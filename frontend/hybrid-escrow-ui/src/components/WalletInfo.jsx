import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getContracts } from "../utils/getContractByChain";

export default function WalletInfo({ onReady }) {
  const [address, setAddress] = useState("");
  const [chainName, setChainName] = useState("");
  const [contracts, setContracts] = useState({});

  useEffect(() => {
    async function connect() {
      if (!window.ethereum) return alert("MetaMask not installed");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      try {
        const { escrow, token, name } = getContracts(network.chainId);
        setAddress(accounts[0]);
        setChainName(name);
        setContracts({ escrow, token });

        if (onReady) {
          onReady({ provider, signer, chainId: network.chainId, escrow, token });
        }
      } catch (err) {
        alert("Unsupported network. Please switch your chain in MetaMask.");
      }
    }

    connect();
  }, []);

  return (
    <div className="bg-gray-100 p-4 rounded shadow">
      <p><strong>Wallet:</strong> {address}</p>
      <p><strong>Network:</strong> {chainName}</p>
      <p><strong>Escrow Contract:</strong> {contracts.escrow}</p>
      <p><strong>Token Contract:</strong> {contracts.token}</p>
    </div>
  );
}
