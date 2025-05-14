const { ethers } = require("hardhat");
const { parseEther } = require("ethers");
require("dotenv").config();

async function main() {
  const [admin] = await ethers.getSigners();

  const escrow = await ethers.getContractAt(
    "Escrow",
    process.env.ESCROW_SEPOLIA,
    admin
  );

  const to = "0x0a866C479B895f4E08160B67AE162Cb23CeA6F1c";
  const amount = parseEther("100");
  const nonce = 1;
  const signature = "0x424a7c311acfb163dc6e25fb42662305c21939b1e489735fd30365ab9b719255262f50c2a21762d8bb7e0791869c67f921aa775b68d33d40edf719fbcab937ab1b"; // This should be ~132 chars long

  const tx = await escrow.withdraw(to, amount, nonce, signature);
  await tx.wait();
  console.log("✅ Withdrawal successful");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
