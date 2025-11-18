import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Form, Input, Button, message, Divider, Space } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, FacebookOutlined } from '@ant-design/icons';
import { api } from '../services/api';
import { useStore } from '../store/useStore';

export default function Register() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useStore((state) => state.setUser);

  const onFinish = async (values: { name: string; email: string; password: string }) => {
    try {
      setLoading(true);
      const response = await api.register(values.name, values.email, values.password);

      // Save token
      localStorage.setItem('auth_token', response.token);

      // Save user
      setUser(response.user);

      message.success('Registration successful!');
      navigate('/dashboard');
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Registration failed');
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
              Create your account
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

        <Divider>Or register with email</Divider>

        <Form name="register" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please input your name!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Full Name"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 8, message: 'Password must be at least 8 characters!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
            >
              Sign Up
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Space split="|">
            <span>Already have an account?</span>
            <Link to="/login">Sign in</Link>
          </Space>
        </div>
      </Card>
    </div>
  );
}
