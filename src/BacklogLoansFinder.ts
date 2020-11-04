import { Connection } from 'typeorm';

/* get all existing loans from this exchange that we are watching into the db */
export default class BacklogLoansFinder {
  public blockNumber: string;
  private _contract: any;

  constructor(web3, db: Connection, exchangeConfig) {
    /* 
      Inject config and db instance 
      if type = "contract" create instance(s) of contract(s)
    */
  }

  start = () => {
    // get lastBlockChecked from db - could go forwards from hardcoded "startBlock" or backwards
    // from "latest" block
    // call methods until all loans are found
    // update lastBlockChecked
    // call "singleLoanMethod" for each
    // normalize/standardize objects
    // save in db
  };

  _poll = () => {};

  _normalize = () => {};

  _saveInDB = () => {};
}
