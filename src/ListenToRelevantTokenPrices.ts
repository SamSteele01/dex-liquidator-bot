import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { getRepository, Repository } from 'typeorm';
import { Loan } from './entity/Loan';
import TokenExchangeRateWatcher from './TokenExchangeRateWatcher';
import { TokensConfig, MessageEvents } from './interfaces';

/* create a TokenExchangeRateWatcher for each token that is an asset for at least one active loan 
in the DB */
export default class ListenToRelevantTokenPrices {
  private _loan: Repository<Loan>;
  tokensConfig: any;
  private _assetTokenList: string[] = [];
  tokensToWatch: string[] = [];
  emitter: any;

  constructor(tokensConfig: TokensConfig) {
    this._loan = getRepository(Loan);
    this.tokensConfig = tokensConfig;
    // new Emitter -> extract to method with error listener ??
    this.emitter = new EventEmitter() as TypedEmitter<MessageEvents>;
  }

  start = async () => {
    // db call - get list of all asset tokens
    this._assetTokenList = await this._getAssetTokensFromDB();
    // reduce to Set/unique array
    this.tokensToWatch = this._reduceToUniqueSet();
    // map => new TokenExchangeRateWatchers

    // emit event on price drop
  };

  getEmitter = () => {
    return this.emitter;
  };

  _getAssetTokensFromDB = async () => {
    // query all Loans - project only collateralToken
    const allLoans = await this._loan.find({ select: ['collateralToken'] });
    return allLoans.map((loan) => loan.collateralToken);
  };

  _reduceToUniqueSet = () => {
    const assetSet = new Set(this._assetTokenList);
    return Array.from(assetSet);
  };

  _createWatchers = () => {
    this.tokensToWatch.map((token) => {
      // get APIs from config
      const singleTokenConfig = this.tokensConfig[token];
      // new TokenExRateWs
      new TokenExchangeRateWatcher(singleTokenConfig, this.emitter);
    });
  };
}
