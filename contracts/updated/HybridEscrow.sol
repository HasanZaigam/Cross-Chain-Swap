// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract HybridEscrow is ReentrancyGuard {
    address public immutable admin;
    IERC20 public immutable token;

    mapping(address => uint256) public depositedAmount;
    mapping(bytes32 => bool) public usedHashes;

    uint256 public constant TIMEOUT = 1 days; // After 1 day, refund allowed
    mapping(address => uint256) public depositTimestamps;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, address indexed to, uint256 amount);
    event Refunded(address indexed user, uint256 amount);

    constructor(address _token) {
        require(_token != address(0), "Invalid token address");
        admin = msg.sender;
        token = IERC20(_token);
    }

    // Deposit Function
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(token.transferFrom(msg.sender, address(this), amount), "Token transfer failed");

        depositedAmount[msg.sender] += amount;
        depositTimestamps[msg.sender] = block.timestamp;

        emit Deposited(msg.sender, amount);
    }

    // Admin Withdraw after verifying signature
    function adminWithdraw(
        address user,
        address to,
        uint256 amount,
        uint256 nonce,
        bytes calldata signature
    ) external nonReentrant {
        require(msg.sender == admin, "Only admin can withdraw");
        require(to != address(0), "Invalid recipient");

        bytes32 messageHash = keccak256(abi.encodePacked(user, to, amount, nonce, address(this)));
        require(!usedHashes[messageHash], "Hash already used");

        // OpenZeppelin v5.x: Use MessageHashUtils for toEthSignedMessageHash
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        address signer = ECDSA.recover(ethSignedMessageHash, signature);
        require(signer == user, "Invalid signature");

        require(depositedAmount[user] >= amount, "Insufficient deposit");

        usedHashes[messageHash] = true;
        depositedAmount[user] -= amount;
        require(token.transfer(to, amount), "Token transfer failed");

        emit Withdrawn(user, to, amount);
    }

    // Refund if timeout happens (user can call)
    function refund() external nonReentrant {
        require(depositedAmount[msg.sender] > 0, "No deposit found");
        require(block.timestamp >= depositTimestamps[msg.sender] + TIMEOUT, "Timeout not reached");

        uint256 amount = depositedAmount[msg.sender];
        depositedAmount[msg.sender] = 0;
        depositTimestamps[msg.sender] = 0; // Reset timestamp for safety
        require(token.transfer(msg.sender, amount), "Token transfer failed");

        emit Refunded(msg.sender, amount);
    }
}