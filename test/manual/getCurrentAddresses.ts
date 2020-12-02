import * as dotenv from 'dotenv';
import Web3 from 'web3';
import { contracts } from '../../src/contracts';

dotenv.config({ path: '../../.env' });

async function main() {
  const web3 = new Web3(`https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`);

  const { abi: lpapAbi, address: lpapAddress } = contracts.aave.LendingPoolAddressProvider;
  const lendingPoolAddressesProvider = new web3.eth.Contract(lpapAbi, lpapAddress);

  const oracleAddress = await lendingPoolAddressesProvider.methods.getPriceOracle().call();

  console.log('ORACLEADDRESS', oracleAddress);

  const lendingPoolAddress = await lendingPoolAddressesProvider.methods.getLendingPool().call();

  console.log('LENDINGPOOLADDRESS', lendingPoolAddress);

  const lendingPoolCoreAddress = await lendingPoolAddressesProvider.methods
    .getLendingPoolCore()
    .call();

  console.log('LENDINGPOOLCOREADDRESS', lendingPoolCoreAddress);
}

main();
