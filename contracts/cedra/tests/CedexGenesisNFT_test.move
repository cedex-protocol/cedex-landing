#[test_only]
module GenesisNFT::GenesisNFT_test {
    use GenesisNFT::GenesisNFT;
    use cedra_framework::signer;
    use cedra_framework::account::{create_account_for_test, create_signer_for_test};
    use cedra_framework::timestamp;
    use std::vector;
    use std::string;

    const ROLE_TRADER: u8 = 0;
    const ROLE_LIQUIDITY_PROVIDER: u8 = 1;
    const ROLE_HOLDER: u8 = 2;
    const INVALID_ROLE: u8 = 255;

    // Helper function to initialize timestamp for testing
    fun setup_timestamp() {
        let framework_signer = create_signer_for_test(@0x1);
        timestamp::set_time_has_started_for_testing(&framework_signer);
        timestamp::update_global_time_for_test_secs(100);
    }

    // Test 1: Mint and verify token details
    #[test(admin = @GenesisNFT, user = @0x123)]
    fun test_mint_and_verify_token(admin: signer, user: signer) {
        setup_timestamp();
        GenesisNFT::init_for_testing(&admin);
        create_account_for_test(signer::address_of(&user));

        GenesisNFT::mint_with_role(&user, ROLE_TRADER);

        // Verify through token IDs and token details
        let user_addr = signer::address_of(&user);
        let token_ids = GenesisNFT::get_user_token_ids(user_addr);
        assert!(vector::length(&token_ids) == 1, 1);

        let (name, _desc, _, role) = GenesisNFT::get_token_by_id(0);
        assert!(name == string::utf8(b"Genesis #0"), 2);
        assert!(role == ROLE_TRADER, 3);

        // Verify NFT count
        assert!(GenesisNFT::get_user_nft_count(user_addr) == 1, 4);
    }

    // Test 2: Verify can't mint duplicate roles
    #[test(admin = @GenesisNFT, user = @0x123)]
    #[expected_failure(abort_code = 0x80004, location = GenesisNFT::GenesisNFT)]
    fun test_no_duplicate_roles(admin: signer, user: signer) {
        setup_timestamp();
        GenesisNFT::init_for_testing(&admin);
        create_account_for_test(signer::address_of(&user));

        GenesisNFT::mint_with_role(&user, ROLE_TRADER);
        GenesisNFT::mint_with_role(&user, ROLE_TRADER); // Should fail
    }

    // Test 3: Max per wallet enforcement
    #[test(admin = @GenesisNFT, user = @0x123)]
    fun test_max_three_nfts_per_wallet(admin: signer, user: signer) {
        setup_timestamp();
        GenesisNFT::init_for_testing(&admin);
        create_account_for_test(signer::address_of(&user));

        // Mint all three roles successfully
        GenesisNFT::mint_with_role(&user, ROLE_TRADER);
        GenesisNFT::mint_with_role(&user, ROLE_LIQUIDITY_PROVIDER);
        GenesisNFT::mint_with_role(&user, ROLE_HOLDER);

        let user_addr = signer::address_of(&user);
        assert!(GenesisNFT::get_user_nft_count(user_addr) == 3, 1);

        // Verify token IDs
        let token_ids = GenesisNFT::get_user_token_ids(user_addr);
        assert!(vector::length(&token_ids) == 3, 2);
    }

    // Test 4: Invalid role rejection
    #[test(admin = @GenesisNFT, user = @0x123)]
    #[expected_failure(abort_code = 0x10005, location = GenesisNFT::GenesisNFT)]
    fun test_invalid_role_rejected(admin: signer, user: signer) {
        setup_timestamp();
        GenesisNFT::init_for_testing(&admin);
        create_account_for_test(signer::address_of(&user));

        GenesisNFT::mint_with_role(&user, 3); // Invalid role
    }

    // Test 5: Pause mechanism
    #[test(admin = @GenesisNFT, user = @0x123)]
    #[expected_failure(abort_code = 0xD0006, location = GenesisNFT::GenesisNFT)]
    fun test_pause_prevents_minting(admin: signer, user: signer) {
        setup_timestamp();
        GenesisNFT::init_for_testing(&admin);
        create_account_for_test(signer::address_of(&user));

        GenesisNFT::pause(&admin);
        GenesisNFT::mint_with_role(&user, ROLE_TRADER); // Should fail
    }

    // Test 6: Only admin can pause
    #[test(admin = @GenesisNFT, user = @0x123)]
    #[expected_failure(abort_code = 0x50001, location = GenesisNFT::GenesisNFT)]
    fun test_only_admin_pause(admin: signer, user: signer) {
        setup_timestamp();
        GenesisNFT::init_for_testing(&admin);
        create_account_for_test(signer::address_of(&user));

        GenesisNFT::pause(&user); // Should fail
    }

    // Test 7: Token role mapping accuracy
    #[test(admin = @GenesisNFT, user1 = @0x123, user2 = @0x456)]
    fun test_token_role_mapping_accuracy(admin: signer, user1: signer, user2: signer) {
        setup_timestamp();
        GenesisNFT::init_for_testing(&admin);
        create_account_for_test(signer::address_of(&user1));
        create_account_for_test(signer::address_of(&user2));

        // User1: mints trader (token 0)
        GenesisNFT::mint_with_role(&user1, ROLE_TRADER);
        // User2: mints LP (token 1)
        GenesisNFT::mint_with_role(&user2, ROLE_LIQUIDITY_PROVIDER);
        // User1: mints holder (token 2)
        GenesisNFT::mint_with_role(&user1, ROLE_HOLDER);

        // Verify token roles
        let (_, _, _, role0) = GenesisNFT::get_token_by_id(0);
        let (_, _, _, role1) = GenesisNFT::get_token_by_id(1);
        let (_, _, _, role2) = GenesisNFT::get_token_by_id(2);

        assert!(role0 == ROLE_TRADER, 1);
        assert!(role1 == ROLE_LIQUIDITY_PROVIDER, 2);
        assert!(role2 == ROLE_HOLDER, 3);
    }

    // Test 8: Collection statistics tracking
    #[test(admin = @GenesisNFT, u1 = @0x123, u2 = @0x456, u3 = @0x789)]
    fun test_collection_statistics(admin: signer, u1: signer, u2: signer, u3: signer) {
        setup_timestamp();
        GenesisNFT::init_for_testing(&admin);
        create_account_for_test(signer::address_of(&u1));
        create_account_for_test(signer::address_of(&u2));
        create_account_for_test(signer::address_of(&u3));

        // Mint various roles
        GenesisNFT::mint_with_role(&u1, ROLE_TRADER);
        GenesisNFT::mint_with_role(&u2, ROLE_TRADER);
        GenesisNFT::mint_with_role(&u3, ROLE_LIQUIDITY_PROVIDER);
        GenesisNFT::mint_with_role(&u1, ROLE_HOLDER);

        let _admin_addr = signer::address_of(&admin);
        let (total, traders, lps, holders) = GenesisNFT::get_minted_details();

        assert!(total == 4, 1);
        assert!(traders == 2, 2);  // u1 and u2
        assert!(lps == 1, 3);      // u3
        assert!(holders == 1, 4);  // u1
    }

    // Test 9: Non-existent token query
    #[test(admin = @GenesisNFT)]
    fun test_nonexistent_token_query(admin: signer) {
        setup_timestamp();
        GenesisNFT::init_for_testing(&admin);

        let (name, desc, uri, role) = GenesisNFT::get_token_by_id(999);
        assert!(name == string::utf8(b""), 1);
        assert!(desc == string::utf8(b""), 2);
        assert!(uri == string::utf8(b""), 3);
        assert!(role == INVALID_ROLE, 4);
    }

    // Test 10: Sequential token ID assignment
    #[test(admin = @GenesisNFT, u1 = @0x123, u2 = @0x456)]
    fun test_sequential_token_ids(admin: signer, u1: signer, u2: signer) {
        setup_timestamp();
        GenesisNFT::init_for_testing(&admin);
        create_account_for_test(signer::address_of(&u1));
        create_account_for_test(signer::address_of(&u2));

        GenesisNFT::mint_with_role(&u1, ROLE_TRADER);
        GenesisNFT::mint_with_role(&u2, ROLE_HOLDER);
        GenesisNFT::mint_with_role(&u1, ROLE_LIQUIDITY_PROVIDER);

        let ids1 = GenesisNFT::get_user_token_ids(signer::address_of(&u1));
        let ids2 = GenesisNFT::get_user_token_ids(signer::address_of(&u2));

        // u1 should have tokens 0 and 2
        assert!(*vector::borrow(&ids1, 0) == 0, 1);
        assert!(*vector::borrow(&ids1, 1) == 2, 2);

        // u2 should have token 1
        assert!(*vector::borrow(&ids2, 0) == 1, 3);
    }

    // Test 11: Unpause functionality
    #[test(admin = @GenesisNFT, user = @0x123)]
    fun test_unpause_allows_minting(admin: signer, user: signer) {
        setup_timestamp();
        GenesisNFT::init_for_testing(&admin);
        create_account_for_test(signer::address_of(&user));

        let _admin_addr = signer::address_of(&admin);

        // Pause then unpause
        GenesisNFT::pause(&admin);
        assert!(GenesisNFT::is_paused(), 1);

        GenesisNFT::unpause(&admin);
        assert!(!GenesisNFT::is_paused(), 2);

        // Should be able to mint now
        GenesisNFT::mint_with_role(&user, ROLE_TRADER);
        assert!(GenesisNFT::get_user_nft_count(signer::address_of(&user)) == 1, 3);
    }

    // Test 12: Only admin can unpause
    #[test(admin = @GenesisNFT, user = @0x123)]
    #[expected_failure(abort_code = 0x50001, location = GenesisNFT::GenesisNFT)]
    fun test_only_admin_unpause(admin: signer, user: signer) {
        setup_timestamp();
        GenesisNFT::init_for_testing(&admin);
        create_account_for_test(signer::address_of(&user));

        GenesisNFT::pause(&admin);
        GenesisNFT::unpause(&user); // Should fail
    }

    // Test 13: Token name formatting
    #[test(admin = @GenesisNFT, user = @0x123)]
    fun test_token_name_formatting(admin: signer, user: signer) {
        setup_timestamp();
        GenesisNFT::init_for_testing(&admin);
        create_account_for_test(signer::address_of(&user));

        // Mint multiple tokens to test different IDs
        GenesisNFT::mint_with_role(&user, ROLE_TRADER);
        GenesisNFT::mint_with_role(&user, ROLE_LIQUIDITY_PROVIDER);

        let (name0, _, _, _) = GenesisNFT::get_token_by_id(0);
        let (name1, _, _, _) = GenesisNFT::get_token_by_id(1);

        assert!(name0 == string::utf8(b"Genesis #0"), 1);
        assert!(name1 == string::utf8(b"Genesis #1"), 2);
    }

    // Test 14: Empty user query
    #[test(admin = @GenesisNFT)]
    fun test_empty_user_query(admin: signer) {
        setup_timestamp();
        GenesisNFT::init_for_testing(&admin);

        let non_existent_user = @0x999;

        // User with no NFTs
        assert!(GenesisNFT::get_user_nft_count(non_existent_user) == 0, 1);

        let token_ids = GenesisNFT::get_user_token_ids(non_existent_user);
        assert!(vector::length(&token_ids) == 0, 2);
    }
}