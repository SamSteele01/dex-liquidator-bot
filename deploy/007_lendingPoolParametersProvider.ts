import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const possibleLendingPoolParametersProvider = await deployments.getOrNull(
    'LendingPoolParametersProvider'
  );
  if (!possibleLendingPoolParametersProvider) {
    await deploy('LendingPoolParametersProvider', {
      from: deployer,
      log: true,
    });

    const LendingPoolParametersProvider = await ethers.getContract('LendingPoolParametersProvider');
    const lendingPoolAddressesProvider = await deployments.get('LendingPoolAddressesProvider');

    await LendingPoolParametersProvider.initialize(lendingPoolAddressesProvider.address);
  }
};
export default func;
