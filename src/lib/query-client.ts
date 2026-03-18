import { QueryClient, QueryCache, MutationCache, defaultShouldDehydrateQuery, isServer } from '@tanstack/react-query'
import { toast } from 'sonner'

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.meta?.silent) return
        toast.error(error.message || '데이터를 불러올 수 없어요')
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (mutation.meta?.silent) return
        toast.error(error.message || '요청에 실패했어요')
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        // SSR에서 에러를 throw 대신 상태로 처리
        throwOnError: false,
        retry: (failureCount: number, error: unknown) => {
          // 4xx 에러는 재시도 안함
          if (error instanceof Error && /\b4\d{2}\b/.test(error.message)) return false
          return failureCount < 2
        },
      },
      dehydrate: {
        // 에러 상태 쿼리도 hydrate에 포함
        shouldDehydrateQuery: (query: Parameters<typeof defaultShouldDehydrateQuery>[0]) =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

export { makeQueryClient }

export function getQueryClient() {
  if (isServer) return makeQueryClient()
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}
