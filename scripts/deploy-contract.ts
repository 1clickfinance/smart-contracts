import { ethers } from "hardhat"

async function main() {
    const contract = await ethers.getContractFactory("InstaFiWrapper")
    const deployment = await contract.deploy()
    await deployment.deployed()
    console.log("InstaFi Wrapper contract deployed to:", deployment.address)
}

main().then(() => process.exit(0)).catch(error => {
    console.error(error)
    process.exit(1)
})