// src/utils/getContractsByChain.js

import { CONTRACTS } from "../constants/ContractConfig";

export function getContracts(chainId) {
  const id = Number(chainId);
  if (CONTRACTS[id]) {
    return CONTRACTS[id];
  } else {
    throw new Error("Unsupported network");
  }
}


