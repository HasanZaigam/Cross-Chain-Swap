// src/components/WalletConnection.jsx
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContracts } from "../utils/getContractByChain";

const WalletConnection = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [networkName, setNetworkName] = useState(null);
  const [escrowAddress, setEscrowAddress] = useState(null);
  const [tokenAddress, setTokenAddress] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("🦊 MetaMask not found");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

    if (accounts) {
      const userAddress = accounts[0];
      setWalletAddress(userAddress);
      const network = await provider.getNetwork();
      setNetworkName(network.name);

      // Fetch contract details based on the network chain ID
      try {
        const { escrow, token } = getContracts(network.chainId);
        setEscrowAddress(escrow);
        setTokenAddress(token);
      } catch (err) {
        console.error("❌ Unsupported network:", err.message);
      }
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      connectWallet();
    }
  }, []);

  return (
    <div className="wallet-info">
      {walletAddress ? (
        <div>
          <p>🪙 Wallet: {walletAddress}</p>
          <p>🌐 Network: {networkName}</p>
          <p>Escrow Contract: {escrowAddress}</p>
          <p>Token Contract: {tokenAddress}</p>
        </div>
      ) : (
        <button onClick={connectWallet} className="connect-wallet-btn">
          Connect MetaMask Wallet
        </button>
      )}
    </div>
  );
};

export default WalletConnection;
