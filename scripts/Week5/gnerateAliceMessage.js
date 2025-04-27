const { parseEther, solidityPackedKeccak256, getBytes, Wallet } = require("ethers");
require("dotenv").config();

async function main() {
  if (!process.env.ALICE_PRIVATE_KEY) {
    throw new Error("ALICE_PRIVATE_KEY is not set in .env file");
  }
  if (!process.env.BOB_ADDRESS) {
    throw new Error("BOB_ADDRESS is not set in .env file");
  }

  const alice = new Wallet(process.env.ALICE_PRIVATE_KEY);
  const receiverOnBase = process.env.BOB_ADDRESS;

  const amount = parseEther("100"); // ethers v6: use parseEther
  const nonce = Date.now(); // Random nonce to prevent replay attacks

  const message = solidityPackedKeccak256(
    ["address", "uint256", "address", "uint256"],
    [alice.address, amount, receiverOnBase, nonce]
  );

  const signature = await alice.signMessage(getBytes(message));

  console.log("🔐 Message Hash:", message);
  console.log("✍️ Signature:", signature);
  console.log("📦 Nonce:", nonce);
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
