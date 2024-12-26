import React, { useState, useEffect } from 'react';
import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';
import { parseEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// コントラクトのABIとアドレス（デプロイ後に更新）
const OMIKUJI_CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS';
const JPYC_CONTRACT_ADDRESS = 'YOUR_JPYC_ADDRESS';

export default function OmikujiApp() {
  const { address, isConnected } = useAccount();
  const [latestTokenId, setLatestTokenId] = useState<number | null>(null);
  const [isApproved, setIsApproved] = useState(false);

  // JPYCのapprove
  const { data: approveData, write: approveJPYC } = useContractWrite({
    address: JPYC_CONTRACT_ADDRESS,
    abi: [
      {
        name: 'approve',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'spender', type: 'address' },
          { name: 'amount', type: 'uint256' }
        ],
        outputs: [{ name: '', type: 'bool' }]
      }
    ],
    functionName: 'approve',
  });

  // おみくじを引く
  const { data: drawData, write: drawOmikuji } = useContractWrite({
    address: OMIKUJI_CONTRACT_ADDRESS,
    abi: [
      {
        name: 'drawOmikuji',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }]
      }
    ],
    functionName: 'drawOmikuji',
  });

  // トランザクション待機
  const { isLoading: isDrawLoading, isSuccess: isDrawSuccess } = useWaitForTransaction({
    hash: drawData?.hash,
  });

  // おみくじ結果の取得
  const { data: omikujiResult } = useContractRead({
    address: OMIKUJI_CONTRACT_ADDRESS,
    abi: [
      {
        name: 'omikujiResults',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        outputs: [
          { name: 'fortune', type: 'string' },
          { name: 'imageURI', type: 'string' }
        ]
      }
    ],
    functionName: 'omikujiResults',
    args: [latestTokenId],
    enabled: latestTokenId !== null,
  });

  // JPYCのapprove状態確認
  const { data: allowance } = useContractRead({
    address: JPYC_CONTRACT_ADDRESS,
    abi: [
      {
        name: 'allowance',
        type: 'function',
        stateMutability: 'view',
        inputs: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' }
        ],
        outputs: [{ name: '', type: 'uint256' }]
      }
    ],
    functionName: 'allowance',
    args: [address, OMIKUJI_CONTRACT_ADDRESS],
    enabled: isConnected,
  });

  useEffect(() => {
    if (allowance && allowance >= parseEther('100')) {
      setIsApproved(true);
    }
  }, [allowance]);

  const handleApprove = async () => {
    try {
      await approveJPYC({
        args: [OMIKUJI_CONTRACT_ADDRESS, parseEther('100')],
      });
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  const handleDrawOmikuji = async () => {
    try {
      await drawOmikuji();
    } catch (error) {
      console.error('Drawing omikuji failed:', error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-pink-100 to-purple-100">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>デジタルおみくじ</CardTitle>
          <CardDescription>100 JPYCでおみくじが引けます</CardDescription>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <p className="text-center text-gray-600">ウォレットを接続してください</p>
          ) : !isApproved ? (
            <Button 
              className="w-full"
              onClick={handleApprove}
              disabled={!isConnected}
            >
              JPYCを承認する
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={handleDrawOmikuji}
              disabled={isDrawLoading || !isApproved}
            >
              {isDrawLoading ? '処理中...' : 'おみくじを引く'}
            </Button>
          )}
          
          {omikujiResult && (
            <div className="mt-4 text-center">
              <h3 className="text-2xl font-bold mb-2">{omikujiResult[0]}</h3>
              <img 
                src={omikujiResult[1]}
                alt={omikujiResult[0]}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="text-sm text-gray-500 text-center">
          結果はNFTとして保存されます
        </CardFooter>
      </Card>
    </div>
  );
}