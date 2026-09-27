import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from './axiosClient';

export function useProducts(params = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const { data } = await axiosClient.get('/products', { params });
      return data.data;
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/products/categories');
      return data.data;
    },
  });
}

export function usePaymentMethods(params = {}) {
  return useQuery({
    queryKey: ['payment-methods', params],
    queryFn: async () => {
      const { data } = await axiosClient.get('/payment-methods', { params });
      return data.data;
    },
  });
}

export function useCheckoutOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderPayload) => {
      const { data } = await axiosClient.post('/orders/checkout', orderPayload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useMyOrders() {
  return useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/orders/my-orders');
      return data.data;
    },
  });
}
