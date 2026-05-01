import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FlatSelect from '../components/FlatSelect';
import { submitReading } from '../services/readingService';
import { getSelectedFlatId } from '../utils/localStorage';

function ReadingPage() {
  const navigate = useNavigate();
  const [flatId, setFlatId] = useState(getSelectedFlatId() || '');
  const [units, setUnits] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const current = getSelectedFlatId();
    if (current) {
      setFlatId(current);
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await submitReading(flatId, units);
      setSuccess('Reading submitted successfully!');
      setUnits('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit reading');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <FlatSelect currentFlatId={flatId} onChange={(newId) => setFlatId(newId)} />

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Submit Meter Reading</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Units</label>
              <input
                type="number"
                step="0.01"
                value={units}
                onChange={(event) => setUnits(event.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <button
              type="submit"
              disabled={loading || !flatId}
              className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Submitting...' : 'Submit Reading'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ReadingPage;
