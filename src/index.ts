// get .env, exchangess, adapters

import 'reflect-metadata';
import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import Web3 from 'web3';
import { createConnection } from 'typeorm';
import { RateLimiter } from 'limiter';
import { url } from './config';
import AaveAddressProvider from './lendingExchanges/aave/AddressProvider';
import AaveBacklog from './lendingExchanges/aave/Backlog';
import GasPriceWatcher from './GasPriceWatcher';
import TokenPriceListener from './TokenPriceListener';
import { MessageEvents, PriceOracle } from './interfaces';

async function main() {
  const web3ws = new Web3(url.web3()); // Ganache
  const dbConnection = await createConnection();
  const commonEmitter = new EventEmitter() as TypedEmitter<MessageEvents>;
  const rateLimiter = new RateLimiter(50, 'second');

  const gasPriceWatcher = new GasPriceWatcher();
  gasPriceWatcher.start();

  /* start loan finders, get all existing loans from exchanges that we are watching */
  const aaveAddressProvider = new AaveAddressProvider(web3ws);
  const aaveLendingPoolAddress = await aaveAddressProvider.getLendingPool();
  const aaveBacklog = new AaveBacklog(web3ws, rateLimiter, aaveLendingPoolAddress);

  /* get caught up on backlog */
  const backlogs: Promise<boolean>[] = [];
  backlogs.push(aaveBacklog.syncDBWithBacklog());

  /* Wait for latestBlockChecked to be updated for each exchange, then listen for new loan events */
  Promise.all(backlogs).then(() => {
    // set active monitors with commonEmitter
  });

  /* process loans: 
  - calculate asset price to liquidate at -> save 
  - get unique tokens
  - get oracle addresses to watch
  */

  let priceOracles: PriceOracle[] = [
    {
      exchange: 'aave',
      address: await aaveAddressProvider.getPriceOracle(),
    },
  ];

  const tokenPriceListener = new TokenPriceListener(commonEmitter, priceOracles);
  tokenPriceListener.start();

  // new emitter listener - ({ token, price }) => find loans

  /* new Liquidator contracts */
}

main();
