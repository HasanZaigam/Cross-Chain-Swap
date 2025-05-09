// scripts/depositAliceSepolia.js
const { ethers } = require("hardhat");
const { parseEther, formatEther } = require("ethers");
require("dotenv").config();

async function main() {
  const [alice] = await ethers.getSigners();
  console.log("Using address:", alice.address);

  const token = await ethers.getContractAt(
    "TestToken", 
    process.env.TEST_TOKEN_SEPOLIA1,
    alice
  );
  
  const escrow = await ethers.getContractAt(
    "Escrow", 
    process.env.ESCROW_SEPOLIA1,
    alice
  );

  // Check balances first
  const balance = await token.balanceOf(alice.address);
  console.log("Token balance:", formatEther(balance));

  const amount = parseEther("10");
  console.log("Trying to deposit:", formatEther(amount));

  // Check allowance
  const allowanceBefore = await token.allowance(alice.address, escrow.target);
  console.log("Current allowance:", formatEther(allowanceBefore));

  // Approve
  await token.approve(escrow.target, amount);
  console.log("✅ Approved");

  // Verify allowance after approve
  const allowanceAfter = await token.allowance(alice.address, escrow.target);
  console.log("New allowance:", formatEther(allowanceAfter));

  // Try deposit
  console.log("Attempting deposit...");
  const tx = await escrow.deposit(amount);
  await tx.wait();
  console.log("✅ Alice deposited on Sepolia:", tx.hash);

  // Verify final balance
  const finalBalance = await token.balanceOf(alice.address);
  console.log("Final balance:", formatEther(finalBalance));
}

main().catch((error) => {
  console.error("Error details:", error);
  process.exit(1);
});
