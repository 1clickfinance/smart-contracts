// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SwapsWrapper {
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
        address allowanceTarget,
        uint256 sellAmount,
        bytes calldata zeroExData
    ) external {
        _swapWithZeroEx(sellTokenAddress, allowanceTarget, sellAmount, zeroExData);
    }

    function swapWithZeroExForUser(
        address buyTokenAddress,
        address sellTokenAddress,
        address allowanceTarget,
        address onBehalfOf,
        uint256 sellAmount,
        bytes calldata zeroExData
    ) external {
        _swapWithZeroEx(sellTokenAddress, allowanceTarget, sellAmount, zeroExData);

        // Transfer the swapped token to user
        IERC20 buyToken = IERC20(buyTokenAddress);
        buyToken.transfer(onBehalfOf, buyToken.balanceOf(address(this)));
    }

    function _swapWithZeroEx(
        address sellTokenAddress,
        address allowanceTarget,
        uint256 sellAmount,
        bytes calldata zeroExData
    ) private {
        IERC20 sellToken = IERC20(sellTokenAddress);

        // 1. Transfer the user's tokens to this contract
        sellToken.transferFrom(msg.sender, address(this), sellAmount);

        // 2. Set allowance to the ZeroX target
        sellToken.approve(allowanceTarget, sellAmount);

        // 3. Do the ZeroX swap
        (bool zeroXExecuted, ) = zeroXProxy.call(zeroExData);
        require(zeroXExecuted, "ZeroX Swap failed");
    }
}