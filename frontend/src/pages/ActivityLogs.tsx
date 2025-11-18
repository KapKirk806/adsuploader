import { useState, useEffect } from 'react';
import { Card, Table, Tag, Input, Select, DatePicker, Space, Button } from 'antd';
import { SearchOutlined, ReloadOutlined, HistoryOutlined } from '@ant-design/icons';
import { api } from '../services/api';
import type { ActivityLog } from '../types';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export default function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState({
    search: '',
    action: undefined as string | undefined,
    dateRange: null as [dayjs.Dayjs, dayjs.Dayjs] | null,
  });

  useEffect(() => {
    loadLogs();
  }, [pagination.current, filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await api.getActivityLogs({
        page: pagination.current,
        limit: pagination.pageSize,
        search: filters.search,
        action: filters.action,
        startDate: filters.dateRange?.[0]?.toISOString(),
        endDate: filters.dateRange?.[1]?.toISOString(),
      });
      setLogs(response.logs);
      setPagination(prev => ({ ...prev, total: response.total }));
    } catch (error) {
      console.error('Failed to load activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      create: 'green',
      update: 'blue',
      delete: 'red',
      login: 'cyan',
      logout: 'default',
      upload: 'purple',
      publish: 'orange',
    };
    return colors[action.toLowerCase()] || 'default';
  };

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date: string) => dayjs(date).format('MMM D, YYYY HH:mm:ss'),
      sorter: true,
    },
    {
      title: 'User',
      dataIndex: 'user_name',
      key: 'user_name',
      render: (name: string, record: ActivityLog) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.user_email}</div>
        </div>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => (
        <Tag color={getActionColor(action)}>{action.toUpperCase()}</Tag>
      ),
      filters: [
        { text: 'Create', value: 'create' },
        { text: 'Update', value: 'update' },
        { text: 'Delete', value: 'delete' },
        { text: 'Login', value: 'login' },
        { text: 'Logout', value: 'logout' },
        { text: 'Upload', value: 'upload' },
        { text: 'Publish', value: 'publish' },
      ],
    },
    {
      title: 'Resource',
      dataIndex: 'resource_type',
      key: 'resource_type',
      render: (type: string, record: ActivityLog) => (
        <div>
          <div>{type}</div>
          {record.resource_id && (
            <div style={{ fontSize: 12, color: '#999' }}>ID: {record.resource_id}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'IP Address',
      dataIndex: 'ip_address',
      key: 'ip_address',
      width: 140,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>
          <HistoryOutlined /> Activity Logs
        </h1>
        <Button icon={<ReloadOutlined />} onClick={loadLogs}>
          Refresh
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="Search logs..."
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder="Filter by action"
            value={filters.action}
            onChange={(value) => setFilters({ ...filters, action: value })}
            style={{ width: 150 }}
            allowClear
          >
            <Select.Option value="create">Create</Select.Option>
            <Select.Option value="update">Update</Select.Option>
            <Select.Option value="delete">Delete</Select.Option>
            <Select.Option value="login">Login</Select.Option>
            <Select.Option value="logout">Logout</Select.Option>
            <Select.Option value="upload">Upload</Select.Option>
            <Select.Option value="publish">Publish</Select.Option>
          </Select>
          <RangePicker
            value={filters.dateRange}
            onChange={(dates) => setFilters({ ...filters, dateRange: dates as [dayjs.Dayjs, dayjs.Dayjs] | null })}
          />
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => setPagination({ ...pagination, current: page, pageSize: pageSize || 20 }),
          }}
        />
      </Card>
    </div>
  );
}
