import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

export default function TokenBalance({ provider, tokenAddress, walletAddress }) {
  const [balance, setBalance] = useState("...");

  useEffect(() => {
    if (!provider || !tokenAddress || !walletAddress) return;

    async function fetchBalance() {
      const abi = [
        "function balanceOf(address) view returns (uint256)",
        "function decimals() view returns (uint8)",
      ];
      const contract = new ethers.Contract(tokenAddress, abi, provider);
      const raw = await contract.balanceOf(walletAddress);
      const decimals = await contract.decimals();
      setBalance(ethers.formatUnits(raw, decimals));
    }

    fetchBalance();
  }, [provider, tokenAddress, walletAddress]);

  return (
    <div className="mt-4">
      <p><strong>Token Balance:</strong> {balance}</p>
    </div>
  );
}
