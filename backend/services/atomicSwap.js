const { ethers } = require('ethers');
const crypto = require('crypto');
const mongoose = require('mongoose');

// Define Swap Schema
const swapSchema = new mongoose.Schema({
    swapId: { type: String, required: true, unique: true },
    initiatorAddress: { type: String, required: true },
    counterpartyAddress: { type: String, required: true },
    initiatorToken: { type: String, required: true },
    counterpartyToken: { type: String, required: true },
    initiatorAmount: { type: String, required: true },
    counterpartyAmount: { type: String, required: true },
    hashlock: { type: String, required: true },
    preimage: { type: String },
    initiatorTimelock: { type: Number, required: true },
    counterpartyTimelock: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['PENDING', 'INITIATED', 'COMPLETED', 'REFUNDED', 'EXPIRED'],
        default: 'PENDING'
    },
    initiatorTxHash: { type: String },
    counterpartyTxHash: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Swap = mongoose.model('Swap', swapSchema);

// Network configurations
const networks = {
    sepolia: {
        rpc: "https://eth-sepolia.g.alchemy.com/v2/demo",
        htlcAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",  // Replace with your actual HTLC contract address
        tokenAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",  // Replace with your actual token address
        privateKey: "0x79fb6d26b229491957879a682d96fb067b4d334298a8c8d162477044c9839a6a"
    },
    baseSepolia: {
        rpc: "https://sepolia.base.org",
        htlcAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",  // Replace with your actual HTLC contract address
        tokenAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",  // Replace with your actual token address
        privateKey: "0x79fb6d26b229491957879a682d96fb067b4d334298a8c8d162477044c9839a6a"
    }
};

// Validate private key format
function validatePrivateKey(key, network) {
    if (!key) {
        throw new Error(`Private key is missing for ${network}`);
    }
    // Add 0x prefix if not present
    if (!key.startsWith('0x')) {
        key = '0x' + key;
    }
    if (key.length !== 66) {
        throw new Error(`Invalid private key length for ${network}. Must be 32 bytes (64 hex chars) + '0x' prefix`);
    }
    return key;
}

// Validate contract addresses
function validateContractAddresses() {
    // Validate HTLC addresses
    if (!networks.sepolia.htlcAddress || !networks.sepolia.htlcAddress.startsWith('0x') || networks.sepolia.htlcAddress.length !== 42) {
        throw new Error('Invalid HTLC contract address for Sepolia');
    }
    if (!networks.baseSepolia.htlcAddress || !networks.baseSepolia.htlcAddress.startsWith('0x') || networks.baseSepolia.htlcAddress.length !== 42) {
        throw new Error('Invalid HTLC contract address for Base Sepolia');
    }

    // Validate token addresses
    if (!networks.sepolia.tokenAddress || !networks.sepolia.tokenAddress.startsWith('0x') || networks.sepolia.tokenAddress.length !== 42) {
        throw new Error('Invalid token contract address for Sepolia');
    }
    if (!networks.baseSepolia.tokenAddress || !networks.baseSepolia.tokenAddress.startsWith('0x') || networks.baseSepolia.tokenAddress.length !== 42) {
        throw new Error('Invalid token contract address for Base Sepolia');
    }
}

// HTLC ABI
const htlcABI = [
    "function initiateSwap(bytes32 swapId, address token, address payable recipient, uint256 amount, bytes32 hashlock, uint256 timelock) external",
    "function claim(bytes32 swapId, bytes32 preimage) external",
    "function refund(bytes32 swapId) external",
    "function getSwap(bytes32 swapId) external view returns (address token, address sender, address recipient, uint256 amount, bytes32 hashlock, uint256 timelock, bool withdrawn, bool refunded, bytes32 preimage)"
];

class AtomicSwapService {
    constructor() {
        // Validate contract addresses
        validateContractAddresses();

        // Validate private keys before creating providers
        validatePrivateKey(networks.sepolia.privateKey, 'Sepolia');
        validatePrivateKey(networks.baseSepolia.privateKey, 'Base Sepolia');

        // Log network configuration (without private keys)
        console.log('Network Configuration:');
        console.log('Sepolia:', {
            rpc: networks.sepolia.rpc,
            htlcAddress: networks.sepolia.htlcAddress,
            tokenAddress: networks.sepolia.tokenAddress
        });
        console.log('Base Sepolia:', {
            rpc: networks.baseSepolia.rpc,
            htlcAddress: networks.baseSepolia.htlcAddress,
            tokenAddress: networks.baseSepolia.tokenAddress
        });

        this.providers = {
            sepolia: new ethers.JsonRpcProvider(networks.sepolia.rpc),
            baseSepolia: new ethers.JsonRpcProvider(networks.baseSepolia.rpc)
        };
        
        this.wallets = {
            sepolia: new ethers.Wallet(networks.sepolia.privateKey, this.providers.sepolia),
            baseSepolia: new ethers.Wallet(networks.baseSepolia.privateKey, this.providers.baseSepolia)
        };

        this.contracts = {
            sepolia: new ethers.Contract(networks.sepolia.htlcAddress, htlcABI, this.wallets.sepolia),
            baseSepolia: new ethers.Contract(networks.baseSepolia.htlcAddress, htlcABI, this.wallets.baseSepolia)
        };
    }

    // Generate a random secret and its hash
    generateSecret() {
        const secret = crypto.randomBytes(32);
        const hash = crypto.createHash('sha256').update(secret).digest('hex');
        return {
            secret: secret.toString('hex'),
            hash: hash
        };
    }

    // Create a new swap
    async createSwap(initiatorAddress, counterpartyAddress, initiatorAmount, counterpartyAmount) {
        const { secret, hash } = this.generateSecret();
        const swapId = ethers.keccak256(ethers.toUtf8Bytes(secret + Date.now().toString()));
        
        // Set timelocks (24 hours from now)
        const timelock = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

        const swap = new Swap({
            swapId: swapId,
            initiatorAddress,
            counterpartyAddress,
            initiatorToken: networks.sepolia.tokenAddress,
            counterpartyToken: networks.baseSepolia.tokenAddress,
            initiatorAmount: ethers.parseEther(initiatorAmount).toString(),
            counterpartyAmount: ethers.parseEther(counterpartyAmount).toString(),
            hashlock: hash,
            preimage: secret,
            initiatorTimelock: timelock,
            counterpartyTimelock: timelock,
            status: 'PENDING'
        });

        await swap.save();
        return swap;
    }

    // Initiate the swap on Sepolia (Alice's side)
    async initiateSwap(swapId) {
        const swap = await Swap.findOne({ swapId });
        if (!swap) throw new Error('Swap not found');
        if (swap.status !== 'PENDING') throw new Error('Invalid swap status');

        try {
            const tx = await this.contracts.sepolia.initiateSwap(
                swapId,
                networks.sepolia.tokenAddress,
                swap.counterpartyAddress,
                swap.initiatorAmount,
                swap.hashlock,
                swap.initiatorTimelock
            );

            await tx.wait();
            
            swap.status = 'INITIATED';
            swap.initiatorTxHash = tx.hash;
            swap.updatedAt = new Date();
            await swap.save();

            return swap;
        } catch (error) {
            console.error('Error initiating swap:', error);
            throw error;
        }
    }

    // Initiate the swap on Base Sepolia (Bob's side)
    async initiateCounterpartySwap(swapId) {
        const swap = await Swap.findOne({ swapId });
        if (!swap) throw new Error('Swap not found');
        if (swap.status !== 'INITIATED') throw new Error('Invalid swap status');

        try {
            const tx = await this.contracts.baseSepolia.initiateSwap(
                swapId,
                networks.baseSepolia.tokenAddress,
                swap.initiatorAddress,
                swap.counterpartyAmount,
                swap.hashlock,
                swap.counterpartyTimelock
            );

            await tx.wait();
            
            swap.counterpartyTxHash = tx.hash;
            swap.updatedAt = new Date();
            await swap.save();

            return swap;
        } catch (error) {
            console.error('Error initiating counterparty swap:', error);
            throw error;
        }
    }

    // Claim tokens using the preimage
    async claimSwap(swapId, network) {
        const swap = await Swap.findOne({ swapId });
        if (!swap) throw new Error('Swap not found');
        if (!swap.preimage) throw new Error('Preimage not found');

        try {
            const tx = await this.contracts[network].claim(
                swapId,
                swap.preimage
            );

            await tx.wait();
            
            swap.status = 'COMPLETED';
            swap.updatedAt = new Date();
            await swap.save();

            return swap;
        } catch (error) {
            console.error('Error claiming swap:', error);
            throw error;
        }
    }

    // Refund tokens if timelock expires
    async refundSwap(swapId, network) {
        const swap = await Swap.findOne({ swapId });
        if (!swap) throw new Error('Swap not found');
        if (swap.status === 'COMPLETED') throw new Error('Swap already completed');

        try {
            const tx = await this.contracts[network].refund(swapId);
            await tx.wait();
            
            swap.status = 'REFUNDED';
            swap.updatedAt = new Date();
            await swap.save();

            return swap;
        } catch (error) {
            console.error('Error refunding swap:', error);
            throw error;
        }
    }

    // Get swap status
    async getSwapStatus(swapId) {
        const swap = await Swap.findOne({ swapId });
        if (!swap) throw new Error('Swap not found');
        return swap;
    }
}

module.exports = new AtomicSwapService(); 