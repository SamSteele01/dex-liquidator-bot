import * as dotenv from 'dotenv';
import Web3 from 'web3';
import Aave from '../../src/loanFinder/Aave';

dotenv.config({ path: '../../.env' });

async function main() {
  const web3 = new Web3(`https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`);

  const aave = new Aave(web3);
  await aave.requestAndSetAllBorrowEvents();
  // await aave.getAllLiquidationEvents('0x53F0F70d1b8EF10FE8267C9D79ef77487C2D2bd6');
  // await aave.getAllDepositEvents('0x53F0F70d1b8EF10FE8267C9D79ef77487C2D2bd6');
  aave.reduceAndSetUniqueUsers();
  await aave.requestAllUsersAccountData();
  aave.printEligibleLoans();
}

main();
