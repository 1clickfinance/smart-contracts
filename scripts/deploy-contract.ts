import { ethers } from "hardhat";
import { getEnvVariable } from "./commons";

// 0x exchange proxy on ropsten - 0xdef1c0ded9bec7f1a1670819833240f027b25eff
// Aave Pool proxy on ropsten - 0x23a85024f54a19e243ba7a74e339a5c80998c7a4

// 0x exchange proxy on Avax mainnet - 0xDef1C0ded9bec7F1a1670819833240f027b25EfF
// Aave Pool proxy on Avax mainnet - 0x794a61358D6845594F94dc1DB02A252b5b4814aD

async function deployAaveWrapper() {
  const contract = await ethers.getContractFactory("AaveWrapper");
  const deployment = await contract.deploy(
    "0x23a85024f54a19e243ba7a74e339a5c80998c7a4"
  );
  await deployment.deployed();
  console.log("Aave Wrapper deployed to:", deployment.address);
}

async function deployAaveV3Wrapper() {
  const contract = await ethers.getContractFactory("AaveV3Wrapper");
  const deployment = await contract.deploy(
    // "0xc4dCB5126a3AfEd129BC3668Ea19285A9f56D15D" // goerli address provider
    "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb"
  );
  await deployment.deployed();
  console.log("Aave Wrapper deployed to:", deployment.address);
}

async function deployZeroXWrapper() {
  const contract = await ethers.getContractFactory("ZeroXWrapper");
  const deployment = await contract.deploy(
    "0xdef1c0ded9bec7f1a1670819833240f027b25eff"
  );
  await deployment.deployed();
  console.log("ZeroX Wrapper deployed to:", deployment.address);
}

async function deployAaveZeroXWrapper() {
  const contract = await ethers.getContractFactory("AaveZeroXWrapper");

  // AVAX mainnet deployment
  // Ropsten - but only 0x is available
  const deployment = await contract.deploy(
    "0xDef1C0ded9bec7F1a1670819833240f027b25EfF",
    "0x794a61358D6845594F94dc1DB02A252b5b4814aD"
  );
  await deployment.deployed();
  console.log("Aave + ZeroX Wrapper deployed to:", deployment.address);
}

async function main() {
  // await deployZeroXWrapper()
  // await deployAaveWrapper()
  // await deployAaveZeroXWrapper();
  await deployAaveV3Wrapper();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
