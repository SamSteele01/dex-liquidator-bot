pragma solidity ^0.5.0;

library TestMethods {
  
  function isContract(address addr) external view returns (bool) {
      // According to EIP-1052, 0x0 is the value returned for not-yet created accounts
      // and 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470 is returned
      // for accounts without code, i.e. `keccak256('')`
      bytes32 accountHash = 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470;
      bytes32 codehash;
      
      // solhint-disable-next-line no-inline-assembly
      assembly { codehash := extcodehash(addr) }
      
      return (codehash != 0x0 && codehash != accountHash);
  }
  
  /* function contractSize(address addr) external view returns (uint256) {
      uint256 codesize;
      
      // solhint-disable-next-line no-inline-assembly
      assembly { codesize := extcodesize(addr) }
      // this gets the ParserError: Variable name must precede ":=" in assignment.
      
      return codesize;
  }  */
  
}