import { ethers } from "hardhat"
import { Contract } from "ethers"
import { expect } from "chai"
import { CallUnit, makeCallUnit } from "../scripts/commons"

describe("Single contract execution", () => {
    const initMessage = "Gensis message";
    const initValue = "1111";
    const expectedMessage = "Hello there!";
    const expectedValue = "4242";

    let instaFiContract: Contract;
    let externalContract: Contract;

    let callUnits: CallUnit[];
    
    beforeEach("Deploy the contract", async () => {
        const instaFiWrapperFactory = await ethers.getContractFactory("InstaFiWrapper");
        const testExternalContractFactory = await ethers.getContractFactory("TestExternal");

        instaFiContract = await instaFiWrapperFactory.deploy();
        externalContract = await testExternalContractFactory.deploy(initMessage, initValue);

        await instaFiContract.deployed();
        await externalContract.deployed();

        callUnits = [
            makeCallUnit(
                externalContract.address, 
                "updateValues", 
                ['string', 'uint256'], 
                [expectedMessage, expectedValue],
                0,
            )
        ]
    });

    it("Simple case works", async () => {
        expect(await instaFiContract.executeExternal(callUnits, { value: 0}));
    });

    it("Sets to correct state", async () => {
        expect(await instaFiContract.executeExternal(callUnits, { value: 0}));
        expect(await externalContract.message()).to.equal(expectedMessage);
        expect(await externalContract.value()).to.equal(expectedValue);
    });

    it("Passes correct value", async () => {
        const expectedValue = 21;
        callUnits[0].value = expectedValue;

        expect(await instaFiContract.executeExternal(callUnits, { value: expectedValue}));
        expect(await ethers.provider.getBalance(externalContract.address)).to.equal(expectedValue);
    });

    it("Will fail on in-sufficient value", async () => {
        callUnits[0].value = 21;

        await expect(instaFiContract.executeExternal(callUnits, { value: 19}))
            .to.be.revertedWith('EXTERNAL_CALL_FAILED in call #0');
        expect(await ethers.provider.getBalance(externalContract.address)).to.equal(0);
    });
  
});
