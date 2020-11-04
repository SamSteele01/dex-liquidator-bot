import { legos } from '@studydefi/money-legos';

// const eventOptionsObject = {
//   fromBlock: Number | String | BN | BigNumber,
//   toBlock: Number | String | BN | BigNumber,
// };

export const exchanges = {
  aave: {
    type: 'contract',
    contractAddress: legos.aave.LendingPool.address,
    getLoanAddresses: {
      method: 'getPastEvents',
      args: ['Borrow', 'eventOptionsObject'],
    },
    getLoanDetails: {
      method: 'getUserAccountData',
      args: ['_borrowEvent.returnValues._user'],
    },
    normalizeFunction: () => {},
  },
  bzx: {
    type: 'contract',
    contractAddress: '0x1Cf226E9413AddaF22412A2E182F9C0dE44AF002',
    getLoansMethod: 'getActiveLoans',
    normalizeFunction: () => {},
  },
  compound: {
    type: 'contract',
    contractAddress: '',
    getLoansMethod: '',
    normalizeFunction: () => {},
  },
  dydx: {
    type: 'http',
    contractAddress: '',
    getLoansMethod: '',
    normalizeFunction: () => {},
  },
};

export const tokens = {};
