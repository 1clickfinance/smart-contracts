import { getEnvVariable, Erc20Interface } from "./commons"
import { ethers } from "hardhat"
import axios from "axios"

async function main() {
    const srcToken = "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664" // USDC.e
    const dstToken = "0xd586e7f844cea2f87f50152665bcbc2c279d8d70" // DAI
    const srcAmount = "100000"
    const userAddress = "0xbAe00583E381821b8aec9B4aebB4E52864100baE"

    const aaveSwapperAddress = getEnvVariable("ZEROX_AAVE_WRAPPER_ADDRESS")
    
    const owner = (await ethers.getSigners())[0]

    const orderParams = new URLSearchParams({
        buyToken: dstToken,
        sellToken: srcToken,
        sellAmount: srcAmount,
        taker: owner.address,
        slippagePercentage: '0.03'
    })
   
    const orderResponse = await axios.get(
        `https://avalanche.api.0x.org/swap/v1/quote`,
        {
            params: orderParams
        }
    )
    console.log(orderResponse)

    // 1. Approve spending for the wrapper
    const erc20Token = new ethers.Contract(srcToken, Erc20Interface, owner)
    const balance = await erc20Token.balanceOf(owner.address)
    const approval = await erc20Token.approve(
        aaveSwapperAddress, 
        balance,
    )
    console.log(`Approval is`, approval)
    await approval.wait()
    
    // 2. Do the swap & transfer using wrapper
    const contract = await ethers.getContractFactory("AaveZeroXWrapper")
    const aaveSwapContract = contract.attach(aaveSwapperAddress)
    const swapResult = await aaveSwapContract.swap(
        dstToken,
        srcToken,
        userAddress,
        srcAmount,
        orderResponse.data.data,
        {
            gasLimit: 400000,
        }
    )
    console.log("Swap result:", swapResult)
    await swapResult.wait()
}

main().then(() => process.exit(0)).catch(error => {
    console.error(error)
    process.exit(1)
})