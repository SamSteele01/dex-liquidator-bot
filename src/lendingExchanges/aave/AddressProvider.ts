import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { contracts } from '../../contracts';

export default class AddressProvider {
  lpapAddress: string | undefined = process.env.LENDING_POOL_ADDRESS_PROVIDER_ADDRESS;
  web3: Web3;
  lendingPoolAddressProvider: Contract;

  constructor(web3: Web3) {
    this.web3 = web3;
    const { abi } = contracts.aave.LendingPoolAddressProvider;
    this.lendingPoolAddressProvider = new this.web3.eth.Contract(abi, this.lpapAddress);
  }

  getPriceOracle = async () => {
    return await this.lendingPoolAddressProvider.methods.getPriceOracle().call();
  };

  getLendingPool = async () => {
    return await this.lendingPoolAddressProvider.methods.getLendingPool().call();
  };

  getLendingPoolCore = async () => {
    return await this.lendingPoolAddressProvider.methods.getLendingPoolCore().call();
  };
}
