// src/hooks/omikuji/useOmikujiNFT.ts
import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { readContract } from '@wagmi/core'
import { OmikujiNFT } from '../../components/omikuji/types'
import { OMIKUJI_ABI, OMIKUJI_CONTRACT_ADDRESS } from '../../constants/contracts'
import { config } from '../../config/wagmi'

export const useOmikujiNFT = () => {
  const { address } = useAccount()
  const [nfts, setNfts] = useState<OmikujiNFT[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Get token balance with better error handling
  const { data: balance, error: balanceError } = useReadContract({
    address: OMIKUJI_CONTRACT_ADDRESS,
    abi: OMIKUJI_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      retry: 3,          // リトライ回数
      retryDelay: 1000,  // リトライ間隔（ミリ秒）
    }
  })

  // Get token IDs and metadata
  useEffect(() => {
    const fetchNFTs = async () => {
      if (!address || !balance) return
      if (balanceError) {
        setError(balanceError instanceof Error ? balanceError : new Error('Failed to fetch balance'))
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        const newNfts: OmikujiNFT[] = []

        for (let i = 0; i < Number(balance); i++) {
          try {
            // Get token ID with retry logic
            const tokenId = await readContract(config, {
              address: OMIKUJI_CONTRACT_ADDRESS,
              abi: OMIKUJI_ABI,
              functionName: 'tokenOfOwnerByIndex',
              args: [address, BigInt(i)],
            } as const) as bigint

            // Get token URI with retry logic
            const uri = await readContract(config, {
              address: OMIKUJI_CONTRACT_ADDRESS,
              abi: OMIKUJI_ABI,
              functionName: 'tokenURI',
              args: [tokenId],
            } as const) as string

            try {
              // Parse base64 encoded metadata with error handling
              const base64Data = uri.split(',')[1]
              if (!base64Data) {
                throw new Error('Invalid URI format')
              }
              const json = atob(base64Data)
              const metadata = JSON.parse(json)

              newNfts.push({
                tokenId: tokenId.toString(),
                metadata,
              })
            } catch (parseError) {
              console.error('Error parsing metadata for token', tokenId.toString(), parseError)
              // Continue with next token instead of failing completely
              continue
            }
          } catch (tokenError) {
            console.error('Error fetching token data for index', i, tokenError)
            // Continue with next token instead of failing completely
            continue
          }
        }

        setNfts(newNfts)
      } catch (error) {
        console.error('Error fetching NFTs:', error)
        setError(error instanceof Error ? error : new Error('Failed to fetch NFTs'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchNFTs()
  }, [address, balance, balanceError])

  return { nfts, isLoading, error }
}