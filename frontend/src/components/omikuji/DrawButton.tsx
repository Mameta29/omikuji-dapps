// src/components/omikuji/DrawButton.tsx
import { useState } from 'react'
import { Button } from '../ui/button'
import { useAccount } from 'wagmi'

interface DrawButtonProps {
  onClick: () => Promise<void>
}

export const DrawButton = ({ onClick }: DrawButtonProps) => {
  const { isConnected } = useAccount()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (!isConnected) return
    
    setIsLoading(true)
    try {
      await onClick()
    } catch (error) {
      console.error('Error drawing omikuji:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={!isConnected || isLoading}
      className="w-full bg-gradient-to-r from-rose-400 to-orange-400 hover:from-rose-500 hover:to-orange-500 text-white font-bold"
    >
      {isLoading ? 'おみくじを引いています...' : 'おみくじを引く (100 JPYC)'}
    </Button>
  )
}