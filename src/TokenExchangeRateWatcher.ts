/* watch an instant token price
 * sources:  http api, contracts, or the mempool
 */
import { PriceOracle } from './interfaces';

export default class TokenExchangeRateWatcher {
  constructor(oracle: PriceOracle) {
    // set API url
  }

  // ping at interval or subscribe to events
  start = () => {
    // emit event when price drops { token, price }
  };
}
