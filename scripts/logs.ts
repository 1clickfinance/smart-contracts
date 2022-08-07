import { getEnvVariable, Erc20Interface } from "./commons"
import { ethers } from "hardhat"
import { BigNumber } from "ethers";

async function main() {
    const receipt = await ethers.provider.getTransactionReceipt(
        "0xa6020a94ed78d81535376ef36dfc05a14e8bacd60c68ce89fe9cad664a44a0dc"
    );
    // console.log("Receipt is:", receipt.logs);

    let amount: BigNumber = BigNumber.from(0);
    const to: string = "0xbae00583E381821b8aec9B4aebB4E52864100bae";

    // Let's parse through each log as if it fits an erc20 Transfer event
    receipt.logs.forEach(log => {
        try {
            const parsedLog = Erc20Interface.parseLog(log);
            const toAddr: string = parsedLog.args[1];

            if (toAddr.toLowerCase() === to.toLowerCase()) {
                amount = parsedLog.args[2];
            }
        } catch (err) {
            // Doesn't fit into an erc20 event. Do nothing.
        }
    });

    console.log("Transfer amount to user:", amount.toNumber());
}

main().then(() => process.exit(0)).catch(error => {
    console.error(error)
    process.exit(1)
})