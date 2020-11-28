import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const safeMath = await deployments.get('SafeMath');
  const wadRayMath = await deployments.get('WadRayMath');
  const address = await deployments.get('Address');

  // const lendingPoolLiquidationManager = await deploy('LendingPoolLiquidationManager', {
  const possibleLendingPoolLiquidationManager = await deployments.getOrNull(
    'LendingPoolLiquidationManager'
  );
  if (!possibleLendingPoolLiquidationManager) {
    await deploy('LendingPoolLiquidationManager', {
      from: deployer,
      log: true,
      libraries: {
        SafeMath: safeMath.address,
        WadRayMath: wadRayMath.address,
        Address: address.address,
      },
    });

    // const LendingPoolLiquidationManager = await ethers.getContract('LendingPoolLiquidationManager');
    // const lendingPoolAddressesProvider = await deployments.get('LendingPoolAddressesProvider');
    //
    // await LendingPoolLiquidationManager.initialize(lendingPoolAddressesProvider.address);
  }
};
export default func;
