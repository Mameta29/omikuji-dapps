// src/constants/contracts.ts
export const OMIKUJI_CONTRACT_ADDRESS = '0x...' // デプロイ後のアドレスを入力
export const JPYC_CONTRACT_ADDRESS = '0x...' // JPYCのコントラクトアドレス

export const OMIKUJI_ABI = [
  {
    "inputs": [],
    "name": "drawOmikuji",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // ... 他の必要なABIを追加
] as const