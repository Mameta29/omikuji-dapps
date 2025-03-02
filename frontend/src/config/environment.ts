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
  
  // デバッグ用のログ
  console.log('VITE_NETWORK:', import.meta.env.VITE_NETWORK)
  console.log('isProduction:', isProduction)
  console.log('Selected chain:', isProduction ? 'polygon' : 'amoy')
  
  const config = {
    chain: isProduction ? polygon : amoy,
    contracts: addresses
  }
  
  // 最終的な設定のログ
  console.log('Final config:', config)
  
  return config
}

export const env = getEnvironmentConfig()
export const isProduction = () => import.meta.env.VITE_NETWORK === 'production'
export const isDevelopment = () => !isProduction()