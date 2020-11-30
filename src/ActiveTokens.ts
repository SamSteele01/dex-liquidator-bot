// import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { getRepository, Repository } from 'typeorm';
import { AaveUserReserveData } from './entity/AaveUserReserveData';
import { MessageEvents } from './interfaces';

/*
 * create a list of unique addresses for each token that is an asset for at
 * least one active loan in the DB.
 */
export default class ActiveTokens {
  private _aaveUserReserveData: Repository<AaveUserReserveData>;
  tokensConfig: any;
  private _assetTokenList: string[] = [];
  tokensToWatch: string[] = [];
  emitter: TypedEmitter<MessageEvents>;

  constructor(commonEmitter: TypedEmitter<MessageEvents>) {
    this._aaveUserReserveData = getRepository(AaveUserReserveData);
    this.emitter = commonEmitter;
  }

  start = async () => {
    // db call - get list of all asset tokens
    this._assetTokenList = await this._getUserReserveDataFromDB();
    // reduce to Set/unique array
    this.tokensToWatch = this._reduceToUniqueSet();
    // map => new TokenExchangeRateWatchers

    // emit event on price drop
  };

  _getUserReserveDataFromDB = async () => {
    const allLoans = await this._aaveUserReserveData.find({ select: ['collateralToken'] });
    return allLoans.map((loan) => loan.collateralToken);
  };

  _reduceToUniqueSet = () => {
    const assetSet = new Set(this._assetTokenList);
    return Array.from(assetSet);
  };

  // get oracle contract addresses

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
