import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers } = hre;
  const { deploy } = deployments;

  const signers = await ethers.getSigners();

  const safeMath = await deployments.get('SafeMath');
  const wadRayMath = await deployments.get('WadRayMath');
  const coreLibrary = await deployments.get('CoreLibrary');
  const safeERC20 = await deployments.get('SafeERC20');
  const address = await deployments.get('Address');

  const possibleLendingPoolCore = await deployments.getOrNull('LendingPoolCore');
  if (!possibleLendingPoolCore) {
    await deploy('LendingPoolCore', {
      from: signers[0].address, // deployer,
      log: true,
      libraries: {
        SafeMath: safeMath.address,
        WadRayMath: wadRayMath.address,
        CoreLibrary: coreLibrary.address,
        SafeERC20: safeERC20.address,
        Address: address.address,
      },
    });

    const LendingPoolCore = await ethers.getContract('LendingPoolCore');

    const lendingPoolAddressesProvider = await deployments.get('LendingPoolAddressesProvider');

    await LendingPoolCore.initialize(lendingPoolAddressesProvider.address);
  }
};
export default func;
