import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const safeMath = await deployments.get('SafeMath');
  const wadRayMath = await deployments.get('WadRayMath');
  const address = await deployments.get('Address');

  // const lendingPool = await deploy('LendingPool', {
  const possibleLendingPool = await deployments.getOrNull('LendingPool');
  if (!possibleLendingPool) {
    await deploy('LendingPool', {
      from: deployer,
      log: true,
      libraries: {
        SafeMath: safeMath.address,
        WadRayMath: wadRayMath.address,
        Address: address.address,
      },
    });
  }

  const LendingPool = await ethers.getContract('LendingPool');
  // const lendingPoolAddressesProvider = await deployments.get('LendingPoolAddressesProvider');
  const LendingPoolAddressesProvider = await ethers.getContract('LendingPoolAddressesProvider');

  LendingPool.initialize(LendingPoolAddressesProvider.address);
  LendingPoolAddressesProvider.setLendingPoolImpl(LendingPool.address);
};
export default func;
