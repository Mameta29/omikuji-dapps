// import { http, createConfig } from 'wagmi'
// import { polygon } from 'wagmi/chains'
// import { amoy } from './chain'
// import { env } from './environment'

// // 環境に応じてチェーンの配列を作成
// const chains = [env.chain] as const

// // development環境でのRPCエンドポイントを設定
// const getRpcUrl = (chainId: number) => {
//   if (import.meta.env.DEV && chainId === amoy.id) {
//     return '/rpc'  // Viteプロキシ経由
//   }
//   return undefined  // デフォルトのRPCエンドポイントを使用
// }

// export const config = createConfig({
//   chains: chains,
//   transports: {
//     [polygon.id]: http(),
//     [amoy.id]: http(getRpcUrl(amoy.id)),
//   },
// })

import { http, createConfig } from 'wagmi'
import { amoy } from './chain'

export const config = createConfig({
  chains: [amoy],
  transports: {
    [amoy.id]: http(
      'https://rpc-amoy.polygon.technology',
      {
        batch: false,
        timeout: 30000,
        retryCount: 3,
        retryDelay: 1000,
      }
    ),
  },
})