const { expect } = require("chai");
const commons = require("./commons");

describe("ERC 1155 execution", function() {
    let instaFiContract;
    let erc1155Contract;
    let callUnits;
    let owner;
    let attacker;
    let safeTransferFromCall;
    let safeBatchTransferFromCall;
    
    beforeEach("Deploy the contract", async function() {
        const instaFiWrapperFactory = await hre.ethers.getContractFactory("InstaFiWrapper");
        const erc1155ContractFactory = await hre.ethers.getContractFactory("TestERC1155");

        owner = await hre.ethers.getSigner(0);
        attacker = await hre.ethers.getSigner(1);

        instaFiContract = await instaFiWrapperFactory.deploy();
        erc1155Contract = await erc1155ContractFactory.deploy();

        await instaFiContract.deployed();
        await erc1155Contract.deployed();

        // Owner needs to approve our contract before the contract can spend the token
        erc1155Contract.setApprovalForAll(instaFiContract.address, true);

        safeTransferFromCall = commons.makeCallUnit(
            erc1155Contract.address, 
            "safeTransferFrom", 
            ['address', 'address', 'uint256', 'uint256', 'bytes'], 
            [owner.address, attacker.address, 1, 1, 0],
            0,
        );
        safeBatchTransferFromCall = commons.makeCallUnit(
            erc1155Contract.address, 
            "safeBatchTransferFrom", 
            ['address', 'address', 'uint256[]', 'uint256[]', 'bytes'], 
            [owner.address, attacker.address, [1], [1], 0],
            0,
        );
        callUnits= [];
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

    it("Owner --> Attacker: safeBatchTransferFrom works when sent by owner", async function() {
        callUnits = [safeBatchTransferFromCall];
        expect(await instaFiContract.executeExternal(callUnits, { value: 0}));
    });

    it("Owner --> Attacker: safeBatchTransferFrom doesn't work when sent by attacker", async function() {
        callUnits = [safeBatchTransferFromCall];
        await expect(instaFiContract.connect(attacker).executeExternal(callUnits, { value: 0}))
            .to.be.revertedWith('TOKEN_SPEND_NOT_PERMITTED_FOR_SENDER');
    });
  
});
