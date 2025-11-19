import React from 'react';
import {
  Form,
  Input,
  Select,
  Switch,
  Card,
  Alert,
  Tooltip,
  Space,
  Typography,
  Collapse,
} from 'antd';
import { InfoCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { AdConfig, CALL_TO_ACTIONS } from '../../types/metaAds';

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

interface CreativeConfigSectionProps {
  value?: Partial<AdConfig>;
  onChange?: (value: Partial<AdConfig>) => void;
}

export const CreativeConfigSection: React.FC<CreativeConfigSectionProps> = ({
  value = { status: 'ACTIVE', creative: { name: '' } },
  onChange,
}) => {
  const updateAd = (updates: Partial<AdConfig>) => {
    onChange?.({ ...value, ...updates });
  };

  const updateCreative = (updates: any) => {
    updateAd({
      creative: {
        ...value.creative,
        ...updates,
      },
    });
  };

  return (
    <Card title={<Title level={4}>Creative Configuration</Title>} className="mb-4">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Ad Name */}
        <Form.Item label="Ad Name" required>
          <Input
            placeholder="e.g., Summer Sale Ad 1"
            value={value.name}
            onChange={(e) => updateAd({ name: e.target.value })}
            maxLength={255}
          />
        </Form.Item>

        {/* Creative Name */}
        <Form.Item label="Creative Name" required>
          <Input
            placeholder="e.g., Summer Sale Creative"
            value={value.creative?.name}
            onChange={(e) => updateCreative({ name: e.target.value })}
            maxLength={255}
          />
        </Form.Item>

        {/* Ad Copy */}
        <Form.Item
          label={
            <Space>
              Primary Text (Body)
              <Tooltip title="Main text that appears with your ad (max 5000 chars)">
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          }
        >
          <TextArea
            placeholder="Enter your ad copy here..."
            value={value.creative?.body}
            onChange={(e) => updateCreative({ body: e.target.value })}
            maxLength={5000}
            rows={4}
            showCount
          />
        </Form.Item>

        {/* Headline/Title */}
        <Form.Item
          label={
            <Space>
              Headline
              <Tooltip title="Headline text (max 255 chars)">
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          }
        >
          <Input
            placeholder="e.g., Shop Now and Save 50%"
            value={value.creative?.title}
            onChange={(e) => updateCreative({ title: e.target.value })}
            maxLength={255}
            showCount
          />
        </Form.Item>

        {/* Link Description */}
        <Form.Item
          label={
            <Space>
              Description
              <Tooltip title="Additional description text">
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          }
        >
          <Input
            placeholder="e.g., Limited time offer - Free shipping on all orders"
            value={value.creative?.link_description}
            onChange={(e) => updateCreative({ link_description: e.target.value })}
            maxLength={255}
          />
        </Form.Item>

        {/* Call to Action */}
        <Form.Item
          label={
            <Space>
              Call to Action
              <Tooltip title="Button text that appears on your ad">
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          }
        >
          <Select
            placeholder="Select call to action"
            value={value.creative?.call_to_action?.type}
            onChange={(type) =>
              updateCreative({
                call_to_action: {
                  ...value.creative?.call_to_action,
                  type,
                },
              })
            }
            options={CALL_TO_ACTIONS}
            showSearch
          />
        </Form.Item>

        {/* Destination URL */}
        <Form.Item
          label={
            <Space>
              Destination URL
              <Tooltip title="Where people go when they click your ad">
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          }
        >
          <Input
            prefix="https://"
            placeholder="www.yourwebsite.com/landing-page"
            value={value.creative?.link_url}
            onChange={(e) => {
              const url = e.target.value;
              updateCreative({
                link_url: url,
                call_to_action: {
                  ...value.creative?.call_to_action,
                  value: { link: url.startsWith('http') ? url : `https://${url}` },
                },
              });
            }}
          />
        </Form.Item>

        {/* Advantage+ Creative */}
        <div>
          <Title level={5}>
            <Space>
              <ThunderboltOutlined />
              Advantage+ Creative (2025)
            </Space>
          </Title>
          <Paragraph type="secondary">
            Meta's AI enhancements to improve creative performance
          </Paragraph>

          <Collapse className="mt-2">
            {/* Image Enhancements */}
            <Panel
              header={
                <Space>
                  Image Enhancements
                  {value.creative?.advantage_creative?.image_enhancements?.enabled && (
                    <Text type="success">Enabled</Text>
                  )}
                </Space>
              }
              key="image"
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item label="Enable Image Enhancements">
                  <Switch
                    checked={value.creative?.advantage_creative?.image_enhancements?.enabled}
                    onChange={(enabled) =>
                      updateCreative({
                        advantage_creative: {
                          ...value.creative?.advantage_creative,
                          image_enhancements: { enabled },
                        },
                      })
                    }
                  />
                  <Text type="secondary" className="ml-2">
                    Automatically adjust brightness, contrast, and cropping
                  </Text>
                </Form.Item>

                {value.creative?.advantage_creative?.image_enhancements?.enabled && (
                  <>
                    <Form.Item label="Brightness Adjustment">
                      <Switch
                        checked={value.creative?.advantage_creative?.image_enhancements?.brightness_adjustment}
                        onChange={(brightness_adjustment) =>
                          updateCreative({
                            advantage_creative: {
                              ...value.creative?.advantage_creative,
                              image_enhancements: {
                                ...value.creative?.advantage_creative?.image_enhancements,
                                brightness_adjustment,
                              },
                            },
                          })
                        }
                      />
                    </Form.Item>

                    <Form.Item label="Contrast Adjustment">
                      <Switch
                        checked={value.creative?.advantage_creative?.image_enhancements?.contrast_adjustment}
                        onChange={(contrast_adjustment) =>
                          updateCreative({
                            advantage_creative: {
                              ...value.creative?.advantage_creative,
                              image_enhancements: {
                                ...value.creative?.advantage_creative?.image_enhancements,
                                contrast_adjustment,
                              },
                            },
                          })
                        }
                      />
                    </Form.Item>

                    <Form.Item label="Smart Cropping">
                      <Switch
                        checked={value.creative?.advantage_creative?.image_enhancements?.cropping}
                        onChange={(cropping) =>
                          updateCreative({
                            advantage_creative: {
                              ...value.creative?.advantage_creative,
                              image_enhancements: {
                                ...value.creative?.advantage_creative?.image_enhancements,
                                cropping,
                              },
                            },
                          })
                        }
                      />
                    </Form.Item>
                  </>
                )}
              </Space>
            </Panel>

            {/* Video Enhancements */}
            <Panel
              header={
                <Space>
                  Video Enhancements
                  {value.creative?.advantage_creative?.video_enhancements?.enabled && (
                    <Text type="success">Enabled</Text>
                  )}
                </Space>
              }
              key="video"
            >
              <Form.Item label="Enable Video Enhancements">
                <Switch
                  checked={value.creative?.advantage_creative?.video_enhancements?.enabled}
                  onChange={(enabled) =>
                    updateCreative({
                      advantage_creative: {
                        ...value.creative?.advantage_creative,
                        video_enhancements: { enabled, auto_enhance: enabled },
                      },
                    })
                  }
                />
                <Text type="secondary" className="ml-2">
                  Automatically optimize video quality and format
                </Text>
              </Form.Item>
            </Panel>

            {/* Text Optimization */}
            <Panel
              header={
                <Space>
                  Text Optimization
                  {value.creative?.advantage_creative?.text_optimization?.enabled && (
                    <Text type="success">Enabled</Text>
                  )}
                </Space>
              }
              key="text"
            >
              <Form.Item label="Enable Text Optimization">
                <Switch
                  checked={value.creative?.advantage_creative?.text_optimization?.enabled}
                  onChange={(enabled) =>
                    updateCreative({
                      advantage_creative: {
                        ...value.creative?.advantage_creative,
                        text_optimization: { enabled },
                      },
                    })
                  }
                />
                <Text type="secondary" className="ml-2">
                  Test different text variations automatically
                </Text>
              </Form.Item>
            </Panel>

            {/* Dynamic Creative */}
            <Panel
              header={
                <Space>
                  Dynamic Creative
                  {value.creative?.advantage_creative?.dynamic_creative?.enabled && (
                    <Text type="success">Enabled</Text>
                  )}
                </Space>
              }
              key="dynamic"
            >
              <Form.Item label="Enable Dynamic Creative">
                <Switch
                  checked={value.creative?.advantage_creative?.dynamic_creative?.enabled}
                  onChange={(enabled) =>
                    updateCreative({
                      advantage_creative: {
                        ...value.creative?.advantage_creative,
                        dynamic_creative: { enabled },
                      },
                    })
                  }
                />
                <Text type="secondary" className="ml-2">
                  Automatically test different combinations of creative elements
                </Text>
              </Form.Item>
              {value.creative?.advantage_creative?.dynamic_creative?.enabled && (
                <Alert
                  message="Dynamic creative requires multiple creative assets (images, videos, headlines, descriptions)"
                  type="info"
                  showIcon
                  className="mt-2"
                />
              )}
            </Panel>
          </Collapse>
        </div>

        {/* Creative Notes */}
        <Alert
          message="Creative Best Practices (2025)"
          description={
            <ul className="mb-0">
              <li>Use high-quality images (1200x628px or 1080x1080px recommended)</li>
              <li>Keep text on images to less than 20% of the image</li>
              <li>Videos should be 15-30 seconds for best engagement</li>
              <li>Use Advantage+ Creative enhancements for automatic optimization</li>
              <li>Test multiple variations with dynamic creative</li>
            </ul>
          }
          type="info"
          showIcon
        />

        {/* Media Upload Note */}
        <Alert
          message="Media Upload"
          description="Creative media (images/videos) will be uploaded when you create a campaign using this template. You'll select files from Google Drive or upload directly."
          type="success"
          showIcon
        />
      </Space>
    </Card>
  );
};
