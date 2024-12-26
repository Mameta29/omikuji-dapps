// src/config/environment.ts
import { amoy, polygon } from './chain'

interface Environment {
  chain: typeof amoy | typeof polygon
  contracts: {
    omikuji: `0x${string}`
    jpyc: `0x${string}`
  }
}

// 環境変数からコントラクトアドレスを取得
const getContractAddresses = () => ({
  omikuji: import.meta.env.VITE_OMIKUJI_CONTRACT as `0x${string}`,
  jpyc: import.meta.env.VITE_JPYC_CONTRACT as `0x${string}`,
})

// 環境に基づいて設定を取得
export const getEnvironmentConfig = (): Environment => {
  const addresses = getContractAddresses()

  // VITE_NETWORKに基づいて環境を判定
  const isProduction = import.meta.env.VITE_NETWORK === 'production'

  return {
    chain: isProduction ? polygon : amoy,
    contracts: addresses
  }
}

export const env = getEnvironmentConfig()
export const isProduction = () => import.meta.env.VITE_NETWORK === 'production'
export const isDevelopment = () => !isProduction()