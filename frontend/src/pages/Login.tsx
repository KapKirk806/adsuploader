import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Form, Input, Button, message, Divider, Space } from 'antd';
import { UserOutlined, LockOutlined, FacebookOutlined } from '@ant-design/icons';
import { api } from '../services/api';
import { useStore } from '../store/useStore';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useStore((state) => state.setUser);

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);
      const response = await api.login(values.email, values.password);

      // Save token
      localStorage.setItem('auth_token', response.token);

      // Save user
      setUser(response.user);

      message.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const response = await api.getFacebookAuthUrl();
      window.location.href = response.authUrl;
    } catch (error) {
      message.error('Failed to initiate Facebook login');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <Card
        style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
        title={
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ margin: 0 }}>AdsUploader</h2>
            <p style={{ margin: '8px 0 0', color: '#666', fontSize: 14 }}>
              Sign in to your account
            </p>
          </div>
        }
      >
        <Button
          type="primary"
          icon={<FacebookOutlined />}
          size="large"
          block
          onClick={handleFacebookLogin}
          style={{ marginBottom: 24 }}
        >
          Continue with Facebook
        </Button>

        <Divider>Or sign in with email</Divider>

        <Form name="login" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <div style={{ textAlign: 'right', marginBottom: 16 }}>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Space split="|">
            <span>Don't have an account?</span>
            <Link to="/register">Sign up</Link>
          </Space>
        </div>
      </Card>
    </div>
  );
}
