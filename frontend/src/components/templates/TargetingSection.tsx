import React from 'react';
import {
  Form,
  InputNumber,
  Select,
  Switch,
  Card,
  Alert,
  Tooltip,
  Space,
  Typography,
  Radio,
  Tabs,
  Tag,
  Button,
} from 'antd';
import {
  InfoCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Targeting, GeoLocation } from '../../types/metaAds';

const { Text, Title, Paragraph } = Typography;
const { TabPane } = Tabs;

interface TargetingSectionProps {
  value?: Targeting;
  onChange?: (value: Targeting) => void;
  specialAdCategory?: boolean;
}

export const TargetingSection: React.FC<TargetingSectionProps> = ({
  value = {
    age_min: 18,
    age_max: 65,
    geo_locations: { countries: ['US'] },
  },
  onChange,
  specialAdCategory = false,
}) => {
  const [targetingMode, setTargetingMode] = React.useState<'advantage' | 'manual'>(
    value.advantage_audience?.enabled ? 'advantage' : 'manual'
  );

  const updateTargeting = (updates: Partial<Targeting>) => {
    onChange?.({ ...value, ...updates });
  };

  const updateGeoLocation = (updates: Partial<GeoLocation>) => {
    updateTargeting({
      geo_locations: {
        ...value.geo_locations,
        ...updates,
      },
    });
  };

  const handleModeChange = (mode: 'advantage' | 'manual') => {
    setTargetingMode(mode);
    if (mode === 'advantage') {
      updateTargeting({
        advantage_audience: {
          enabled: true,
          targeting_expansion: 'AUTOMATIC',
          age_min: value.age_min,
          age_max: value.age_max,
          genders: value.genders,
          geo_locations: value.geo_locations,
        },
        flexible_spec: undefined,
        custom_audiences: undefined,
        lookalike_audiences: undefined,
      });
    } else {
      updateTargeting({
        advantage_audience: undefined,
      });
    }
  };

  return (
    <Card
      title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>
            Targeting
          </Title>
          <Tag color="blue">2025 Features</Tag>
        </Space>
      }
      className="mb-4"
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Targeting Mode Selection */}
        <div>
          <Title level={5}>Targeting Mode</Title>
          <Radio.Group
            value={targetingMode}
            onChange={(e) => handleModeChange(e.target.value)}
            disabled={specialAdCategory}
          >
            <Radio.Button value="advantage">
              <Space>
                <ThunderboltOutlined />
                Advantage+ Audience (Recommended)
              </Space>
            </Radio.Button>
            <Radio.Button value="manual">Manual Targeting</Radio.Button>
          </Radio.Group>

          {specialAdCategory && (
            <Alert
              message="Special ad categories have limited targeting options"
              type="warning"
              showIcon
              className="mt-2"
            />
          )}

          {targetingMode === 'advantage' && (
            <Alert
              message="Advantage+ Audience uses AI to find your best audience"
              description="Meta's AI will automatically expand your audience based on the constraints you set below. This typically delivers better results than manual targeting."
              type="info"
              showIcon
              icon={<ThunderboltOutlined />}
              className="mt-2"
            />
          )}
        </div>

        {/* Age Range */}
        <Form.Item
          label={
            <Space>
              Age Range
              <Tooltip title={specialAdCategory ? "18-65 required for special ad categories" : "13-65 years old"}>
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          }
          required
        >
          <Space>
            <InputNumber
              min={specialAdCategory ? 18 : 13}
              max={65}
              value={value.age_min}
              onChange={(age_min) => updateTargeting({ age_min: age_min || 18 })}
              addonBefore="From"
            />
            <InputNumber
              min={specialAdCategory ? 18 : 13}
              max={65}
              value={value.age_max}
              onChange={(age_max) => updateTargeting({ age_max: age_max || 65 })}
              addonBefore="To"
            />
            <Text type="secondary">years old</Text>
          </Space>
        </Form.Item>

        {/* Gender */}
        {!specialAdCategory && (
          <Form.Item
            label={
              <Space>
                Gender
                <Tooltip title="Target specific genders or all">
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
          >
            <Select
              mode="multiple"
              placeholder="All genders"
              value={value.genders || []}
              onChange={(genders) => updateTargeting({ genders: genders.length > 0 ? genders : undefined })}
              options={[
                { value: 1, label: 'Male' },
                { value: 2, label: 'Female' },
              ]}
              allowClear
            />
            {!value.genders || value.genders.length === 0 && (
              <Text type="secondary" className="block mt-1">
                All genders will be targeted
              </Text>
            )}
          </Form.Item>
        )}

        {/* Geographic Targeting */}
        <div>
          <Title level={5}>Geographic Targeting</Title>

          {/* Countries */}
          <Form.Item label="Countries" required>
            <Select
              mode="multiple"
              placeholder="Select countries"
              value={value.geo_locations?.countries || []}
              onChange={(countries) => updateGeoLocation({ countries })}
              showSearch
              options={[
                { value: 'US', label: '🇺🇸 United States' },
                { value: 'CA', label: '🇨🇦 Canada' },
                { value: 'GB', label: '🇬🇧 United Kingdom' },
                { value: 'AU', label: '🇦🇺 Australia' },
                { value: 'DE', label: '🇩🇪 Germany' },
                { value: 'FR', label: '🇫🇷 France' },
                { value: 'IT', label: '🇮🇹 Italy' },
                { value: 'ES', label: '🇪🇸 Spain' },
                { value: 'MX', label: '🇲🇽 Mexico' },
                { value: 'BR', label: '🇧🇷 Brazil' },
                { value: 'IN', label: '🇮🇳 India' },
                { value: 'JP', label: '🇯🇵 Japan' },
                { value: 'KR', label: '🇰🇷 South Korea' },
                { value: 'CN', label: '🇨🇳 China' },
                // Add more countries as needed
              ]}
              filterOption={(input, option) =>
                (option?.label as string).toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          {/* Location Types */}
          <Form.Item
            label={
              <Space>
                Location Types
                <Tooltip title="People who live in, recently in, or traveling to these locations">
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
          >
            <Select
              mode="multiple"
              placeholder="All location types"
              value={value.geo_locations?.location_types || []}
              onChange={(location_types) =>
                updateGeoLocation({ location_types: location_types.length > 0 ? location_types : undefined })
              }
              options={[
                { value: 'home', label: 'People living in this location' },
                { value: 'recent', label: 'People recently in this location' },
                { value: 'travel_in', label: 'People traveling to this location' },
              ]}
              allowClear
            />
          </Form.Item>
        </div>

        {/* Manual Targeting Options */}
        {targetingMode === 'manual' && !specialAdCategory && (
          <div>
            <Tabs defaultActiveKey="interests">
              <TabPane tab="Interests" key="interests">
                <Alert
                  message="Add interests to target specific audiences"
                  description="Search for interests related to your product or service. You can add multiple interests to broaden your reach."
                  type="info"
                  showIcon
                  className="mb-3"
                />
                <Button type="dashed" icon={<PlusOutlined />} block>
                  Add Interests (Feature coming soon)
                </Button>
              </TabPane>

              <TabPane tab="Behaviors" key="behaviors">
                <Alert
                  message="Target based on purchase behavior and device usage"
                  description="Reach people based on their purchase behavior, device usage, and other activities."
                  type="info"
                  showIcon
                  className="mb-3"
                />
                <Button type="dashed" icon={<PlusOutlined />} block>
                  Add Behaviors (Feature coming soon)
                </Button>
              </TabPane>

              <TabPane tab="Custom Audiences" key="custom_audiences">
                <Alert
                  message="Target your existing customers or website visitors"
                  description="Upload customer lists or create audiences from your website traffic or app activity."
                  type="info"
                  showIcon
                  className="mb-3"
                />
                <Button type="dashed" icon={<PlusOutlined />} block>
                  Add Custom Audiences (Feature coming soon)
                </Button>
              </TabPane>

              <TabPane tab="Lookalike Audiences" key="lookalike">
                <Alert
                  message="Find people similar to your best customers"
                  description="Meta will find new people who are similar to your existing customers or audience."
                  type="info"
                  showIcon
                  className="mb-3"
                />
                <Button type="dashed" icon={<PlusOutlined />} block>
                  Add Lookalike Audiences (Feature coming soon)
                </Button>
              </TabPane>
            </Tabs>
          </div>
        )}

        {/* Advantage+ Audience Settings */}
        {targetingMode === 'advantage' && (
          <Form.Item
            label={
              <Space>
                Targeting Expansion
                <Tooltip title="Let Meta expand beyond your age, gender, and location constraints">
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
          >
            <Radio.Group
              value={value.advantage_audience?.targeting_expansion || 'AUTOMATIC'}
              onChange={(e) =>
                updateTargeting({
                  advantage_audience: {
                    ...value.advantage_audience!,
                    targeting_expansion: e.target.value,
                  },
                })
              }
            >
              <Radio value="AUTOMATIC">
                Automatic (Recommended) - Meta optimizes for best results
              </Radio>
              <Radio value="DISABLED">
                Disabled - Stay within constraints above
              </Radio>
            </Radio.Group>
          </Form.Item>
        )}

        {/* Device Targeting */}
        <Form.Item
          label={
            <Space>
              Device Platforms
              <Tooltip title="Target specific device types">
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          }
        >
          <Select
            mode="multiple"
            placeholder="All devices"
            value={value.device_platforms || []}
            onChange={(device_platforms) =>
              updateTargeting({ device_platforms: device_platforms.length > 0 ? device_platforms : undefined })
            }
            options={[
              { value: 'mobile', label: 'Mobile' },
              { value: 'desktop', label: 'Desktop' },
            ]}
            allowClear
          />
        </Form.Item>

        {/* Targeting Optimization */}
        <Form.Item
          label={
            <Space>
              Targeting Optimization
              <Tooltip title="Expand targeting to improve performance">
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          }
        >
          <Radio.Group
            value={value.targeting_optimization || 'NONE'}
            onChange={(e) => updateTargeting({ targeting_optimization: e.target.value })}
          >
            <Radio value="NONE">No expansion</Radio>
            <Radio value="EXPANSION_ALL">Expand to improve performance</Radio>
          </Radio.Group>
        </Form.Item>

        {/* Summary */}
        <Alert
          message="Estimated Audience Size"
          description={
            <div>
              <Paragraph>
                Your targeting settings will be refined based on:
              </Paragraph>
              <ul>
                <li>Age: {value.age_min}-{value.age_max} years</li>
                <li>Location: {value.geo_locations?.countries?.join(', ') || 'Not set'}</li>
                {value.genders && value.genders.length > 0 && (
                  <li>Gender: {value.genders.map(g => g === 1 ? 'Male' : 'Female').join(', ')}</li>
                )}
                <li>Mode: {targetingMode === 'advantage' ? 'Advantage+ Audience (AI-optimized)' : 'Manual targeting'}</li>
              </ul>
              {targetingMode === 'advantage' && (
                <Text type="success">
                  <ThunderboltOutlined /> Meta's AI will automatically find your best audience within these constraints
                </Text>
              )}
            </div>
          }
          type="info"
        />
      </Space>
    </Card>
  );
};
