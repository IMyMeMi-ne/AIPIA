import type { useInfiniteQuery, useQuery } from '@tanstack/react-query';
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

function makeUseInfiniteQueryResult(state: {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  data?: unknown;
  error?: unknown;
  refetch?: () => void;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}): ReturnType<typeof useInfiniteQuery> {
  const refetch = state.refetch ?? vi.fn();
  const fetchNextPage = state.fetchNextPage ?? vi.fn();

  return {
    data: state.data,
    error: state.error,
    fetchNextPage,
    hasNextPage: state.hasNextPage ?? false,
    isError: state.isError,
    isFetchingNextPage: state.isFetchingNextPage ?? false,
    isLoading: state.isLoading,
    isSuccess: state.isSuccess,
    refetch,
  } as unknown as ReturnType<typeof useInfiniteQuery>;
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

export function infiniteQueryLoading() {
  return makeUseInfiniteQueryResult({
    isError: false,
    isLoading: true,
    isSuccess: false,
  });
}

export function infiniteQuerySuccess<TPage>(
  pages: TPage[],
  options: {
    fetchNextPage?: () => void;
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
  } = {},
) {
  return makeUseInfiniteQueryResult({
    data: {
      pageParams: pages.map((_, index) => index),
      pages,
    },
    fetchNextPage: options.fetchNextPage,
    hasNextPage: options.hasNextPage,
    isError: false,
    isFetchingNextPage: options.isFetchingNextPage,
    isLoading: false,
    isSuccess: true,
  });
}

export function infiniteQueryError(error: unknown, refetch = vi.fn()) {
  return makeUseInfiniteQueryResult({
    error,
    isError: true,
    isLoading: false,
    isSuccess: false,
    refetch,
  });
}
