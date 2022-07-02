const { expect } = require("chai");
const commons = require("./commons");

describe("ERC 721 execution", function() {
    let instaFiContract;
    let erc721Contract;
    let callUnits;
    let owner;
    let attacker;
    let transferFromCall;
    let safeTransferFromCall;
    let safeTransferFromDataCall;
    
    beforeEach("Deploy the contract", async function() {
        const instaFiWrapperFactory = await hre.ethers.getContractFactory("InstaFiWrapper");
        const erc721ContractFactory = await hre.ethers.getContractFactory("TestERC721");

        owner = await hre.ethers.getSigner(0);
        attacker = await hre.ethers.getSigner(1);

        instaFiContract = await instaFiWrapperFactory.deploy();
        erc721Contract = await erc721ContractFactory.deploy();

        await instaFiContract.deployed();
        await erc721Contract.deployed();

        // Owner needs to approve our contract before the contract can spend the token
        erc721Contract.approve(instaFiContract.address, 1);

        transferFromCall = commons.makeCallUnit(
            erc721Contract.address, 
            "transferFrom", 
            ['address', 'address', 'uint256'], 
            [owner.address, attacker.address, 1],
            0,
        );
        safeTransferFromCall = commons.makeCallUnit(
            erc721Contract.address, 
            "safeTransferFrom", 
            ['address', 'address', 'uint256'], 
            [owner.address, attacker.address, 1],
            0,
        );
        safeTransferFromDataCall = commons.makeCallUnit(
            erc721Contract.address, 
            "safeTransferFrom", 
            ['address', 'address', 'uint256', 'bytes'], 
            [owner.address, attacker.address, 1, 0],
            0,
        );
        callUnits= [];
    });

    // This transfer working is expected behaviour. Basically user signed a bundle of 
    // transactions that would send their tokens from their wallet to some other wallet. 
    it("Owner --> Attacker: transferFrom works when sent by owner", async function() {
        callUnits = [transferFromCall];
        expect(await instaFiContract.executeExternal(callUnits, { value: 0}));
    });

    it("Owner --> Attacker: transferFrom doesn't work when sent by attacker", async function() {
        callUnits = [transferFromCall];
        await expect(instaFiContract.connect(attacker).executeExternal(callUnits, { value: 0}))
            .to.be.revertedWith('TOKEN_SPEND_NOT_PERMITTED_FOR_SENDER');
    });

    it("Owner --> Attacker: safeTransferFrom works when sent by owner", async function() {
        callUnits = [safeTransferFromCall];
        expect(await instaFiContract.executeExternal(callUnits, { value: 0}));
    });

    it("Owner --> Attacker: safeTransferFrom doesn't work when sent by attacker", async function() {
        callUnits = [safeTransferFromCall];
        await expect(instaFiContract.connect(attacker).executeExternal(callUnits, { value: 0}))
            .to.be.revertedWith('TOKEN_SPEND_NOT_PERMITTED_FOR_SENDER');
    });

    it("Owner --> Attacker: safeTransferFrom with data works when sent by owner", async function() {
        callUnits = [safeTransferFromDataCall];
        expect(await instaFiContract.executeExternal(callUnits, { value: 0}));
    });

    it("Owner --> Attacker: safeTransferFrom with data doesn't work when sent by attacker", async function() {
        callUnits = [safeTransferFromDataCall];
        await expect(instaFiContract.connect(attacker).executeExternal(callUnits, { value: 0}))
            .to.be.revertedWith('TOKEN_SPEND_NOT_PERMITTED_FOR_SENDER');
    });

    it("Contract --> Owner: transferFrom works", async function() {
        const toContractTransferCall = commons.makeCallUnit(
            erc721Contract.address, 
            "transferFrom", 
            ['address', 'address', 'uint256'], 
            [owner.address, instaFiContract.address, 1],
            0,
        );
        const fromContractTransferCall = commons.makeCallUnit(
            erc721Contract.address, 
            "transferFrom", 
            ['address', 'address', 'uint256'], 
            [instaFiContract.address, owner.address, 1],
            0,
        );
        callUnits = [toContractTransferCall, fromContractTransferCall];

        expect(await instaFiContract.executeExternal(callUnits, { value: 0}));
    });

    // This transfer working is expected behaviour. Basically user signed a bundle of 
    // transactions that would send their tokens from their wallet to contract and 
    // contract to some other wallet. 
    it("Contract --> Attacker: transferFrom works", async function() {
        const toContractTransferCall = commons.makeCallUnit(
            erc721Contract.address, 
            "transferFrom", 
            ['address', 'address', 'uint256'], 
            [owner.address, instaFiContract.address, 1],
            0,
        );
        const fromContractTransferCall = commons.makeCallUnit(
            erc721Contract.address, 
            "transferFrom", 
            ['address', 'address', 'uint256'], 
            [instaFiContract.address, attacker.address, 1],
            0,
        );
        callUnits = [toContractTransferCall, fromContractTransferCall];

        expect(await instaFiContract.executeExternal(callUnits, { value: 0}));
    });
  
});
