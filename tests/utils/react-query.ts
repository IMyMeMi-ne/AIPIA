import type { useQuery } from '@tanstack/react-query';
import { vi } from 'vitest';

function makeUseQueryResult(state: {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  data?: unknown;
  error?: unknown;
  refetch?: () => void;
}): ReturnType<typeof useQuery> {
  const refetch = state.refetch ?? vi.fn();

  return {
    data: state.data,
    error: state.error,
    isError: state.isError,
    isLoading: state.isLoading,
    isSuccess: state.isSuccess,
    refetch,
  } as unknown as ReturnType<typeof useQuery>;
}

export function queryIdle() {
  return makeUseQueryResult({
    isError: false,
    isLoading: false,
    isSuccess: false,
  });
}

export function queryLoading() {
  return makeUseQueryResult({
    isError: false,
    isLoading: true,
    isSuccess: false,
  });
}

export function querySuccess<TData>(data: TData) {
  return makeUseQueryResult({
    data,
    isError: false,
    isLoading: false,
    isSuccess: true,
  });
}

export function queryError(error: unknown, refetch = vi.fn()) {
  return makeUseQueryResult({
    error,
    isError: true,
    isLoading: false,
    isSuccess: false,
    refetch,
  });
}
