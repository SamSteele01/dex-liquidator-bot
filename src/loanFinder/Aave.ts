/*
  Getting eligible loans from AAVE has a few steps.
  - First is getting the borrow events from the contract.
  - Second is getting the users (addresses) that received these loans. In the data returned is a 
  "healthFactor". If it is < 1 the user is eligible for liquidation. All collateral and loans are 
  grouped together as one.
  To call the LiquidationCall method you have to know the _collateral as well as the _reserve used.
  - Third, to find out what collaterals were used we have to get all of the "Deposit" events, 
  filtered by user.
  - Calculate profit
  - LiquidationCall can only reclaim 50% of the collateral per call. This means that the method must 
  be called twice. 
  see: https://docs.aave.com/developers/developing-on-aave/the-protocol/lendingpool#liquidationcall
*/
import Web3 from 'web3';
import { Contract, EventData } from 'web3-eth-contract';
import { getRepository, Repository } from 'typeorm';
import { contracts } from '../contracts';
import { BorrowEvent, UserAccountData } from '../interfaces';
import { chunk, delay } from '../utility';

export default class Aave {
  web3: Web3;
  lendingPoolContract: Contract;
  lendingPoolAddressProviderContract: Contract;
  _borrowEvents: EventData[] = [];
  userAccounts: UserAccountData[] = [];
  oracleAddress: string = '';
  eligibleUserAccounts: UserAccountData[] = [];

  constructor(web3: Web3) {
    this.web3 = web3;
    const { abi: lpAbi, address: lpAddress } = contracts.aave.LendingPool;
    const { abi: lpapAbi, address: lpapAddress } = contracts.aave.LendingPoolAddressProvider;
    this.lendingPoolContract = new this.web3.eth.Contract(lpAbi, lpAddress);
    this.lendingPoolAddressProviderContract = new this.web3.eth.Contract(lpapAbi, lpapAddress);
  }

  requestAndSetAllBorrowEvents = async () => {
    const deploymentBlock = 9241022; // of LendingPool contract
    const latestBlock = await this.web3.eth.getBlock('latest');
    // console.log('LATESTBLOCK', latestBlock); // 11155267
    // 295 days, 182346 txns = 19+ batches => 10.49 blocks/txn // 10,000 txns/request max
    // round down to 10 blocks/txn. This gives 100,000 blocks per request. 50,000 would be better, as
    // it would allow for increased usage in the future.
    let requests = [];
    for (let block = deploymentBlock; block < latestBlock.number; block += 100000) {
      if (block + 100000 > latestBlock.number) {
        requests.push(this.requestAndSetBorrowEventsFromRange(block, latestBlock.number));
      } else {
        requests.push(this.requestAndSetBorrowEventsFromRange(block, block + 99999));
      }
    }
    console.log('REQUESTS', requests.length);
    return Promise.all(requests).then((requests) => {
      requests.forEach((borrowEvents) => {
        console.log('AAVE BORROWEVENTS', borrowEvents.length);
        this._borrowEvents = this._borrowEvents.concat(borrowEvents);
      });
      return;
    });
  };

  requestAndSetBorrowEventsFromRange = (fromBlock: number, toBlock: number) => {
    // const batchOfBorrowEvents = await this.lendingPoolContract.getPastEvents('Borrow', {
    return this.lendingPoolContract.getPastEvents('Borrow', {
      filter: {},
      fromBlock,
      toBlock,
    });
    // this._borrowEvents = this._borrowEvents.concat(borrowEvents);
  };

  getAllDepositEvents = async (user: string) => {
    const depositEvents = await this.lendingPoolContract.getPastEvents('Deposit', {
      filter: { _user: user },
      fromBlock: 0,
      toBlock: 'latest',
    });
    // console.log('DEPOSITEVENTS', depositEvents);
    let collateralUsed = new Set();
    depositEvents.forEach((event) => {
      console.log('EVENT.RETURNVALUES', event.returnValues);
      collateralUsed.add(event.returnValues._reserve);
    });
    const array = Array.from(collateralUsed.values());
    console.log('User has collaterals of: ', array);
  };

  getAllLiquidationEvents = async (user: string) => {
    const LiquidationEvents = await this.lendingPoolContract.getPastEvents('LiquidationCall', {
      filter: { _user: user },
      fromBlock: 0,
      toBlock: 'latest',
    });
    console.log('LIQUIDATIONEVENTS', LiquidationEvents);
  };

  getAllUsersAccountData = async () => {
    let uniqueUsers = new Set();
    this._borrowEvents.forEach((borrowEvent) => {
      const { _user } = borrowEvent.returnValues;
      uniqueUsers.add(_user);
    });
    const users = Array.from(uniqueUsers.values());
    console.log('USERS.length', users.length);
    // TODO: this.users
    // out of memory sending all requests at once !!
    const batches = chunk(users, 50); // infura rate limit of 50/sec
    for (const batch of batches) {
      try {
        await Promise.all(
          batch.map((user) => {
            return this.lendingPoolContract.methods.getUserAccountData(user).call();
          })
        ).then((responses: any) => {
          this.userAccounts = this.userAccounts.concat(responses);
        });
      } catch (err) {
        console.error(err);
      }
      await delay(1000);
    }
    return;
  };

  // for testing
  printEligibleLoans = () => {
    console.log('THIS.USERACCOUNTS.LENGTH', this.userAccounts.length);
    const eligibleLoans = this.userAccounts.filter((account) => account.healthFactor < 1);
    console.log('ELIGIBLELOANS', eligibleLoans);
    console.log('ELIGIBLELOANS.length', eligibleLoans.length);
  };

  getAllUsersReserveData = async () => {};

  // health check ??

  normalize = () => {};

  // save to db ??

  getCurrentOracleAddress = async () => {
    this.oracleAddress = await this.lendingPoolAddressProviderContract.methods
      .getPriceOracle()
      .call();
  };

  /* EventData.returnValues._reserve => Set 
    
  */
  getAssetPrice = () => {};

  liquidateLoan = () => {};

  getBacklog = async () => {
    // check if loans are already in db, what was the latest block checked?
    await this.requestAndSetAllBorrowEvents();
    await this.getAllUsersAccountData();
    this.normalize();
    // save to db
  };
}
