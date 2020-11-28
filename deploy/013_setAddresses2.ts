import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers } = hre;

  const LendingPoolAddressesProvider = await ethers.getContract('LendingPoolAddressesProvider');
  const lendingPoolDataProvider = await deployments.get('LendingPoolDataProvider');
  const lendingPoolLiquidationManager = await deployments.get('LendingPoolLiquidationManager');

  // const LendingPoolAddressesProvider = await ethers.getContract(
  //   'LendingPoolAddressesProvider'
  // );

  // UnhandledPromiseRejectionWarning: ProviderError: VM Exception while processing transaction:
  // revert Cannot set a proxy implementation to a non-contract address

  console.log('you are here');
  await LendingPoolAddressesProvider.setLendingPoolDataProviderImpl(
    lendingPoolDataProvider.address
  );
  await LendingPoolAddressesProvider.setLendingPoolLiquidationManager(
    lendingPoolLiquidationManager.address
  );
};
export default func;
