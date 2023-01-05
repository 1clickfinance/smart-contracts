// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.10;

import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {IERC20} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";
import {DataTypes} from "@aave/core-v3/contracts/protocol/libraries/types/DataTypes.sol";
import {IAaveWrapper} from "./IAaveWrapper.sol";

contract AaveV3Wrapper is IAaveWrapper {
    IPoolAddressesProvider public immutable ADDRESSES_PROVIDER;
    IPool public immutable POOL;

    constructor(address _addressProvider) {
        ADDRESSES_PROVIDER = IPoolAddressesProvider(_addressProvider);
        POOL = IPool(ADDRESSES_PROVIDER.getPool());
    }

    function supplyToAave(
        address supplyTokenAddress,
        uint256 supplyAmount,
        address onBehalfOf
    ) external override {
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

        // 2. Check the allowance of pool to transfer the supplyToken from this smart contract
        uint256 allowance = supplyToken.allowance(
            address(this),
            ADDRESSES_PROVIDER.getPool()
        );
        if (allowance < supplyAmount) {
            supplyToken.approve(ADDRESSES_PROVIDER.getPool(), supplyAmount);
        }

        // 3. Supply to the pool
        _supplyToAaveContract(supplyTokenAddress, supplyAmount, onBehalfOf);
    }

    function _supplyToAaveContract(
        address supplyTokenAddress,
        uint256 supplyAmount,
        address onBehalfOf
    ) internal {
        address asset = supplyTokenAddress;
        uint256 amount = supplyAmount;
        uint16 referralCode = 0;

        POOL.supply(asset, amount, onBehalfOf, referralCode);
    }

    function withdrawFromAave(
        address _tokenAddress,
        uint256 _amount
    ) external returns (uint256) {
        address asset = _tokenAddress;
        uint256 amount = _amount;

        DataTypes.ReserveData memory reserveData = POOL.getReserveData(asset);
        // 1. Transfer the user's aTokens to this contract
        address aTokenAddress = reserveData.aTokenAddress;
        IERC20 aToken = IERC20(aTokenAddress);
        aToken.transferFrom(msg.sender, address(this), amount);

        // 2. Withdraw tokens from aave to contract
        uint256 amountWithdrawn = POOL.withdraw(asset, amount, msg.sender);

        return amountWithdrawn;
    }

    function borrowFromAave(address _tokenAddress, uint256 _amount) external {
        address asset = _tokenAddress;
        uint256 amount = _amount;

        // 1. Smart contract borrows tokens at a stable rate
        //    on behalf of msg sender
        POOL.borrow(asset, amount, 1, 0, msg.sender);

        // 2. Transfer the borrowed asset to the user.
        IERC20 token = IERC20(asset);
        token.transfer(msg.sender, amount);
    }
}
