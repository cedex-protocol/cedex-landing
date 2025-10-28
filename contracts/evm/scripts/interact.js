const hre = require("hardhat");

async function main() {
  // IMPORTANT: Replace with your deployed contract address
  const CONTRACT_ADDRESS = "0x8d3A702B6a813f2c1C9FAfe24B6f1E925D169D23";
  
  console.log("\n🔍 Interacting with RoleBasedNFT Contract");
  console.log("Contract Address:", CONTRACT_ADDRESS);
  
  const [signer] = await hre.ethers.getSigners();
  console.log("Connected wallet:", signer.address);
  
  // Get contract instance
  const RoleBasedNFT = await hre.ethers.getContractFactory("RoleBasedNFT");
  const nft = RoleBasedNFT.attach(CONTRACT_ADDRESS);
  
  // Display contract info
  console.log("\n📊 Contract Information:");
  console.log("========================");
  
  const name = await nft.name();
  const symbol = await nft.symbol();
  console.log(`Name: ${name}`);
  console.log(`Symbol: ${symbol}`);
  console.log(`Max Supply: ${await nft.MAX_SUPPLY()}`);
  console.log(`Max Per Wallet: ${await nft.MAX_PER_WALLET()}`);
  
  // Get minting stats (only owner can call this)
  try {
    const owner = await nft.owner();
    if (owner.toLowerCase() === signer.address.toLowerCase()) {
      const stats = await nft.getMintedDetails();
      console.log(`\n📈 Minting Statistics (Owner Only):`);
      console.log(`Total Minted: ${stats.totalMinted}`);
      console.log(`Total Traders: ${stats.traderCount}`);
      console.log(`Total Liquidity Providers: ${stats.lpCount}`);
      console.log(`Total Holders: ${stats.holderCount}`);
    }
  } catch (error) {
    // Not owner, skip
  }
  
  // Check user's NFTs
  console.log("\n👤 Your NFT Status:");
  console.log("==================");
  
  const balance = await nft.balanceOf(signer.address);
  console.log(`Your NFT Balance: ${balance}`);
  
  const userRoles = await nft.getUserRoles(signer.address);
  console.log("\nYour Roles:");
  console.log(`✅ Trader: ${userRoles.hasTrader}`);
  console.log(`✅ Liquidity Provider: ${userRoles.hasLiquidityProvider}`);
  console.log(`✅ Holder: ${userRoles.hasHolder}`);
  
  // Show available roles to mint
  console.log("\n🎯 Available Roles to Mint:");
  console.log("==========================");
  
  const roleOptions = [
    { id: 0, name: "TRADER", has: userRoles.hasTrader },
    { id: 1, name: "LIQUIDITY_PROVIDER", has: userRoles.hasLiquidityProvider },
    { id: 2, name: "HOLDER", has: userRoles.hasHolder }
  ];
  
  for (const role of roleOptions) {
    if (!role.has && balance < 3) {
      console.log(`${role.id}: ${role.name} - Available to mint`);
    } else if (role.has) {
      console.log(`${role.id}: ${role.name} - Already owned`);
    }
  }
  
  if (balance >= 3) {
    console.log("\n⚠️  You've reached the maximum of 3 NFTs per wallet!");
  }
  
  // Display owned token IDs and their metadata
  if (balance > 0) {
    console.log("\n🖼️  Your NFT Details:");
    console.log("===================");
    
    // Note: This contract doesn't have a way to enumerate tokens by owner
    // In production, you'd want to add that functionality or track Transfer events
    console.log("To see your NFT metadata, check the block explorer or OpenSea");
  }
  
  console.log("\n💡 To mint an NFT, run:");
  console.log("npx hardhat run scripts/mint.js --network [network-name]");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });