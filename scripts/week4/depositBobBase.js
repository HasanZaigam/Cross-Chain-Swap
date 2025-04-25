// scripts/depositBobBase.js
const { ethers } = require("hardhat");
const { parseEther, formatEther } = require("ethers");
require("dotenv").config();

async function main() {
  const [bob] = await ethers.getSigners();
  console.log("👤 Using address:", bob.address);

  // Contract addresses verification
  console.log("📄 Token Contract:", process.env.TEST_TOKEN_BASE_SEPOLIA);
  console.log("📄 Escrow Contract:", process.env.ESCROW_BASE_SEPOLIA);

  const token = await ethers.getContractAt(
    "TestToken", 
    process.env.TEST_TOKEN_BASE_SEPOLIA,
    bob
  );
  
  const escrow = await ethers.getContractAt(
    "Escrow", 
    process.env.ESCROW_BASE_SEPOLIA,
    bob
  );

  // Check initial balances
  const balance = await token.balanceOf(bob.address);
  console.log("💰 Initial token balance:", formatEther(balance));

  const amount = parseEther("20");
  console.log("🔄 Trying to deposit:", formatEther(amount), "tokens");

  // Check allowance before approval
  const allowanceBefore = await token.allowance(bob.address, escrow.target);
  console.log("👆 Current allowance:", formatEther(allowanceBefore));

  // Approve tokens
  console.log("⏳ Approving tokens...");
  await token.approve(escrow.target, amount);
  console.log("✅ Tokens approved");

  // Verify allowance after approval
  const allowanceAfter = await token.allowance(bob.address, escrow.target);
  console.log("👆 New allowance:", formatEther(allowanceAfter));

  // Deposit tokens
  console.log("⏳ Depositing tokens...");
  const tx = await escrow.deposit(amount);
  await tx.wait();
  console.log("✅ Deposit transaction hash:", tx.hash);

  // Verify final balance
  const finalBalance = await token.balanceOf(bob.address);
  console.log("💰 Final token balance:", formatEther(finalBalance));

  // Calculate and show difference
  const difference = balance - finalBalance;
  console.log("📊 Total tokens deposited:", formatEther(difference));
}

main().catch((error) => {
  console.error("❌ Error occurred:");
  console.error(error);
  process.exit(1);
});
