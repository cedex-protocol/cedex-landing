const hre = require("hardhat");

async function main() {
  console.log("Deploying to Ethereum Mainnet...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
  
  const RoleBasedNFT = await hre.ethers.getContractFactory("RoleBasedNFT");
  console.log("Deploying RoleBasedNFT...");
  const roleBasedNFT = await RoleBasedNFT.deploy();
  
  await roleBasedNFT.waitForDeployment();
  
  const contractAddress = await roleBasedNFT.getAddress();
  console.log("RoleBasedNFT deployed to:", contractAddress);
  
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
  
  console.log("\n✅ Ethereum Deployment Complete!");
  console.log("================================");
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`View on Etherscan: https://etherscan.io/address/${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });