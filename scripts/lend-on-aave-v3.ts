import { getEnvVariable, Erc20Interface, AavePoolAbi } from "./commons";
import { ethers } from "hardhat";

async function main() {
  const lendToken = "0xd586e7f844cea2f87f50152665bcbc2c279d8d70"; // DAI
  const lendAmount = "10000000000000";
  const userAddress = "0xbAe00583E381821b8aec9B4aebB4E52864100baE";

  const aaveWrapperAddress = getEnvVariable("AAVE_V3_WRAPPER_ADDRESS");

  const owner = (await ethers.getSigners())[0];

  // 1. Approve spending for the wrapper
  const erc20Token = new ethers.Contract(lendToken, Erc20Interface, owner);
  const balance = await erc20Token.balanceOf(owner.address);
  const approval = await erc20Token.approve(
    aaveWrapperAddress, // aavePoolAddress,
    balance
  );
  console.log(`Approval is`, approval);
  await approval.wait();

  // 2. Lend to aave pool
  const contract = await ethers.getContractFactory("AaveV3Wrapper");
  const aaveV3Wrapper = contract.attach(aaveWrapperAddress);
  const supplyResult = await aaveV3Wrapper.lend(
    lendToken,
    lendAmount,
    userAddress,
    {
      gasLimit: 400000,
    }
  );
  console.log("Lend result:", supplyResult);
  await supplyResult.wait();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
