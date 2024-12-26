// src/config/chains.ts
import { Chain } from 'viem'

// Amoy testnet の設定
export const amoy = {
  id: 80_002,
  name: 'Amoy',
  nativeCurrency: {
    decimals: 18,
    name: 'MATIC',
    symbol: 'MATIC',
  },
  rpcUrls: {
    default: {
      http: ['https://polygon-amoy.blockpi.network/v1/rpc/public'],
    },
    public: {
      http: ['https://polygon-amoy.blockpi.network/v1/rpc/public'],
    },
  },
  blockExplorers: {
    default: {
      name: 'PolygonScan',
      url: 'https://www.oklink.com/amoy',
    },
  },
  testnet: true,
} as const satisfies Chain

// Polygon Mainnet の設定
export const polygon = {
  id: 137,
  name: 'Polygon',
  nativeCurrency: {
    decimals: 18,
    name: 'MATIC',
    symbol: 'MATIC',
  },
  rpcUrls: {
    default: {
      http: ['https://polygon-rpc.com'],
    },
    public: {
      http: ['https://polygon-rpc.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'PolygonScan',
      url: 'https://polygonscan.com',
    },
  },
  testnet: false,
} as const satisfies Chain