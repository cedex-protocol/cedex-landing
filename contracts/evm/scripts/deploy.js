const hre = require("hardhat");

async function main() {
  const network = hre.network.name;
  console.log(`Deploying to ${network}...`);
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance));
  
  const RoleBasedNFT = await hre.ethers.getContractFactory("RoleBasedNFT");
  const roleBasedNFT = await RoleBasedNFT.deploy();
  
  await roleBasedNFT.waitForDeployment();
  
  const contractAddress = await roleBasedNFT.getAddress();
  console.log("RoleBasedNFT deployed to:", contractAddress);
  
  if (network !== "hardhat" && network !== "localhost") {
    console.log("Waiting for block confirmations...");
    await roleBasedNFT.deploymentTransaction().wait(6);
    
    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
  
  console.log("\nDeployment Summary:");
  console.log("===================");
  console.log(`Network: ${network}`);
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Max Supply: 10000`);
  console.log(`Max Per Wallet: 3`);
  console.log(`Roles: Trader, Liquidity Provider, Holder`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });