// src/components/omikuji/OmikujiCard.tsx
import { useAccount, useWriteContract } from 'wagmi'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card'
import { DrawButton } from './DrawButton'
import { ConnectButton } from './ConnectButton'
import { OMIKUJI_ABI, OMIKUJI_CONTRACT_ADDRESS } from '../../constants/contracts'
import omikujiIllustration from '../../assets/omikuji-illustration.png'

export const OmikujiCard = () => {
  const { address } = useAccount()
  const { writeContractAsync } = useWriteContract()

  const handleDrawOmikuji = async () => {
    if (!address) return
    
    try {
      await writeContractAsync({
        address: OMIKUJI_CONTRACT_ADDRESS,
        abi: OMIKUJI_ABI,
        functionName: 'drawOmikuji',
      })
    } catch (error) {
      console.error('Failed to draw omikuji:', error)
    }
  }

  return (
    <Card className="w-96 bg-white/20 backdrop-blur-xl border-white/30 shadow-xl relative z-10">
      <CardHeader>
        <CardTitle className="text-3xl text-center font-bold bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
          新年のおみくじ
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-white/80 mb-6 font-medium">
          100 JPYC でおみくじが引けます
        </p>
        <img 
          src={omikujiIllustration}
          alt="おみくじイラスト" 
          className="mx-auto mb-6 w-32 h-32 opacity-90"
        />
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <ConnectButton />
        <DrawButton onClick={handleDrawOmikuji} />
      </CardFooter>
    </Card>
  )
}