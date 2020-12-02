export const url = {
  web3: () => {
    if (process.env.NETWORK === 'localhost') {
      return 'ws://localhost:8546'; // ganache
    } else {
      return `wss://${process.env.NETWORK}.infura.io/ws/v3/${process.env.INFURA_API_KEY}`;
    }
  },
};

export const deploymentBlock = {
  lendingPool: () => {
    switch (process.env.NETWORK) {
      case 'mainnet':
        return 9241022;
      default:
        return 0;
    }
  },
};
