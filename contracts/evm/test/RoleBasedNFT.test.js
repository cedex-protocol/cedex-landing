const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RoleBasedNFT", function () {
  let roleBasedNFT;
  let owner;
  let user1;
  let user2;
  
  const Role = {
    TRADER: 0,
    LIQUIDITY_PROVIDER: 1,
    HOLDER: 2
  };
  
  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const RoleBasedNFT = await ethers.getContractFactory("RoleBasedNFT");
    roleBasedNFT = await RoleBasedNFT.deploy();
    await roleBasedNFT.waitForDeployment();
  });
  
  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await roleBasedNFT.owner()).to.equal(owner.address);
    });
    
    it("Should have correct name and symbol", async function () {
      expect(await roleBasedNFT.name()).to.equal("Genesis");
      expect(await roleBasedNFT.symbol()).to.equal("GENESIS");
    });
    
    it("Should have correct max supply", async function () {
      expect(await roleBasedNFT.MAX_SUPPLY()).to.equal(10000);
    });
    
    it("Should have correct max per wallet", async function () {
      expect(await roleBasedNFT.MAX_PER_WALLET()).to.equal(3);
    });
  });
  
  describe("Minting", function () {
    it("Should mint NFT with Trader role", async function () {
      await roleBasedNFT.connect(user1).mintWithRole(Role.TRADER);
      
      expect(await roleBasedNFT.balanceOf(user1.address)).to.equal(1);
      expect(await roleBasedNFT.ownerOf(0)).to.equal(user1.address);
      expect(await roleBasedNFT.tokenRoles(0)).to.equal(Role.TRADER);
      expect(await roleBasedNFT.userHasRole(user1.address, Role.TRADER)).to.be.true;
    });
    
    it("Should mint NFT with Liquidity Provider role", async function () {
      await roleBasedNFT.connect(user1).mintWithRole(Role.LIQUIDITY_PROVIDER);
      
      expect(await roleBasedNFT.tokenRoles(0)).to.equal(Role.LIQUIDITY_PROVIDER);
      expect(await roleBasedNFT.userHasRole(user1.address, Role.LIQUIDITY_PROVIDER)).to.be.true;
    });
    
    it("Should mint NFT with Holder role", async function () {
      await roleBasedNFT.connect(user1).mintWithRole(Role.HOLDER);
      
      expect(await roleBasedNFT.tokenRoles(0)).to.equal(Role.HOLDER);
      expect(await roleBasedNFT.userHasRole(user1.address, Role.HOLDER)).to.be.true;
    });
    
    it("Should allow user to mint all three roles", async function () {
      await roleBasedNFT.connect(user1).mintWithRole(Role.TRADER);
      await roleBasedNFT.connect(user1).mintWithRole(Role.LIQUIDITY_PROVIDER);
      await roleBasedNFT.connect(user1).mintWithRole(Role.HOLDER);
      
      expect(await roleBasedNFT.balanceOf(user1.address)).to.equal(3);
      expect(await roleBasedNFT.balanceOf(user1.address)).to.equal(3);
      
      const roles = await roleBasedNFT.getUserRoles(user1.address);
      expect(roles[0]).to.be.true;
      expect(roles[1]).to.be.true;
      expect(roles[2]).to.be.true;
    });
    
    it("Should not allow minting same role twice", async function () {
      await roleBasedNFT.connect(user1).mintWithRole(Role.TRADER);
      
      await expect(
        roleBasedNFT.connect(user1).mintWithRole(Role.TRADER)
      ).to.be.revertedWith("Already has this role");
    });
    
    it("Should not allow minting more than 3 NFTs per wallet", async function () {
      await roleBasedNFT.connect(user1).mintWithRole(Role.TRADER);
      await roleBasedNFT.connect(user1).mintWithRole(Role.LIQUIDITY_PROVIDER);
      await roleBasedNFT.connect(user1).mintWithRole(Role.HOLDER);
      
      await expect(
        roleBasedNFT.connect(user1).mintWithRole(Role.TRADER)
      ).to.be.revertedWith("Max mint per wallet reached");
    });
    
    it("Should emit NFTMinted event", async function () {
      await expect(roleBasedNFT.connect(user1).mintWithRole(Role.TRADER))
        .to.emit(roleBasedNFT, "NFTMinted")
        .withArgs(user1.address, 0, Role.TRADER);
    });
  });
  
  describe("Pause functionality", function () {
    it("Should allow owner to pause", async function () {
      await roleBasedNFT.pause();
      expect(await roleBasedNFT.paused()).to.be.true;
    });
    
    it("Should allow owner to unpause", async function () {
      await roleBasedNFT.pause();
      await roleBasedNFT.unpause();
      expect(await roleBasedNFT.paused()).to.be.false;
    });
    
    it("Should not allow non-owner to pause", async function () {
      await expect(
        roleBasedNFT.connect(user1).pause()
      ).to.be.revertedWithCustomError(roleBasedNFT, "OwnableUnauthorizedAccount");
    });
    
    it("Should not allow minting when paused", async function () {
      await roleBasedNFT.pause();
      
      await expect(
        roleBasedNFT.connect(user1).mintWithRole(Role.TRADER)
      ).to.be.revertedWithCustomError(roleBasedNFT, "EnforcedPause");
    });
  });
  
  describe("Admin functions", function () {
    it("Should allow owner to get minted details", async function () {
      await roleBasedNFT.connect(user1).mintWithRole(Role.TRADER);
      await roleBasedNFT.connect(user1).mintWithRole(Role.LIQUIDITY_PROVIDER);
      await roleBasedNFT.connect(user2).mintWithRole(Role.HOLDER);
      
      const details = await roleBasedNFT.getMintedDetails();
      expect(details[0]).to.equal(3);
      expect(details[1]).to.equal(1);
      expect(details[2]).to.equal(1);
      expect(details[3]).to.equal(1);
    });
    
    it("Should not allow non-owner to get minted details", async function () {
      await expect(
        roleBasedNFT.connect(user1).getMintedDetails()
      ).to.be.revertedWithCustomError(roleBasedNFT, "OwnableUnauthorizedAccount");
    });
  });
  
  describe("View functions", function () {
    it("Should return correct user roles", async function () {
      await roleBasedNFT.connect(user1).mintWithRole(Role.TRADER);
      await roleBasedNFT.connect(user1).mintWithRole(Role.HOLDER);
      
      const roles = await roleBasedNFT.getUserRoles(user1.address);
      expect(roles[0]).to.be.true;
      expect(roles[1]).to.be.false;
      expect(roles[2]).to.be.true;
    });
    
    it("Should check if user has specific role", async function () {
      await roleBasedNFT.connect(user1).mintWithRole(Role.LIQUIDITY_PROVIDER);
      
      expect(await roleBasedNFT.userHasRole(user1.address, Role.LIQUIDITY_PROVIDER)).to.be.true;
      expect(await roleBasedNFT.userHasRole(user1.address, Role.TRADER)).to.be.false;
    });
    
    it("Should track role counts correctly", async function () {
      await roleBasedNFT.connect(user1).mintWithRole(Role.TRADER);
      await roleBasedNFT.connect(user2).mintWithRole(Role.TRADER);
      await roleBasedNFT.connect(user1).mintWithRole(Role.LIQUIDITY_PROVIDER);
      
      expect(await roleBasedNFT.totalTraders()).to.equal(2);
      expect(await roleBasedNFT.totalLiquidityProviders()).to.equal(1);
      expect(await roleBasedNFT.totalHolders()).to.equal(0);
    });
  });
  
  describe("Token URI", function () {
    it("Should return correct metadata for minted token", async function () {
      await roleBasedNFT.connect(user1).mintWithRole(Role.TRADER);
      
      const tokenURI = await roleBasedNFT.tokenURI(0);
      expect(tokenURI).to.include("data:application/json;base64,");
      
      const base64Data = tokenURI.replace("data:application/json;base64,", "");
      const jsonData = Buffer.from(base64Data, "base64").toString("utf-8");
      const metadata = JSON.parse(jsonData);
      
      expect(metadata.name).to.equal("Genesis #0");
      expect(metadata.description).to.equal("Role-based NFT: Trader");
      expect(metadata.image).to.equal("ipfs://QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx");
      expect(metadata.attributes[0].value).to.equal("Trader");
    });
    
    it("Should revert for non-existent token", async function () {
      await expect(
        roleBasedNFT.tokenURI(999)
      ).to.be.revertedWith("Token does not exist");
    });
  });
});