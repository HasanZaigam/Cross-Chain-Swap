const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const admin = new ethers.Wallet(process.env.PRIVATE_KEY, ethers.provider); // token owner
  const token = await ethers.getContractAt("TestToken", "0x9BF7e9Ef56923B41243B6fF47B9C950980434648", admin);

  const bobAddress = "0xc41814e117CC65D7F89c8cD53077c47709217f26";
  const mintAmount = ethers.parseUnits("1000", 18);

  console.log("Minting tokens to Bob...");
  const tx = await token.transfer(bobAddress, mintAmount);
  await tx.wait();

  console.log("✅ Minted 1000 tokens to Bob:", bobAddress);
}

main().catch((error) => {
  console.error("❌ Minting failed:", error);
  process.exit(1);
});
