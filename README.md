Smart Contracts
----
Smart Contracts for InstaFi's 1 click position moves.


# Useful commands

```shell
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat run scripts/sample-script.js
npx hardhat help
```

# Notes of our smart contract

## Ignoring return values
For each call we make with our `CallUnit`, we don't look at the return value of the actual function. We just verify that the call itself has passed without reverting. We are making an implicit assumption that if a function didn't finish as expected, it would just revert instead of say, returning false (for example `Transfer` function in ERC 20 spec). This line of thinking makes sense because these same functions could be called from a wallet and wallets only care about wheather a call passed or failed. Read [this article](https://medium.com/coinmonks/return-values-in-solidity-contracts-2a034b31d553) for more details. 
