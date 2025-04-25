// scripts/signForBob.js
const { ethers } = require("hardhat");
const { parseEther, solidityPackedKeccak256, getBytes } = require("ethers");
require("dotenv").config();

async function main() {
  const [alice] = await ethers.getSigners();
  console.log("👤 Signer (Alice):", alice.address);

  const amount = parseEther("100");
  const nonce = 1;

  if (!process.env.BOB_ADDRESS) {
    throw new Error("Please set BOB_ADDRESS in .env file");
  }

  const to = process.env.BOB_ADDRESS;
  console.log("🎯 Signing for address (Bob):", to);
  console.log("💰 Amount:", ethers.formatEther(amount), "tokens");
  console.log("🔢 Nonce:", nonce);

  const messageHash = solidityPackedKeccak256(
    ["address", "uint256", "uint256"],
    [to, amount, nonce]
  );

  const messageHashBytes = getBytes(messageHash);
  const signature = await alice.signMessage(messageHashBytes);

  console.log("\n✅ Signature Generated Successfully!");
  console.log("📝 Signature:", signature);
  console.log("🔑 Message Hash:", messageHash);

  console.log("\n🔍 Verification Details:");
  console.log("- Use this signature in withdraw script");
  console.log("- Ensure same amount and nonce when withdrawing");
}

main().catch((error) => {
  console.error("❌ Error occurred:");
  console.error(error);
  process.exit(1);
});
