import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const wadRayMath = await deployments.get('WadRayMath');

  const possibleFeeProvider = await deployments.getOrNull('FeeProvider');
  if (!possibleFeeProvider) {
    await deploy('FeeProvider', {
      from: deployer,
      log: true,
      libraries: {
        WadRayMath: wadRayMath.address,
      },
    });

    const FeeProvider = await ethers.getContract('FeeProvider');
    const lendingPoolAddressesProvider = await deployments.get('LendingPoolAddressesProvider');

    await FeeProvider.initialize(lendingPoolAddressesProvider.address);
  }
};
export default func;
