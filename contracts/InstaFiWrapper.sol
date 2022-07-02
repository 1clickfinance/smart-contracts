// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";

contract InstaFiWrapper is IERC721Receiver, IERC1155Receiver {

    struct CallUnit {
        address contractAddress;
        bytes4 functionSelector;
        bytes functionArguments;
        uint256 value;
    }
    mapping(bytes4 => bool) internal callsToVerify;

    constructor() {
        // Cannot use selector on overloaded functions - see https://github.com/ethereum/solidity/issues/1256
        // So, using good old signatures through out
        callsToVerify[bytes4(keccak256("transferFrom(address,address,uint256)"))] = true;                               // ERC20, ERC721
        callsToVerify[bytes4(keccak256("safeTransferFrom(address,address,uint256)"))] = true;                           // ERC721
        callsToVerify[bytes4(keccak256("safeTransferFrom(address,address,uint256,bytes)"))] = true;                     // ERC721
        callsToVerify[bytes4(keccak256("safeTransferFrom(address,address,uint256,uint256,bytes)"))] = true;             // ERC1155
        callsToVerify[bytes4(keccak256("safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)"))] = true;    // ERC1155
    }

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
    
    // These are just so we can receive tokens through safeTransfers
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) override external returns (bytes4) {
        emit ERC721Received(operator, from, tokenId, data);
        return IERC721Receiver.onERC721Received.selector;
    }
    
    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) override external returns (bytes4) {
        emit ERC1155Received(operator, from, id, value, data);
        return IERC1155Receiver.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) override external returns (bytes4) {
        emit ERC1155BatchReceived(operator, from, ids, values, data);
        return IERC1155Receiver.onERC1155BatchReceived.selector;
    }

    function supportsInterface(bytes4 interfaceId) override external pure returns (bool) {
        return IERC165.supportsInterface.selector == interfaceId;
    }

    function verifyIfCallPermitted(bytes4 functionSelector, bytes memory functionArguments) private view {
        if (callsToVerify[functionSelector]) {
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

    event CallExecuted(
        address indexed contractAddress, 
        bytes4 indexed functionSelector, 
        bytes functionArguments, 
        uint256 value
    );
    event ERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes data
    );
    event ERC1155Received(
        address indexed operator, 
        address indexed from, 
        uint256 id, 
        uint256 value, 
        bytes data
    );
    event ERC1155BatchReceived(
        address indexed operator, 
        address indexed from, 
        uint256[] ids, 
        uint256[] values, 
        bytes data
    );

}