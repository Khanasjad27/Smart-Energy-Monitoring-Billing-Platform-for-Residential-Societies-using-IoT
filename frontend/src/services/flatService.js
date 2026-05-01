import api from './api';

export const getFlats = async () => {
  const response = await api.get('/flat');
  return response.data;
};
