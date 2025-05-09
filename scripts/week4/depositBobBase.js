
// scripts/depositBobSepolia.js
const { ethers } = require("hardhat");
const { parseEther, formatEther } = require("ethers");
require("dotenv").config();

async function main() {
  const [Bob] = await ethers.getSigners();
  console.log("Using address:", Bob.address);

  const token = await ethers.getContractAt(
    "TestToken", 
    process.env.TEST_TOKEN_BASE_SEPOLIA1,
    Bob
  );
  
  const escrow = await ethers.getContractAt(
    "Escrow", 
    process.env.ESCROW_BASE_SEPOLIA1,
    Bob
  );

  // Check balances first
  const balance = await token.balanceOf(Bob.address);
  console.log("Token balance:", formatEther(balance));

  const amount = parseEther("100");
  console.log("Trying to deposit:", formatEther(amount));

  // Check allowance
  const allowanceBefore = await token.allowance(Bob.address, escrow.target);
console.log("Current allowance:", formatEther(allowanceBefore));

await token.approve(escrow.target, amount);
console.log("✅ Approved");

const allowanceAfter = await token.allowance(Bob.address, escrow.target);
console.log("New allowance:", formatEther(allowanceAfter));


  // Try deposit
  console.log("Attempting deposit...");
  const tx = await escrow.deposit(amount);
  await tx.wait();
  console.log("✅ Bob deposited on BASE_Sepolia:", tx.hash);

  // Verify final balance
  const finalBalance = await token.balanceOf(Bob.address);
  console.log("Final balance:", formatEther(finalBalance));
}

main().catch((error) => {
  console.error("Error details:", error);
  process.exit(1);
});
