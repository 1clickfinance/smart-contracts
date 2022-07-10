// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

interface IAaveWrapper {

    function supplyToAave(address lendToken, uint256 amount, address onBehalfOf) external;
}