import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import UsageChart from '../components/UsageChart';
import FlatSelect from '../components/FlatSelect';
import { getDashboardData, getMonthlyUsage } from '../services/dashboardService';
import { getSelectedFlatId } from '../utils/localStorage';

function DashboardPage() {
  const navigate = useNavigate();
  const { flatId: routeFlatId } = useParams();
  const [dashboardData, setDashboardData] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedFlatId = routeFlatId || getSelectedFlatId();

  useEffect(() => {
    if (!routeFlatId && selectedFlatId) {
      navigate(`/dashboard/${selectedFlatId}`, { replace: true });
      return;
    }

    if (!selectedFlatId) {
      setDashboardData(null);
      setMonthlyData([]);
      setError('Please select a flat to view dashboard details.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        const [dashboard, monthly] = await Promise.all([
          getDashboardData(selectedFlatId),
          getMonthlyUsage(selectedFlatId),
        ]);
        setDashboardData(dashboard);
        setMonthlyData(monthly);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
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
        <FlatSelect currentFlatId={selectedFlatId} onChange={(newId) => navigate(`/dashboard/${newId}`)} />

        {loading ? (
          <div className="flex items-center justify-center h-72 rounded-3xl bg-white shadow-md">
            <p className="text-slate-600">Loading dashboard data...</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl bg-white p-8 shadow-md">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          dashboardData && (
            <>
              <h2 className="text-2xl font-semibold text-slate-900">Flat {dashboardData.flatNumber} Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Total Units</h3>
                  <p className="text-3xl font-bold text-primary">{dashboardData.totalUnits}</p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Total Amount</h3>
                  <p className="text-3xl font-bold text-primary">₹{dashboardData.totalAmount}</p>
                </div>
              </div>
              <UsageChart data={monthlyData} />
            </>
          )
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
