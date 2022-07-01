// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";

contract InstaFiWrapper {

    constructor() { }

    /**
     * Call the given contracts with the given callData
     */
    function executeExternal(
        address[] calldata contracts, 
        bytes[] calldata methodData, 
        uint256[] calldata methodValues
    ) public payable {
        require(contracts.length == methodData.length, "CONTRACTS_METHODDATA_LENGTH_MISSMATCH");
        require(contracts.length == methodValues.length, "CONTRACTS_METHODVALUES_LENGTH_MISSMATCH");

        bool callExecuted = false;
        for (uint256 i = 0; i < contracts.length; i++) {
            (callExecuted, ) = contracts[i].call{ value: methodValues[i] }(methodData[i]);
            require(callExecuted, string(abi.encodePacked("EXTERNAL_CALL_FAILED in call #", Strings.toString(i))));
        }
    }

}