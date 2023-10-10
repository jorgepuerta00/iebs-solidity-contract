# Smart Contract: Lock

This project showcases an Ethereum smart contract called Lock. The contract allows a user to lock funds until a specified unlock time. Once the unlock time is reached, the owner can withdraw the locked funds.

You can test the contract and its functions using Hardhat, a development tool for Ethereum. Here are some useful commands

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```

## Important

Before running the deployment, ensure you have sufficient funds in the account from which you wish to deploy the contract, as they will be needed to cover gas costs and other associated expenses.
