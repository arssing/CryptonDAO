import "@nomiclabs/hardhat-ethers";
import { task } from "hardhat/config";

task("add-proposal", "addProposal")
    .addParam("contract","smart contract address")
    .addParam("signature","signature for function")
    .addParam("recipient","recipient contract")
    .addParam("description","description")
    .setAction (async (taskArgs, hre) => {
    
    const DAOFactory = await hre.ethers.getContractFactory("DAO");
    const accounts = await hre.ethers.getSigners();

    const DAOContract = new hre.ethers.Contract(
        taskArgs.contract,
        DAOFactory.interface,
        accounts[0]
    );

    const tx = await DAOContract.addProposal(taskArgs.signature, taskArgs.recipient, taskArgs.description);

    console.log(
        `tx hash: ${tx.hash}`
    );
});

task("deposit", "deposit tokens")
    .addParam("contract","smart contract address")
    .addParam("amount","(in ETH)")
    .setAction (async (taskArgs, hre) => {
    
    const DAOFactory = await hre.ethers.getContractFactory("DAO");
    const accounts = await hre.ethers.getSigners();
    const convertAmount =  hre.ethers.utils.parseEther(taskArgs.amount);

    const DAOContract = new hre.ethers.Contract(
        taskArgs.contract,
        DAOFactory.interface,
        accounts[0]
    );

    const tx = await DAOContract.deposit(convertAmount);

    console.log(
        `tx hash: ${tx.hash}`
    );
});

task("vote", "vote for proposal")
    .addParam("contract","smart contract address")
    .addParam("id","proposal id")
    .addParam("support","true or false")
    .setAction (async (taskArgs, hre) => {
    
    const DAOFactory = await hre.ethers.getContractFactory("DAO");
    const accounts = await hre.ethers.getSigners();

    const DAOContract = new hre.ethers.Contract(
        taskArgs.contract,
        DAOFactory.interface,
        accounts[0]
    );

    const tx = await DAOContract.vote(taskArgs.id, taskArgs.support);

    console.log(
        `tx hash: ${tx.hash}`
    );
});

task("finish", "finish proposal")
    .addParam("contract","smart contract address")
    .addParam("id","proposal id")
    .setAction (async (taskArgs, hre) => {
    
    const DAOFactory = await hre.ethers.getContractFactory("DAO");
    const accounts = await hre.ethers.getSigners();

    const DAOContract = new hre.ethers.Contract(
        taskArgs.contract,
        DAOFactory.interface,
        accounts[0]
    );

    const tx = await DAOContract.finishProposal(taskArgs.id);

    console.log(
        `tx hash: ${tx.hash}`
    );
});