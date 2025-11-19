import React from 'react';
import {
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  DatePicker,
  Radio,
  Card,
  Alert,
  Tooltip,
  Space,
  Typography,
} from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  CampaignConfig,
  CAMPAIGN_OBJECTIVES,
  BID_STRATEGIES,
  SPECIAL_AD_CATEGORIES,
} from '../../types/metaAds';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

interface CampaignConfigSectionProps {
  value?: Partial<CampaignConfig>;
  onChange?: (value: Partial<CampaignConfig>) => void;
}

export const CampaignConfigSection: React.FC<CampaignConfigSectionProps> = ({
  value = {},
  onChange,
}) => {
  const updateConfig = (updates: Partial<CampaignConfig>) => {
    onChange?.({ ...value, ...updates });
  };

  const budgetType = value.daily_budget ? 'daily' : 'lifetime';

  return (
    <Card title={<Title level={4}>Campaign Configuration</Title>} className="mb-4">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Campaign Name */}
        <Form.Item
          label="Campaign Name"
          required
          tooltip="Name for your campaign (max 255 characters)"
        >
          <Input
            placeholder="e.g., Summer Sale 2025"
            value={value.name}
            onChange={(e) => updateConfig({ name: e.target.value })}
            maxLength={255}
          />
        </Form.Item>

        {/* Objective */}
        <Form.Item
          label={
            <Space>
              Objective
              <Tooltip title="What you want to accomplish with your ads">
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          }
          required
        >
          <Select
            placeholder="Select campaign objective"
            value={value.objective}
            onChange={(objective) => updateConfig({ objective })}
            options={CAMPAIGN_OBJECTIVES.map((obj) => ({
              value: obj.value,
              label: (
                <div>
                  <div><strong>{obj.label}</strong></div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {obj.description}
                  </Text>
                </div>
              ),
            }))}
          />
        </Form.Item>

        {/* Special Ad Categories */}
        <Form.Item
          label={
            <Space>
              Special Ad Categories
              <Tooltip title="Required for ads about employment, housing, credit, or politics">
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          }
        >
          <Select
            mode="multiple"
            placeholder="Select if your ad falls into special categories"
            value={value.special_ad_categories || ['NONE']}
            onChange={(special_ad_categories) => updateConfig({ special_ad_categories })}
            options={SPECIAL_AD_CATEGORIES}
          />
          {value.special_ad_categories?.some((cat) => cat !== 'NONE') && (
            <Alert
              message="Special ad categories have restricted targeting options"
              type="warning"
              showIcon
              className="mt-2"
            />
          )}
        </Form.Item>

        {/* Bid Strategy */}
        <Form.Item
          label={
            <Space>
              Bid Strategy
              <Tooltip title="How Meta optimizes your bids">
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          }
          required
        >
          <Select
            placeholder="Select bid strategy"
            value={value.bid_strategy}
            onChange={(bid_strategy) => updateConfig({ bid_strategy })}
            options={BID_STRATEGIES.map((strategy) => ({
              value: strategy.value,
              label: (
                <div>
                  <div><strong>{strategy.label}</strong></div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {strategy.description}
                  </Text>
                </div>
              ),
            }))}
          />
        </Form.Item>

        {/* Campaign Budget Optimization */}
        <Form.Item
          label={
            <Space>
              Campaign Budget Optimization (CBO)
              <Tooltip title="Let Meta automatically distribute budget across ad sets for best results">
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          }
        >
          <Switch
            checked={value.campaign_budget_optimization?.enabled}
            onChange={(enabled) =>
              updateConfig({
                campaign_budget_optimization: { enabled },
              })
            }
          />
          <Text type="secondary" className="ml-2">
            {value.campaign_budget_optimization?.enabled
              ? 'Enabled - Meta will optimize budget across ad sets'
              : 'Disabled - Set budget at ad set level'}
          </Text>
        </Form.Item>

        {/* Budget Type Selection */}
        <Form.Item label="Budget Type" required>
          <Radio.Group
            value={budgetType}
            onChange={(e) => {
              const type = e.target.value;
              if (type === 'daily') {
                updateConfig({
                  daily_budget: value.daily_budget || 5000,
                  lifetime_budget: undefined,
                });
              } else {
                updateConfig({
                  lifetime_budget: value.lifetime_budget || 50000,
                  daily_budget: undefined,
                });
              }
            }}
          >
            <Radio value="daily">Daily Budget</Radio>
            <Radio value="lifetime">Lifetime Budget</Radio>
          </Radio.Group>
        </Form.Item>

        {/* Budget Amount */}
        {budgetType === 'daily' ? (
          <Form.Item
            label={
              <Space>
                Daily Budget
                <Tooltip title="Amount in USD (minimum $1.00)">
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
            required
          >
            <InputNumber
              prefix="$"
              value={value.daily_budget ? value.daily_budget / 100 : undefined}
              onChange={(val) =>
                updateConfig({ daily_budget: val ? Math.round(val * 100) : undefined })
              }
              min={1}
              precision={2}
              style={{ width: 200 }}
              placeholder="e.g., 50.00"
            />
            <Text type="secondary" className="ml-2">
              (${((value.daily_budget || 0) / 100).toFixed(2)} per day)
            </Text>
          </Form.Item>
        ) : (
          <Form.Item
            label={
              <Space>
                Lifetime Budget
                <Tooltip title="Total budget for the campaign duration (minimum $1.00)">
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
            required
          >
            <InputNumber
              prefix="$"
              value={value.lifetime_budget ? value.lifetime_budget / 100 : undefined}
              onChange={(val) =>
                updateConfig({ lifetime_budget: val ? Math.round(val * 100) : undefined })
              }
              min={1}
              precision={2}
              style={{ width: 200 }}
              placeholder="e.g., 500.00"
            />
            <Text type="secondary" className="ml-2">
              (${((value.lifetime_budget || 0) / 100).toFixed(2)} total)
            </Text>
            {!value.end_time && (
              <Alert
                message="End date required when using lifetime budget"
                type="warning"
                showIcon
                className="mt-2"
              />
            )}
          </Form.Item>
        )}

        {/* Campaign Schedule */}
        <Form.Item
          label={
            <Space>
              Campaign Schedule
              <Tooltip title="When your campaign will run">
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          }
        >
          <RangePicker
            showTime
            value={[
              value.start_time ? dayjs(value.start_time) : null,
              value.end_time ? dayjs(value.end_time) : null,
            ]}
            onChange={(dates) => {
              if (dates) {
                updateConfig({
                  start_time: dates[0]?.toISOString(),
                  end_time: dates[1]?.toISOString(),
                });
              } else {
                updateConfig({
                  start_time: undefined,
                  end_time: undefined,
                });
              }
            }}
            style={{ width: '100%' }}
          />
          <Text type="secondary" className="mt-1 block">
            Leave empty to start immediately and run continuously
          </Text>
        </Form.Item>

        {/* Campaign Status */}
        <Form.Item label="Campaign Status">
          <Radio.Group
            value={value.status || 'ACTIVE'}
            onChange={(e) => updateConfig({ status: e.target.value })}
          >
            <Radio value="ACTIVE">Active</Radio>
            <Radio value="PAUSED">Paused</Radio>
          </Radio.Group>
        </Form.Item>

        {/* Buying Type */}
        <Form.Item
          label={
            <Space>
              Buying Type
              <Tooltip title="How you purchase ad inventory">
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          }
        >
          <Radio.Group
            value={value.buying_type || 'AUCTION'}
            onChange={(e) => updateConfig({ buying_type: e.target.value })}
          >
            <Radio value="AUCTION">Auction (Recommended)</Radio>
            <Radio value="RESERVED">Reserved</Radio>
          </Radio.Group>
        </Form.Item>

        {/* Recommendations */}
        {value.bid_strategy !== 'LOWEST_COST_WITHOUT_CAP' && (
          <Alert
            message="Recommendation"
            description="LOWEST_COST_WITHOUT_CAP is the recommended bid strategy for most campaigns in 2025"
            type="info"
            showIcon
            closable
          />
        )}

        {value.daily_budget && value.daily_budget < 1000 && (
          <Alert
            message="Low Budget Warning"
            description="Daily budget below $10 may limit campaign performance and learning"
            type="warning"
            showIcon
            closable
          />
        )}
      </Space>
    </Card>
  );
};
