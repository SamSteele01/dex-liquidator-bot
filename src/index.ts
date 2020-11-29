// get .env, exchangess, adapters

import 'reflect-metadata';
import Web3 from 'web3';
import { createConnection } from 'typeorm';
import { exchanges, tokens } from './config';
import BacklogLoansFinder from './BacklogLoansFinder';
import ListenToRelevantTokenPrices from './ListenToRelevantTokenPrices';

async function main() {
  // initialize - connections to Web3, Redis and Postgres?
  const web3 = new Web3('ws://localhost:8546'); // Ganache
  const dbConnection = await createConnection();
  // common emitter ??
  // RateLimiter
  // ErrorHandler
  // MempoolWatcher

  // start GasPriceWatcher

  /* start loan finders, get all existing loans from exchanges that we are watching */
  const aaveLoans = new BacklogLoansFinder(web3, dbConnection, exchanges.aave);

  const bZxLoans = new BacklogLoansFinder(web3, dbConnection, exchanges.bzx);
  /* get caught up on backlog */

  const compoundLoans = new BacklogLoansFinder(web3, dbConnection, exchanges.compound);
  /* Wait for latestBlockChecked to be updated for each exchange, then listen for new loan events */

  const dydxLoans = new BacklogLoansFinder(web3, dbConnection, exchanges.dydx);
  /* process loans: 
  - calculate asset price to liquidate at -> save 
  - get unique tokens
  - get oracle addresses to watch
  */

  const tokenPriceListener = new ListenToRelevantTokenPrices(tokens);
  //    start TokenExchangeRateWatchers ?
  tokenPriceListener.start();
  const tokenPriceEmitter = tokenPriceListener.getEmitter();

  // new emitter listener - ({ token, price }) => find loans

  /* new Liquidator contracts */
}

main();
