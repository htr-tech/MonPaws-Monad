require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      metadata: {
        bytecodeHash: "none",
        useLiteralContent: true,
      },
    },
  },
  networks: {
    monadtestnet: {
      url: "https://testnet-rpc.monad.xyz/", // RPC URL
    },
  },
  sourcify: {
    enabled: true,
    apiUrl: "https://sourcify-api-monad.blockvision.org", // API URL
    browserUrl: "https://testnet.monadexplorer.com", // Explorer URL
  },
  etherscan: {
    enabled: false,
  },
};