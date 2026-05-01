import { useEffect, useState } from 'react';
import { getFlats } from '../services/flatService';
import { getSelectedFlatId, setSelectedFlatId } from '../utils/localStorage';
import { getToken } from '../utils/auth';
import { getUserIdFromToken, getUserRoleFromToken } from '../utils/jwt';

export default function useFlats() {
  const [flats, setFlats] = useState([]);
  const [selectedFlatId, setSelectedFlatIdState] = useState(getSelectedFlatId());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getFlats();
        const token = getToken();
        const role = getUserRoleFromToken(token);
        const userId = getUserIdFromToken(token);

        if (role === 'USER') {
          const ownedFlats = data.filter((flat) => Number(flat.ownerId) === Number(userId));
          setFlats(ownedFlats);
          if (selectedFlatId && !ownedFlats.some((flat) => String(flat.id) === String(selectedFlatId))) {
            setSelectedFlatId(null);
            setSelectedFlatIdState(null);
          }
        } else {
          setFlats(data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load flats');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  const selectFlat = (flatId) => {
    setSelectedFlatId(flatId);
    setSelectedFlatIdState(flatId);
  };

  return { flats, selectedFlatId, selectFlat, loading, error };
}
