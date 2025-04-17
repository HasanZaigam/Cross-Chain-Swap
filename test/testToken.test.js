const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parseEther } = require("ethers");

describe("testToken", function () {
  let TestToken, token, owner, addr1, addr2, initialSupply;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    initialSupply = parseEther("1000000");

    TestToken = await ethers.getContractFactory("TestToken");
    token = await TestToken.deploy("Test Token", "TTK", initialSupply);
  });

  it("Should have correct name and symbol", async function () {
    expect(await token.name()).to.equal("Test Token");
    expect(await token.symbol()).to.equal("TTK");
  });

  it("Should assign the initial supply to the owner", async function () {
    const balance = await token.balanceOf(owner.address);
    expect(balance).to.equal(initialSupply);
  });

  it("Should transfer tokens between accounts", async function () {
    const amount = parseEther("1000");
    await token.transfer(addr1.address, amount);
    expect(await token.balanceOf(addr1.address)).to.equal(amount);
  });

  it("Should fail if sender doesn't have enough balance", async function () {
    const amount = parseEther("1000");
    await expect(
      token.connect(addr1).transfer(addr2.address, amount)
    ).to.be.reverted;
  });

  it("Should update balances after transfers", async function () {
    const amount = parseEther("1000");
    await token.transfer(addr1.address, amount);
    await token.connect(addr1).transfer(addr2.address, amount);
    expect(await token.balanceOf(addr1.address)).to.equal(0);
    expect(await token.balanceOf(addr2.address)).to.equal(amount);
  });
});
