const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const admin = new ethers.Wallet(process.env.PRIVATE_KEY, ethers.provider); // token owner
  const token = await ethers.getContractAt("TestToken", "0xC0C4e8699545d9603B7bEb931F636Df9b8a812eC", admin);

  const AliceAddress = "0x960e641feA7ec2faCc2EEb96FE79e82cA7872ea3";
  const mintAmount = ethers.parseUnits("1000", 18);

  console.log("Minting tokens to Bob...");
  const tx = await token.transfer(AliceAddress, mintAmount);
  await tx.wait();

  console.log("✅ Minted 1000 tokens to Alice:", AliceAddress);
}

main().catch((error) => {
  console.error("❌ Minting failed:", error);
  process.exit(1);
});
