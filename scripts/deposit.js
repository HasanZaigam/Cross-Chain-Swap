const hre = require("hardhat");
const { parseEther } = require("ethers");
require("dotenv").config();

async function main() {
  // पहले check करें कि addresses exist करती हैं
  if (!process.env.TEST_TOKEN_SEPOLIA || !process.env.ESCROW_SEPOLIA) {
    throw new Error("Please set TEST_TOKEN_SEPOLIA and ESCROW_SEPOLIA in .env file");
  }

  console.log("Token address:", process.env.TEST_TOKEN_SEPOLIA);
  console.log("Escrow address:", process.env.ESCROW_SEPOLIA);

  const { ethers } = hre;
  const [user] = await ethers.getSigners();

  const token = await ethers.getContractAt(
    "TestToken",
    process.env.TEST_TOKEN_SEPOLIA,
    user
  );

  const escrow = await ethers.getContractAt(
    "Escrow",
    process.env.ESCROW_SEPOLIA,
    user
  );

  const depositAmount = parseEther("100");

  // Approve tokens to Escrow contract
  const approveTx = await token.approve(escrow.target, depositAmount);
  await approveTx.wait();
  console.log("✅ Token approved");

  // Deposit tokens to Escrow
  const depositTx = await escrow.deposit(depositAmount);
  await depositTx.wait();
  console.log("✅ Deposit complete");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
