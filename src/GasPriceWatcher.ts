/*
 * Get the current gas price from EthGasStation
 */
import request from 'request-promise-native';
import logger from './logger';

export default class GasPriceWatcher {
  interval: number;
  timer: NodeJS.Timeout;
  currentGasPrice: string;

  requestGasPrice = async () => {
    let response;
    try {
      response = await request({
        method: 'GET',
        uri: process.env.GAS_STATION_URL,
        timeout: process.env.GAS_REQUEST_TIMEOUT_MS,
      });
    } catch (error) {
      logger.error({
        at: 'getGasPrices',
        message: 'Failed to retrieve gas prices',
        error,
      });
      return;
    }
    return JSON.parse(response);
  };

  updateGasPrice = async () => {
    const response = await this.requestGasPrice();

    const { fast } = response;
    if (!fast) {
      logger.error({
        at: 'updateGasPrice',
        message: 'gas api did not return fast',
      });
      return;
    }

    const multiplier = Number(process.env.GAS_PRICE_MULTIPLIER);
    if (Number.isNaN(multiplier)) {
      throw new Error('GAS_PRICE_MULTIPLIER not specified');
    }

    const addition = Number(process.env.GAS_PRICE_ADDITION || 0);
    if (Number.isNaN(addition)) {
      throw new Error('GAS_PRICE_ADDITION is invalid');
    }

    const totalWei = `${Math.round(Number(fast) * multiplier * 100000000 + addition)}`;

    logger.info({
      at: 'updateGasPrice',
      message: 'Updating gas price',
      gasPrice: totalWei,
    });

    this.currentGasPrice = totalWei;
  };

  /* take interval and endpoint, call on loop */
  start = () => {
    this.timer = setInterval(() => {
      this.requestGasPrice();
    }, Number(process.env.GAS_PRICE_UPDATE_FREQUENCY_SEC));
  };

  /* clean up */
  stop = () => {
    clearInterval(this.timer);
  };

  getCurrentGasPrice = () => {
    return this.currentGasPrice;
  };
}
