pragma solidity ^0.5.0;

import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Callee.sol';
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import '../libraries/UniswapV2Library.sol';

contract LiquidateCore is Ownable {
    using SafeMath for uint258;
    
    address constant aaveEthAddress = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    
    /* mapping(bytes32 => address) exchanges; */
    mapping(bytes32 => address) liquidators; // our logic contracts 
    /* mapping(bytes32 => address) flashLoaners; */
    address hodlToken;
    address uniswapV2FactoryAddress;
    uint256 minGas;
    uint256 maxGas;
    uint256 allowedSlippage; // 0 - 999 == 0% - 9.99%
    
    event Liquidate(bytes32 indexed exchangeName, address collateral, uint256 amount);
    // NOTE: _name, exchangeName, and _liquidator are all the same thing: the name of the exchange
    //    that we will liquidate a loan on.
    
    function addLiquidator(bytes32 _name, address _address) public onlyOwner returns(bool) {
        require(liquidators[_name] == 0, "Name already used.");
        liquidators[_name] = _address;
        return true;
    }

    function setHodlToken(address _hodlToken) public onlyOwner returns(bool) {
        hodlToken = _hodlToken;
        return true;
    }
    
    function setMinGas(uint256 _amount) public onlyOwner returns(bool) {
        minGas = _amount;
        return true;
    }
    
    function setMaxGas(uint256 _amount) public onlyOwner returns(bool) {
        maxGas = _amount;
        return true;
    }

    function setUniswapV2FactoryAddress(address _address) public onlyOwner returns(bool) {
        uniswapV2FactoryAddress = _address;
        return true;
    }
  
    function liquidateWithFlashSwap(      
        bytes32 _liquidator,
        address _collateral,
        address _reserve,
        address _user,
        uint256 _amount
    ) public onlyOwner returns (bool) {
        // need to sort contracts
        (address token0, address token1) = UniswapV2Library.sortTokens(_collateral, _reserve);
        address tokenPair = IUniswapV2Factory(uniswapV2FactoryAddress).getPair(token0, token1);
        
        data = abi.encode(
            _liquidator,
            _collateral,
            _reserve,
            _user,
            _amount
        );
        // tokenPair.swap(uint amount0Out, uint amount1Out, address to, bytes calldata data)
        // address order may be reversed depending on which _collateral and _reserve
        if (_collateral == token0) {
            tokenPair.swap(0, _amount, address(this), data);
            return;
        }
        // or
        tokenPair.swap(_amount, 0, address(this), data);
    }
  
    // called from pair contract after
    // NOTE: sender === address(this)
    function uniswapV2Call(address sender, uint amount0, uint amount1, bytes calldata data) {
        address[] memory token = new address[](2);
        token[0] = IUniswapV2Pair(msg.sender).token0(); // fetch the address of token0
        token[1] = IUniswapV2Pair(msg.sender).token1(); // fetch the address of token1
        // ensure that msg.sender is a V2 tokenPair contract
        assert(msg.sender == IUniswapV2Factory(uniswapV2FactoryAddress).getPair(token[0], token[1]));
        
        (
          bytes32 _liquidator,
          address _collateral,
          address _reserve,
          address _user,
          uint256 _amount
        ) = abi.decode(data, (bytes32, address, address, address, uint256));
        
        IERC20 collateralToken = IERC20(_collateral);
        
        uint256 beforeBalance = collateralToken.balanceOf(address(this));
      
        /* these args need to be the same for each liquidation method call for each exchange */
        /* (bool success, bytes memory result) = liquidators[_liquidator].delegatecall( */
        liquidators[_liquidator].delegatecall(
            abi.encodeWithSignature(
                "liquidate(address,address,address,uint256)",
                _collateral,
                _reserve,
                _user,
                _purchaseAmount
            )
        );
        /* require(success, "Liquidation call failed"); */
        
        // deal with unit conversion ??
        
        uint256 afterBalance = collateralToken.balanceOf(address(this));
        
        // confirm liquidation went through
        assert(afterBalance > beforeBalance);

        // figure collateralAmount to return to pair contract (with .3% fee)
        uint256 amountRequired = UniswapV2Library.getAmountsIn(uniswapV2FactoryAddress, _amount, token)[0];
        
        // slippage ?? add 0.5 - 1% ??
        amountRequired += amountRequired.mul(allowedSlippage).div(1000);
        
        // fail if we didn't get enough collateral back to repay our flash loan
        assert((afterBalance - beforeBalance) > amountRequired);
        
        // return collateral to token pair contract
        collateralToken.approve(msg.sender, amountRequired);
        assert(collateralToken.transfer(msg.sender, amountRequired));
        
        // update afterBalance after paying back flashSwap
        afterBalance = collateralToken.balanceOf(address(this));
        
        // Emit Liquidation event
        emit Liquidate(_liquidator, _collateral, (afterBalance - beforeBalance));
      
        // need to always keep enough ETH for gas. Use some of the profit to keep gas levels in range.
        if (this.balance < minGas) {
            _getGas(_collateral);
        }
        
        // if collateral is hodlToken we are done, else swap tokens
        if (_collateral != hodlToken) {            
            // sort
            (address token0, address token1) = UniswapV2Library.sortTokens(_collateral, _reserve);
            
            // update token
            token[0] = token0;
            token[1] = token1;
            
            // figure fee
            uint256 minHodlReturn = UniswapV2Library.getAmountsOut(uniswapV2FactoryAddress, afterBalance, token)[0];
            
            // allow for slippage
            minHodlReturn -= minHodlReturn.mul(allowedSlippage).div(1000);
            
            address hodlTokenPair = IUniswapV2Factory(uniswapV2FactoryAddress).getPair(token0, token1);
            collateralToken.approve(hodlTokenPair, afterBalance);
            
            if (token0 == _collateral) {
              hodlTokenPair.swap(afterBalance, minHodlReturn, address(this), 0);
              return;
            }
            
            hodlTokenPair.swap(minHodlReturn, afterBalance, address(this), 0);
        }
    };
  
    function _getGas(address _collateral) internal {
        uint256 amountOutMin = maxGas - this.balance;

        address[] memory path = new address[](2);
        path[0] = address(_collateral);
        path[1] = address(aaveEthAddress); // NEED: WETH address for Uniswap
        
        // NOTE: to avoid sandwich attacks the amountIn must be calculated from prices retrieved from 
        //   an oracle of some kind
        /* (uint price0Cumulative, uint price1Cumulative, uint32 blockTimestamp) = UniswapV2OracleLibrary.currentCumulativePrices(pair);
        uint256 amountIn = (price1Cumulative * amountOutMin) / price0Cumulative; */
        /* require(collateralToken.approve(address(UniswapV2Router02), amountIn), 'approve failed.');
        UniswapV2Router02.swapExactTokensForETH(amountIn, amountOutMin, path, msg.sender, block.timestamp); */
        
        uint256 amountIn = UniswapV2Library.getAmountsIn(uniswapV2FactoryAddress, amountOutMin, path)[0];
        amountIn += amountIn.mul(allowedSlippage).div(1000);
        
        address tokenEthPair = IUniswapV2Factory(uniswapV2FactoryAddress).getPair(path[0], path[1]);
        collateralToken.approve(tokenEthPair, amountIn);
        
        (address token0, address token1) = UniswapV2Library.sortTokens(path[0], path[1]);
        
        if (token0 == path[0]) {
          hodlTokenPair.swap(amountIn, amountOutMin, address(this), 0);
          return;
        }
        
        hodlTokenPair.swap(amountOutMin, amountIn, address(this), 0);
    }
  
    // withdraw
    function withdraw(uint amount) public onlyOwner returns(bool) {
        require(amount <= this.balance);
        owner.transfer(amount);
        return true;
    }
    
    function withdrawToken(address token, uint amount) public onlyOwner returns(bool) {
        require(amount <= token.balanceOf(address(this)));
        token.approve(address(this), amount)
        token.transfer(owner(), amount);
        return true;
    }
    
    function() external payable { };
}