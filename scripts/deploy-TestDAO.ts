import { ethers } from "hardhat";

async function main() {
  const TestDAO = await ethers.getContractFactory("TestDAO");
  const testDAO = await TestDAO.deploy("0xDb766405C8C518a6B421F87fb543645C999689eD");

  await testDAO.deployed();

  console.log("address:", testDAO.address);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
