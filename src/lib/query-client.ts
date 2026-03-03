import { QueryClient, defaultShouldDehydrateQuery, isServer } from '@tanstack/react-query'

function makeQueryClientOptions() {
  return {
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
  }
}

let browserQueryClient: QueryClient | undefined

export function makeQueryClient() {
  return new QueryClient(makeQueryClientOptions())
}

export function getQueryClient() {
  if (isServer) return makeQueryClient()
  if (!browserQueryClient) browserQueryClient = new QueryClient(makeQueryClientOptions())
  return browserQueryClient
}
