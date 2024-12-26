// src/components/omikuji/ConnectButton.tsx
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { Button } from '../ui/button'
import { injected } from 'wagmi/connectors'
import { env, isDevelopment } from '../../config/environment'

export const ConnectButton = () => {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const handleConnect = () => {
    connect({ connector: injected() })
  }

  // 現在のネットワーク名を取得
  const getCurrentNetworkName = () => {
    if (!chainId) return 'Not Connected'
    switch (chainId) {
      case 80002:
        return 'Amoy Testnet'
      case 137:
        return 'Polygon Mainnet'
      default:
        return `Unknown Network (${chainId})`
    }
  }

  // 必要なネットワーク名
  const targetNetwork = isDevelopment() ? 'Amoy Testnet' : 'Polygon Mainnet'

  // 間違ったネットワークに接続している場合
  if (isConnected && chainId !== env.chain.id) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <div className="text-sm text-yellow-400 text-center p-2 bg-yellow-400/10 rounded-md">
          現在の接続先: {getCurrentNetworkName()}
        </div>
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => switchChain({ chainId: env.chain.id })}
        >
          {targetNetwork}に切り替える
        </Button>
      </div>
    )
  }

  if (isConnected) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <Button
          variant="outline"
          className="w-full bg-white/10 hover:bg-white/20 text-white/80"
          onClick={() => disconnect()}
        >
          {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
        </Button>
        <div className="text-sm text-emerald-400 text-center p-2 bg-emerald-400/10 rounded-md">
          接続中のネットワーク: {getCurrentNetworkName()}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <Button
        className="w-full bg-white/10 hover:bg-white/20 text-white/80"
        onClick={handleConnect}
      >
        ウォレットを接続
      </Button>
      <div className="text-sm text-white/60 text-center">
        {targetNetwork}に接続します
      </div>
    </div>
  )
}