import { useState } from 'react'
import { Button } from '../ui/button'
import { useAccount } from 'wagmi'

interface DrawButtonProps {
  onClick: () => Promise<void>
  disabled?: boolean
}

export const DrawButton = ({ onClick, disabled }: DrawButtonProps) => {
  const { isConnected } = useAccount()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (!isConnected || disabled) return
    
    setIsLoading(true)
    try {
      await onClick()
    } catch (error) {
      console.error('Error drawing omikuji:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getButtonText = () => {
    if (!isConnected) return 'ウォレットを接続してください'
    if (isLoading) return 'おみくじを引いています...'
    if (disabled) return 'JPYCの承認が必要です'
    return 'おみくじを引く (100 JPYC)'
  }

  return (
    <Button
      onClick={handleClick}
      disabled={!isConnected || disabled || isLoading}
      className="w-full bg-gradient-to-r from-rose-400 to-orange-400 hover:from-rose-500 hover:to-orange-500 text-white font-bold disabled:opacity-50 transition-all duration-200"
    >
      {getButtonText()}
    </Button>
  )
}