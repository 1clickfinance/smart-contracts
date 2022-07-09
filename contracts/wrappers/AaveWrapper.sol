// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IPool } from "./aave/IPool.sol";

contract AaveWrapper {
    address public aavePoolAddress;
    
    constructor(address _aavePoolAddress) {
        aavePoolAddress = _aavePoolAddress;
    }

    function supplyToAave(
        address supplyTokenAddress,
        uint256 supplyAmount,
        address onBehalfOf
    ) external {
        IPool aavePool = IPool(aavePoolAddress);
        IERC20 supplyToken = IERC20(supplyTokenAddress);

        // 1. Transfer the user's tokens to this contract
        supplyToken.transferFrom(msg.sender, address(this), supplyAmount);

        // 2. Approve token spend
        supplyToken.approve(aavePoolAddress, supplyAmount);

        // 3. Supply to the pool
        aavePool.supply(supplyTokenAddress, supplyAmount, onBehalfOf, 0);
    }
}