const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const bob = new ethers.Wallet(process.env.BOB_PRIVATE_KEY, ethers.provider);

  // Contract addresses
  const escrowAddress = "0x5CefE24F50C57dce7aBc4bc658134c16a5d6Da81";
  const tokenAddress = "0x9BF7e9Ef56923B41243B6fF47B9C950980434648";

  // Get contract instances
  const escrow = await ethers.getContractAt("HybridEscrow", escrowAddress, bob);
  const token = await ethers.getContractAt("TestToken", tokenAddress, bob);

  // Deposit amount
  const depositAmount = ethers.parseUnits("100", 18);

  // Debugging: Check Bob's balance
  const balance = await token.balanceOf(bob.address);
  console.log("🔍 Bob token balance:", ethers.formatUnits(balance, 18));

  if (balance < depositAmount) {
    throw new Error("❌ Bob doesn't have enough token balance");
  }

  // Debugging: Check allowance before approval
  const allowanceBefore = await token.allowance(bob.address, escrowAddress);
  console.log("🔍 Allowance before approval:", ethers.formatUnits(allowanceBefore, 18));

  // Approve tokens for escrow contract
  console.log("✅ Approving tokens...");
  const approveTx = await token.approve(escrowAddress, depositAmount);
  await approveTx.wait();

  const allowanceAfter = await token.allowance(bob.address, escrowAddress);
  console.log("🔍 Allowance after approval:", ethers.formatUnits(allowanceAfter, 18));

  // Debugging: Check if allowance is sufficient
  // Check if allowance is sufficient
if (allowanceAfter < depositAmount) {
  throw new Error("❌ Insufficient allowance for deposit");
}


  // Debugging: Ensure sufficient gas
  try {
    console.log("✅ Depositing tokens into escrow...");
    const depositTx = await escrow.deposit(depositAmount, {
      gasLimit: 500000,  // Increase gas limit if necessary
    });
    await depositTx.wait();
    console.log("✅ Deposit successful");
  } catch (err) {
    console.error("❌ Deposit failed:", err);
    return;
  }

  // Check deposited amount
  const deposited = await escrow.depositedAmount(bob.address);
  console.log("💰 Deposited amount in escrow (Bob):", ethers.formatUnits(deposited, 18));
}

main().catch((error) => {
  console.error("❌ Script failed with error:", error);
  process.exit(1);
});
