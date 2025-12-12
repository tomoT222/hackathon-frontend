import useSWR from 'swr';
import { fetcher } from '../../../lib/fetcher';
import { API_URL } from '../../../config';
import type { Item } from '../types';

const API_HOST = API_URL;

export const useItems = () => {
  const { data, error, isLoading } = useSWR<Item[]>(`${API_HOST}/items`, fetcher);

  return {
    items: data,
    isLoading,
    error,
  };
};

export const useItem = (id: string | undefined) => {
  const { data, error, isLoading } = useSWR<Item>(id ? `${API_HOST}/items/${id}` : null, fetcher);

  return {
    item: data,
    isLoading,
    error,
  };
};
