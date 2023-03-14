// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OneClickRouter {
    using SafeERC20 for IERC20;
    event OrderExecuted(
        address asset,
        uint256 amount,
        address protocolContractAddress
    );

    event Received(address, uint);
    event Balance(uint256);

    mapping(address => uint) public balanceReceived;

    function _approveTokenIfNeeded(
        address token,
        address spender,
        uint256 amount
    ) private {
        if (IERC20(token).allowance(address(this), spender) == 0) {
            IERC20(token).safeApprove(spender, amount);
        }
    }

    function _pullTokens(address user, address asset, uint256 amount) private {
        if (asset == address(0)) return;
        IERC20(asset).safeTransferFrom(user, address(this), amount);
    }

    function execute(
        address asset,
        uint256 amount,
        address protocolContractAddress,
        address[] memory inputTokens,
        address[] memory outputTokens,
        bytes calldata txData
    ) external {
        uint256 value = 0;
        for (uint i = 0; i < inputTokens.length; i++) {
            address inputToken = inputTokens[i];
            // Pull money from msg.sender
            _pullTokens(msg.sender, inputToken, amount);
            // Allow protocolAddress for pulling amount from this contract
            uint256 balance;
            if (inputToken == address(0)) {
                value = balanceReceived[msg.sender];
                require(
                    value >= amount,
                    "User's native token balance in contract is not enough"
                );
                value = amount;
            } else {
                value = 0;
                balance = IERC20(inputToken).balanceOf(address(this));
                require(balance > 0, "Not enough balance for the step");
                _approveTokenIfNeeded(
                    inputToken,
                    protocolContractAddress,
                    balance
                );
            }
        }

        // Call txData on protocolAddress
        (bool success, bytes memory result) = protocolContractAddress.call{
            value: value
        }(txData);

        if (!success) {
            // Next 5 lines from https://ethereum.stackexchange.com/a/83577
            if (result.length < 68) revert();
            assembly {
                result := add(result, 0x04)
            }
            revert(abi.decode(result, (string)));
        }

        for (uint i = 0; i < outputTokens.length; i++) {
            address outputToken = outputTokens[i];
            uint256 outputTokenBalance = IERC20(outputToken).balanceOf(
                address(this)
            );
            IERC20(outputToken).safeTransfer(msg.sender, outputTokenBalance);
        }

        emit OrderExecuted(asset, amount, protocolContractAddress);
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
        balanceReceived[msg.sender] += msg.value;
    }

    function withdrawAllMoney(address payable _to) public {
        uint balanceToSend = balanceReceived[msg.sender];
        balanceReceived[msg.sender] = 0;
        _to.transfer(balanceToSend);
    }
}
