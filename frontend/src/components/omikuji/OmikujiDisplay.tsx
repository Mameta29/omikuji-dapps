// src/components/omikuji/OmikujiDisplay.tsx
import { useOmikujiNFT } from '../../hooks/omikuji/useOmikujiNFT'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Skeleton } from '../ui/skeleton'
import { env } from '../../config/environment'
import { OMIKUJI_CONTRACT_ADDRESS } from '../../constants/contracts'

export const OmikujiDisplay = () => {
  const { nfts, isLoading } = useOmikujiNFT()

  if (isLoading) {
    return <Skeleton className="w-full h-48" />
  }

  if (nfts.length === 0) {
    return (
      <div className="text-center text-white/60 py-4">
        まだおみくじを引いていません
      </div>
    )
  }

  const getOpenseaUrl = (tokenId: string) => {
    const networkSubdomain = env.chain.id === 137 ? '' : 'testnet.'
    return `https://${networkSubdomain}opensea.io/assets/${env.chain.id}/${OMIKUJI_CONTRACT_ADDRESS}/${tokenId}`
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white/90">
        あなたのおみくじ ({nfts.length}枚)
      </h3>
      <div className="grid grid-cols-1 gap-4">
        {nfts.map((nft) => (
          <Card key={nft.tokenId} className="bg-white/20 backdrop-blur-sm border-white/30">
            <CardHeader>
              <CardTitle className="text-white/90">
                {nft.metadata.name}
              </CardTitle>
              <CardDescription className="text-white/60">
                {nft.metadata.attributes[0].value}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <img 
                src={nft.metadata.image} 
                alt={nft.metadata.name}
                className="w-full rounded-lg"
              />
            </CardContent>
            <CardFooter>
              <a
                href={getOpenseaUrl(nft.tokenId)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                OpenSeaで表示 ↗
              </a>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}