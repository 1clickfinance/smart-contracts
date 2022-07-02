const { expect } = require("chai");
const commons = require("./commons");

describe("Multiple contract execution", function() {
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
                ["Hello", "123"],
                0,
            ),
            commons.makeCallUnit(
                externalContract.address, 
                "updateValues", 
                ['string', 'uint256'], 
                ["World", "456"],
                0,
            ),
            commons.makeCallUnit(
                externalContract.address, 
                "updateValues", 
                ['string', 'uint256'], 
                [expectedMessage, expectedValue],
                0,
            ),
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
        callUnits[0].value = 1;
        callUnits[1].value = 2;
        callUnits[2].value = 3;

        expect(await instaFiContract.executeExternal(callUnits, { value: 6}));
        expect(await hre.ethers.provider.getBalance(externalContract.address)).to.equal(6);
    });
  
    it("Will fail on in-sufficient value", async function() {
        callUnits[0].value = 1;
        callUnits[1].value = 2;
        callUnits[2].value = 3;

        await expect(instaFiContract.executeExternal(callUnits, { value: 3}))
            .to.be.revertedWith('EXTERNAL_CALL_FAILED in call #2');
        expect(await hre.ethers.provider.getBalance(externalContract.address)).to.equal(0);
    });
  
    it("Will fail on in-correct method signature", async function() {
        callUnits[1].functionSelector = commons.encodedFunction("RANDOM_SIGNATURE_HERE(string)");

        await expect(instaFiContract.executeExternal(callUnits, { value: 0}))
            .to.be.revertedWith('EXTERNAL_CALL_FAILED in call #1');
        expect(await hre.ethers.provider.getBalance(externalContract.address)).to.equal(0);
    });
  
    it("Fail transaction doesn't change state", async function() {
        callUnits[0].value = 1;
        callUnits[1].value = 2;
        callUnits[2].value = 3;

        await expect(instaFiContract.executeExternal(callUnits, { value: 0}))
            .to.be.revertedWith('EXTERNAL_CALL_FAILED in call #0');

        expect(await externalContract.message()).to.equal(initMessage);
        expect(await externalContract.value()).to.equal(initValue);
    });
});
