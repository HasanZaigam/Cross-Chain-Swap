const Escrow_ABI = [
    {
      inputs: [{ internalType: "address", name: "_token", type: "address" }],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      name: "deposit",
      inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    // add refund and adminWithdraw later if needed
  ];
  
  export default Escrow_ABI;
  