// src/components/omikuji/JPYCApproval.tsx
import { Button } from '../ui/button'
import { useJPYCApproval } from '../../hooks/omikuji/useJPYCApproval'

export const JPYCApproval = () => {
  const { isLoading, error, approve } = useJPYCApproval()

  if (error) {
    return (
      <div className="text-sm text-red-400 text-center p-2 bg-red-400/10 rounded-md">
        承認中にエラーが発生しました: {error.message}
      </div>
    )
  }

  return (
    <Button
      onClick={approve}
      disabled={isLoading}
      variant="secondary"
      className="w-full"
    >
      {isLoading ? 'JPYCを承認中...（ウォレットを確認してください）' : 'JPYCを承認する'}
    </Button>
  )
}