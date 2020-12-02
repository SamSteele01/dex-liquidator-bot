
pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "./aave/flashloan/base/FlashLoanReceiverBase.sol";
import "./aave/configuration/LendingPoolAddressesProvider.sol";

import "./aave/interfaces/ILendingPoolAddressesProvider.sol";
import "./aave/interfaces/ILendingPool.sol";

contract AaveLiquidation {
  
  address constant aaveEthAddress = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
  // address addressesProvider;
  LendingPoolAddressesProvider public addressesProvider;
  
  constructor(LendingPoolAddressesProvider _addressesProvider, address _liquidateCore) public {
    addressesProvider = _addressesProvider;
  }
  
  function liquidate(
      address _collateral,
      address _reserve,
      address _user,
      uint256 _purchaseAmount
    ) external {

    if (_reserve != aaveEthAddress) {
      require(IERC20(_reserve).approve(addressesProvider.getLendingPoolCore(), _purchaseAmount), "Approval error");
    }

    ILendingPool lendingPool = ILendingPool(addressesProvider.getLendingPool());

    // Assumes this contract already has `_purchaseAmount` of `_reserve`.
    lendingPool.liquidationCall.value(_reserve == aaveEthAddress ? _purchaseAmount : 0)(_collateral, _reserve, _user, _purchaseAmount, false);
        
  }
  
}
