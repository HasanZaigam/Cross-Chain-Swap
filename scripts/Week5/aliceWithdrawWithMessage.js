const { ethers } = require("hardhat");
const { Wallet, parseEther, solidityPackedKeccak256, getBytes } = require("ethers");
require("dotenv").config();

async function main() {
  if (!process.env.PRIVATE_KEY) throw new Error("PRIVATE_KEY (admin) not set");
  if (!process.env.ESCROW_SEPOLIA) throw new Error("ESCROW_SEPOLIA not set");
  if (!process.env.BOB_ADDRESS) throw new Error("BOB_ADDRESS not set");
  if (!process.env.BOB_PRIVATE_KEY) throw new Error("BOB_PRIVATE_KEY not set");

  // Use admin/deployer as signer
  const admin = new Wallet(process.env.PRIVATE_KEY, ethers.provider);

  const escrow = await ethers.getContractAt(
    "Escrow",
    process.env.ESCROW_SEPOLIA,
    admin
  );

  const bob = new Wallet(process.env.BOB_PRIVATE_KEY);
  const to = process.env.BOB_ADDRESS; // Bob ka address
  const amount = parseEther("200");
  const nonce = "1745762985643";

  const message = solidityPackedKeccak256(
    ["address", "uint256", "uint256"],
    [to, amount, nonce]
  );
  const signature = await bob.signMessage(getBytes(message));

  // Log for debugging
  console.log("Escrow contract:", process.env.ESCROW_SEPOLIA);
  console.log("Admin address:", admin.address);
  console.log("To (Bob):", to);
  console.log("Amount:", amount.toString());
  console.log("Nonce:", nonce);
  console.log("Signature:", signature);

  // Call the correct withdraw function
  const tx = await escrow.withdraw(
    to, amount, nonce, signature
  );

  await tx.wait();
  console.log("✅ Alice successfully received tokens from Bob's chain");
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
