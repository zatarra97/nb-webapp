import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { cognitoService, userPool } from '../../services/cognito';
import { LOCAL_STORAGE_KEYS, resolveRole, DEFAULT_ADMIN_ROUTE } from '../../constants';

interface LoginProps {
  setIsAuthenticated: (v: boolean) => void;
  setUserRole: (role: string) => void;
}

const Login: React.FC<LoginProps> = ({ setIsAuthenticated, setUserRole }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await cognitoService.signIn(email, password);

      const currentUser = userPool.getCurrentUser();
      currentUser?.getSession((err: any, session: any) => {
        if (err || !session?.isValid()) {
          toast.error('Errore durante il login. Riprova.');
          setLoading(false);
          return;
        }

        const idToken = session.getIdToken().getJwtToken();
        const accessToken = session.getAccessToken().getJwtToken();
        const payload = cognitoService.getTokenPayload(idToken);
        const groups: string[] = payload?.['cognito:groups'] ?? [];
        const role = resolveRole(groups);

        if (!role) {
          toast.error('Accesso non autorizzato.');
          cognitoService.signOut();
          setLoading(false);
          return;
        }

        localStorage.setItem(LOCAL_STORAGE_KEYS.ID_TOKEN, idToken);
        localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(LOCAL_STORAGE_KEYS.JWT_TOKEN, idToken);
        localStorage.setItem(LOCAL_STORAGE_KEYS.USER_ROLE, role);
        localStorage.setItem(LOCAL_STORAGE_KEYS.USER_EMAIL, email);

        setIsAuthenticated(true);
        setUserRole(role);

        const returnUrl = localStorage.getItem(LOCAL_STORAGE_KEYS.RETURN_URL);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.RETURN_URL);
        navigate(returnUrl || DEFAULT_ADMIN_ROUTE);
      });
    } catch (err: any) {
      if (err.name === 'NotAuthorizedException') {
        toast.error('Email o password non corretti.');
      } else if (err.name === 'UserNotFoundException') {
        toast.error('Nessun account con questa email.');
      } else {
        toast.error(err.message || 'Errore durante il login.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
          <h1 className="text-xl font-bold text-gray-900 text-center mb-1">NB Admin</h1>
          <p className="text-gray-500 text-center text-sm mb-8">Accedi per gestire i contenuti</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <><i className="fa-solid fa-spinner fa-spin text-xs"></i> Accesso in corso...</>
              ) : 'Accedi'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
