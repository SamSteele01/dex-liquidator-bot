# DEX liquidator bot

## Commands

`npx hardhat compile`
`ganache-cli`
`npx hardhat --network localhost deploy`

If you shut down ganache make sure to `rm -rf deployemnts/localhost`

## TODO

- [x] setup project
- [x] get contracts for exchanges
- [x] script to load contracts into Ganache
- [x] setup Docker
- [ ] test loading DB
- [ ] task to setup Liquidation contract(s)
- [ ] task to create loans
- [ ] task/script to adjust oracle prices
- [ ] test Liquidation contract(s) - receive & withdraw

## Deploy steps

- deploy MockTokens
- aave contracts
- uniswap contracts
- liquidate (bot) contracts
- mint tokens
- eth to WETH contract
- set values on LiquidateCore
- send tokens to borrowers/users
- add liquidity to Uniswap
- send eth for gas to LiquidateCore
- users deposit collateral
- users take out loans
