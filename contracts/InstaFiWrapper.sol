// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";

contract InstaFiWrapper {

    struct CallUnit {
        address contractAddress;
        bytes4 functionSelector;
        bytes functionArguments;
        uint256 value;
    }

    constructor() { }

    /**
     * Call the given contracts with the given callData
     */
    function executeExternal(CallUnit[] memory callUnits) public payable {
        bool callExecuted = false;
        bytes memory callData;

        for (uint256 i = 0; i < callUnits.length; i++) {
            callData = bytes.concat(callUnits[i].functionSelector, callUnits[i].functionArguments);

            (callExecuted, ) = callUnits[i].contractAddress.call{ value: callUnits[i].value }(callData);
            require(callExecuted, string(abi.encodePacked("EXTERNAL_CALL_FAILED in call #", Strings.toString(i))));

            emit CallExecuted(
                callUnits[i].contractAddress, 
                callUnits[i].functionSelector, 
                callUnits[i].functionArguments, 
                callUnits[i].value
            );
        }
    }

    event CallExecuted(address indexed contractAddress, bytes4 indexed functionSelector, bytes functionArguments, uint256 value);

}