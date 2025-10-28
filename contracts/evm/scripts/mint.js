const hre = require("hardhat");

async function main() {
  // IMPORTANT: Replace with your deployed contract address
  const CONTRACT_ADDRESS = "0x8d3A702B6a813f2c1C9FAfe24B6f1E925D169D23";
  
  // Choose which role to mint (0 = TRADER, 1 = LIQUIDITY_PROVIDER, 2 = HOLDER)
  const ROLE_TO_MINT = 2; // Change this to mint different roles
  
  const roleNames = ["TRADER", "LIQUIDITY_PROVIDER", "HOLDER"];
  
  console.log(`\nMinting NFT with role: ${roleNames[ROLE_TO_MINT]}`);
  console.log("Contract Address:", CONTRACT_ADDRESS);
  
  const [signer] = await hre.ethers.getSigners();
  console.log("Minting from address:", signer.address);
  
  // Get contract instance
  const RoleBasedNFT = await hre.ethers.getContractFactory("RoleBasedNFT");
  const nft = RoleBasedNFT.attach(CONTRACT_ADDRESS);
  
  // Check current balance
  const balance = await nft.balanceOf(signer.address);
  console.log(`Current NFT balance: ${balance}`);
  
  // Check if user already has this role
  const hasRole = await nft.userHasRole(signer.address, ROLE_TO_MINT);
  if (hasRole) {
    console.log("❌ You already have this role!");
    return;
  }
  
  // Check max per wallet limit
  if (balance >= 3) {
    console.log("❌ You've reached the maximum of 3 NFTs per wallet!");
    return;
  }
  
  // Mint the NFT
  console.log("\nMinting NFT...");
  const tx = await nft.mintWithRole(ROLE_TO_MINT);
  console.log("Transaction hash:", tx.hash);
  
  // Wait for confirmation
  const receipt = await tx.wait();
  console.log("✅ NFT minted successfully!");
  
  // Get the minted token ID from events
  const event = receipt.logs.find(log => {
    try {
      const parsed = nft.interface.parseLog(log);
      return parsed.name === "NFTMinted";
    } catch {
      return false;
    }
  });
  
  if (event) {
    const parsed = nft.interface.parseLog(event);
    console.log(`Token ID: ${parsed.args.tokenId}`);
    console.log(`Role: ${roleNames[parsed.args.role]}`);
  }
  
  // Check new balance
  const newBalance = await nft.balanceOf(signer.address);
  console.log(`New NFT balance: ${newBalance}`);
  
  // Get all user roles
  const userRoles = await nft.getUserRoles(signer.address);
  console.log("\nYour roles:");
  console.log("- Trader:", userRoles.hasTrader);
  console.log("- Liquidity Provider:", userRoles.hasLiquidityProvider);
  console.log("- Holder:", userRoles.hasHolder);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });