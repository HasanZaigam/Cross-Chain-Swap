// // scripts/signForAlice.js
// const { ethers } = require("hardhat");
// const { parseEther, solidityPackedKeccak256, getBytes } = require("ethers");
// require("dotenv").config();

// async function main() {
//   const [bob] = await ethers.getSigners();
//   console.log("👤 Signer (Bob):", bob.address);

//   const amount = parseEther("10");
//   const nonce = 1;

//   if (!process.env.ALICE_ADDRESS) {
//     throw new Error("Please set ALICE_ADDRESS in .env file");
//   }

//   const to = process.env.ALICE_ADDRESS;
//   console.log("🎯 Signing for address (Alice):", to);
//   console.log("💰 Amount:", ethers.formatEther(amount), "tokens");
//   console.log("🔢 Nonce:", nonce);

//   const messageHash = solidityPackedKeccak256(
//     ["address", "uint256", "uint256"],
//     [to, amount, nonce]
//   );

//   const messageHashBytes = getBytes(messageHash);
//   const signature = await bob.signMessage(messageHashBytes);

//   console.log("\n✅ Signature Generated Successfully!");
//   console.log("📝 Signature:", signature);
//   console.log("🔑 Message Hash:", messageHash);

//   console.log("\n🔍 Verification Details:");
//   console.log("- Use this signature in withdraw script");
//   console.log("- Amount:", ethers.formatEther(amount), "tokens");
//   console.log("- Nonce:", nonce);
//   console.log("- Recipient (Alice):", to);
// }

// main().catch((error) => {
//   console.error("❌ Error occurred:");
//   console.error(error);
//   process.exit(1);
// });


// scripts/signForAlice.js
const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
  // Alice ka wallet create karo (private key .env se)
  const alice = new ethers.Wallet(process.env.ALICE_PRIVATE_KEY);

  const amount = ethers.parseEther("10");
  const nonce = 1;

  if (!process.env.ALICE_ADDRESS) {
    throw new Error("Please set ALICE_ADDRESS in .env file");
  }

  const to = process.env.ALICE_ADDRESS;
  console.log("👤 Signer (Alice):", alice.address);
  console.log("🎯 Signing for address (Alice):", to);
  console.log("💰 Amount:", ethers.formatEther(amount), "tokens");
  console.log("🔢 Nonce:", nonce);

  // Contract ke logic ke hisaab se message hash banao
  const messageHash = ethers.solidityPackedKeccak256(
    ["address", "uint256", "uint256"],
    [to, amount, nonce]
  );

  // Message hash ko bytes me convert karo
  const messageHashBytes = ethers.getBytes(messageHash);

  // Alice se sign karwao
  const signature = await alice.signMessage(messageHashBytes);

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