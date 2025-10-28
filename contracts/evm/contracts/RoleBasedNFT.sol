// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract RoleBasedNFT is ERC721, Ownable, Pausable, ReentrancyGuard {
    using Strings for uint256;
    
    enum Role {
        TRADER,
        LIQUIDITY_PROVIDER,
        HOLDER
    }
    
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MAX_PER_WALLET = 3;
    
    mapping(uint256 => Role) public tokenRoles;
    mapping(address => mapping(Role => bool)) public userHasRole;
    
    uint32 public totalTraders;
    uint32 public totalLiquidityProviders;
    uint32 public totalHolders;
    uint32 private _tokenIdCounter;
    mapping(uint256 => uint64) private mintTimestamp;
    
    string[3] private roleNames = ["Trader", "Liquidity Provider", "Holder"];
    string[3] private roleImages = [
        "ipfs://bafkreie2r3cnafo5tau4ilgwl5qfgganf4x3mnyrzagpwbw62wqenjuaj4",
        "ipfs://bafybeiao75pt3pegdhssu4vbkx22xz3wkhl7fezx7e6u564sml4uj5snki",
        "ipfs://bafkreifp5h7awyvewbjfo4wy34cvi3u5j5dfu3naj47isbevozn7u4ntci"
    ];
    
    event NFTMinted(address indexed minter, uint256 tokenId, Role role);
    
    constructor() ERC721("Genesis", "GENESIS") Ownable(msg.sender) {}
    
    function mintWithRole(Role _role) external whenNotPaused nonReentrant {
        require(_tokenIdCounter < MAX_SUPPLY, "Max supply reached");
        require(balanceOf(msg.sender) < MAX_PER_WALLET, "Max mint per wallet reached");
        require(!userHasRole[msg.sender][_role], "Already has this role");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        tokenRoles[tokenId] = _role;
        userHasRole[msg.sender][_role] = true;
        if (_role == Role.TRADER) {
            totalTraders++;
        } else if (_role == Role.LIQUIDITY_PROVIDER) {
            totalLiquidityProviders++;
        } else {
            totalHolders++;
        }
        mintTimestamp[tokenId] = uint64(block.timestamp);

        _safeMint(msg.sender, tokenId);

        emit NFTMinted(msg.sender, tokenId, _role);
    }
    
    function getMintedDetails() external view onlyOwner returns (
        uint256 totalMinted,
        uint256 traderCount,
        uint256 lpCount,
        uint256 holderCount
    ) {
        return (
            _tokenIdCounter,
            totalTraders,
            totalLiquidityProviders,
            totalHolders
        );
    }
    
    function getUserRoles(address user) external view returns (
        bool hasTrader,
        bool hasLiquidityProvider,
        bool hasHolder
    ) {
        return (
            userHasRole[user][Role.TRADER],
            userHasRole[user][Role.LIQUIDITY_PROVIDER],
            userHasRole[user][Role.HOLDER]
        );
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        Role role = tokenRoles[tokenId];
        string memory roleName = roleNames[uint256(role)];
        string memory image = roleImages[uint256(role)];
        
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Genesis #',
                        tokenId.toString(),
                        '", "description": "Role-based NFT: ',
                        roleName,
                        '", "image": "',
                        image,
                        '", "attributes": [{"trait_type": "Role", "value": "',
                        roleName,
                        '"}, {"trait_type": "Token ID", "value": "',
                        tokenId.toString(),
                        '"}, {"trait_type": "Minted", "value": "',
                        (uint256(mintTimestamp[tokenId])).toString(),
                        '"}]}'
                    )
                )
            )
        );
        
        return string(abi.encodePacked("data:application/json;base64,", json));
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    

}