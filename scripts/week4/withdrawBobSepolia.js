// scripts/withdrawBobSepolia.js
const { ethers } = require("hardhat");
const { parseEther, formatEther } = require("ethers");
require("dotenv").config();

async function main() {
  const [admin] = await ethers.getSigners();
  console.log("👤 Admin address:", admin.address);

  if (!process.env.ESCROW_SEPOLIA || !process.env.BOB_ADDRESS || !process.env.SIGNATURE_FROM_ALICE) {
    throw new Error("Please set ESCROW_SEPOLIA, BOB_ADDRESS and SIGNATURE_FROM_ALICE in .env file");
  }

  const escrow = await ethers.getContractAt(
    "Escrow", 
    process.env.ESCROW_SEPOLIA,
    admin
  );
  console.log("📄 Using Escrow at:", process.env.ESCROW_SEPOLIA);

  const to = process.env.BOB_ADDRESS;
  const amount = parseEther("100"); // Changed from utils.parseUnits
  const nonce = 1;

  console.log("\n🔍 Withdrawal Details:");
  console.log("- To (Bob):", to);
  console.log("- Amount:", formatEther(amount), "tokens");
  console.log("- Nonce:", nonce);
  console.log("- Signature from Alice:", process.env.SIGNATURE_FROM_ALICE);

  console.log("\n⏳ Processing withdrawal...");
  const tx = await escrow.withdraw(to, amount, nonce, process.env.SIGNATURE_FROM_ALICE);
  await tx.wait();
  console.log("✅ Withdrawal successful!");
  console.log("🔗 Transaction hash:", tx.hash);

  // Optional: Verify the balance after withdrawal
  const token = await ethers.getContractAt(
    "TestToken",
    process.env.TEST_TOKEN_SEPOLIA,
    admin
  );
  const balance = await token.balanceOf(to);
  console.log("\n💰 Bob's new balance:", formatEther(balance), "tokens");
}

main().catch((error) => {
  console.error("❌ Error occurred:");
  console.error(error);
  process.exit(1);
});
