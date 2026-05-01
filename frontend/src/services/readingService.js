import api from './api';

export const submitReading = async (flatId, units) => {
  const response = await api.post('/reading', { flatId: parseInt(flatId), units: parseFloat(units) });
  return response.data;
};
