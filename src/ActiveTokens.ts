// import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { getAllCollateralTokens } from './lendingExchanges/aave/AaveRepository';
import { MessageEvents } from './interfaces';

/*
 * Create a list of unique addresses for each token that is an asset for at
 *  least one active loan in the DB.
 * As more exchanges are added this Class would have multiple instances with the DB function set
 *  with a strategy pattern.
 */
export default class ActiveTokens {
  tokensToWatch: string[] = [];
  emitter: TypedEmitter<MessageEvents>;

  constructor(commonEmitter: TypedEmitter<MessageEvents>) {
    this.emitter = commonEmitter;
  }

  start = async () => {
    // db call - get list of all asset tokens
    await this.getTokensToWatchFromDB();
    // if new ReserveData is saved to the DB, update this list and emit event
  };

  getTokensToWatchFromDB = async () => {
    const allTokens = await getAllCollateralTokens();
    this.tokensToWatch = Array.from(new Set(allTokens.map((token) => token.reserve)));
  };
}
