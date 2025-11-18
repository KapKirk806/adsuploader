import { useState, useEffect } from 'react';
import {
  Card,
  Upload as AntUpload,
  Button,
  Select,
  message,
  Table,
  Tag,
  Steps,
  Space,
  Alert,
} from 'antd';
import { InboxOutlined, UploadOutlined, RocketOutlined, GoogleOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { CampaignTemplate, Creative } from '../types';
import GoogleDrivePicker from '../components/GoogleDrivePicker';

const { Dragger } = AntUpload;
const { Step } = Steps;

export default function UploadPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<number | undefined>();
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [jobId, setJobId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showGooglePicker, setShowGooglePicker] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await api.getTemplates();
      setTemplates(data);
      const defaultTemplate = data.find((t) => t.is_default);
      if (defaultTemplate) {
        setSelectedTemplate(defaultTemplate.id);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      message.error('Failed to load templates');
    }
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error('Please select files to upload');
      return;
    }

    if (!selectedTemplate) {
      message.error('Please select a campaign template');
      return;
    }

    try {
      setUploading(true);
      const files = fileList.map((f) => f.originFileObj as File);

      const result = await api.uploadFiles(files, 1, selectedTemplate); // Using mock ad account ID 1

      setJobId(result.job.id);
      setCreatives(result.creatives);
      setCurrentStep(1);
      message.success(`Uploaded ${files.length} files successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async () => {
    if (!jobId) return;

    try {
      await api.publishJob(jobId);
      message.success('Job published to Meta Ads!');
      setCurrentStep(2);

      setTimeout(() => {
        navigate(`/jobs?id=${jobId}`);
      }, 2000);
    } catch (error) {
      console.error('Publish error:', error);
      message.error('Failed to publish job');
    }
  };

  const handleGoogleDriveSelect = (files: any[]) => {
    // Convert Google Drive files to UploadFile format
    const newFiles: UploadFile[] = files.map((file, index) => ({
      uid: `google-drive-${file.id}`,
      name: file.name,
      status: 'done',
      url: file.webViewLink,
      // Store the Google Drive file ID for later download
      originFileObj: {
        ...file,
        googleDriveId: file.id,
      } as any,
    }));

    setFileList([...fileList, ...newFiles]);
    setShowGooglePicker(false);
    message.success(`Added ${files.length} files from Google Drive`);
  };

  const columns = [
    {
      title: 'Filename',
      dataIndex: 'filename',
      key: 'filename',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'image' ? 'blue' : 'purple'}>{type.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Aspect Ratio',
      dataIndex: 'aspect_ratio',
      key: 'aspect_ratio',
    },
    {
      title: 'Variation Group',
      dataIndex: 'variation_group',
      key: 'variation_group',
      render: (group: string) => group || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'completed' ? 'success' : 'default'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Upload Ads</h1>

      <Steps current={currentStep} style={{ marginBottom: 32 }}>
        <Step title="Upload Files" icon={<UploadOutlined />} />
        <Step title="Review & Configure" icon={<RocketOutlined />} />
        <Step title="Publishing" icon={<RocketOutlined />} />
      </Steps>

      {currentStep === 0 && (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card title="Select Campaign Template">
            <Select
              style={{ width: '100%' }}
              placeholder="Select a template"
              value={selectedTemplate}
              onChange={setSelectedTemplate}
              options={templates.map((t) => ({
                label: `${t.name}${t.is_default ? ' (Default)' : ''}`,
                value: t.id,
              }))}
            />
          </Card>

          <Card title="Upload Creative Files">
            <Dragger
              multiple
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false} // Prevent auto upload
              accept="image/*,video/*"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag files to this area to upload
              </p>
              <p className="ant-upload-hint">
                Support for images (JPG, PNG, GIF) and videos (MP4, MOV). Upload
                up to 100 files at once.
              </p>
            </Dragger>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                icon={<GoogleOutlined />}
                onClick={() => setShowGooglePicker(true)}
                size="large"
              >
                Import from Google Drive
              </Button>
              <Button
                type="primary"
                onClick={handleUpload}
                loading={uploading}
                disabled={fileList.length === 0}
                size="large"
              >
                Upload {fileList.length} {fileList.length === 1 ? 'File' : 'Files'}
              </Button>
            </div>
          </Card>
        </Space>
      )}

      {currentStep === 1 && (
        <Card
          title={`Review ${creatives.length} Uploaded Creatives`}
          extra={
            <Button type="primary" onClick={handlePublish} size="large">
              Publish to Meta Ads
            </Button>
          }
        >
          <Alert
            message="Files Uploaded Successfully"
            description="Review the uploaded files below and click 'Publish to Meta Ads' to start creating your ad campaigns."
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Table dataSource={creatives} columns={columns} rowKey="id" />
        </Card>
      )}

      {currentStep === 2 && (
        <Card title="Publishing...">
          <Alert
            message="Job Queued for Processing"
            description="Your ads are being published to Meta. Redirecting to job details..."
            type="success"
            showIcon
          />
        </Card>
      )}

      <GoogleDrivePicker
        visible={showGooglePicker}
        onCancel={() => setShowGooglePicker(false)}
        onSelect={handleGoogleDriveSelect}
      />
    </div>
  );
}
