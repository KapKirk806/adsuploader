import { useState } from 'react';
import { Card, Form, Input, Button, message, Typography } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const { Title, Text } = Typography;

export default function ForgotPassword() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (values: { email: string }) => {
    try {
      setLoading(true);
      await api.requestPasswordReset(values.email);
      setSent(true);
      message.success('Password reset instructions sent to your email');
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0f2f5',
      padding: '20px'
    }}>
      <Card style={{ width: '100%', maxWidth: 450 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2}>Forgot Password?</Title>
          <Text type="secondary">
            Enter your email address and we'll send you instructions to reset your password.
          </Text>
        </div>

        {!sent ? (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Enter your email"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
              >
                Send Reset Link
              </Button>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
              <Link to="/login">
                <ArrowLeftOutlined /> Back to Login
              </Link>
            </Form.Item>
          </Form>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
            <Title level={4}>Check Your Email</Title>
            <Text>
              We've sent password reset instructions to <strong>{form.getFieldValue('email')}</strong>.
              Please check your inbox and follow the link to reset your password.
            </Text>
            <div style={{ marginTop: 24 }}>
              <Link to="/login">
                <Button type="primary" size="large">
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
