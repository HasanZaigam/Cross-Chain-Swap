const { Wallet, parseEther, solidityPackedKeccak256, getBytes } = require("ethers");
require("dotenv").config();

async function main() {
  if (!process.env.BOB_PRIVATE_KEY) throw new Error("BOB_PRIVATE_KEY not set");
  if (!process.env.ALICE_ADDRESS) throw new Error("ALICE_ADDRESS not set");

  const bob = new Wallet(process.env.BOB_PRIVATE_KEY);
  const receiverOnSepolia = process.env.ALICE_ADDRESS;

  const amount = parseEther("200"); // Bob deposited this much
  const nonce = Date.now();

  const message = solidityPackedKeccak256(
    ["address", "uint256", "address", "uint256"],
    [bob.address, amount, receiverOnSepolia, nonce]
  );

  const signature = await bob.signMessage(getBytes(message));

  console.log("🔁 Bob Message Hash:", message);
  console.log("🖋️ Signature:", signature);
  console.log("📦 Nonce:", nonce);
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
