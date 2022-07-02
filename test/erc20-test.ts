import { ethers } from "hardhat"
import { Contract, Signer } from "ethers"
import { expect } from "chai"
import { CallUnit, makeCallUnit } from "../scripts/commons"

describe("ERC 20 execution", () => {
    let instaFiContract: Contract;
    let erc20Contract: Contract;
    let callUnits: CallUnit[];
    let owner: Signer;
    let attacker: Signer;
    
    beforeEach("Deploy the contract", async () => {
        const instaFiWrapperFactory = await ethers.getContractFactory("InstaFiWrapper");
        const erc20ContractFactory = await ethers.getContractFactory("TestERC20");

        owner = (await ethers.getSigners())[0];
        attacker = (await ethers.getSigners())[1];

        instaFiContract = await instaFiWrapperFactory.deploy();
        erc20Contract = await erc20ContractFactory.deploy();

        await instaFiContract.deployed();
        await erc20Contract.deployed();

        // Owner needs to approve our contract before the contract can spend the tokens
        erc20Contract.approve(instaFiContract.address, ethers.constants.MaxUint256);

        callUnits= [
            makeCallUnit(
                erc20Contract.address, 
                "transferFrom", 
                ['address', 'address', 'uint256'], 
                [await owner.getAddress(), await attacker.getAddress(), 22],
                0,
            )
        ];
    });

    it("Owner --> Attacker: transferFrom works when sent by owner", async () => {
        expect(await instaFiContract.executeExternal(callUnits, { value: 0}));
    });

    it("Owner --> Attacker: transferFrom doesn't work when sent by attacker", async () => {
        await expect(instaFiContract.connect(attacker).executeExternal(callUnits, { value: 0}))
            .to.be.revertedWith('TOKEN_SPEND_NOT_PERMITTED_FOR_SENDER');
    });

    it("Contract --> Owner: transfer works", async () => {
        const toContractTransferCall = makeCallUnit(
            erc20Contract.address, 
            "transferFrom", 
            ['address', 'address', 'uint256'], 
            [await owner.getAddress(), instaFiContract.address, 1],
            0,
        );
        const fromContractTransferCall = makeCallUnit(
            erc20Contract.address, 
            "transfer", 
            ['address', 'uint256'], 
            [await owner.getAddress(), 1],
            0,
        );
        callUnits = [toContractTransferCall, fromContractTransferCall];

        expect(await instaFiContract.executeExternal(callUnits, { value: 0}));
    });

    // This transfer working is expected behaviour. Basically user signed a bundle of 
    // transactions that would send their tokens from their wallet to contract and 
    // contract to some other wallet. 
    it("Contract --> Attacker: transfer works", async () => {
        const toContractTransferCall = makeCallUnit(
            erc20Contract.address, 
            "transferFrom", 
            ['address', 'address', 'uint256'], 
            [await owner.getAddress(), instaFiContract.address, 1],
            0,
        );
        const fromContractTransferCall = makeCallUnit(
            erc20Contract.address, 
            "transfer", 
            ['address', 'uint256'], 
            [await owner.getAddress(), 1],
            0,
        );
        callUnits = [toContractTransferCall, fromContractTransferCall];

        expect(await instaFiContract.executeExternal(callUnits, { value: 0}));
    });
});
