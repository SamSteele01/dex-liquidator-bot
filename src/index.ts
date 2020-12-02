// get .env, exchangess, adapters

import 'reflect-metadata';
import Web3 from 'web3';
import { createConnection } from 'typeorm';
import { exchanges, tokens } from './config';
import ListenToRelevantTokenPrices from './ListenToRelevantTokenPrices';
import AaveBacklog from './lendingExchanges/aave/Backlog';

async function main() {
  // initialize - connections to Web3, Redis and Postgres?
  const web3ws = new Web3('ws://localhost:8546'); // Ganache
  const dbConnection = await createConnection();
  // common emitter ??
  // RateLimiter
  // ErrorHandler
  // MempoolWatcher

  // start GasPriceWatcher

  /* start loan finders, get all existing loans from exchanges that we are watching */
  const aaveLoans = new Aave(web3ws);

  /* get caught up on backlog */
  const backlogs: Promise<any>[] = [];
  backlogs.push(aaveLoans.getBacklog());

  /* Wait for latestBlockChecked to be updated for each exchange, then listen for new loan events */
  Promise.all(backlogs).then(() => {
    aaveLoans.listenForNewLoans();
  });

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
