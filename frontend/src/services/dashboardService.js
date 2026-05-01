import api from './api';

export const getDashboardData = async (flatId) => {
  const response = await api.get(`/dashboard/${flatId}`);
  return response.data;
};

export const getMonthlyUsage = async (flatId) => {
  const response = await api.get(`/dashboard/monthly/${flatId}`);
  return response.data;
};
