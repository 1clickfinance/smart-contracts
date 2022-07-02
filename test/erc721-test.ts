import { ethers } from "hardhat"
import { Contract, Signer } from "ethers"
import { expect } from "chai"
import { CallUnit, encodedFunction, makeCallUnit } from "../scripts/commons"

describe("ERC 721 execution", () => {
    let instaFiContract: Contract;
    let erc721Contract: Contract;
    let callUnits: CallUnit[];
    let owner: Signer;
    let attacker: Signer;
    let transferFromCall: CallUnit;
    let safeTransferFromCall: CallUnit;
    let safeTransferFromDataCall: CallUnit;
    
    beforeEach("Deploy the contract", async () => {
        const instaFiWrapperFactory = await ethers.getContractFactory("InstaFiWrapper")
        const erc721ContractFactory = await ethers.getContractFactory("TestERC721")

        owner = (await ethers.getSigners())[0]
        attacker = (await ethers.getSigners())[1]

        instaFiContract = await instaFiWrapperFactory.deploy()
        erc721Contract = await erc721ContractFactory.deploy()

        await instaFiContract.deployed()
        await erc721Contract.deployed()

        // Owner needs to approve our contract before the contract can spend the token
        erc721Contract.approve(instaFiContract.address, 1)

        transferFromCall = makeCallUnit(
            erc721Contract.address, 
            "transferFrom", 
            ['address', 'address', 'uint256'], 
            [await owner.getAddress(), await attacker.getAddress(), 1],
            0,
        );
        safeTransferFromCall = makeCallUnit(
            erc721Contract.address, 
            "safeTransferFrom", 
            ['address', 'address', 'uint256'], 
            [await owner.getAddress(), await attacker.getAddress(), 1],
            0,
        );
        safeTransferFromDataCall = makeCallUnit(
            erc721Contract.address, 
            "safeTransferFrom", 
            ['address', 'address', 'uint256', 'bytes'], 
            [await owner.getAddress(), await attacker.getAddress(), 1, 0],
            0,
        );
        callUnits= [];
    });

    // This transfer working is expected behaviour. Basically user signed a bundle of 
    // transactions that would send their tokens from their wallet to some other wallet. 
    it("Owner --> Attacker: transferFrom works when sent by owner", async () => {
        callUnits = [transferFromCall];
        expect(await instaFiContract.executeExternal(callUnits, { value: 0}));
    });

    it("Owner --> Attacker: transferFrom doesn't work when sent by attacker", async () => {
        callUnits = [transferFromCall];
        await expect(instaFiContract.connect(attacker).executeExternal(callUnits, { value: 0}))
            .to.be.revertedWith('TOKEN_SPEND_NOT_PERMITTED_FOR_SENDER');
    });

    it("Owner --> Attacker: safeTransferFrom works when sent by owner", async () => {
        callUnits = [safeTransferFromCall];
        expect(await instaFiContract.executeExternal(callUnits, { value: 0}));
    });

    it("Owner --> Attacker: safeTransferFrom doesn't work when sent by attacker", async () => {
        callUnits = [safeTransferFromCall];
        await expect(instaFiContract.connect(attacker).executeExternal(callUnits, { value: 0}))
            .to.be.revertedWith('TOKEN_SPEND_NOT_PERMITTED_FOR_SENDER');
    });

    it("Owner --> Attacker: safeTransferFrom with data works when sent by owner", async () => {
        callUnits = [safeTransferFromDataCall];
        expect(await instaFiContract.executeExternal(callUnits, { value: 0}));
    });

    it("Owner --> Attacker: safeTransferFrom with data doesn't work when sent by attacker", async () => {
        callUnits = [safeTransferFromDataCall];
        await expect(instaFiContract.connect(attacker).executeExternal(callUnits, { value: 0}))
            .to.be.revertedWith('TOKEN_SPEND_NOT_PERMITTED_FOR_SENDER');
    });

    it("Contract --> Owner: transferFrom works", async () => {
        const toContractTransferCall = makeCallUnit(
            erc721Contract.address, 
            "transferFrom", 
            ['address', 'address', 'uint256'], 
            [await owner.getAddress(), instaFiContract.address, 1],
            0,
        );
        const fromContractTransferCall = makeCallUnit(
            erc721Contract.address, 
            "transferFrom", 
            ['address', 'address', 'uint256'], 
            [instaFiContract.address, await owner.getAddress(), 1],
            0,
        );
        callUnits = [toContractTransferCall, fromContractTransferCall];

        expect(await instaFiContract.executeExternal(callUnits, { value: 0}));
    });

    // This transfer working is expected behaviour. Basically user signed a bundle of 
    // transactions that would send their tokens from their wallet to contract and 
    // contract to some other wallet. 
    it("Contract --> Attacker: transferFrom works", async () => {
        const toContractTransferCall = makeCallUnit(
            erc721Contract.address, 
            "transferFrom", 
            ['address', 'address', 'uint256'], 
            [await owner.getAddress(), instaFiContract.address, 1],
            0,
        );
        const fromContractTransferCall = makeCallUnit(
            erc721Contract.address, 
            "transferFrom", 
            ['address', 'address', 'uint256'], 
            [instaFiContract.address, await attacker.getAddress(), 1],
            0,
        );
        callUnits = [toContractTransferCall, fromContractTransferCall];

        expect(await instaFiContract.executeExternal(callUnits, { value: 0}));
    });
  
});
