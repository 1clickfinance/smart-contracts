// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IZeroXWrapper } from "./IZeroXWrapper.sol";

contract ZeroXWrapper is IZeroXWrapper {
    address public zeroXProxy;
    
    constructor(address _zeroXProxy) { 
        zeroXProxy = _zeroXProxy;
    }

    /**
     * This will keep the swapped tokens in the smart contract. Use this for delagated calls 
     * and wrapping around other functionality
     */
    function swapWithZeroExForContract(
        address sellTokenAddress,
        uint256 sellAmount,
        bytes calldata zeroExData
    ) override external {
        _swapWithZeroEx(sellTokenAddress, sellAmount, zeroExData);
    }

    function swapWithZeroExForUser(
        address buyTokenAddress,
        address sellTokenAddress,
        address onBehalfOf,
        uint256 sellAmount,
        bytes calldata zeroExData
    ) override external {
        _swapWithZeroEx(sellTokenAddress, sellAmount, zeroExData);

        // Transfer the swapped token to user
        IERC20 buyToken = IERC20(buyTokenAddress);
        buyToken.transfer(onBehalfOf, buyToken.balanceOf(address(this)));
    }

    function _swapWithZeroEx(
        address sellTokenAddress,
        uint256 sellAmount,
        bytes calldata zeroExData
    ) internal {
        IERC20 sellToken = IERC20(sellTokenAddress);

        // 1. Transfer the user's tokens to this contract
        sellToken.transferFrom(msg.sender, address(this), sellAmount);

        // 2. Set allowance to the ZeroX target
        sellToken.approve(zeroXProxy, sellAmount);

        // 3. Do the ZeroX swap
        (bool zeroXExecuted, ) = zeroXProxy.call(zeroExData);
        require(zeroXExecuted, "ZeroX Swap failed");
    }
}