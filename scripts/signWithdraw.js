const { ethers } = require("hardhat");
const { parseEther, solidityPackedKeccak256, getBytes } = require("ethers");
require("dotenv").config();

async function main() {
  const [user] = await ethers.getSigners();
  const to = user.address;
  const amount = parseEther("100");
  const nonce = 1;

  const messageHash = solidityPackedKeccak256(
    ["address", "uint256", "uint256"],
    [to, amount, nonce]
  );

  const arrayifiedHash = getBytes(messageHash);
  const signature = await user.signMessage(arrayifiedHash);

  console.log("=== Withdrawal Info ===");
  console.log("To:", to);
  console.log("Amount:", amount.toString());
  console.log("Nonce:", nonce);
  console.log("Full Signature:", signature);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
