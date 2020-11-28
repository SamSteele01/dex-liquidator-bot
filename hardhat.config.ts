/**
 * @type import('hardhat/config').HardhatUserConfig
 */
import { task } from 'hardhat/config';
import 'hardhat-contract-sizer';
// import '@nomiclabs/hardhat-truffle5';
// import '@nomiclabs/hardhat-waffle';
import 'hardhat-deploy';
import 'hardhat-deploy-ethers';

task('accounts', 'Prints the list of accounts', async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.4.21',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      {
        version: '0.5.5',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      {
        version: '0.6.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    feeCollector: {
      default: 1, // tokenDistributor
    },
    lendingPoolManager: {
      default: 2,
    },
    owner: {
      default: 3,
    },
  },
};
