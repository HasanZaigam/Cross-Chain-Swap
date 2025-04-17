// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Escrow {
    IERC20 public token;
    address public admin;

    mapping(bytes32 => bool) public executed; // prevent replay

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    constructor(address _token) {
        token = IERC20(_token);
        admin = msg.sender;
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "Amount > 0");
        token.transferFrom(msg.sender, address(this), amount);
        emit Deposited(msg.sender, amount);
    }

    function withdraw(
        address to,
        uint256 amount,
        uint256 nonce,
        bytes calldata signature
    ) external {
        require(msg.sender == admin, "Only admin");

        bytes32 messageHash = getMessageHash(to, amount, nonce);
        require(!executed[messageHash], "Already executed");

        address signer = recoverSigner(messageHash, signature);
        require(signer == to, "Invalid signer");

        executed[messageHash] = true;

        token.transfer(to, amount);
        emit Withdrawn(to, amount);
    }

    function getMessageHash(
        address to,
        uint256 amount,
        uint256 nonce
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(to, amount, nonce));
    }

    function recoverSigner(
        bytes32 messageHash,
        bytes memory signature
    ) public pure returns (address) {
        bytes32 ethSignedMessageHash =
            keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));

        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);

        return ecrecover(ethSignedMessageHash, v, r, s);
    }

    function splitSignature(
        bytes memory sig
    ) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "Invalid sig length");

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
}
