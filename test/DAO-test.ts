import { expect } from "chai";
import { ethers } from "hardhat";
import { ContractReceipt } from "ethers";
import {Token, Token__factory, DAO, DAO__factory, TestDAO, TestDAO__factory} from "../typechain";

function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

describe("DAO-tests", function () {
  
  let token: Token;
  let dao: DAO;
  let testDao: TestDAO;

  beforeEach(async () => {
    const [owner, user1] = await ethers.getSigners();
    const tokenFactory = await ethers.getContractFactory("Token",owner) as Token__factory;
    const daoFactory = await ethers.getContractFactory("DAO", owner) as DAO__factory;
    const testDaoFactory = await ethers.getContractFactory("TestDAO", owner) as TestDAO__factory;

    const toMint = ethers.utils.parseEther("10");

    token = await tokenFactory.deploy("TestToken1","STT");
    await token.deployed();

    await token.mint(owner.address, toMint);
    await token.mint(user1.address, toMint);

    dao = await daoFactory.deploy(owner.address, token.address, 5, 11);
    await dao.deployed();
    
    testDao = await testDaoFactory.deploy(dao.address);
    await testDao.deployed();
  });

  it("addProposal, vote, deposit, finishProposal, withdraw", async function () {

    const [owner, user1] = await ethers.getSigners();

    const toAllow = ethers.utils.parseEther("10");
    const toVote = ethers.utils.parseEther("5");
    await token.connect(user1).approve(dao.address, toAllow);

    await expect(
      dao.connect(owner).vote(2, true)
    ).to.be.revertedWith("DAO::vote:proposal not found");

    const iface = new ethers.utils.Interface([
      "function test1() public view returns(string memory)",
      "function sum(uint a, uint b) public view returns(uint)",
      "function err1() public view returns(uint)",
    ]);
  
    const firstCall = iface.encodeFunctionData("test1");
    const secondCall = iface.encodeFunctionData("sum", [1, 2]);
    const errorCall = iface.encodeFunctionData("err1");
    console.log(firstCall);
    await dao.connect(owner).addProposal(firstCall, testDao.address, "test1");
    await dao.connect(owner).addProposal(secondCall, testDao.address, "sum");
    await dao.connect(owner).addProposal(errorCall, testDao.address, "error");
    
    await dao.connect(user1).deposit(toVote);
    await dao.connect(user1).vote(0, true);

    await expect(
      dao.connect(user1).vote(0, true)
    ).to.be.revertedWith("DAO::vote:not enough tokens");

    await dao.connect(user1).deposit(toVote);
    await dao.connect(user1).vote(0, false);
    await dao.connect(user1).vote(1, true);
    await dao.connect(user1).vote(2, true);

    const test1 = await dao.proposals(0);
    const sum = await dao.proposals(1);
    const error = await dao.proposals(2);

    expect(test1.numOfYes).to.equal(5);
    expect(test1.numOfNo).to.equal(5);
    expect(sum.numOfYes).to.equal(10);
    expect(error.numOfYes).to.equal(10);
    

    await expect(
      dao.finishProposal(3)
    ).to.be.revertedWith("DAO::finishProposal:proposal not found");

    await expect(
      dao.finishProposal(0)
    ).to.be.revertedWith("DAO::finishProposal:the debate is not over yet");

    await delay(5000);
    const tx1 = await dao.finishProposal(0);
    let receipt1: ContractReceipt = await tx1.wait();
    const event1 = receipt1.events?.find(event => event.event === "FinishProposal");
    const accepted1 = event1?.args!['accepted'];
    const successful1 = event1?.args!['successfulCall'];

    expect(accepted1).to.equal(false);
    expect(successful1).to.equal(true);

    await expect(
      dao.connect(owner).vote(0, true)
    ).to.be.revertedWith("DAO::vote:finished");

    await expect(
      dao.finishProposal(0)
    ).to.be.revertedWith("DAO::finishProposal:finished");

    const tx2 = await dao.finishProposal(1);
    let receipt2: ContractReceipt = await tx2.wait();
    const event2 = receipt2.events?.find(event => event.event === "FinishProposal");
    const accepted2 = event2?.args!['accepted'];
    const successful2 = event2?.args!['successfulCall'];

    expect(accepted2).to.equal(true);
    expect(successful2).to.equal(true);

    await expect(
      dao.connect(user1).withdraw()
    ).to.be.revertedWith("DAO::withdraw:not all proposal finished");

    const tx3 = await dao.finishProposal(2);
    let receipt3: ContractReceipt = await tx3.wait();
    const event3 = receipt3.events?.find(event => event.event === "FinishProposal");
    const accepted3 = event2?.args!['accepted'];
    const successful3 = event3?.args!['successfulCall'];

    expect(accepted3).to.equal(true);
    expect(successful3).to.equal(false);

    await dao.connect(user1).withdraw();

    expect(await token.balanceOf(user1.address)).to.equal(toAllow);
  });


});
