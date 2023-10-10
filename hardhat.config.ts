require('dotenv').config();

import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import { HardhatUserConfig } from "hardhat/config";
import "solidity-coverage";

const chainIds = {
  eth_goerli_id: 5,
  eth_sepolia_id: 11155111,
};

const {
  SIGNER_PRIVATE_KEY,
  ETH_GOERLI_TESTNET_RPC,
  ETH_SCAN_API_KEY,
  ETH_SEPOLIA_TESTNET_RPC
} = process.env;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.1",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      }
    }
  },
  networks: {
    goerli: {
      url: ETH_GOERLI_TESTNET_RPC,
      chainId: chainIds.eth_goerli_id,
      accounts: SIGNER_PRIVATE_KEY !== undefined ? [SIGNER_PRIVATE_KEY] : [],
      gas: 70000,
      gasPrice: 500000000,
    },
    sepolia: {
      url: ETH_SEPOLIA_TESTNET_RPC,
      chainId: chainIds.eth_sepolia_id,
      accounts: SIGNER_PRIVATE_KEY !== undefined ? [SIGNER_PRIVATE_KEY] : [],
      gas: 70000,
      gasPrice: 500000000,
    },
  },
  etherscan: {
    apiKey: {
      goerli: ETH_SCAN_API_KEY !== undefined ? ETH_SCAN_API_KEY : "",
      sepolia: ETH_SCAN_API_KEY !== undefined ? ETH_SCAN_API_KEY : "",
    }
  },
  mocha: {
    timeout: 0
  }
};

export default config;