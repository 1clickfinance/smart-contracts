import { getEnvVariable, Erc20Abi } from "./commons"
import { ethers } from "hardhat"
import axios from "axios"

async function main() {
    const srcToken = "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664" // USDCE.e on Avax mainnet
    const dstToken = "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7" // WAVAX on Avax mainnet

    const srcAmount = "100000"
    const userAddress = "0xbAe00583E381821b8aec9B4aebB4E52864100baE"

    const zeroXAaveWrapperAddress = getEnvVariable("ZEROX_AAVE_WRAPPER_ADDRESS")
    
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
    const erc20Token = new ethers.Contract(srcToken, Erc20Abi, owner)
    const balance = await erc20Token.balanceOf(owner.address)
    const approval = await erc20Token.approve(
        zeroXAaveWrapperAddress, 
        balance,
    )
    console.log(`Approval is`, approval)
    await approval.wait()
    
    // 2. Do the swap & transfer using wrapper
    const contract = await ethers.getContractFactory("AaveZeroXWrapper")
    const zeroXAaveWrapper = contract.attach(zeroXAaveWrapperAddress)
    const swapResult = await zeroXAaveWrapper.swapAndLend(
        srcToken,
        srcAmount,
        orderResponse.data.data,
        dstToken,
        userAddress,
        {
            gasLimit: 800000,
        }
    )
    console.log("Swap and Lend result:", swapResult)
    await swapResult.wait()
}

main().then(() => process.exit(0)).catch(error => {
    console.error(error)
    process.exit(1)
})