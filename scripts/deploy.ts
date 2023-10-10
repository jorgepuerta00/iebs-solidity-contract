import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const UnlockTime = Math.floor(Date.now() / 1000) + 3600;
  console.log("Unlock time:", UnlockTime);

  const overrides = {
    gasPrice: ethers.utils.parseUnits("1", "gwei"),
    gasLimit: 2000000,
  };

  const LockFactory = await ethers.getContractFactory("Lock");
  const lock = await LockFactory.deploy(UnlockTime, { value: ethers.utils.parseEther("1"), ...overrides });

  await lock.deployed();

  console.log("Lock contract deployed to:", lock.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
