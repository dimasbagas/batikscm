const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "MATIC");

  const BatikNFT = await ethers.getContractFactory("BatikNFT");
  const contract = await BatikNFT.deploy();

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("BatikNFT deployed to:", address);
  console.log("Network:", network.name);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
