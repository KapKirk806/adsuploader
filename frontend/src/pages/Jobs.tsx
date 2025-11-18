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
} from 'antd';
import { EyeOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { api } from '../services/api';
import type { UploadJob } from '../types';

export default function Jobs() {
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  useEffect(() => {
    loadJobs();
  }, [statusFilter]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await api.getJobs(1, 20, statusFilter);
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

  const statusColors = {
    pending: 'default',
    processing: 'processing',
    completed: 'success',
    failed: 'error',
    cancelled: 'default',
  };

  const columns = [
    {
      title: 'Job ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: number) => `#${id}`,
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
    },
    {
      title: 'Total Ads',
      dataIndex: 'total_ads',
      key: 'total_ads',
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
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: UploadJob) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => window.open(`/jobs/${record.id}`, '_blank')}
          >
            View
          </Button>
          {(record.status === 'pending' || record.status === 'processing') && (
            <Popconfirm
              title="Are you sure you want to cancel this job?"
              onConfirm={() => handleCancel(record.id)}
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                Cancel
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1>Upload Jobs</h1>
        <Space>
          <Select
            style={{ width: 200 }}
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
          <Button icon={<ReloadOutlined />} onClick={loadJobs}>
            Refresh
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          dataSource={jobs}
          columns={columns}
          rowKey="id"
          loading={loading}
        />
      </Card>
    </div>
  );
}
