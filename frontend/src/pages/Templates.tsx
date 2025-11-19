import { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Drawer,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { api } from '../services/api';
import type { CampaignTemplate } from '../types';
import { AdvancedTemplateForm } from '../components/templates/AdvancedTemplateForm';

export default function Templates() {
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CampaignTemplate | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await api.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
      message.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = (advanced = false) => {
    setEditingTemplate(null);
    form.resetFields();
    if (advanced) {
      setAdvancedMode(true);
    } else {
      setModalVisible(true);
    }
  };

  const handleCreateAdvanced = () => {
    handleCreate(true);
  };

  const handleEdit = (template: CampaignTemplate) => {
    setEditingTemplate(template);
    form.setFieldsValue(template);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingTemplate) {
        await api.updateTemplate(editingTemplate.id, values);
        message.success('Template updated successfully');
      } else {
        // Create template with default configs
        await api.createTemplate({
          ...values,
          campaign_config: { name: values.name, objective: values.objective, status: 'PAUSED' },
          adset_config: { name: `${values.name} - AdSet`, optimization_goal: 'LINK_CLICKS', billing_event: 'IMPRESSIONS', targeting: {}, status: 'PAUSED' },
          ad_config: { name: `${values.name} - Ad`, status: 'PAUSED', creative: { name: values.name, object_story_spec: {} } },
        });
        message.success('Template created successfully');
      }

      setModalVisible(false);
      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      message.error('Failed to save template');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteTemplate(id);
      message.success('Template deleted successfully');
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      message.error('Failed to delete template');
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await api.setDefaultTemplate(id);
      message.success('Template set as default');
      loadTemplates();
    } catch (error) {
      console.error('Error setting default:', error);
      message.error('Failed to set default template');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: CampaignTemplate) => (
        <Space>
          {text}
          {record.is_default && <Tag color="gold"><StarOutlined /> Default</Tag>}
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Objective',
      dataIndex: 'objective',
      key: 'objective',
      render: (objective: string) => <Tag color="blue">{objective}</Tag>,
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: CampaignTemplate) => (
        <Space>
          {!record.is_default && (
            <Button
              type="link"
              icon={<StarOutlined />}
              onClick={() => handleSetDefault(record.id)}
            >
              Set Default
            </Button>
          )}
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this template?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1>Campaign Templates</h1>
        <Space>
          <Button icon={<PlusOutlined />} onClick={() => handleCreate(false)}>
            Quick Create
          </Button>
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            onClick={handleCreateAdvanced}
          >
            Advanced Mode
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          dataSource={templates}
          columns={columns}
          rowKey="id"
          loading={loading}
        />
      </Card>

      {/* Quick Create Modal */}
      <Modal
        title={editingTemplate ? 'Edit Template' : 'Quick Create Template'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Template Name"
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input placeholder="e.g., Holiday Sale Campaign" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Describe this template..." />
          </Form.Item>

          <Form.Item
            name="objective"
            label="Campaign Objective"
            rules={[{ required: true, message: 'Please select an objective' }]}
          >
            <Select placeholder="Select objective">
              <Select.Option value="OUTCOME_SALES">Sales</Select.Option>
              <Select.Option value="OUTCOME_TRAFFIC">Traffic</Select.Option>
              <Select.Option value="OUTCOME_AWARENESS">Awareness</Select.Option>
              <Select.Option value="OUTCOME_LEADS">Leads</Select.Option>
              <Select.Option value="OUTCOME_ENGAGEMENT">Engagement</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Advanced Mode Drawer */}
      <Drawer
        title="Advanced Template Configuration"
        placement="right"
        open={advancedMode}
        onClose={() => setAdvancedMode(false)}
        width="90%"
        destroyOnClose
      >
        <AdvancedTemplateForm
          initialTemplate={editingTemplate || undefined}
          mode={editingTemplate ? 'edit' : 'create'}
          onSubmit={(template) => {
            setAdvancedMode(false);
            loadTemplates();
          }}
          onCancel={() => setAdvancedMode(false)}
        />
      </Drawer>
    </div>
  );
}
