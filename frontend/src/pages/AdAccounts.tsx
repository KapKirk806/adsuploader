import { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Typography, Tag, message, Popconfirm } from 'antd';
import { SyncOutlined, DeleteOutlined, FacebookOutlined } from '@ant-design/icons';
import { api } from '../services/api';
import type { AdAccount } from '../types';

const { Title } = Typography;

export default function AdAccounts() {
  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await api.getAdAccounts();
      setAccounts(data);
    } catch (error) {
      message.error('Failed to load ad accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const data = await api.syncAdAccountsFromMeta();
      setAccounts(data);
      message.success(`Synced ${data.length} ad accounts from Meta`);
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to sync ad accounts');
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteAdAccount(id);
      message.success('Ad account removed');
      loadAccounts();
    } catch (error) {
      message.error('Failed to remove ad account');
    }
  };

  const columns = [
    {
      title: 'Account Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Space>
          <FacebookOutlined style={{ color: '#1877F2' }} />
          <span>{name}</span>
        </Space>
      ),
    },
    {
      title: 'Account ID',
      dataIndex: 'facebook_ad_account_id',
      key: 'facebook_ad_account_id',
      render: (id: string) => <code>{id}</code>,
    },
    {
      title: 'Currency',
      dataIndex: 'currency',
      key: 'currency',
    },
    {
      title: 'Timezone',
      dataIndex: 'timezone',
      key: 'timezone',
    },
    {
      title: 'Status',
      dataIndex: 'account_status',
      key: 'account_status',
      render: (status: string) => {
        const color = status === 'ACTIVE' ? 'green' : 'default';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: AdAccount) => (
        <Popconfirm
          title="Remove this ad account?"
          description="This will not delete the account from Meta, only remove it from this app."
          onConfirm={() => handleDelete(record.id)}
          okText="Remove"
          cancelText="Cancel"
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
          >
            Remove
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>Ad Accounts</Title>
        <Button
          type="primary"
          icon={<SyncOutlined spin={syncing} />}
          onClick={handleSync}
          loading={syncing}
        >
          Sync from Meta
        </Button>
      </div>

      <Card>
        {accounts.length === 0 && !loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <FacebookOutlined style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 16 }} />
            <p style={{ fontSize: 16, color: '#666' }}>
              No ad accounts found
            </p>
            <p style={{ color: '#999', marginBottom: 24 }}>
              Click "Sync from Meta" to import your Facebook ad accounts
            </p>
            <Button
              type="primary"
              icon={<SyncOutlined />}
              onClick={handleSync}
              loading={syncing}
            >
              Sync from Meta
            </Button>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={accounts}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>
    </div>
  );
}
