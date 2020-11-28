import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const safeMath = await deploy('SafeMath', {
    from: deployer,
    log: true,
  });

  const wadRayMath = await deploy('WadRayMath', {
    from: deployer,
    log: true,
    libraries: {
      SafeMath: safeMath.address,
    },
  });

  await deploy('CoreLibrary', {
    from: deployer,
    log: true,
    libraries: {
      SafeMath: safeMath.address,
      WadRayMath: wadRayMath.address,
    },
  });

  await deploy('SafeERC20', {
    from: deployer,
    log: true,
  });

  await deploy('Address', {
    from: deployer,
    log: true,
  });
};
export default func;
