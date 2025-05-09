const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  // Alice ka wallet
  const alice = new ethers.Wallet(process.env.ALICE_PRIVATE_KEY, ethers.provider);

  const escrowSepolia = await ethers.getContractAt(
    "HybridEscrow",
    process.env.HYBRID_ESCROW_SEPOLIA,
    alice
  );

  // Refund
  console.log("Requesting refund from Sepolia escrow (Alice)...");
  await escrowSepolia.refund();

  // Check deposited amount after refund
  const balanceSepolia = await escrowSepolia.depositedAmount(alice.address);
  console.log("Deposited amount in Sepolia after refund (Alice):", ethers.formatUnits(balanceSepolia, 18));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });