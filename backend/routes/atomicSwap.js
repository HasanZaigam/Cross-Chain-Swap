const express = require('express');
const router = express.Router();
const atomicSwapService = require('../services/atomicSwap');

// Create a new swap
router.post('/create', async (req, res) => {
    try {
        const {
            initiatorAddress,
            counterpartyAddress,
            initiatorAmount,
            counterpartyAmount
        } = req.body;

        if (!initiatorAddress || !counterpartyAddress || !initiatorAmount || !counterpartyAmount) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const swap = await atomicSwapService.createSwap(
            initiatorAddress,
            counterpartyAddress,
            initiatorAmount,
            counterpartyAmount
        );

        res.json(swap);
    } catch (error) {
        console.error('Error creating swap:', error);
        res.status(500).json({ error: error.message });
    }
});

// Initiate swap on Sepolia (Alice's side)
router.post('/initiate/:swapId', async (req, res) => {
    try {
        const { swapId } = req.params;
        const swap = await atomicSwapService.initiateSwap(swapId);
        res.json(swap);
    } catch (error) {
        console.error('Error initiating swap:', error);
        res.status(500).json({ error: error.message });
    }
});

// Initiate swap on Base Sepolia (Bob's side)
router.post('/initiate-counterparty/:swapId', async (req, res) => {
    try {
        const { swapId } = req.params;
        const swap = await atomicSwapService.initiateCounterpartySwap(swapId);
        res.json(swap);
    } catch (error) {
        console.error('Error initiating counterparty swap:', error);
        res.status(500).json({ error: error.message });
    }
});

// Claim swap
router.post('/claim/:swapId', async (req, res) => {
    try {
        const { swapId } = req.params;
        const { network } = req.body; // 'sepolia' or 'baseSepolia'

        if (!network || !['sepolia', 'baseSepolia'].includes(network)) {
            return res.status(400).json({ error: 'Invalid network specified' });
        }

        const swap = await atomicSwapService.claimSwap(swapId, network);
        res.json(swap);
    } catch (error) {
        console.error('Error claiming swap:', error);
        res.status(500).json({ error: error.message });
    }
});

// Refund swap
router.post('/refund/:swapId', async (req, res) => {
    try {
        const { swapId } = req.params;
        const { network } = req.body; // 'sepolia' or 'baseSepolia'

        if (!network || !['sepolia', 'baseSepolia'].includes(network)) {
            return res.status(400).json({ error: 'Invalid network specified' });
        }

        const swap = await atomicSwapService.refundSwap(swapId, network);
        res.json(swap);
    } catch (error) {
        console.error('Error refunding swap:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get swap status
router.get('/status/:swapId', async (req, res) => {
    try {
        const { swapId } = req.params;
        const swap = await atomicSwapService.getSwapStatus(swapId);
        res.json(swap);
    } catch (error) {
        console.error('Error getting swap status:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 