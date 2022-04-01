# Contracts
## Kovan

[DAO](https://kovan.etherscan.io/address/0xDb766405C8C518a6B421F87fb543645C999689eD)

[Test](https://kovan.etherscan.io/address/0x66AAEE25669132c3CF094Fff5fE7165851C22b17)

[Token](https://kovan.etherscan.io/address/0x72e835e9896a6327202983dfb5499bf310600f59)


# Tasks
```shell
npx hardhat add-proposal --contract 0xDb766405C8C518a6B421F87fb543645C999689eD --signature 0x6b59084d --recipient 0x66AAEE25669132c3CF094Fff5fE7165851C22b17 --description "test1" 
npx hardhat deposit --contract 0xDb766405C8C518a6B421F87fb543645C999689eD --amount 
npx hardhat vote --contract 0xDb766405C8C518a6B421F87fb543645C999689eD --id 0 --support true
npx hardhat finish --contract 0xDb766405C8C518a6B421F87fb543645C999689eD --id 0
```

