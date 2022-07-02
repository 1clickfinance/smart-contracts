import { getEnvVariable } from "./scripts/commons"
import "@nomiclabs/hardhat-waffle"
import "hardhat-gas-reporter"
import { HardhatUserConfig } from "hardhat/config"

const MORALIS_API_KEY = getEnvVariable("MORALIS_API_KEY")
const CMC_API_KEY = getEnvVariable("CMC_API_KEY")
const DEPLOYER_PRIVATE_KEY = getEnvVariable("DEPLOYER_PRIVATE_KEY")

const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 1337,
            gasPrice: 21000000000
        },
        eth_ropsten: {
            url: `https://speedy-nodes-nyc.moralis.io/${MORALIS_API_KEY}/eth/ropsten`,
            accounts: [DEPLOYER_PRIVATE_KEY]
        },
        eth_kovan: {
            url: `https://speedy-nodes-nyc.moralis.io/${MORALIS_API_KEY}/eth/kovan`,
            accounts: [DEPLOYER_PRIVATE_KEY]
        },
        eth_mainnet: {
            url: `https://speedy-nodes-nyc.moralis.io/${MORALIS_API_KEY}/eth/mainnet`,
            accounts: [DEPLOYER_PRIVATE_KEY]
        },
        avax_mainnet: {
            url: `https://speedy-nodes-nyc.moralis.io/${MORALIS_API_KEY}/avalanche/mainnet`,
            accounts: [DEPLOYER_PRIVATE_KEY]
        }
    },
    gasReporter: {
        gasPrice: 50,
        coinmarketcap: CMC_API_KEY,
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

export default config;