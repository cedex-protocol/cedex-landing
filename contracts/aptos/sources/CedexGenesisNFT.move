module GenesisNFT::GenesisNFT {
    use aptos_framework::account;
    use aptos_framework::signer;
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use aptos_framework::object;
    use aptos_token_objects::collection;
    use aptos_token_objects::token;
    use std::string::{Self, String};
    use std::option;
    use std::error;
    use std::vector;

    /// Error codes
    const ENOT_ADMIN: u64 = 1;
    const EMAX_SUPPLY_REACHED: u64 = 2;
    const EMAX_PER_WALLET_REACHED: u64 = 3;
    const EALREADY_HAS_ROLE: u64 = 4;
    const EINVALID_ROLE: u64 = 5;
    const ECONTRACT_PAUSED: u64 = 6;
    const ECOLLECTION_ALREADY_EXISTS: u64 = 7;

    /// Constants
    const MAX_SUPPLY: u64 = 10000;
    const MAX_PER_WALLET: u8 = 3;

    /// Role constants
    const ROLE_TRADER: u8 = 0;
    const ROLE_LIQUIDITY_PROVIDER: u8 = 1;
    const ROLE_HOLDER: u8 = 2;
    const INVALID_ROLE: u8 = 255;

    const COLLECTION_NAME: vector<u8> = b"Genesis";
    const COLLECTION_DESCRIPTION: vector<u8> = b"Role-based NFT collection with Trader, Liquidity Provider, and Holder roles";
    const COLLECTION_URI: vector<u8> = b"ipfs://bafkreieogny5ika5lmyjt2gbfs4ju2cqaii3tpuxuswk6abkzxhjgxgkm4";

    /// Role names for metadata
    const ROLE_NAMES: vector<vector<u8>> = vector[
        b"Trader",
        b"Liquidity Provider",
        b"Holder"
    ];

    /// Role images (IPFS URIs)
    const ROLE_IMAGES: vector<vector<u8>> = vector[
        b"ipfs://bafkreie2r3cnafo5tau4ilgwl5qfgganf4x3mnyrzagpwbw62wqenjuaj4",
        b"ipfs://bafybeiao75pt3pegdhssu4vbkx22xz3wkhl7fezx7e6u564sml4uj5snki",
        b"ipfs://bafkreifp5h7awyvewbjfo4wy34cvi3u5j5dfu3naj47isbevozn7u4ntci"
    ];

    /// Collection configuration stored at resource account's address
    struct CollectionConfig has key {
        admin: address,  // Original admin who deployed the contract
        total_minted: u64,
        total_traders: u32,
        total_liquidity_providers: u32,
        total_holders: u32,
        paused: bool,
        collection_created: bool,
        signer_cap: account::SignerCapability  // Resource account capability for minting
    }

    /// User role tracking
    struct UserRoles has key {
        has_trader: bool,
        has_liquidity_provider: bool,
        has_holder: bool,
        nft_count: u8,
        token_ids: vector<u64>
    }

    /// Mapping of token_id to role (stored at admin address)
    struct TokenRoleMapping has key {
        mappings: vector<u8>  // Index is token_id, value is role
    }

    // Events
    #[event]
    struct NFTMinted has drop, store {
        minter: address,
        token_id: u64,
        role: u8,
        timestamp: u64
    }

    /// Get the deterministic resource account address
    fun get_resource_address(): address {
        account::create_resource_address(&@GenesisNFT, b"GenesisNFT_V1")
    }

    /// Initialize the collection when module is published
    fun init_module(admin: &signer) acquires CollectionConfig {
        let admin_addr = signer::address_of(admin);

        // Create resource account with deterministic seed
        let seed = b"GenesisNFT_V1";
        let (resource_signer, resource_signer_cap) = account::create_resource_account(admin, seed);

        // Move all resources to resource account
        move_to(&resource_signer, CollectionConfig {
            admin: admin_addr,  // Store original admin for permission checks
            total_minted: 0,
            total_traders: 0,
            total_liquidity_providers: 0,
            total_holders: 0,
            paused: false,
            collection_created: false,
            signer_cap: resource_signer_cap  // Store capability for minting
        });

        // Initialize token role mapping at resource account
        move_to(&resource_signer, TokenRoleMapping {
            mappings: vector::empty<u8>()
        });

        // Create the NFT collection with resource account as owner
        create_collection(&resource_signer);
    }

    /// Create the NFT collection (called once during init)
    fun create_collection(resource_signer: &signer) acquires CollectionConfig {
        let resource_addr = signer::address_of(resource_signer);
        let config = borrow_global_mut<CollectionConfig>(resource_addr);

        assert!(!config.collection_created, error::already_exists(ECOLLECTION_ALREADY_EXISTS));

        let collection_name = string::utf8(COLLECTION_NAME);
        let description = string::utf8(COLLECTION_DESCRIPTION);
        let collection_uri = string::utf8(COLLECTION_URI);

        // Create unlimited collection with resource account as owner
        collection::create_unlimited_collection(
            resource_signer,
            description,
            collection_name,
            option::none(),
            collection_uri,
        );

        config.collection_created = true;
    }

    /// Main minting function - mint NFT with specific role
    public entry fun mint_with_role(
        minter: &signer,
        role: u8
    ) acquires CollectionConfig, UserRoles, TokenRoleMapping {
        let minter_addr = signer::address_of(minter);

        // Get resource account address where config is stored
        let resource_addr = get_resource_address();
        let config = borrow_global_mut<CollectionConfig>(resource_addr);

        // Check if paused
        assert!(!config.paused, error::unavailable(ECONTRACT_PAUSED));

        // Validate role
        assert!(role <= ROLE_HOLDER, error::invalid_argument(EINVALID_ROLE));

        // Check max supply
        assert!(config.total_minted < MAX_SUPPLY, error::resource_exhausted(EMAX_SUPPLY_REACHED));

        // Initialize user roles if first time
        if (!exists<UserRoles>(minter_addr)) {
            move_to(minter, UserRoles {
                has_trader: false,
                has_liquidity_provider: false,
                has_holder: false,
                nft_count: 0,
                token_ids: vector::empty()
            });
        };

        let user_roles = borrow_global_mut<UserRoles>(minter_addr);

        // Check max per wallet
        assert!(user_roles.nft_count < MAX_PER_WALLET, error::resource_exhausted(EMAX_PER_WALLET_REACHED));

        // Check if user already has this role
        if (role == ROLE_TRADER) {
            assert!(!user_roles.has_trader, error::already_exists(EALREADY_HAS_ROLE));
            user_roles.has_trader = true;
            config.total_traders = config.total_traders + 1;
        } else if (role == ROLE_LIQUIDITY_PROVIDER) {
            assert!(!user_roles.has_liquidity_provider, error::already_exists(EALREADY_HAS_ROLE));
            user_roles.has_liquidity_provider = true;
            config.total_liquidity_providers = config.total_liquidity_providers + 1;
        } else {
            assert!(!user_roles.has_holder, error::already_exists(EALREADY_HAS_ROLE));
            user_roles.has_holder = true;
            config.total_holders = config.total_holders + 1;
        };

        // Get token ID
        let token_id = config.total_minted;
        config.total_minted = config.total_minted + 1;

        // Update user data
        user_roles.nft_count = user_roles.nft_count + 1;
        vector::push_back(&mut user_roles.token_ids, token_id);

        // Store token-to-role mapping
        let token_mapping = borrow_global_mut<TokenRoleMapping>(resource_addr);
        vector::push_back(&mut token_mapping.mappings, role);

        // Create token name and description
        let role_name = get_role_name(role);
        let token_name = string::utf8(b"Genesis #");
        string::append(&mut token_name, u64_to_string(token_id));

        let token_description = string::utf8(b"Role-based NFT: ");
        string::append(&mut token_description, role_name);

        let token_uri = get_role_image(role);
        let collection_name = string::utf8(COLLECTION_NAME);

        // Create signer from capability to mint token
        let resource_signer = account::create_signer_with_capability(&config.signer_cap);

        // Resource account mints the token
        let constructor_ref = token::create_named_token(
            &resource_signer,  // Resource account owns collection
            collection_name,
            token_description,
            token_name,
            option::none(),
            token_uri,
        );

        // Transfer token to minter
        let token_addr = object::address_from_constructor_ref(&constructor_ref);
        let token_obj = object::address_to_object<token::Token>(token_addr);
        object::transfer(&resource_signer, token_obj, minter_addr);

        // Emit event
        event::emit(NFTMinted {
            minter: minter_addr,
            token_id,
            role,
            timestamp: timestamp::now_seconds()
        });
    }

    /// Pause minting (admin only)
    public entry fun pause(admin: &signer) acquires CollectionConfig {
        let resource_addr = get_resource_address();
        let config = borrow_global_mut<CollectionConfig>(resource_addr);

        // Check admin permission
        assert!(signer::address_of(admin) == config.admin, error::permission_denied(ENOT_ADMIN));
        config.paused = true;
    }

    /// Unpause minting (admin only)
    public entry fun unpause(admin: &signer) acquires CollectionConfig {
        let resource_addr = get_resource_address();
        let config = borrow_global_mut<CollectionConfig>(resource_addr);

        // Check admin permission
        assert!(signer::address_of(admin) == config.admin, error::permission_denied(ENOT_ADMIN));
        config.paused = false;
    }

    // ===== View Functions =====

    #[view]
    /// Get minted details (admin view for stats)
    public fun get_minted_details(): (u64, u32, u32, u32) acquires CollectionConfig {
        let resource_addr = get_resource_address();
        if (exists<CollectionConfig>(resource_addr)) {
            let config = borrow_global<CollectionConfig>(resource_addr);
            (
                config.total_minted,
                config.total_traders,
                config.total_liquidity_providers,
                config.total_holders
            )
        } else {
            (0, 0, 0, 0)
        }
    }

    #[view]
    /// Get user NFT count
    public fun get_user_nft_count(user: address): u8 acquires UserRoles {
        if (exists<UserRoles>(user)) {
            let roles = borrow_global<UserRoles>(user);
            roles.nft_count
        } else {
            0
        }
    }


    #[view]
    /// Check if contract is paused
    public fun is_paused(): bool acquires CollectionConfig {
        let resource_addr = get_resource_address();
        if (exists<CollectionConfig>(resource_addr)) {
            let config = borrow_global<CollectionConfig>(resource_addr);
            config.paused
        } else {
            true  // Default to paused if config doesn't exist
        }
    }

    #[view]
    /// Get user's token IDs
    public fun get_user_token_ids(user: address): vector<u64> acquires UserRoles {
        if (exists<UserRoles>(user)) {
            let roles = borrow_global<UserRoles>(user);
            roles.token_ids
        } else {
            vector::empty<u64>()
        }
    }

    #[view]
    /// Get complete token details by ID
    /// Returns: (token_name, description, image_uri, role)
    public fun get_token_by_id(token_id: u64): (String, String, String, u8) acquires TokenRoleMapping {
        let resource_addr = get_resource_address();

        if (!exists<TokenRoleMapping>(resource_addr)) {
            return (string::utf8(b""), string::utf8(b""), string::utf8(b""), INVALID_ROLE)
        };

        let mapping = borrow_global<TokenRoleMapping>(resource_addr);

        if (token_id >= vector::length(&mapping.mappings)) {
            return (string::utf8(b""), string::utf8(b""), string::utf8(b""), INVALID_ROLE)
        };

        let role = *vector::borrow(&mapping.mappings, (token_id as u64));

        // Build token name with ID
        let token_name = string::utf8(b"Genesis #");
        string::append(&mut token_name, u64_to_string(token_id));

        // Build description
        let role_name = get_role_name(role);
        let description = string::utf8(b"Role-based NFT: ");
        string::append(&mut description, role_name);

        // Get image URI
        let image_uri = get_role_image(role);

        (token_name, description, image_uri, role)
    }

    // ===== Helper Functions =====

    fun get_role_name(role: u8): String {
        string::utf8(*vector::borrow(&ROLE_NAMES, (role as u64)))
    }

    fun get_role_image(role: u8): String {
        string::utf8(*vector::borrow(&ROLE_IMAGES, (role as u64)))
    }

    fun u64_to_string(val: u64): String {
        if (val == 0) {
            return string::utf8(b"0")
        };
        let buffer = vector::empty<u8>();
        while (val != 0) {
            vector::push_back(&mut buffer, ((48 + val % 10) as u8));
            val = val / 10;
        };
        vector::reverse(&mut buffer);
        string::utf8(buffer)
    }

    #[test_only]
    /// Initialize for testing
    public fun init_for_testing(admin: &signer) acquires CollectionConfig {
        init_module(admin);
    }
}