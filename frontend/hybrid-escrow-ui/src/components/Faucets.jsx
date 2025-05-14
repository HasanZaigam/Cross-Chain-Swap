// src/components/Faucet.jsx

import React, { useState } from "react";
import { ethers } from "ethers";
import ERC20_ABI from "../abis/ERC20";
import {
  RPCS,
  TOKEN_ADDRESSES,
  EXPLORERS,
  PRIVATE_KEY,
} from "../config/network";

function Faucet() {
  const [chainId, setChainId] = useState("11155111");
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");

  const handleSend = async () => {
    try {
      const rpc = RPCS[chainId];
      if (!rpc) throw new Error("Unsupported chain");

      const provider = new ethers.JsonRpcProvider(rpc);
      const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

      const tokenAddress = TOKEN_ADDRESSES[chainId];
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);

      const decimals = await tokenContract.decimals();
      const balance = await tokenContract.balanceOf(await wallet.getAddress());
      const amountToSend = ethers.parseUnits(amount, decimals);

      if (balance < amountToSend) {
        alert("❌ Not enough tokens!");
        return;
      }

      const tx = await tokenContract.transfer(toAddress, amountToSend);
      await tx.wait();
      setTxHash(tx.hash);
      alert(`✅ Tokens sent! TX Hash: ${tx.hash}`);
    } catch (err) {
      console.error("❌ Error sending tokens:", err);
      alert("Something went wrong. Check console.");
    }
  };

  return (
    <div className="p-4 bg-gray-800 text-white max-w-md mx-auto rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">🎁 Token Faucet</h2>

      <div className="mb-3">
        <label className="block mb-1">Select Network</label>
        <select
          value={chainId}
          onChange={(e) => setChainId(e.target.value)}
          className="text-black w-full p-2 rounded"
        >
          <option value="11155111">Ethereum Sepolia</option>
          <option value="84532">Base Sepolia</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="block mb-1">Recipient Address</label>
        <input
          type="text"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          className="text-black w-full p-2 rounded"
        />
      </div>

      <div className="mb-3">
        <label className="block mb-1">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="text-black w-full p-2 rounded"
        />
      </div>

      <button
        onClick={handleSend}
        className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
      >
        🚀 Send Tokens
      </button>

      {txHash && (
        <p className="mt-4">
          ✅ Transaction:{" "}
          <a
            href={`${EXPLORERS[chainId]}${txHash}`}
            className="text-blue-400 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Explorer
          </a>
        </p>
      )}
    </div>
  );
}

export default Faucet;
