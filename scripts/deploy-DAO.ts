import { ethers } from "hardhat";

async function main() {
  const DAO = await ethers.getContractFactory("DAO");
  const dao = await DAO.deploy("0x1083981D05a7bF5Ebfb9666a43806a6571bb19d0","0x72e835E9896A6327202983DFb5499Bf310600f59", 4, 3600);

  await dao.deployed();

  console.log("address:", dao.address);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
