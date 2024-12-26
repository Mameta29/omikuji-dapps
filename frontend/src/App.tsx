// src/App.tsx
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './config/wagmi'
import { OmikujiCard } from './components/omikuji/OmikujiCard'

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 via-rose-400 to-lime-400 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px]" />
          <OmikujiCard />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App