const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy Escrow Contract
  const Token = await ethers.getContractFactory("TestToken");
  const token = await Token.deploy("Test Token", "TTK", ethers.utils.parseEther("1000000"));
  console.log("Token Contract deployed to:", token.address);

  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(token.address);
  console.log("Escrow Contract deployed to:", escrow.address);

  // Now deploy on both networks
  const networks = ['sepolia', 'mumbai']; // Deploy on Sepolia and Mumbai

  for (let network of networks) {
    console.log(`Deploying on network: ${network}`);
    
    // Use `ethers` to get network provider
    const provider = ethers.getDefaultProvider(network);

    // Send transaction on that network
    await token.deployTransaction.wait();
    await escrow.deployTransaction.wait();

    console.log(`Escrow contract deployed on ${network} at: ${escrow.address}`);
  }

  console.log("Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
