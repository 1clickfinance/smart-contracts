require('dotenv').config();
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
      gasPrice: 21000000000
    },
    eth_ropsten: {
      url: `https://speedy-nodes-nyc.moralis.io/${process.env.MORALIS_API_KEY}/eth/ropsten`,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY]
    },
    eth_kovan: {
      url: `https://speedy-nodes-nyc.moralis.io/${process.env.MORALIS_API_KEY}/eth/kovan`,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY]
    },
    eth_mainnet: {
      url: `https://speedy-nodes-nyc.moralis.io/${process.env.MORALIS_API_KEY}/eth/mainnet`,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY]
    },
    avax_mainnet: {
      url: `https://speedy-nodes-nyc.moralis.io/${process.env.MORALIS_API_KEY}/avalanche/mainnet`,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY]
    }
  },
  gasReporter: {
    gasPrice: 21,
    coinmarketcap: process.env.CMC_API_KEY,
    currency: 'USD'
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 20000
  }
};
