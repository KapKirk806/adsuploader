import React from 'react';
import {
  Form,
  Select,
  Switch,
  Card,
  Alert,
  Tooltip,
  Space,
  Typography,
  Radio,
  Checkbox,
  Collapse,
} from 'antd';
import {
  InfoCircleOutlined,
  ThunderboltOutlined,
  FacebookOutlined,
  InstagramOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import {
  PlacementConfig,
  FACEBOOK_PLACEMENTS,
  INSTAGRAM_PLACEMENTS,
  MESSENGER_PLACEMENTS,
} from '../../types/metaAds';

const { Text, Title, Paragraph } = Typography;
const { Panel } = Collapse;

interface PlacementsSectionProps {
  value?: PlacementConfig;
  onChange?: (value: PlacementConfig) => void;
}

export const PlacementsSection: React.FC<PlacementsSectionProps> = ({
  value = {
    advantage_placements: { enabled: true },
  },
  onChange,
}) => {
  const [placementMode, setPlacementMode] = React.useState<'advantage' | 'manual'>(
    value.advantage_placements?.enabled ? 'advantage' : 'manual'
  );

  const updatePlacements = (updates: Partial<PlacementConfig>) => {
    onChange?.({ ...value, ...updates });
  };

  const handleModeChange = (mode: 'advantage' | 'manual') => {
    setPlacementMode(mode);
    if (mode === 'advantage') {
      onChange?.({
        advantage_placements: { enabled: true },
        publisher_platforms: undefined,
        facebook_positions: undefined,
        instagram_positions: undefined,
        messenger_positions: undefined,
        audience_network_positions: undefined,
      });
    } else {
      onChange?.({
        advantage_placements: { enabled: false },
        publisher_platforms: ['facebook', 'instagram'],
        facebook_positions: ['feed', 'story', 'reels'],
        instagram_positions: ['instagram_stream', 'instagram_story', 'instagram_reels'],
      });
    }
  };

  const togglePlatform = (platform: string, checked: boolean) => {
    const current = value.publisher_platforms || [];
    const updated = checked
      ? [...current, platform]
      : current.filter((p) => p !== platform);

    updatePlacements({ publisher_platforms: updated as any });

    // Clear positions for removed platforms
    if (!checked) {
      const positionUpdates: Partial<PlacementConfig> = {};
      if (platform === 'facebook') positionUpdates.facebook_positions = undefined;
      if (platform === 'instagram') positionUpdates.instagram_positions = undefined;
      if (platform === 'messenger') positionUpdates.messenger_positions = undefined;
      if (platform === 'audience_network') positionUpdates.audience_network_positions = undefined;

      updatePlacements(positionUpdates);
    }
  };

  const isPlatformSelected = (platform: string) => {
    return value.publisher_platforms?.includes(platform as any) || false;
  };

  return (
    <Card
      title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>
            Placements
          </Title>
        </Space>
      }
      className="mb-4"
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Placement Mode Selection */}
        <div>
          <Title level={5}>Placement Mode</Title>
          <Radio.Group value={placementMode} onChange={(e) => handleModeChange(e.target.value)}>
            <Radio.Button value="advantage">
              <Space>
                <ThunderboltOutlined />
                Advantage+ Placements (Recommended)
              </Space>
            </Radio.Button>
            <Radio.Button value="manual">Manual Placements</Radio.Button>
          </Radio.Group>

          {placementMode === 'advantage' && (
            <Alert
              message="Advantage+ Placements optimizes placement selection automatically"
              description="Meta's AI will show your ads in the placements most likely to perform well, maximizing your results."
              type="info"
              showIcon
              icon={<ThunderboltOutlined />}
              className="mt-2"
            />
          )}
        </div>

        {/* Manual Placements */}
        {placementMode === 'manual' && (
          <div>
            <Title level={5}>Select Platforms</Title>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {/* Platform Selection */}
              <Form.Item label="Platforms">
                <Checkbox.Group
                  value={value.publisher_platforms || []}
                  onChange={(platforms) =>
                    updatePlacements({ publisher_platforms: platforms as any })
                  }
                >
                  <Space direction="vertical">
                    <Checkbox value="facebook">
                      <Space>
                        <FacebookOutlined style={{ color: '#1877f2' }} />
                        Facebook
                      </Space>
                    </Checkbox>
                    <Checkbox value="instagram">
                      <Space>
                        <InstagramOutlined style={{ color: '#e4405f' }} />
                        Instagram
                      </Space>
                    </Checkbox>
                    <Checkbox value="messenger">
                      <Space>
                        <MessageOutlined style={{ color: '#00b2ff' }} />
                        Messenger
                      </Space>
                    </Checkbox>
                    <Checkbox value="audience_network">
                      Audience Network
                    </Checkbox>
                  </Space>
                </Checkbox.Group>
              </Form.Item>

              {/* Platform-Specific Placements */}
              <Collapse
                defaultActiveKey={['facebook', 'instagram']}
                className="mt-3"
              >
                {/* Facebook Placements */}
                {isPlatformSelected('facebook') && (
                  <Panel
                    header={
                      <Space>
                        <FacebookOutlined style={{ color: '#1877f2' }} />
                        Facebook Placements
                      </Space>
                    }
                    key="facebook"
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select Facebook placements"
                      value={value.facebook_positions || []}
                      onChange={(facebook_positions) =>
                        updatePlacements({ facebook_positions: facebook_positions as any })
                      }
                      options={FACEBOOK_PLACEMENTS}
                      style={{ width: '100%' }}
                    />
                    <div className="mt-2">
                      <Text type="secondary">
                        Popular: Feed, Stories, Reels (new in 2024)
                      </Text>
                    </div>
                  </Panel>
                )}

                {/* Instagram Placements */}
                {isPlatformSelected('instagram') && (
                  <Panel
                    header={
                      <Space>
                        <InstagramOutlined style={{ color: '#e4405f' }} />
                        Instagram Placements
                      </Space>
                    }
                    key="instagram"
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select Instagram placements"
                      value={value.instagram_positions || []}
                      onChange={(instagram_positions) =>
                        updatePlacements({ instagram_positions: instagram_positions as any })
                      }
                      options={INSTAGRAM_PLACEMENTS}
                      style={{ width: '100%' }}
                    />
                    <div className="mt-2">
                      <Text type="secondary">
                        Popular: Feed, Stories, Reels, Explore, Shop (2025 features)
                      </Text>
                    </div>
                  </Panel>
                )}

                {/* Messenger Placements */}
                {isPlatformSelected('messenger') && (
                  <Panel
                    header={
                      <Space>
                        <MessageOutlined style={{ color: '#00b2ff' }} />
                        Messenger Placements
                      </Space>
                    }
                    key="messenger"
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select Messenger placements"
                      value={value.messenger_positions || []}
                      onChange={(messenger_positions) =>
                        updatePlacements({ messenger_positions: messenger_positions as any })
                      }
                      options={MESSENGER_PLACEMENTS}
                      style={{ width: '100%' }}
                    />
                  </Panel>
                )}

                {/* Audience Network */}
                {isPlatformSelected('audience_network') && (
                  <Panel
                    header="Audience Network Placements"
                    key="audience_network"
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select Audience Network placements"
                      value={value.audience_network_positions || []}
                      onChange={(audience_network_positions) =>
                        updatePlacements({ audience_network_positions: audience_network_positions as any })
                      }
                      options={[
                        { value: 'audience_network_classic', label: 'Classic' },
                        { value: 'audience_network_instream_video', label: 'In-Stream Video' },
                        { value: 'audience_network_rewarded_video', label: 'Rewarded Video' },
                      ]}
                      style={{ width: '100%' }}
                    />
                  </Panel>
                )}
              </Collapse>

              {(!value.publisher_platforms || value.publisher_platforms.length === 0) && (
                <Alert
                  message="No platforms selected"
                  description="Please select at least one platform to show your ads"
                  type="error"
                  showIcon
                />
              )}
            </Space>
          </div>
        )}

        {/* Placement Summary */}
        <Alert
          message="Placement Strategy"
          description={
            <div>
              {placementMode === 'advantage' ? (
                <Paragraph>
                  <ThunderboltOutlined /> <strong>Advantage+ Placements</strong> is enabled.
                  Meta will automatically show your ads across Facebook, Instagram, Messenger,
                  and Audience Network where they're most likely to perform well.
                </Paragraph>
              ) : (
                <div>
                  <Paragraph>
                    <strong>Manual Placements</strong> selected:
                  </Paragraph>
                  <ul>
                    {value.publisher_platforms?.map((platform) => (
                      <li key={platform}>
                        {platform.charAt(0).toUpperCase() + platform.slice(1).replace('_', ' ')}
                        {platform === 'facebook' && value.facebook_positions && (
                          <span> ({value.facebook_positions.length} placements)</span>
                        )}
                        {platform === 'instagram' && value.instagram_positions && (
                          <span> ({value.instagram_positions.length} placements)</span>
                        )}
                        {platform === 'messenger' && value.messenger_positions && (
                          <span> ({value.messenger_positions.length} placements)</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          }
          type="info"
        />

        {/* 2025 Features Alert */}
        {placementMode === 'manual' && (
          <Alert
            message="2025 Placement Features"
            description={
              <ul className="mb-0">
                <li><strong>Facebook Reels:</strong> Short-form vertical video format</li>
                <li><strong>Instagram Reels:</strong> Similar to TikTok, highly engaging</li>
                <li><strong>Instagram Shop:</strong> Shopping-focused placement</li>
                <li><strong>Instagram Explore:</strong> Discovery feed for new audiences</li>
              </ul>
            }
            type="success"
            showIcon
            closable
          />
        )}
      </Space>
    </Card>
  );
};
