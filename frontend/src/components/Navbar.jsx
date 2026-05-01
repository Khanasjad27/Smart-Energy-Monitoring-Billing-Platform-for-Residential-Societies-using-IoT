import { NavLink, useNavigate } from 'react-router-dom';
import { removeToken } from '../utils/auth';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition ${isActive ? 'text-primary' : 'text-slate-600 hover:text-primary'}`;

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Smart Energy IoT</h1>
            <p className="text-sm text-slate-500">Simple billing and usage tracking</p>
          </div>
          <div className="flex items-center gap-6">
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/billing" className={linkClass}>
              Billing
            </NavLink>
            <NavLink to="/reading" className={linkClass}>
              Reading
            </NavLink>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-primary hover:text-primary"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
