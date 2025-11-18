import { useState, useEffect } from 'react';
import { Modal, Button, List, Card, Space, Checkbox, message, Spin, Empty } from 'antd';
import { GoogleOutlined, FileImageOutlined, FileOutlined, VideoCameraOutlined } from '@ant-design/icons';
import axios from 'axios';

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  thumbnailLink?: string;
  webViewLink?: string;
}

interface GoogleDrivePickerProps {
  visible: boolean;
  onCancel: () => void;
  onSelect: (files: GoogleDriveFile[]) => void;
}

export default function GoogleDrivePicker({ visible, onCancel, onSelect }: GoogleDrivePickerProps) {
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (visible) {
      checkConnection();
    }
  }, [visible]);

  const checkConnection = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('/api/google-drive/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConnected(response.data.connected);
      if (response.data.connected) {
        loadFiles();
      }
    } catch (error) {
      message.error('Failed to check Google Drive connection');
    }
  };

  const handleConnect = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('/api/google-drive/connect', {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.href = response.data.authUrl;
    } catch (error) {
      message.error('Failed to connect to Google Drive');
    }
  };

  const loadFiles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('/api/google-drive/files', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          mimeTypes: 'image/jpeg,image/png,image/gif,video/mp4,video/quicktime',
        },
      });
      setFiles(response.data.files);
    } catch (error) {
      message.error('Failed to load Google Drive files');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFile = (fileId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map(f => f.id)));
    }
  };

  const handleImport = () => {
    const selected = files.filter(f => selectedFiles.has(f.id));
    onSelect(selected);
    setSelectedFiles(new Set());
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <FileImageOutlined style={{ fontSize: 24, color: '#1890ff' }} />;
    } else if (mimeType.startsWith('video/')) {
      return <VideoCameraOutlined style={{ fontSize: 24, color: '#52c41a' }} />;
    }
    return <FileOutlined style={{ fontSize: 24 }} />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <Modal
      title={
        <Space>
          <GoogleOutlined style={{ color: '#4285F4' }} />
          <span>Import from Google Drive</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        connected && (
          <Button
            key="select-all"
            onClick={handleSelectAll}
            disabled={files.length === 0}
          >
            {selectedFiles.size === files.length ? 'Deselect All' : 'Select All'}
          </Button>
        ),
        connected && (
          <Button
            key="import"
            type="primary"
            onClick={handleImport}
            disabled={selectedFiles.size === 0}
          >
            Import {selectedFiles.size > 0 && `(${selectedFiles.size})`}
          </Button>
        ),
      ]}
    >
      {!connected ? (
        <Card style={{ textAlign: 'center', padding: '40px 0' }}>
          <GoogleOutlined style={{ fontSize: 64, color: '#4285F4', marginBottom: 16 }} />
          <p style={{ fontSize: 16, marginBottom: 24 }}>
            Connect your Google Drive to import files
          </p>
          <Button
            type="primary"
            icon={<GoogleOutlined />}
            size="large"
            onClick={handleConnect}
          >
            Connect Google Drive
          </Button>
        </Card>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>Loading files...</p>
        </div>
      ) : files.length === 0 ? (
        <Empty
          description="No image or video files found in your Google Drive"
          style={{ padding: '40px 0' }}
        />
      ) : (
        <List
          dataSource={files}
          style={{ maxHeight: 500, overflow: 'auto' }}
          renderItem={(file) => (
            <List.Item
              key={file.id}
              style={{
                cursor: 'pointer',
                background: selectedFiles.has(file.id) ? '#e6f7ff' : 'transparent',
              }}
              onClick={() => handleSelectFile(file.id)}
            >
              <List.Item.Meta
                avatar={
                  <Checkbox
                    checked={selectedFiles.has(file.id)}
                    onChange={() => handleSelectFile(file.id)}
                  />
                }
                title={
                  <Space>
                    {getFileIcon(file.mimeType)}
                    <span>{file.name}</span>
                  </Space>
                }
                description={
                  <Space>
                    <span>{file.mimeType}</span>
                    <span>•</span>
                    <span>{formatFileSize(file.size)}</span>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Modal>
  );
}
