require('dotenv').config();
const hre = require("hardhat");

async function main() {
    const contract = await hre.ethers.getContractFactory("InstaFiWrapper");
    const deployment = await contract.deploy();
    await deployment.deployed();
    console.log("InstaFi Wrapper contract deployed to:", deployment.address);
}

main().then(() => process.exit(0)).catch(error => {
    console.error(error);
    process.exit(1);
});