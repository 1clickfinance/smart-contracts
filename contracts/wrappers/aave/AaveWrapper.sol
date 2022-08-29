// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IPool } from "./IPool.sol";
import { IAaveWrapper } from "./IAaveWrapper.sol";

contract AaveWrapper is IAaveWrapper {
    address public aavePoolAddress;
    
    constructor(address _aavePoolAddress) {
        aavePoolAddress = _aavePoolAddress;
    }

    function supplyToAave(
        address supplyTokenAddress,
        uint256 supplyAmount,
        address onBehalfOf
    ) override external {
        _supplyToAaveUser(supplyTokenAddress, supplyAmount, onBehalfOf);
    }

    function _supplyToAaveUser(
        address supplyTokenAddress,
        uint256 supplyAmount,
        address onBehalfOf
    ) internal {
        // 1. Transfer the user's tokens to this contract
        IERC20 supplyToken = IERC20(supplyTokenAddress);
        supplyToken.transferFrom(msg.sender, address(this), supplyAmount);

        // 2. Supply to the pool
        _supplyToAaveContract(supplyTokenAddress, supplyAmount, onBehalfOf);
    }

    function _supplyToAaveContract(
        address supplyTokenAddress,
        uint256 supplyAmount,
        address onBehalfOf
    ) internal {
        // 1. Approve token spend
        IERC20 supplyToken = IERC20(supplyTokenAddress);
        supplyToken.approve(aavePoolAddress, supplyAmount);

        // 2. Lend to pool
        IPool aavePool = IPool(aavePoolAddress);
        aavePool.supply(supplyTokenAddress, supplyAmount, onBehalfOf, 0);
    }
}