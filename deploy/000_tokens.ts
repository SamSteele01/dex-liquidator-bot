import fs from 'fs';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  console.log('DEPLOYER', deployer);

  await deploy('MockDAI', {
    from: deployer,
    log: true,
  });

  await deploy('MockLINK', {
    from: deployer,
    log: true,
  });

  await deploy('MockUSDC', {
    from: deployer,
    log: true,
  });

  await deploy('MockUSDT', {
    from: deployer,
    log: true,
  });

  await deploy('MockWBTC', {
    from: deployer,
    log: true,
  });
};
export default func;
