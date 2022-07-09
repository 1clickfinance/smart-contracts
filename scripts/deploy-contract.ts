import { ethers } from "hardhat"

// 0x exchange proxy on ropsten - 0xdef1c0ded9bec7f1a1670819833240f027b25eff
// Aave Pool proxy on ropsten - 0x23a85024f54a19e243ba7a74e339a5c80998c7a4

async function main() {
    const contract = await ethers.getContractFactory("AaveWrapper")
    const deployment = await contract.deploy("0x23a85024f54a19e243ba7a74e339a5c80998c7a4") 
    await deployment.deployed()
    console.log("InstaFi Wrapper contract deployed to:", deployment.address)
}

main().then(() => process.exit(0)).catch(error => {
    console.error(error)
    process.exit(1)
})