import { ethers } from "hardhat"
import { Contract, Signer } from "ethers"
import { expect } from "chai"
import { CallUnit, makeCallUnit } from "../scripts/commons"

describe("ERC 1155 execution", () => {
    let instaFiContract: Contract;
    let erc1155Contract: Contract;
    let callUnits: CallUnit[];
    let owner: Signer;
    let attacker: Signer;
    let safeTransferFromCall: CallUnit;
    let safeBatchTransferFromCall: CallUnit;
    
    beforeEach("Deploy the contract", async () => {
        const instaFiWrapperFactory = await ethers.getContractFactory("InstaFiWrapper")
        const erc1155ContractFactory = await ethers.getContractFactory("TestERC1155")

        owner = (await ethers.getSigners())[0]
        attacker = (await ethers.getSigners())[1]

        instaFiContract = await instaFiWrapperFactory.deploy()
        erc1155Contract = await erc1155ContractFactory.deploy()

        await instaFiContract.deployed()
        await erc1155Contract.deployed()

        // Owner needs to approve our contract before the contract can spend the token
        erc1155Contract.setApprovalForAll(instaFiContract.address, true)

        safeTransferFromCall = makeCallUnit(
            erc1155Contract.address, 
            "safeTransferFrom", 
            ['address', 'address', 'uint256', 'uint256', 'bytes'], 
            [await owner.getAddress(), await attacker.getAddress(), 1, 1, 0],
            0,
        )
        safeBatchTransferFromCall = makeCallUnit(
            erc1155Contract.address, 
            "safeBatchTransferFrom", 
            ['address', 'address', 'uint256[]', 'uint256[]', 'bytes'], 
            [await owner.getAddress(), await attacker.getAddress(), [1], [1], 0],
            0,
        )
        callUnits= []
    });

    it("Owner --> Attacker: safeTransferFrom works when sent by owner", async () => {
        callUnits = [safeTransferFromCall]
        expect(await instaFiContract.executeExternal(callUnits, { value: 0}))
    });

    it("Owner --> Attacker: safeTransferFrom doesn't work when sent by attacker", async () => {
        callUnits = [safeTransferFromCall]
        await expect(instaFiContract.connect(attacker).executeExternal(callUnits, { value: 0}))
            .to.be.revertedWith('TOKEN_SPEND_NOT_PERMITTED_FOR_SENDER')
    });

    it("Owner --> Attacker: safeBatchTransferFrom works when sent by owner", async () => {
        callUnits = [safeBatchTransferFromCall]
        expect(await instaFiContract.executeExternal(callUnits, { value: 0}))
    });

    it("Owner --> Attacker: safeBatchTransferFrom doesn't work when sent by attacker", async () => {
        callUnits = [safeBatchTransferFromCall]
        await expect(instaFiContract.connect(attacker).executeExternal(callUnits, { value: 0}))
            .to.be.revertedWith('TOKEN_SPEND_NOT_PERMITTED_FOR_SENDER')
    });
    
    it("Owner --> Contract: safeTransferFrom works", async () => {
        const toContractTransferCall = makeCallUnit(
            erc1155Contract.address, 
            "safeTransferFrom", 
            ['address', 'address', 'uint256', 'uint256', 'bytes'], 
            [await owner.getAddress(), instaFiContract.address, 1, 1, 0],
            0,
        );
        callUnits = [toContractTransferCall];

        expect(await instaFiContract.executeExternal(callUnits, { value: 0}));
    });
    
    it("Contract --> Owner: safeTransferFrom works", async () => {
        const toContractTransferCall = makeCallUnit(
            erc1155Contract.address, 
            "safeTransferFrom", 
            ['address', 'address', 'uint256', 'uint256', 'bytes'], 
            [await owner.getAddress(), instaFiContract.address, 1, 1, 0],
            0,
        );
        const fromContractTransferCall = makeCallUnit(
            erc1155Contract.address, 
            "safeTransferFrom", 
            ['address', 'address', 'uint256', 'uint256', 'bytes'], 
            [instaFiContract.address, await owner.getAddress(), 1, 1, 0],
            0,
        );
        callUnits = [toContractTransferCall, fromContractTransferCall];

        expect(await instaFiContract.executeExternal(callUnits, { value: 0}));
    });
    
    it("Owner --> Contract: safeBatchTransferFrom works", async () => {
        const toContractTransferCall = makeCallUnit(
            erc1155Contract.address, 
            "safeBatchTransferFrom", 
            ['address', 'address', 'uint256[]', 'uint256[]', 'bytes'], 
            [await owner.getAddress(), instaFiContract.address, [1], [1], 0],
            0,
        );
        callUnits = [toContractTransferCall];

        expect(await instaFiContract.executeExternal(callUnits, { value: 0}));
    });
  
});
