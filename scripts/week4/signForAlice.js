// scripts/signForAlice.js
const { ethers } = require("hardhat");
const { parseEther, solidityPackedKeccak256, getBytes } = require("ethers");
require("dotenv").config();

async function main() {
  const [bob] = await ethers.getSigners();
  console.log("👤 Signer (Bob):", bob.address);

  const amount = parseEther("200");
  const nonce = 1;

  if (!process.env.ALICE_ADDRESS) {
    throw new Error("Please set ALICE_ADDRESS in .env file");
  }

  const to = process.env.ALICE_ADDRESS;
  console.log("🎯 Signing for address (Alice):", to);
  console.log("💰 Amount:", ethers.formatEther(amount), "tokens");
  console.log("🔢 Nonce:", nonce);

  const messageHash = solidityPackedKeccak256(
    ["address", "uint256", "uint256"],
    [to, amount, nonce]
  );

  const messageHashBytes = getBytes(messageHash);
  const signature = await bob.signMessage(messageHashBytes);

  console.log("\n✅ Signature Generated Successfully!");
  console.log("📝 Signature:", signature);
  console.log("🔑 Message Hash:", messageHash);

  console.log("\n🔍 Verification Details:");
  console.log("- Use this signature in withdraw script");
  console.log("- Amount:", ethers.formatEther(amount), "tokens");
  console.log("- Nonce:", nonce);
  console.log("- Recipient (Alice):", to);
}

main().catch((error) => {
  console.error("❌ Error occurred:");
  console.error(error);
  process.exit(1);
});
