/*
  Getting eligible loans from AAVE has a few steps.
  - First is getting the borrow Events from the contract.
  - Second is getting the userAccounts that received these loans. In the data returned is a 
  "healthFactor". If it is < 1 the user is eligible for liquidation. All collateral and loans are 
  grouped together as one.
  To call the LiquidationCall method you have to know the _collateral as well as the _reserve used.
  - Third, to find out what collaterals were used we have to get all of the "Deposit" events, 
  filtered by user.
  - Calculate profit
  - LiquidationCall has to be called once for each collateral that a user has deposited. It also can
    only reclaim 50% of the collateral per call. This means that the method must be called twice per
    collateral to full liquidate the user. The healthFactor will change after every liquidationCall.
    This means that after the first call it either may not be possible or may not be profitable to 
    call a second time. There may be merit in figuring the order of collaterals to liquidate to keep
    this from happening.
  see: https://docs.aave.com/developers/developing-on-aave/the-protocol/lendingpool#liquidationcall
*/
import Web3 from 'web3';
import { Contract, EventData } from 'web3-eth-contract';
import { RateLimiter } from 'limiter';
import {
  saveUserAccountData,
  saveUserReserveData,
  saveUserReserveDataPlaceholder,
  selectAllPlaceholderUserReserveData,
} from './AaveRepository';
import { contracts } from '../../contracts';
import { UserAccountData, UserReservePair } from '../../interfaces';
import logger from '../../logger';
import { chunk, delay } from '../../utility';
import { deploymentBlock } from '../../config';

export default class Backlog {
  web3: Web3;
  rateLimiter: RateLimiter;
  lendingPoolContract: Contract;
  deploymentBlock: number = deploymentBlock.lendingPool(); // of LendingPool contract on mainnet
  borrowEvents: EventData[] = [];
  // userAccounts: UserAccountData[] = [];
  // eligibleUserAccounts: UserAccountData[] = [];
  users: string[] = [];

  constructor(web3: Web3, rateLimiter: RateLimiter, lpAddress: string) {
    this.web3 = web3;
    this.rateLimiter = rateLimiter;
    const { abi } = contracts.aave.LendingPool;
    this.lendingPoolContract = new this.web3.eth.Contract(abi, lpAddress);
  }

  requestAndSetBorrowEventsFromRange = async (fromBlock: number, toBlock: number) => {
    try {
      const batchOfBorrowEvents = await this.lendingPoolContract.getPastEvents('Borrow', {
        fromBlock,
        toBlock,
      });
      this.borrowEvents = this.borrowEvents.concat(batchOfBorrowEvents);
    } catch (error) {
      console.error('getPastEvents Borrow ERROR', error);
      // problem in this block range. Break into smaller batches and try again
    }
    return;
  };

  /* this gets us all the Aave users that have ever taken out a loan */
  requestAndSetAllBorrowEvents = async () => {
    // TODO: getLatestBlockChecked from DB
    const latestBlock = await this.web3.eth.getBlock('latest');
    // console.log('LATESTBLOCK', latestBlock); // 11155267
    // 295 days, 182346 txns = 19+ batches => 10.49 blocks/txn // 10,000 txns/request max
    // round down to 10 blocks/txn. This gives 100,000 blocks per request. 50,000 would be better, as
    // it would account for increased usage in the future.
    // Could take as env.var, initialize, and adjust with errors
    let requests = [];
    for (let block = this.deploymentBlock; block < latestBlock.number; block += 50000) {
      if (block + 50000 > latestBlock.number) {
        requests.push(this.requestAndSetBorrowEventsFromRange(block, latestBlock.number));
      } else {
        requests.push(this.requestAndSetBorrowEventsFromRange(block, block + 49999));
      }
    }
    console.log('REQUESTS', requests.length);
    return Promise.all(requests).then(() => {
      return latestBlock;
    });
  };

  // requestAllLiquidationEvents = async (user: string) => {
  //   const LiquidationEvents = await this.lendingPoolContract.getPastEvents('LiquidationCall', {
  //     filter: { _user: user },
  //     fromBlock: 0,
  //     toBlock: 'latest',
  //   });
  //   console.log('LIQUIDATIONEVENTS', LiquidationEvents);
  // };

  reduceAndSetUniqueUsers = () => {
    let uniqueUsers: Set<string> = new Set();
    this.borrowEvents.forEach((borrowEvent) => {
      const { _user } = borrowEvent.returnValues;
      uniqueUsers.add(_user);
    });
    const users = Array.from(uniqueUsers.values());
    console.log('USERS.length', users.length);
    this.users = users;
  };

  // { user: Set(tokens) } -> { user, tokens: [tokens] }
  reduceAndSaveUserTokenPairs = () => {
    const userTokenSets = {};
    this.users.forEach((user: string) => {
      userTokenSets[user] = new Set();
    });

    this.borrowEvents.forEach((borrowEvent) => {
      const { _user, _reserve } = borrowEvent.returnValues;
      userTokenSets[_user].add(_reserve);
    });

    this.users.forEach((user: string) => {
      saveUserReserveDataPlaceholder(user, Array.from(userTokenSets[user].values()));
    });
  };

  /* this will get data to determine if a user is eligible for liquidation */
  requestAndSaveUserAccountData = async (user: string) => {
    try {
      const userAccount: UserAccountData = await this.lendingPoolContract.methods
        .getUserAccountData(user)
        .call();
      // get blockNumber ?
      // save to DB
      saveUserAccountData(user, userAccount);
    } catch (error) {
      console.error('UserAccountData request error with ', user, '\n', error);
    }
    return;
  };

  // requestAllUsersAccountData = async () => {
  //   const batches = chunk(this.users, 50); // infura rate limit of 50/sec
  //   for (const batch of batches) {
  //     const userPromises = [];
  //     for (const user of batch) {
  //       userPromises.push(this.requestAndSaveUserAccountData(user));
  //     }
  //     await delay(1000); // wait at least one second
  //     await Promise.all(userPromises);
  //   }
  // };

  /* this gets a list of what collaterals were deposited for each user */
  requestAndSaveUserDepositEvents = async (user: string) => {
    // latestBlock ?
    try {
      const depositEvents = await this.lendingPoolContract.getPastEvents('Deposit', {
        filter: { _user: user },
        fromBlock: this.deploymentBlock,
        toBlock: 'latest',
      });
      // console.log('DEPOSITEVENTS', depositEvents);
      let collateralUsed: Set<string> = new Set();
      depositEvents.forEach((event) => {
        console.log('EVENT.RETURNVALUES', event.returnValues);
        collateralUsed.add(event.returnValues._reserve.toString());
      });
      const collaterals: string[] = Array.from(collateralUsed.values());
      console.log('User has collaterals of: ', collaterals);
      // save to DB: forEach collateral token create a new ReserveData
      saveUserReserveDataPlaceholder(user, collaterals);
    } catch (error) {
      logger.error({
        at: 'aave/Backlog.requestAndSaveUserDepositEvents',
        error,
      });
      // TODO: retry request for this user
    }
  };

  // requestAllDepositEvents = async () => {
  //   const batches = chunk(this.users, 50); // infura rate limit of 50/sec
  //   for (const batch of batches) {
  //     const userPromises = [];
  //     for (const user of batch) {
  //       userPromises.push(this.requestAndSaveUserDepositEvents(user));
  //     }
  //     await delay(1000); // wait at least one second
  //     await Promise.all(userPromises);
  //   }
  // };

  // TODO: use rateLimiter once more that one exchange is in this bot
  throttleRequests = async (dataList: any[], method: () => void) => {
    const batches = chunk(dataList, 50); // infura rate limit of 50/sec
    for (const batch of batches) {
      const requestPromises = [];
      for (const item of batch) {
        requestPromises.push(method(item));
      }
      await delay(1000); // wait at least one second
      await Promise.all(requestPromises);
    }
  };

  // for testing
  // printEligibleLoans = () => {
  //   console.log('THIS.USERACCOUNTS.LENGTH', this.userAccounts.length);
  //   const eligibleLoans = this.userAccounts.filter((account) => account.healthFactor < 1);
  //   console.log('ELIGIBLELOANS', eligibleLoans);
  //   console.log('ELIGIBLELOANS.length', eligibleLoans.length);
  // };

  requestAndSaveUserReserveData = async (placeholder: UserReservePair) => {
    try {
      const userReserveData = await this.lendingPoolContract.methods.getUserReserveData(
        placeholder.reserve,
        placeholder.user
      );

      saveUserReserveData(user, reserve, userReserveData);
    } catch (error) {
      logger.error({
        at: 'aave/Backlog.requestAndSaveUserReserveData',
        error,
      });
      // TODO: retry request for this user
    }
  };

  // getAllUsersReserveData = async () => {
  //   // get DB entries - or - state
  //   const reservePlaceholders = await selectAllPlaceholderUserReserveData();
  //   // send requests
  //   // update entries
  // };

  syncDBWithBacklog = async () => {
    // check if loans are already in db, what was the latest block checked?
    await this.requestAndSetAllBorrowEvents(); // get Users
    // update latestBlock
    this.reduceAndSetUniqueUsers();
    this.reduceAndSaveUserTokenPairs();
    // await this.requestAllUsersAccountData();
    await this.throttleRequests(this.users, this.requestAndSaveUserAccountData);
    // await this.requestAllDepositEvents();
    await this.throttleRequests(this.users, this.requestAndSaveUserDepositEvents);
    const reservePlaceholders = await selectAllPlaceholderUserReserveData();
    await this.throttleRequests(reservePlaceholders, this.requestAndSaveUserReserveData);
    return true;
  };
}
