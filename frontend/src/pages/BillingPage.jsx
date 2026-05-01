import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FlatSelect from '../components/FlatSelect';
import { getBill, getBillingHistory } from '../services/billingService';
import { getSelectedFlatId } from '../utils/localStorage';

function BillingPage() {
  const navigate = useNavigate();
  const { flatId: routeFlatId } = useParams();
  const [billData, setBillData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedFlatId = routeFlatId || getSelectedFlatId();

  useEffect(() => {
    if (!routeFlatId && selectedFlatId) {
      navigate(`/billing/${selectedFlatId}`, { replace: true });
      return;
    }

    if (!selectedFlatId) {
      setBillData(null);
      setHistory([]);
      setError('Please select a flat to view billing details.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        const [bill, historyData] = await Promise.all([
          getBill(selectedFlatId),
          getBillingHistory(selectedFlatId),
        ]);
        setBillData(bill);
        setHistory(historyData);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load billing data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [routeFlatId, selectedFlatId, navigate]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <FlatSelect currentFlatId={selectedFlatId} onChange={(newId) => navigate(`/billing/${newId}`)} />

        {loading ? (
          <div className="flex items-center justify-center h-72 rounded-3xl bg-white shadow-md">
            <p className="text-slate-600">Loading billing data...</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl bg-white p-8 shadow-md">
            <p className="text-red-600">{error}</p>
          </div>
        ) : billData ? (
          <>
            <h2 className="text-2xl font-semibold text-slate-900">Billing overview</h2>
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Current Bill</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Units Consumed</p>
                  <p className="text-2xl font-bold text-slate-900">{billData.unitsConsumed}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Rate per Unit</p>
                  <p className="text-2xl font-bold text-slate-900">₹{billData.rate}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Amount</p>
                  <p className="text-2xl font-bold text-primary">₹{billData.totalAmount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Billing History</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Units</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item, index) => (
                      <tr key={item.id || index} className={index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                        <td className="py-3 px-4 text-slate-900">{item.date}</td>
                        <td className="py-3 px-4 text-slate-900">{item.units}</td>
                        <td className="py-3 px-4 text-slate-900">₹{item.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default BillingPage;
