// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { AaveWrapper } from "./aave/AaveWrapper.sol";
import { ZeroXWrapper } from "./zerox/ZeroXWrapper.sol";

contract AaveZeroXWrapper is AaveWrapper, ZeroXWrapper {

    constructor(
        address _zeroXProxy, 
        address _aavePoolAddress
    ) ZeroXWrapper(_zeroXProxy) AaveWrapper(_aavePoolAddress) { }

    function swapAndLend(
        address sellTokenAddress,
        uint256 sellAmount,
        bytes calldata zeroExData,
        address lendTokenAddress,
        address onBehalfOf
    ) external {
        // 1. Swap to the lending token
        _swapWithZeroEx(
            sellTokenAddress,
            sellAmount,
            zeroExData
        );

        // 2. Deposit the lend token to aave pool
        IERC20 lendToken = IERC20(lendTokenAddress);
        _supplyToAave(
            lendTokenAddress, 
            lendToken.balanceOf(address(this)), 
            onBehalfOf
        );
    }

}