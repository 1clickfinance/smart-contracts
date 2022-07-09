import { getEnvVariable, Erc20Abi } from "./commons"
import { ethers } from "hardhat"
import axios from "axios"



async function main() {
    const srcToken = "0xad6d458402f60fd3bd25163575031acdce07538d" // DAI
    const dstToken = "0xc778417e063141139fce010982780140aa0cd5ab" // WETH
    const srcAmount = "100000000000000000"
    const userAddress = "0xbAe00583E381821b8aec9B4aebB4E52864100baE"

    const swapperAddress = getEnvVariable("SWAPS_WRAPPER_ADDRESS")
    
    const owner = (await ethers.getSigners())[0]

    const orderParams = new URLSearchParams({
        buyToken: dstToken,
        sellToken: srcToken,
        sellAmount: srcAmount,
        taker: owner.address,
        slippagePercentage: '0.03'
    })
   
    const orderResponse = await axios.get(
        `https://ropsten.api.0x.org/swap/v1/quote`,
        {
            params: orderParams
        }
    )
    console.log(orderResponse)

    // 1. Approve spending for the wrapper
    const erc20Token = new ethers.Contract(srcToken, Erc20Abi, owner)
    const balance = await erc20Token.balanceOf(owner.address)
    const approval = await erc20Token.approve(
        swapperAddress, 
        balance,
    )
    console.log(`Approval is`, approval)
    await approval.wait()
    
    // 2. Do the swap & transfer using wrapper
    const contract = await ethers.getContractFactory("SwapsWrapper")
    const swapContract = contract.attach(swapperAddress)
    const swapResult = await swapContract.swapWithZeroExForUser(
        dstToken,
        srcToken,
        orderResponse.data.allowanceTarget,
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