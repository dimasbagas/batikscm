const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BatikNFT", function () {
  let BatikNFT, contract, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    BatikNFT = await ethers.getContractFactory("BatikNFT");
    contract = await BatikNFT.deploy();
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set the correct name and symbol", async function () {
      expect(await contract.name()).to.equal("BatikChain Certificate");
      expect(await contract.symbol()).to.equal("BATIK");
    });

    it("should set the deployer as owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });
  });

  describe("Product Registration", function () {
    it("should register a product and emit event", async function () {
      const tx = await contract.registerProduct(
        "Batik Mega Mendung", "Batik Cirebon", "Cirebon",
        ethers.keccak256(ethers.toUtf8Bytes("hash1")), "https://img.url"
      );
      await expect(tx)
        .to.emit(contract, "ProductRegistered")
        .withArgs(1, "Batik Mega Mendung", "Batik Cirebon", ethers.keccak256(ethers.toUtf8Bytes("hash1")));

      expect(await contract.totalSupply()).to.equal(1);
    });

    it("should reject duplicate metadata hash", async function () {
      const hash = ethers.keccak256(ethers.toUtf8Bytes("dup"));
      await contract.registerProduct("A", "B", "C", hash, "url");
      await expect(
        contract.registerProduct("D", "E", "F", hash, "url")
      ).to.be.revertedWith("Hash already used");
    });

    it("should reject empty product name", async function () {
      await expect(
        contract.registerProduct("", "B", "C", ethers.keccak256(ethers.toUtf8Bytes("h")), "url")
      ).to.be.revertedWith("Product name required");
    });

    it("should return product details", async function () {
      const hash = ethers.keccak256(ethers.toUtf8Bytes("detail-hash"));
      await contract.registerProduct("Batik Parang", "Solo Batik", "Solo", hash, "https://photo.url");
      const product = await contract.getProduct(1);
      expect(product.productName).to.equal("Batik Parang");
      expect(product.producerName).to.equal("Solo Batik");
      expect(product.originRegion).to.equal("Solo");
      expect(product.metadataHash).to.equal(hash);
      expect(product.status).to.equal(0);
    });
  });

  describe("Certificate Minting", function () {
    beforeEach(async function () {
      const hash = ethers.keccak256(ethers.toUtf8Bytes("cert-hash"));
      await contract.registerProduct("Batik", "Prod", "Region", hash, "url");
    });

    it("should mint certificate and emit event", async function () {
      const uri = "https://metadata.batikchain.id/1.json";
      const tx = await contract.mintCertificate(1, owner.address, uri);
      await expect(tx).to.emit(contract, "CertificateMinted").withArgs(1, owner.address, uri);
      expect(await contract.ownerOf(1)).to.equal(owner.address);
      expect(await contract.tokenURI(1)).to.equal(uri);
    });

    it("should only allow owner to mint", async function () {
      await expect(
        contract.connect(addr1).mintCertificate(1, addr1.address, "uri")
      ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });

    it("should reject double minting", async function () {
      await contract.mintCertificate(1, owner.address, "uri1");
      await expect(
        contract.mintCertificate(1, owner.address, "uri2")
      ).to.be.revertedWith("Already certified or revoked");
    });

    it("should reject minting non-existent product", async function () {
      await expect(
        contract.mintCertificate(99, owner.address, "uri")
      ).to.be.revertedWith("Invalid token ID");
    });
  });

  describe("Verification", function () {
    beforeEach(async function () {
      const hash = ethers.keccak256(ethers.toUtf8Bytes("verify-hash"));
      await contract.registerProduct("Batik", "Prod", "Region", hash, "url");
    });

    it("should verify with correct hash", async function () {
      const hash = ethers.keccak256(ethers.toUtf8Bytes("verify-hash"));
      const result = await contract.verifyProduct(1, hash);
      expect(result.isValid).to.be.true;
      expect(result.productName).to.equal("Batik");
    });

    it("should fail verification with wrong hash", async function () {
      const wrongHash = ethers.keccak256(ethers.toUtf8Bytes("wrong-hash"));
      const result = await contract.verifyProduct(1, wrongHash);
      expect(result.isValid).to.be.false;
    });

    it("should reject verification of non-existent product", async function () {
      await expect(
        contract.verifyProduct(99, ethers.keccak256(ethers.toUtf8Bytes("x")))
      ).to.be.revertedWith("Invalid token ID");
    });
  });

  describe("Ownership Transfer", function () {
    beforeEach(async function () {
      const hash = ethers.keccak256(ethers.toUtf8Bytes("transfer-hash"));
      await contract.registerProduct("Batik", "Prod", "Region", hash, "url");
      await contract.mintCertificate(1, owner.address, "https://metadata.batikchain.id/1.json");
    });

    it("should transfer ownership with history", async function () {
      const tx = await contract.transferOwnershipWithHistory(1, addr1.address);
      await expect(tx).to.emit(contract, "CertificateTransferred").withArgs(1, owner.address, addr1.address);
      expect(await contract.ownerOf(1)).to.equal(addr1.address);

      const history = await contract.getOwnershipHistory(1);
      expect(history.length).to.equal(2);
      expect(history[1].from).to.equal(owner.address);
      expect(history[1].to).to.equal(addr1.address);
    });

    it("should reject transfer by non-owner", async function () {
      await expect(
        contract.connect(addr1).transferOwnershipWithHistory(1, addr2.address)
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Certificate Revocation", function () {
    beforeEach(async function () {
      const hash = ethers.keccak256(ethers.toUtf8Bytes("revoke-hash"));
      await contract.registerProduct("Batik", "Prod", "Region", hash, "url");
      await contract.mintCertificate(1, owner.address, "uri");
    });

    it("should revoke certificate and emit event", async function () {
      const tx = await contract.revokeCertificate(1);
      await expect(tx).to.emit(contract, "CertificateRevoked").withArgs(1);

      const cert = await contract.getCertificate(1);
      expect(cert.isValid).to.be.false;

      const product = await contract.getProduct(1);
      expect(product.status).to.equal(2);
    });

    it("should only allow owner to revoke", async function () {
      await expect(
        contract.connect(addr1).revokeCertificate(1)
      ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });
  });

  describe("Pausability", function () {
    it("should pause and unpause", async function () {
      await contract.pause();
      await expect(
        contract.registerProduct("B", "P", "R", ethers.keccak256(ethers.toUtf8Bytes("x")), "url")
      ).to.be.revertedWithCustomError(contract, "EnforcedPause");

      await contract.unpause();
      const tx = await contract.registerProduct("B", "P", "R", ethers.keccak256(ethers.toUtf8Bytes("y")), "url");
      await expect(tx).to.emit(contract, "ProductRegistered");
    });

    it("should only allow owner to pause", async function () {
      await expect(
        contract.connect(addr1).pause()
      ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });
  });
});
