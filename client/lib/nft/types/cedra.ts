export interface CedraTokenProperties {
  role?: number | string;
  [key: string]: unknown;
}

export interface CedraCurrentTokenData {
  token_name?: string;
  description?: string;
  token_uri?: string;
  token_properties?: CedraTokenProperties;
  collection_name?: string;
  creator_address?: string;
  [key: string]: unknown;
}

export interface CedraOwnedToken {
  current_token_data?: CedraCurrentTokenData | null;
  property_version_v1?: number | string;
  token_data_id?: string;
  amount?: number;
  owner_address?: string;
  [key: string]: unknown;
}

export interface CedraAccountAddress {
  address: string | { data: Uint8Array };
  publicKey?: unknown;
}

export interface CedraSignResult {
  status: 'Approved' | 'Rejected';
  args?: unknown;
}

export function isCedraAccountAddress(account: unknown): account is CedraAccountAddress {
  return (
    account !== null &&
    typeof account === 'object' &&
    'address' in account
  );
}

export function isAddressObject(address: unknown): address is { data: Uint8Array } {
  return (
    address !== null &&
    typeof address === 'object' &&
    'data' in address &&
    address.data instanceof Uint8Array
  );
}
