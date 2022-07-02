// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestERC20 is ERC20 {
    /**
     * @dev Constructor that gives 100 tokens to creator
     */
    constructor() ERC20("Test erc 20", "T20") {
        _mint(msg.sender, 100);
    }
}