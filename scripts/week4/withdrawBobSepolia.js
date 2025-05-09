// scripts/withdrawBobSepolia.js
const { ethers } = require("hardhat");
const { parseEther, formatEther } = require("ethers");
require("dotenv").config();

async function main() {
  const [admin] = await ethers.getSigners();
  console.log("👤 Admin address:", admin.address);

  if (!process.env.ESCROW_SEPOLIA1 || !process.env.BOB_ADDRESS) {
    throw new Error("Please set ESCROW_SEPOLIA1 and BOB_ADDRESS in .env file");
  }

  const escrow = await ethers.getContractAt(
    "Escrow", 
    process.env.ESCROW_SEPOLIA1,
    admin
  );
  console.log("📄 Using Escrow at:", process.env.ESCROW_SEPOLIA1);

  const to = process.env.BOB_ADDRESS;
  const amount = parseEther("10");
  const nonce = 1;

  // Direct signature string yahan daal do
  const signature = "0x66d0fae6902ecc3b8477a6a94b8904c48ed3a67e8f1c3ffb89e2c166b4f28fcf5723c2c9f75c5cf0639508e67704c352f2558d8a3c8e5f6b1de467a57d8d08211c";

  console.log("\n🔍 Withdrawal Details:");
  console.log("- To (Bob):", to);
  console.log("- Amount:", formatEther(amount), "tokens");
  console.log("- Nonce:", nonce);
  console.log("- Signature from Alice:", signature);

  console.log("\n⏳ Processing withdrawal...");
  const tx = await escrow.withdraw(to, amount, nonce, signature);
  await tx.wait();
  console.log("✅ Withdrawal successful!");
  console.log("🔗 Transaction hash:", tx.hash);

  // Optional: Verify the balance after withdrawal
  const token = await ethers.getContractAt(
    "TestToken",
    process.env.TEST_TOKEN_SEPOLIA1,
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
