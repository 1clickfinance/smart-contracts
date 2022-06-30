const { expect } = require("chai");
const Web3 = require('web3');
const web3 = new Web3(Web3.givenProvider);

describe("Single contract execution", function() {
    const initMessage = "Gensis message";
    const initValue = "1111";
    const expectedMessage = "Hello there!";
    const expectedValue = "4242";

    let instaFiContract;
    let externalContract;

    let contractAddresses;
    let methodIds;
    let methodArgs;
    let methodValues;
    let methodData;
    
    beforeEach("Deploy the contract", async function() {
        const instaFiWrapperFactory = await hre.ethers.getContractFactory("InstaFiWrapper");
        const testExternalContractFactory = await hre.ethers.getContractFactory("TestExternal");

        instaFiContract = await instaFiWrapperFactory.deploy();
        externalContract = await testExternalContractFactory.deploy(initMessage, initValue);

        await instaFiContract.deployed();
        await externalContract.deployed();

        contractAddresses = [externalContract.address];
        methodIds = [web3.eth.abi.encodeFunctionSignature("updateValues(string,uint256)")];
        methodArgs = [web3.eth.abi.encodeParameters(['string', 'uint256'], [expectedMessage, expectedValue])];
        methodValues = [0];
        methodData = getMethodData(methodIds, methodArgs);
    });

    it("Simple case works", async function() {
        expect(await instaFiContract.executeExternal(contractAddresses, methodData, methodValues, { value: 0}));
    });

    it("Sets to correct state", async function() {
        expect(await instaFiContract.executeExternal(contractAddresses, methodData, methodValues, { value: 0}));
        expect(await externalContract.message()).to.equal(expectedMessage);
        expect(await externalContract.value()).to.equal(expectedValue);
    });

    it("Passes correct value", async function() {
        const expectedValue = 21
        methodValues = [expectedValue];

        expect(await instaFiContract.executeExternal(contractAddresses, methodData, methodValues, { value: expectedValue}));
        expect(await hre.ethers.provider.getBalance(externalContract.address)).to.equal(expectedValue);
    });

    it("Will fail on in-sufficient value", async function() {
        const expectedValue = 21
        methodValues = [expectedValue];

        await expect(instaFiContract.executeExternal(contractAddresses, methodData, methodValues, { value: 19}))
            .to.be.revertedWith('EXTERNAL_CALL_FAILED in call #0');
        expect(await hre.ethers.provider.getBalance(externalContract.address)).to.equal(0);
    });
  
});

function getMethodData(methodIds, methodArgs) {
    const methodData = []
    for (var i = 0; i < methodIds.length; i++) {
        methodData.push(methodIds[i] + methodArgs[i].replace('0x', ''));
    }
    return methodData;
}