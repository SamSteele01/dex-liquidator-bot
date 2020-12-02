// import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import TokenExchangeRateWatcher from './TokenExchangeRateWatcher';
import { MessageEvents, PriceOracle } from './interfaces';

/* create a TokenExchangeRateWatcher for each token that is an asset for at least one active loan
 * in the DB.
 *
 * TODO: Get price oracle contract addresses for all exchanges used
 * TODO: Have mempool explorer watch those contracts for price update method calls
 */
export default class TokenPriceListener {
  constructor(
    private commonEmitter: TypedEmitter<MessageEvents>,
    private priceOracles: PriceOracle[]
  ) {}

  start = async () => {
    // set event listeners
    this.createWatchers();
    // exchanges watched won't change while running, but active tokens for each exchange will.
    this.commonEmitter.on(
      'tokenPriceChange',
      (exchange: string, token: string, newPrice: number) => {}
    );
  };

  // NEED: oracle contract addresses

  /* One price watcher per contract 
    Using a mempool monitor will only work on testnets or mainnet. For local contracts in Ganache we
    have to watch for events.
  */
  createWatchers = () => {
    this.priceOracles.forEach((oracle) => {
      // rename oracleMonitor
      new TokenExchangeRateWatcher(oracle);
    });
  };
}
