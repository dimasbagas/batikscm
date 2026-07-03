// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
contract BatikNFT is ERC721URIStorage, ERC721Pausable, Ownable {
    uint256 private _tokenIds;

    enum ProductStatus { Registered, Certified, Revoked, Distributed }

    struct Product {
        uint256 tokenId;
        string productName;
        string producerName;
        string originRegion;
        string metadataHash;
        string photoUrl;
        uint256 timestamp;
        ProductStatus status;
        string distributorName;
        uint256 distributedAt;
    }

    struct Certificate {
        uint256 tokenId;
        string certificateURI;
        uint256 mintedAt;
        bool isValid;
    }

    struct OwnershipRecord {
        address from;
        address to;
        uint256 timestamp;
    }

    mapping(uint256 => Product) private _products;
    mapping(uint256 => Certificate) private _certificates;
    mapping(uint256 => OwnershipRecord[]) private _ownershipHistory;
    mapping(uint256 => address) private _verifiers;
    mapping(bytes32 => bool) private _hashUsed;

    event ProductRegistered(uint256 indexed tokenId, string productName, string producerName, string metadataHash);
    event ProductDistributed(uint256 indexed tokenId, string distributorName, string photoUrl, string metadataHash);
    event CertificateMinted(uint256 indexed tokenId, address indexed owner, string uri);
    event ProductVerified(uint256 indexed tokenId, address indexed verifier, bool match_);
    event CertificateTransferred(uint256 indexed tokenId, address indexed from, address indexed to);
    event CertificateRevoked(uint256 indexed tokenId);

    constructor() Ownable(msg.sender) ERC721("BatikChain Certificate", "BATIK") {}

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function registerProduct(
        string memory _productName,
        string memory _producerName,
        string memory _originRegion,
        string memory _metadataHash,
        string memory _photoUrl
    ) external whenNotPaused returns (uint256) {
        require(bytes(_productName).length > 0, "Product name required");
        require(bytes(_metadataHash).length > 0, "Metadata hash required");
        require(!_hashUsed[keccak256(abi.encodePacked(_metadataHash))], "Hash already used");

        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _products[newTokenId] = Product({
            tokenId: newTokenId,
            productName: _productName,
            producerName: _producerName,
            originRegion: _originRegion,
            metadataHash: _metadataHash,
            photoUrl: _photoUrl,
            timestamp: block.timestamp,
            status: ProductStatus.Registered,
            distributorName: "",
            distributedAt: 0
        });

        _hashUsed[keccak256(abi.encodePacked(_metadataHash))] = true;

        emit ProductRegistered(newTokenId, _productName, _producerName, _metadataHash);
        return newTokenId;
    }

    function distributeProduct(
        uint256 _tokenId,
        string memory _photoUrl,
        string memory _distributorName,
        string memory _newMetadataHash
    ) external whenNotPaused {
        require(_tokenId > 0 && _tokenId <= _tokenIds, "Invalid token ID");
        require(_products[_tokenId].status == ProductStatus.Registered, "Must be in Registered status");
        require(bytes(_photoUrl).length > 0, "Photo URL required");
        require(bytes(_distributorName).length > 0, "Distributor name required");
        require(bytes(_newMetadataHash).length > 0, "New metadata hash required");

        _products[_tokenId].photoUrl = _photoUrl;
        _products[_tokenId].status = ProductStatus.Distributed;
        _products[_tokenId].metadataHash = _newMetadataHash;
        _products[_tokenId].distributorName = _distributorName;
        _products[_tokenId].distributedAt = block.timestamp;

        emit ProductDistributed(_tokenId, _distributorName, _photoUrl, _newMetadataHash);
    }

    function mintCertificate(
        uint256 _tokenId,
        address _to,
        string memory _certificateURI
    ) external whenNotPaused onlyOwner returns (uint256) {
        require(_tokenId > 0 && _tokenId <= _tokenIds, "Invalid token ID");
        require(_products[_tokenId].timestamp > 0, "Product not registered");
        require(
            _products[_tokenId].status == ProductStatus.Registered || _products[_tokenId].status == ProductStatus.Distributed,
            "Already certified or revoked"
        );

        _safeMint(_to, _tokenId);
        _setTokenURI(_tokenId, _certificateURI);

        _products[_tokenId].status = ProductStatus.Certified;
        _certificates[_tokenId] = Certificate({
            tokenId: _tokenId,
            certificateURI: _certificateURI,
            mintedAt: block.timestamp,
            isValid: true
        });

        _ownershipHistory[_tokenId].push(OwnershipRecord({
            from: address(0),
            to: _to,
            timestamp: block.timestamp
        }));

        emit CertificateMinted(_tokenId, _to, _certificateURI);
        return _tokenId;
    }

    function verifyProduct(uint256 _tokenId, string memory _metadataHash)
        external
        view
        returns (
            bool isValid,
            string memory productName,
            string memory producerName,
            string memory originRegion,
            string memory onChainHash,
            ProductStatus status
        )
    {
        require(_tokenId > 0 && _tokenId <= _tokenIds, "Invalid token ID");
        Product memory p = _products[_tokenId];
        require(p.timestamp > 0, "Product does not exist");

        bool hashMatch = keccak256(abi.encodePacked(p.metadataHash)) == keccak256(abi.encodePacked(_metadataHash));

        return (
            hashMatch,
            p.productName,
            p.producerName,
            p.originRegion,
            p.metadataHash,
            p.status
        );
    }

    function getProduct(uint256 _tokenId) external view returns (Product memory) {
        require(_tokenId > 0 && _tokenId <= _tokenIds, "Invalid token ID");
        require(_products[_tokenId].timestamp > 0, "Product does not exist");
        return _products[_tokenId];
    }

    function getCertificate(uint256 _tokenId) external view returns (Certificate memory) {
        require(_tokenId > 0 && _tokenId <= _tokenIds, "Invalid token ID");
        require(_certificates[_tokenId].mintedAt > 0, "Certificate does not exist");
        return _certificates[_tokenId];
    }

    function transferOwnershipWithHistory(uint256 _tokenId, address _to) external whenNotPaused {
        require(_products[_tokenId].status == ProductStatus.Certified, "Not certified");
        address from = ownerOf(_tokenId);
        require(
            _msgSender() == from || isApprovedForAll(from, _msgSender()),
            "Not authorized"
        );
        require(_to != address(0), "Invalid recipient");

        _safeTransfer(from, _to, _tokenId, "");

        _ownershipHistory[_tokenId].push(OwnershipRecord({
            from: from,
            to: _to,
            timestamp: block.timestamp
        }));

        emit CertificateTransferred(_tokenId, from, _to);
    }

    function revokeCertificate(uint256 _tokenId) external onlyOwner {
        require(_products[_tokenId].status == ProductStatus.Certified, "Not certified");

        _products[_tokenId].status = ProductStatus.Revoked;
        _certificates[_tokenId].isValid = false;

        emit CertificateRevoked(_tokenId);
    }

    function getOwnershipHistory(uint256 _tokenId) external view returns (OwnershipRecord[] memory) {
        return _ownershipHistory[_tokenId];
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIds;
    }

    function getProductByHash(string memory _metadataHash) external view returns (Product memory) {
        bytes32 hashKey = keccak256(abi.encodePacked(_metadataHash));
        require(_hashUsed[hashKey], "Hash not found");

        uint256 total = _tokenIds;
        for (uint256 i = 1; i <= total; i++) {
            if (keccak256(abi.encodePacked(_products[i].metadataHash)) == hashKey) {
                return _products[i];
            }
        }
        revert("Product not found");
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Pausable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
