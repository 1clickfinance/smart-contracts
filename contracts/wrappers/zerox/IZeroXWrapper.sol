// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

interface IZeroXWrapper {

    /**
     * This will keep the swapped tokens in the smart contract. Use this for delagated calls 
     * and wrapping around other functionality
     */
    function swapWithZeroExForContract(
        address sellTokenAddress,
        uint256 sellAmount,
        bytes calldata zeroExData
    ) external;

    function swapWithZeroExForUser(
        address buyTokenAddress,
        address sellTokenAddress,
        address onBehalfOf,
        uint256 sellAmount,
        bytes calldata zeroExData
    ) external;
}