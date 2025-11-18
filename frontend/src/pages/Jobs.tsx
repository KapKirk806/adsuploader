import { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Progress,
  Button,
  Space,
  Popconfirm,
  message,
  Select,
  Input,
  Tooltip,
} from 'antd';
import {
  EyeOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { api } from '../services/api';
import type { UploadJob } from '../types';

export default function Jobs() {
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    loadJobs();
  }, [statusFilter]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await api.getJobs(1, 100, statusFilter);
      setJobs(data);
    } catch (error) {
      console.error('Error loading jobs:', error);
      message.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await api.cancelJob(id);
      message.success('Job cancelled successfully');
      loadJobs();
    } catch (error) {
      console.error('Error cancelling job:', error);
      message.error('Failed to cancel job');
    }
  };

  const handleBulkCancel = async () => {
    try {
      await Promise.all(
        selectedRowKeys.map((id) => api.cancelJob(id as number))
      );
      message.success(`${selectedRowKeys.length} jobs cancelled successfully`);
      setSelectedRowKeys([]);
      loadJobs();
    } catch (error) {
      message.error('Failed to cancel some jobs');
    }
  };

  const handleExportCSV = () => {
    const csvData = jobs.map((job) => ({
      'Job ID': job.id,
      'Status': job.status,
      'Progress': `${job.progress_percentage}%`,
      'Total Ads': job.total_ads,
      'Completed': job.completed_ads,
      'Failed': job.failed_ads,
      'Campaign ID': job.campaign_id || '',
      'Created At': new Date(job.created_at).toLocaleString(),
      'Completed At': job.completed_at ? new Date(job.completed_at).toLocaleString() : '',
    }));

    const headers = Object.keys(csvData[0]).join(',');
    const rows = csvData.map((row) => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jobs-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    message.success('Jobs exported to CSV');
  };

  const statusColors = {
    pending: 'default',
    processing: 'processing',
    completed: 'success',
    failed: 'error',
    cancelled: 'default',
  };

  const filteredJobs = jobs.filter((job) =>
    searchText
      ? job.id.toString().includes(searchText) ||
        job.campaign_id?.toLowerCase().includes(searchText.toLowerCase()) ||
        job.status.toLowerCase().includes(searchText.toLowerCase())
      : true
  );

  const columns = [
    {
      title: 'Job ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: number) => `#${id}`,
      sorter: (a: UploadJob, b: UploadJob) => a.id - b.id,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status as keyof typeof statusColors]}>
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Processing', value: 'processing' },
        { text: 'Completed', value: 'completed' },
        { text: 'Failed', value: 'failed' },
        { text: 'Cancelled', value: 'cancelled' },
      ],
      onFilter: (value: string | number | boolean, record: UploadJob) => record.status === value,
    },
    {
      title: 'Progress',
      dataIndex: 'progress_percentage',
      key: 'progress',
      render: (progress: number, record: UploadJob) => (
        <div style={{ width: 200 }}>
          <Progress
            percent={progress}
            size="small"
            status={record.status === 'failed' ? 'exception' : undefined}
          />
        </div>
      ),
      sorter: (a: UploadJob, b: UploadJob) => a.progress_percentage - b.progress_percentage,
    },
    {
      title: 'Total Ads',
      dataIndex: 'total_ads',
      key: 'total_ads',
      sorter: (a: UploadJob, b: UploadJob) => a.total_ads - b.total_ads,
    },
    {
      title: 'Completed',
      dataIndex: 'completed_ads',
      key: 'completed_ads',
      render: (completed: number, record: UploadJob) => (
        <span>
          {completed} / {record.total_ads}
        </span>
      ),
      sorter: (a: UploadJob, b: UploadJob) => a.completed_ads - b.completed_ads,
    },
    {
      title: 'Failed',
      dataIndex: 'failed_ads',
      key: 'failed_ads',
      render: (failed: number) => (
        <span style={{ color: failed > 0 ? '#ff4d4f' : undefined }}>
          {failed}
        </span>
      ),
      sorter: (a: UploadJob, b: UploadJob) => a.failed_ads - b.failed_ads,
    },
    {
      title: 'Campaign ID',
      dataIndex: 'campaign_id',
      key: 'campaign_id',
      render: (id: string) => id || '-',
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString(),
      sorter: (a: UploadJob, b: UploadJob) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      defaultSortOrder: 'descend' as const,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: UploadJob) => (
        <Space>
          <Tooltip title="View details">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => window.open(`/jobs/${record.id}`, '_blank')}
            >
              View
            </Button>
          </Tooltip>
          {(record.status === 'pending' || record.status === 'processing') && (
            <Popconfirm
              title="Are you sure you want to cancel this job?"
              onConfirm={() => handleCancel(record.id)}
            >
              <Tooltip title="Cancel job">
                <Button type="link" danger icon={<DeleteOutlined />}>
                  Cancel
                </Button>
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    getCheckboxProps: (record: UploadJob) => ({
      disabled: record.status === 'completed' || record.status === 'failed',
    }),
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1>Upload Jobs</h1>
        <Space>
          <Input
            placeholder="Search jobs..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            style={{ width: 150 }}
            placeholder="Filter by status"
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: 'All', value: undefined },
              { label: 'Pending', value: 'pending' },
              { label: 'Processing', value: 'processing' },
              { label: 'Completed', value: 'completed' },
              { label: 'Failed', value: 'failed' },
            ]}
          />
          <Tooltip title="Export to CSV">
            <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>
              Export
            </Button>
          </Tooltip>
          <Button icon={<ReloadOutlined />} onClick={loadJobs}>
            Refresh
          </Button>
        </Space>
      </div>

      {selectedRowKeys.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <Space>
            <span>{selectedRowKeys.length} jobs selected</span>
            <Popconfirm
              title={`Cancel ${selectedRowKeys.length} selected jobs?`}
              onConfirm={handleBulkCancel}
            >
              <Button danger>Bulk Cancel</Button>
            </Popconfirm>
            <Button onClick={() => setSelectedRowKeys([])}>Clear Selection</Button>
          </Space>
        </Card>
      )}

      <Card>
        <Table
          rowSelection={rowSelection}
          dataSource={filteredJobs}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} jobs`,
          }}
        />
      </Card>
    </div>
  );
}
