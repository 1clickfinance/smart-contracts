// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract TestExternal {
    string public message;
    uint256 public value;

    constructor(string memory initMessage, uint256 initValue) { 
        message = initMessage;
        value = initValue;
    }

    function updateValues(string calldata _message, uint256 _value) public payable {
        message = _message;
        value = _value;
    }
}