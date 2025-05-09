// scripts/withdrawAliceBase.js
const { ethers } = require("hardhat");
const { parseEther, formatEther } = require("ethers");
require("dotenv").config();

async function main() {
  const [admin] = await ethers.getSigners();
  console.log("👤 Admin address:", admin.address);

  if (!process.env.ESCROW_BASE_SEPOLIA1 || !process.env.ALICE_ADDRESS || !process.env.SIGNATURE_FROM_ALICE) {
    throw new Error("Please set ESCROW_BASE_SEPOLIA, ALICE_ADDRESS and SIGNATURE_FROM_ALICE in .env file");
  }

  const escrow = await ethers.getContractAt(
    "Escrow", 
    process.env.ESCROW_BASE_SEPOLIA1,
    admin
  );
  console.log("📄 Using Escrow at:", process.env.ESCROW_BASE_SEPOLIA1);

  const to = process.env.ALICE_ADDRESS;
  const amount = parseEther("10"); // Changed from utils.parseUnits
  const nonce = 1;

  console.log("\n🔍 Withdrawal Details:");
  console.log("- To (Alice):", to);
  console.log("- Amount:", formatEther(amount), "tokens");
  console.log("- Nonce:", nonce);
  console.log("- Signature from Bob:", process.env.SIGNATURE_FROM_ALICE);

  console.log("\n⏳ Processing withdrawal...");
  const tx = await escrow.withdraw(to, amount, nonce, process.env.SIGNATURE_FROM_ALICE);
  await tx.wait();
  console.log("✅ Withdrawal successful!");
  console.log("🔗 Transaction hash:", tx.hash);

  // Optional: Verify the balance after withdrawal
  const token = await ethers.getContractAt(
    "TestToken",
    process.env.TEST_TOKEN_BASE_SEPOLIA1,
    admin
  );
  const balance = await token.balanceOf(to);
  console.log("\n💰 Alice's new balance:", formatEther(balance), "tokens");
}

main().catch((error) => {
  console.error("❌ Error occurred:");
  console.error(error);
  process.exit(1);
});
