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

    // Magic numbers derived from the method signature of the token standards
    bytes4 public constant ERC20_TRANSFER_FROM_FUNCTION_ID = 0x23b872dd;
    bytes4 public constant ERC721_SAFE_TRANSFER_FROM_ID = 0x42842e0e;
    bytes4 public constant ERC721_SAFE_TRANSFER_FROM_DATA_ID = 0xb88d4fde;
    bytes4 public constant ERC1155_SAFE_TRANSFER_FROM_ID = 0xf242432a;
    bytes4 public constant ERC1155_SAFE_BATCH_TRANSFER_FROM_ID = 0x2eb2c2d6;

    constructor() { }

    /**
     * Call the given contracts with the given callData
     */
    function executeExternal(CallUnit[] memory callUnits) public payable {
        bool callExecuted = false;
        bytes memory callData;

        for (uint256 i = 0; i < callUnits.length; i++) {
            verifyIfCallPermitted(callUnits[i].functionSelector, callUnits[i].functionArguments);

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

    function verifyIfCallPermitted(bytes4 functionSelector, bytes memory functionArguments) private view {
        if (
            functionSelector == ERC20_TRANSFER_FROM_FUNCTION_ID || 
            functionSelector == ERC721_SAFE_TRANSFER_FROM_ID || 
            functionSelector == ERC721_SAFE_TRANSFER_FROM_DATA_ID ||
            functionSelector == ERC1155_SAFE_TRANSFER_FROM_ID || 
            functionSelector == ERC1155_SAFE_BATCH_TRANSFER_FROM_ID
        ) {
            address fromAddress = _extractFromAddress(functionArguments);
            require(
                fromAddress == msg.sender || fromAddress == address(this), 
                "TOKEN_SPEND_NOT_PERMITTED_FOR_SENDER"
            );
        }
    }

    function _extractFromAddress(bytes memory functionArguments) private pure returns (address toAddress) {
        bytes memory addressBytes = _extractBytes(functionArguments, 12, 20);
        assembly {
            toAddress := mload(add(addressBytes, 20))
        }
    }
    
    function _extractBytes(bytes memory data, uint8 from, uint8 n) private pure returns (bytes memory) {
        bytes memory returnValue = new bytes(n);
        for (uint8 i = 0; i < n; i++) {
            returnValue[i] = data[i + from]; 
        }
        return returnValue;
    }

    event CallExecuted(address indexed contractAddress, bytes4 indexed functionSelector, bytes functionArguments, uint256 value);

}