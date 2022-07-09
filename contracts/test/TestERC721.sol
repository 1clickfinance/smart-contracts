// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TestERC721 is ERC721 {
    /**
     * @dev Constructor that gives 2 tokens to creator
     */
    constructor() ERC721("Test erc 721", "T721") {
        _mint(msg.sender, 1);
        _mint(msg.sender, 2);
    }
}