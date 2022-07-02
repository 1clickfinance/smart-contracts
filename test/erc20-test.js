const { expect } = require("chai");
const commons = require("./commons");

describe("ERC 20 execution", function() {
    let instaFiContract;
    let erc20Contract;
    let callUnits;
    let owner;
    let attacker;
    
    beforeEach("Deploy the contract", async function() {
        const instaFiWrapperFactory = await hre.ethers.getContractFactory("InstaFiWrapper");
        const erc20ContractFactory = await hre.ethers.getContractFactory("TestERC20");

        owner = await hre.ethers.getSigner(0);
        attacker = await hre.ethers.getSigner(1);

        instaFiContract = await instaFiWrapperFactory.deploy();
        erc20Contract = await erc20ContractFactory.deploy();

        await instaFiContract.deployed();
        await erc20Contract.deployed();

        // Owner needs to approve our contract before the contract can spend the tokens
        erc20Contract.approve(instaFiContract.address, hre.ethers.constants.MaxUint256);

        callUnits= [
            commons.makeCallUnit(
                erc20Contract.address, 
                "transferFrom", 
                ['address', 'address', 'uint256'], 
                [owner.address, attacker.address, 22],
                0,
            )
        ];
    });

    it("Owner --> Attacker: transferFrom works when sent by owner", async function() {
        expect(await instaFiContract.executeExternal(callUnits, { value: 0}));
    });

    it("Owner --> Attacker: transferFrom doesn't work when sent by attacker", async function() {
        await expect(instaFiContract.connect(attacker).executeExternal(callUnits, { value: 0}))
            .to.be.revertedWith('TOKEN_SPEND_NOT_PERMITTED_FOR_SENDER');
    });

    it("Contract --> Owner: transfer works", async function() {
        const toContractTransferCall = commons.makeCallUnit(
            erc20Contract.address, 
            "transferFrom", 
            ['address', 'address', 'uint256'], 
            [owner.address, instaFiContract.address, 1],
            0,
        );
        const fromContractTransferCall = commons.makeCallUnit(
            erc20Contract.address, 
            "transfer", 
            ['address', 'uint256'], 
            [owner.address, 1],
            0,
        );
        callUnits = [toContractTransferCall, fromContractTransferCall];

        expect(await instaFiContract.executeExternal(callUnits, { value: 0}));
    });

    // This transfer working is expected behaviour. Basically user signed a bundle of 
    // transactions that would send their tokens from their wallet to contract and 
    // contract to some other wallet. 
    it("Contract --> Attacker: transfer works", async function() {
        const toContractTransferCall = commons.makeCallUnit(
            erc20Contract.address, 
            "transferFrom", 
            ['address', 'address', 'uint256'], 
            [owner.address, instaFiContract.address, 1],
            0,
        );
        const fromContractTransferCall = commons.makeCallUnit(
            erc20Contract.address, 
            "transfer", 
            ['address', 'uint256'], 
            [owner.address, 1],
            0,
        );
        callUnits = [toContractTransferCall, fromContractTransferCall];

        expect(await instaFiContract.executeExternal(callUnits, { value: 0}));
    });
});
