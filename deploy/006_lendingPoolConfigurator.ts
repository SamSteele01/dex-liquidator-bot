import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const SafeMath = await deployments.get('SafeMath');

  const possibleLendingPoolConfigurator = await deployments.getOrNull('LendingPoolConfigurator');
  if (!possibleLendingPoolConfigurator) {
    await deploy('LendingPoolConfigurator', {
      from: deployer,
      log: true,
      libraries: {
        SafeMath: SafeMath.address,
      },
    });

    const LendingPoolConfigurator = await ethers.getContract('LendingPoolConfigurator');
    const lendingPoolAddressesProvider = await deployments.get('LendingPoolAddressesProvider');

    await LendingPoolConfigurator.initialize(lendingPoolAddressesProvider.address);
  }
};
export default func;
