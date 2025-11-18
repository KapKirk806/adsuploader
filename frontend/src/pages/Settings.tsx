import { useState, useEffect } from 'react';
import { Card, Form, Switch, Select, Button, message, Divider, Alert, Popconfirm } from 'antd';
import { SaveOutlined, DeleteOutlined, BellOutlined, GlobalOutlined } from '@ant-design/icons';
import { api } from '../services/api';

export default function Settings() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await api.getSettings();
      form.setFieldsValue(settings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSaveSettings = async (values: any) => {
    try {
      setLoading(true);
      await api.updateSettings(values);
      message.success('Settings saved successfully');
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      await api.deleteAccount();
      message.success('Account deleted successfully');
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to delete account');
      setDeleting(false);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Settings</h1>

      <Card title={<><BellOutlined /> Notifications</>} style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveSettings}
          initialValues={{
            emailNotifications: true,
            jobCompletionNotifications: true,
            teamInviteNotifications: true,
            errorNotifications: true,
          }}
        >
          <Form.Item
            name="emailNotifications"
            label="Email Notifications"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="jobCompletionNotifications"
            label="Job Completion Notifications"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="teamInviteNotifications"
            label="Team Invite Notifications"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="errorNotifications"
            label="Error Notifications"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Divider />

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              Save Settings
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title={<><GlobalOutlined /> Preferences</>} style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical" onFinish={handleSaveSettings}>
          <Form.Item
            name="timezone"
            label="Timezone"
            initialValue="UTC"
          >
            <Select>
              <Select.Option value="UTC">UTC</Select.Option>
              <Select.Option value="America/New_York">Eastern Time</Select.Option>
              <Select.Option value="America/Chicago">Central Time</Select.Option>
              <Select.Option value="America/Denver">Mountain Time</Select.Option>
              <Select.Option value="America/Los_Angeles">Pacific Time</Select.Option>
              <Select.Option value="Europe/London">London</Select.Option>
              <Select.Option value="Europe/Paris">Paris</Select.Option>
              <Select.Option value="Asia/Tokyo">Tokyo</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="defaultCurrency"
            label="Default Currency"
            initialValue="USD"
          >
            <Select>
              <Select.Option value="USD">USD ($)</Select.Option>
              <Select.Option value="EUR">EUR (€)</Select.Option>
              <Select.Option value="GBP">GBP (£)</Select.Option>
              <Select.Option value="JPY">JPY (¥)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="defaultAdAccountId"
            label="Default Ad Account"
          >
            <Select placeholder="Select default ad account" allowClear>
              <Select.Option value="1">Ad Account 1</Select.Option>
              <Select.Option value="2">Ad Account 2</Select.Option>
            </Select>
          </Form.Item>

          <Divider />

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              Save Preferences
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Danger Zone">
        <Alert
          message="Delete Account"
          description="Once you delete your account, there is no going back. This will permanently delete all your data, including campaigns, jobs, and team members."
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Popconfirm
          title="Delete your account?"
          description="This action cannot be undone. All your data will be permanently deleted."
          onConfirm={handleDeleteAccount}
          okText="Yes, delete my account"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <Button danger icon={<DeleteOutlined />} loading={deleting}>
            Delete Account
          </Button>
        </Popconfirm>
      </Card>
    </div>
  );
}
