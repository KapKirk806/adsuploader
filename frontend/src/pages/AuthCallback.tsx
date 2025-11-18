import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spin, message } from 'antd';
import { useStore } from '../store/useStore';
import { api } from '../services/api';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setUser = useStore((state) => state.setUser);

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        message.error('Authentication failed');
        navigate('/login');
        return;
      }

      if (token) {
        // Save token
        localStorage.setItem('auth_token', token);

        try {
          // Fetch user info
          const user = await api.getCurrentUser();
          setUser(user);

          message.success('Successfully logged in!');
          navigate('/dashboard');
        } catch (err) {
          message.error('Failed to get user info');
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUser]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16, color: 'white', fontSize: 16 }}>
          Completing authentication...
        </p>
      </div>
    </div>
  );
}
