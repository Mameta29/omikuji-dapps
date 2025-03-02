// src/components/omikuji/types.ts
export interface OmikujiMetadata {
    name: string;
    description: string;
    image: string;
    attributes: {
      trait_type: string;
      value: string;
    }[];
  }
  
  export interface OmikujiNFT {
    tokenId: string;
    metadata: OmikujiMetadata;
  }
  
  export interface ApprovalStatus {
    isApproved: boolean;
    isLoading: boolean;
    error: Error | null;
  }