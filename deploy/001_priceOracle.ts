import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const priceOracle = await deploy('PriceOracle', {
    from: deployer,
    log: true,
  });

  const PriceOracle = await ethers.getContractAt('PriceOracle', priceOracle.address);
  const mockDAI = await deployments.get('MockDAI');
  const mockLINK = await deployments.get('MockLINK');
  const mockUSDC = await deployments.get('MockUSDC');
  const mockUSDT = await deployments.get('MockUSDT');
  const mockWBTC = await deployments.get('MockWBTC');

  await PriceOracle.setAssetPrice(mockDAI.address, '2500000000000000');
  await PriceOracle.setAssetPrice(mockLINK.address, '30000000000000000'); // ≈$12 / LINK
  await PriceOracle.setAssetPrice(mockUSDC.address, '2500000000000000');
  await PriceOracle.setAssetPrice(mockUSDT.address, '2500000000000000');
  await PriceOracle.setAssetPrice(mockWBTC.address, '37500000000000000000'); // $15000 / BTC
};
export default func;
