import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers } = hre;

  const LendingPoolAddressesProvider = await ethers.getContract('LendingPoolAddressesProvider');
  const LendingPoolCore = await ethers.getContract('LendingPoolCore');
  const lendingPoolConfigurator = await deployments.get('LendingPoolConfigurator');
  const lendingPoolParametersProvider = await deployments.get('LendingPoolParametersProvider');
  const feeProvider = await deployments.get('FeeProvider');

  // const TestMethods = await ethers.getContract('TestMethods');
  // // console.log('TESTMETHODS', TestMethods);
  //
  // console.log('lendingPoolCore size: ', await TestMethods.isContract(LendingPoolCore.address));
  // console.log(
  //   'lendingPoolConfigurator size: ',
  //   await TestMethods.isContract(lendingPoolConfigurator.address)
  // );
  // console.log(
  //   'lendingPoolParametersProvider size: ',
  //   await TestMethods.isContract(lendingPoolParametersProvider.address)
  // );
  // console.log('feeProvider size: ', await TestMethods.isContract(feeProvider.address));

  await LendingPoolAddressesProvider.setLendingPoolCoreImpl(LendingPoolCore.address);
  // ProviderError: VM Exception while processing transaction:
  // revert Cannot set a proxy implementation to a non-contract address

  console.log('LENDINGPOOLCONFIGURATOR.ADDRESS', lendingPoolConfigurator.address);
  await LendingPoolAddressesProvider.setLendingPoolConfiguratorImpl(
    lendingPoolConfigurator.address
  );
  // console.log('!!!   ---   setLendingPoolConfiguratorImpl   ---   !!!');
  console.log('LENDINGPOOLPARAMETERSPROVIDER.ADDRESS', lendingPoolParametersProvider.address);
  await LendingPoolAddressesProvider.setLendingPoolParametersProviderImpl(
    lendingPoolParametersProvider.address
  );
  // console.log('!!!   ---   setLendingPoolParametersProviderImpl   ---   !!!');
  console.log('FEEPROVIDER.ADDRESS', feeProvider.address);
  await LendingPoolAddressesProvider.setFeeProviderImpl(feeProvider.address);
  // console.log('!!!   ---   setFeeProviderImpl   ---   !!!');
};
export default func;
