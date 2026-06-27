export const BatikNFT_ABI = [
  'function registerProduct(string _productName, string _producerName, string _originRegion, string _metadataHash, string _photoUrl) external returns (uint256)',
  'function mintCertificate(uint256 _tokenId, address _to, string _certificateURI) external returns (uint256)',
  'function verifyProduct(uint256 _tokenId, string _metadataHash) external view returns (bool isValid, string productName, string producerName, string originRegion, string onChainHash, uint8 status)',
  'event ProductRegistered(uint256 indexed tokenId, string productName, string producerName, string metadataHash)',
  'event CertificateMinted(uint256 indexed tokenId, address indexed owner, string uri)'
];
