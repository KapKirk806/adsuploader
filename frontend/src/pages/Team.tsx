import { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Typography, Tag, message, Modal, Form, Input, Select, Popconfirm, Avatar } from 'antd';
import { UserAddOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { api } from '../services/api';
import type { TeamMember } from '../types';

const { Title } = Typography;

export default function Team() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await api.getTeamMembers();
      setMembers(data);
    } catch (error) {
      message.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (values: { email: string; role: 'admin' | 'member' }) => {
    try {
      setInviting(true);
      await api.inviteTeamMember(values.email, values.role);
      message.success('Team member invited successfully');
      setInviteModalVisible(false);
      form.resetFields();
      loadMembers();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to invite team member');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (id: number) => {
    try {
      await api.removeTeamMember(id);
      message.success('Team member removed');
      loadMembers();
    } catch (error) {
      message.error('Failed to remove team member');
    }
  };

  const handleRoleChange = async (id: number, role: string) => {
    try {
      await api.updateTeamMember(id, { role });
      message.success('Role updated successfully');
      loadMembers();
    } catch (error) {
      message.error('Failed to update role');
    }
  };

  const columns = [
    {
      title: 'Member',
      key: 'member',
      render: (_: any, record: TeamMember) => (
        <Space>
          <Avatar src={record.avatar_url} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.name || 'Unknown'}</div>
            <div style={{ fontSize: 12, color: '#999' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string, record: TeamMember) => (
        <Select
          value={role}
          style={{ width: 120 }}
          onChange={(value) => handleRoleChange(record.id, value)}
          options={[
            { label: 'Owner', value: 'owner', disabled: true },
            { label: 'Admin', value: 'admin' },
            { label: 'Member', value: 'member' },
          ]}
          disabled={role === 'owner'}
        />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          active: 'green',
          pending: 'orange',
          inactive: 'default',
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Joined',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: TeamMember) => (
        record.role !== 'owner' && (
          <Popconfirm
            title="Remove this team member?"
            description="This action cannot be undone."
            onConfirm={() => handleRemove(record.id)}
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
        )
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>Team Members</Title>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => setInviteModalVisible(true)}
        >
          Invite Member
        </Button>
      </div>

      <Card>
        {members.length === 0 && !loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <UserOutlined style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 16 }} />
            <p style={{ fontSize: 16, color: '#666' }}>
              No team members yet
            </p>
            <p style={{ color: '#999', marginBottom: 24 }}>
              Invite team members to collaborate on ad campaigns
            </p>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => setInviteModalVisible(true)}
            >
              Invite Member
            </Button>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={members}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>

      <Modal
        title="Invite Team Member"
        open={inviteModalVisible}
        onCancel={() => setInviteModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleInvite}
        >
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please enter email address' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="colleague@example.com" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            initialValue="member"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select>
              <Select.Option value="admin">Admin - Full access</Select.Option>
              <Select.Option value="member">Member - Limited access</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setInviteModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={inviting}>
                Send Invitation
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
