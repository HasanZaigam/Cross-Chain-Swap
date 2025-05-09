const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const alice = new ethers.Wallet(process.env.ALICE_PRIVATE_KEY, ethers.provider);

  // Contract addresses
  const escrowAddress = "0x44581B35fb43a09b2AE88Ad40AeCe5d960af759B";
  const tokenAddress = "0xC0C4e8699545d9603B7bEb931F636Df9b8a812eC";

  // Get contract instances
  const escrow = await ethers.getContractAt("HybridEscrow", escrowAddress, alice);
  const token = await ethers.getContractAt("TestToken", tokenAddress, alice);

  // Deposit amount
  const depositAmount = ethers.parseUnits("100", 18);

  // Debugging: Check Alice's balance
  const balance = await token.balanceOf(alice.address);
  console.log("🔍 Alice token balance:", ethers.formatUnits(balance, 18));

  if (balance < depositAmount) {
    throw new Error("❌ Alice doesn't have enough token balance");
  }

  // Debugging: Check allowance before approval
  const allowanceBefore = await token.allowance(alice.address, escrowAddress);
  console.log("🔍 Allowance before approval:", ethers.formatUnits(allowanceBefore, 18));

  // Approve tokens for escrow contract
  console.log("✅ Approving tokens...");
  const approveTx = await token.approve(escrowAddress, depositAmount);
  await approveTx.wait();

  const allowanceAfter = await token.allowance(alice.address, escrowAddress);
  console.log("🔍 Allowance after approval:", ethers.formatUnits(allowanceAfter, 18));

  // Check if allowance is sufficient
  if (allowanceAfter < depositAmount) {
    throw new Error("❌ Insufficient allowance for deposit");
  }

  // Deposit tokens
  try {
    console.log("✅ Depositing tokens into escrow...");
    const depositTx = await escrow.deposit(depositAmount, {
      gasLimit: 500000,
    });
    await depositTx.wait();
    console.log("✅ Deposit successful");
  } catch (err) {
    console.error("❌ Deposit failed:", err);
    return;
  }

  // Check deposited amount
  const deposited = await escrow.depositedAmount(alice.address);
  console.log("💰 Deposited amount in escrow (Alice):", ethers.formatUnits(deposited, 18));
}

main().catch((error) => {
  console.error("❌ Script failed with error:", error);
  process.exit(1);
});
