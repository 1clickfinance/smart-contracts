// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract TestERC1155 is ERC1155 {
    /**
     * @dev Constructor that gives 2 tokens to creator
     */
    constructor() ERC1155("") {
        _mint(msg.sender, 1, 10, "");
    }
}