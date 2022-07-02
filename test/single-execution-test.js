const { expect } = require("chai");
const commons = require("./commons");

describe("Single contract execution", function() {
    const initMessage = "Gensis message";
    const initValue = "1111";
    const expectedMessage = "Hello there!";
    const expectedValue = "4242";

    let instaFiContract;
    let externalContract;

    let callUnits;
    
    beforeEach("Deploy the contract", async function() {
        const instaFiWrapperFactory = await hre.ethers.getContractFactory("InstaFiWrapper");
        const testExternalContractFactory = await hre.ethers.getContractFactory("TestExternal");

        instaFiContract = await instaFiWrapperFactory.deploy();
        externalContract = await testExternalContractFactory.deploy(initMessage, initValue);

        await instaFiContract.deployed();
        await externalContract.deployed();

        callUnits = [
            commons.makeCallUnit(
                externalContract.address, 
                "updateValues", 
                ['string', 'uint256'], 
                [expectedMessage, expectedValue],
                0,
            )
        ]
    });

    it("Simple case works", async function() {
        expect(await instaFiContract.executeExternal(callUnits, { value: 0}));
    });

    it("Sets to correct state", async function() {
        expect(await instaFiContract.executeExternal(callUnits, { value: 0}));
        expect(await externalContract.message()).to.equal(expectedMessage);
        expect(await externalContract.value()).to.equal(expectedValue);
    });

    it("Passes correct value", async function() {
        const expectedValue = 21;
        callUnits[0].value = expectedValue;

        expect(await instaFiContract.executeExternal(callUnits, { value: expectedValue}));
        expect(await hre.ethers.provider.getBalance(externalContract.address)).to.equal(expectedValue);
    });

    it("Will fail on in-sufficient value", async function() {
        callUnits[0].value = 21;

        await expect(instaFiContract.executeExternal(callUnits, { value: 19}))
            .to.be.revertedWith('EXTERNAL_CALL_FAILED in call #0');
        expect(await hre.ethers.provider.getBalance(externalContract.address)).to.equal(0);
    });
  
});
