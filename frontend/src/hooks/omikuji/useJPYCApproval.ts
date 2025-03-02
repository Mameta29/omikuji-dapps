// src/hooks/omikuji/useJPYCApproval.ts
import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, usePublicClient } from 'wagmi'
import { ApprovalStatus } from '../../components/omikuji/types'
import { JPYC_ABI, JPYC_CONTRACT_ADDRESS, OMIKUJI_CONTRACT_ADDRESS } from '../../constants/contracts'

export const useJPYCApproval = () => {
  const { address } = useAccount()
  const publicClient = usePublicClient() 
  const [status, setStatus] = useState<ApprovalStatus>({
    isApproved: false,
    isLoading: false,
    error: null,
  })

  const { data: allowance } = useReadContract({
    address: JPYC_CONTRACT_ADDRESS,
    abi: JPYC_ABI,
    functionName: 'allowance',
    args: address ? [address, OMIKUJI_CONTRACT_ADDRESS] : undefined,
    query: {
        enabled: !!address,  // enabled を query オブジェクトの中に移動
    },
  })

  const { writeContractAsync } = useWriteContract()

  useEffect(() => {
    if (allowance !== undefined) {
      // 100 JPYC (6デシマル)
      const requiredAllowance = BigInt(100) * BigInt(10 ** 6)
      setStatus(prev => ({
        ...prev,
        isApproved: allowance >= requiredAllowance,
        isLoading: false,
      }))
    }
  }, [allowance])

  const approve = async () => {
    if (!address || !publicClient) return
    
    let tx: `0x${string}` | undefined
  
    try {
      setStatus(prev => ({ ...prev, isLoading: true }))
  
      // JPYCは6デシマル
      const JPYC_DECIMALS = 6
      // 承認額を10JPYCに設定
      const approvalAmount = BigInt(10) * BigInt(10 ** JPYC_DECIMALS)
  
      // デバッグ用のログ
      console.log('Approval params:', {
        address: JPYC_CONTRACT_ADDRESS,
        spender: OMIKUJI_CONTRACT_ADDRESS,
        amount: approvalAmount.toString(),
        decimals: JPYC_DECIMALS
      })
  
      tx = await writeContractAsync({
        address: JPYC_CONTRACT_ADDRESS,
        abi: JPYC_ABI,
        functionName: 'approve',
        args: [OMIKUJI_CONTRACT_ADDRESS, approvalAmount],
      })
      
      if (tx) {
        try {
          const receipt = await publicClient.waitForTransactionReceipt({ 
            hash: tx,
            confirmations: 0,
            timeout: 30000,
            pollingInterval: 1000,
          })
          
          if (receipt.status === 'success') {
            setStatus(prev => ({ ...prev, isApproved: true }))
            return
          }
        } catch (waitError) {
          console.error('Transaction wait error:', waitError)
          try {
            const txReceipt = await publicClient.getTransactionReceipt({
              hash: tx
            })
            
            if (txReceipt.status === 'success') {
              setStatus(prev => ({ ...prev, isApproved: true }))
              return
            }
          } catch (receiptError) {
            console.error('Error checking receipt:', receiptError)
          }
        }
      }
    } catch (error) {
      console.error('Approval error:', error)
      setStatus(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error : new Error('Unknown error occurred') 
      }))
    } finally {
      setStatus(prev => ({ ...prev, isLoading: false }))
    }
  }

  return { ...status, approve }
}