const { ethers } = require("hardhat");
const { abi } = require("../artifacts/contracts/BatikNFT.sol/BatikNFT.json");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error("Set CONTRACT_ADDRESS in .env");
    process.exit(1);
  }

  const [signer] = await ethers.getSigners();
  const contract = new ethers.Contract(contractAddress, abi, signer);

  const tx = await contract.registerProduct(
    "Batik Mega Mendung",
    "Batik Cirebon",
    "Cirebon, Jawa Barat",
    ethers.keccak256(ethers.toUtf8Bytes("test-data")),
    "https://batikchain.id/images/batik1.jpg"
  );
  const receipt = await tx.wait();
  console.log("Product registered. Tx:", receipt.hash);

  const tokenId = 1;
  const certTx = await contract.mintCertificate(
    tokenId,
    signer.address,
    "https://batikchain.id/metadata/1.json"
  );
  await certTx.wait();
  console.log("Certificate minted for token ID:", tokenId);

  const product = await contract.getProduct(tokenId);
  console.log("Product:", product);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
