
pragma solidity ^0.5.0;

import "./aave/flashloan/base/FlashLoanReceiverBase.sol";
import "./aave/interfaces/ILendingPoolAddressesProvider.sol";
import "./aave/interfaces/ILendingPool.sol";
/* import "@openzeppelin/contracts/ownership/Ownable.sol"; */
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract AaveLiquidation {
  
  address addressesProvider;
  /* address liquidateCore; */
  
  constructor(address _addressesProvider, address _liquidateCore) public {
    addressesProvider = _addressesProvider;
    /* liquidateCore = _liquidateCore; */
  }
  
  /* modifier onlyCore {
      require(liquidateCore == msg.sender, "The caller must be a liquidate core contract");
      _;
  } */
  
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
