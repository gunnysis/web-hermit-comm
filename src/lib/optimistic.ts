import type { QueryClient } from '@tanstack/react-query'

/**
 * 낙관적 업데이트 공통 헬퍼.
 * onMutate에서 이전 데이터를 저장하고, onError에서 롤백합니다.
 */
export function createOptimisticHandlers<TData>(
  queryClient: QueryClient,
  queryKey: unknown[],
  updater: (old: TData | undefined) => TData,
  settledKeys?: unknown[][],
) {
  return {
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })
      const prev = queryClient.getQueryData<TData>(queryKey)
      queryClient.setQueryData<TData>(queryKey, updater)
      return { prev }
    },
    onError: (_err: unknown, _vars: unknown, context: { prev?: TData } | undefined) => {
      if (context?.prev !== undefined) {
        queryClient.setQueryData(queryKey, context.prev)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
      if (settledKeys) {
        for (const key of settledKeys) {
          queryClient.invalidateQueries({ queryKey: key })
        }
      }
    },
  }
}
