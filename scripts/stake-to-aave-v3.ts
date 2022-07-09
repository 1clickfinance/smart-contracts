import { getEnvVariable, Erc20Abi, AavePoolAbi } from "./commons"
import { ethers } from "hardhat"

async function main() {
    const lendToken = "0x85b3362a4c46d57b77844cd64480657ba8d24c8c" // DAI
    const lendAmount = "100000000000000000"
    const userAddress = "0xbAe00583E381821b8aec9B4aebB4E52864100baE"

    const aavePoolAddress = "0x23a85024f54a19e243ba7a74e339a5c80998c7a4"

    const aaveWrapperAddress = getEnvVariable("AAVE_WRAPPER_ADDRESS")
    
    const owner = (await ethers.getSigners())[0]

    // 1. Approve spending for the wrapper
    const erc20Token = new ethers.Contract(lendToken, Erc20Abi, owner)
    const balance = await erc20Token.balanceOf(owner.address)
    const approval = await erc20Token.approve(
        aaveWrapperAddress, // aavePoolAddress,
        balance,
    )
    console.log(`Approval is`, approval)
    await approval.wait()
    
    // 2. Supply to aave pool
    const contract = await ethers.getContractFactory("AaveWrapper")
    const aaveWrapper = contract.attach(aaveWrapperAddress)
    const supplyResult = await aaveWrapper.supplyToAave(
        lendToken,
        lendAmount,
        userAddress,
        {
            gasLimit: 400000,
        }
    )
    console.log("Supply result:", supplyResult)
    await supplyResult.wait()
    // const aavePool = new ethers.Contract(aavePoolAddress, AavePoolAbi, owner)
    // const supplyResult = await aavePool.supply(
    //     lendToken,
    //     lendAmount,
    //     userAddress,
    //     0,
    //     {
    //         gasLimit: 400000,
    //     }
    // )
    // console.log("Supply result:", supplyResult)
}

main().then(() => process.exit(0)).catch(error => {
    console.error(error)
    process.exit(1)
})