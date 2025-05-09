const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  // Bob ka wallet
  const bob = new ethers.Wallet(process.env.BOB_PRIVATE_KEY, ethers.provider);

  const escrowBaseSepolia = await ethers.getContractAt(
    "HybridEscrow",
    process.env.HYBRID_ESCROW_BASE_SEPOLIA,
    bob
  );

  // Refund
  console.log("Requesting refund from BaseSepolia escrow (Bob)...");
  await escrowBaseSepolia.refund();

  // Check deposited amount after refund
  const balanceBaseSepolia = await escrowBaseSepolia.depositedAmount(bob.address);
  console.log("Deposited amount in BaseSepolia after refund (Bob):", ethers.formatUnits(balanceBaseSepolia, 18));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });