// import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import TokenExchangeRateWatcher from './TokenExchangeRateWatcher';
import { MessageEvents } from './interfaces';

/* create a TokenExchangeRateWatcher for each token that is an asset for at least one active loan
 * in the DB.
 *
 * TODO: Get price oracle contract addresses for all exchanges used
 * TODO: Have mempool explorer watch those contracts for price update method calls
 */
export default class TokenPriceListener {
  emitter: TypedEmitter<MessageEvents>;
  tokensConfig: any;
  private _assetTokenList: string[] = [];
  tokensToWatch: string[] = [];

  constructor(commonEmitter: TypedEmitter<MessageEvents>) {
    this.emitter = commonEmitter;
  }

  start = async () => {
    // set event listeners
    // exchanges watched won't change while running, but active tokens for each exchange will.
  };

  // NEED: oracle contract addresses

  /* One price watcher per  */
  _createWatchers = () => {
    this.tokensToWatch.map((token) => {
      // get APIs from config
      const singleTokenConfig = this.tokensConfig[token];
      // new TokenExRateWs
      new TokenExchangeRateWatcher(singleTokenConfig, this.emitter);
    });
  };
}
