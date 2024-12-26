// src/config/wagmi.ts
import { http, createConfig } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { env } from './environment'
import { type Transport } from 'viem'

export const config = createConfig({
  chains: [env.chain],
  connectors: [injected()],
  transports: {
    [env.chain.id]: http()
  } satisfies Record<number, Transport>
})