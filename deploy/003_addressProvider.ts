import fs from 'fs';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer, feeCollector, lendingPoolManager } = await getNamedAccounts();

  const lendingPoolAddressesProvider = await deploy('LendingPoolAddressesProvider', {
    from: deployer,
    log: true,
  });

  const LendingPoolAddressesProvider = await ethers.getContractAt(
    'LendingPoolAddressesProvider',
    lendingPoolAddressesProvider.address
  );
  const priceOracle = await deployments.get('PriceOracle');
  const lendingRateOracle = await deployments.get('LendingRateOracle');

  await LendingPoolAddressesProvider.setPriceOracle(priceOracle.address);
  await LendingPoolAddressesProvider.setLendingRateOracle(lendingRateOracle.address);
  await LendingPoolAddressesProvider.setTokenDistributor(feeCollector);
  await LendingPoolAddressesProvider.setLendingPoolManager(lendingPoolManager);
};
export default func;
