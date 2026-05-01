import api from './api';

export const getBill = async (flatId) => {
  const response = await api.get(`/billing/${flatId}`);
  return response.data;
};

export const getBillingHistory = async (flatId) => {
  const response = await api.get(`/billing/history/${flatId}`);
  return response.data;
};
