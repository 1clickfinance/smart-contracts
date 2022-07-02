import { ethers } from "hardhat"
import { Contract } from "ethers"
import { expect } from "chai"
import { CallUnit, encodedFunction, makeCallUnit } from "../scripts/commons"

describe("Multiple contract execution", () => {
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
                ["Hello", "123"],
                0,
            ),
            makeCallUnit(
                externalContract.address, 
                "updateValues", 
                ['string', 'uint256'], 
                ["World", "456"],
                0,
            ),
            makeCallUnit(
                externalContract.address, 
                "updateValues", 
                ['string', 'uint256'], 
                [expectedMessage, expectedValue],
                0,
            ),
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
        callUnits[0].value = 1;
        callUnits[1].value = 2;
        callUnits[2].value = 3;

        expect(await instaFiContract.executeExternal(callUnits, { value: 6}));
        expect(await ethers.provider.getBalance(externalContract.address)).to.equal(6);
    });
  
    it("Will fail on in-sufficient value", async () => {
        callUnits[0].value = 1;
        callUnits[1].value = 2;
        callUnits[2].value = 3;

        await expect(instaFiContract.executeExternal(callUnits, { value: 3}))
            .to.be.revertedWith('EXTERNAL_CALL_FAILED in call #2');
        expect(await ethers.provider.getBalance(externalContract.address)).to.equal(0);
    });
  
    it("Will fail on in-correct method signature", async () => {
        callUnits[1].functionSelector = encodedFunction("RANDOM_SIGNATURE_HERE(string)");

        await expect(instaFiContract.executeExternal(callUnits, { value: 0}))
            .to.be.revertedWith('EXTERNAL_CALL_FAILED in call #1');
        expect(await ethers.provider.getBalance(externalContract.address)).to.equal(0);
    });
  
    it("Fail transaction doesn't change state", async () => {
        callUnits[0].value = 1;
        callUnits[1].value = 2;
        callUnits[2].value = 3;

        await expect(instaFiContract.executeExternal(callUnits, { value: 0}))
            .to.be.revertedWith('EXTERNAL_CALL_FAILED in call #0');

        expect(await externalContract.message()).to.equal(initMessage);
        expect(await externalContract.value()).to.equal(initValue);
    });
});
