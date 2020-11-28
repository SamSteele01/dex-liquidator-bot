import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const safeMath = await deployments.get('SafeMath');
  const wadRayMath = await deployments.get('WadRayMath');

  // const lendingPoolDataProvider = await deploy('LendingPoolDataProvider', {
  const possibleLendingPoolDataProvider = await deployments.getOrNull('LendingPoolDataProvider');
  if (!possibleLendingPoolDataProvider) {
    await deploy('LendingPoolDataProvider', {
      from: deployer,
      log: true,
      libraries: {
        SafeMath: safeMath.address,
        WadRayMath: wadRayMath.address,
      },
    });

    const LendingPoolDataProvider = await ethers.getContract('LendingPoolDataProvider');
    const lendingPoolAddressesProvider = await deployments.get('LendingPoolAddressesProvider');

    await LendingPoolDataProvider.initialize(lendingPoolAddressesProvider.address);
  }
};
export default func;
