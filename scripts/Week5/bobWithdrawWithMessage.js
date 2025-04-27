const { ethers } = require("hardhat");
const { Wallet } = require("ethers");
require("dotenv").config();

async function main() {
  if (!process.env.BOB_PRIVATE_KEY) throw new Error("BOB_PRIVATE_KEY not set");
  if (!process.env.ESCROW_BASE_SEPOLIA) throw new Error("ESCROW_BASE_SEPOLIA not set");
  if (!process.env.BOB_ADDRESS) throw new Error("BOB_ADDRESS not set");

  const bob = new Wallet(process.env.BOB_PRIVATE_KEY, ethers.provider);

  const escrow = await ethers.getContractAt(
    "Escrow",
    process.env.ESCROW_BASE_SEPOLIA,
    bob
  );

  // Use values copied from Alice
  const to = process.env.BOB_ADDRESS; // Bob ka address
  const amount = ethers.parseEther("100");
  const nonce = "1745744916290"; // Copy same nonce
  const signature = "0x3fbdebda684c1c9ae557031d4194a6093cae471f322f824df30b395a2786d34a0d4cc1f07ffc0a3b9b62190cb3ef1476a96066c04ec41cd3b6df25119bde52221c"; // Copy actual

  // Log all values for debugging
  console.log("Escrow contract:", process.env.ESCROW_BASE_SEPOLIA);
  console.log("Bob address:", bob.address);
  console.log("To (Bob):", to);
  console.log("Amount:", amount.toString());
  console.log("Nonce:", nonce);
  console.log("Signature:", signature);

  // Call the correct withdraw function
  const tx = await escrow.withdraw(
    to, amount, nonce, signature
  );

  await tx.wait();
  console.log("✅ Bob successfully withdrew tokens using Alice's signature");
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
