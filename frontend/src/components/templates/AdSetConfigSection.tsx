import React from 'react';
import {
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Card,
  Alert,
  Tooltip,
  Space,
  Typography,
  Radio,
} from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { AdSetConfig, OPTIMIZATION_GOALS, CampaignObjective } from '../../types/metaAds';

const { Text, Title } = Typography;

interface AdSetConfigSectionProps {
  value?: Partial<AdSetConfig>;
  onChange?: (value: Partial<AdSetConfig>) => void;
  campaignObjective?: CampaignObjective;
  useCampaignBudget?: boolean;
}

export const AdSetConfigSection: React.FC<AdSetConfigSectionProps> = ({
  value = { status: 'ACTIVE' },
  onChange,
  campaignObjective,
  useCampaignBudget = false,
}) => {
  const updateAdSet = (updates: Partial<AdSetConfig>) => {
    onChange?.({ ...value, ...updates });
  };

  // Filter optimization goals based on objective
  const getCompatibleGoals = () => {
    const goalsByObjective: Record<string, string[]> = {
      OUTCOME_AWARENESS: ['REACH', 'IMPRESSIONS'],
      OUTCOME_TRAFFIC: ['LINK_CLICKS', 'LANDING_PAGE_VIEWS', 'IMPRESSIONS'],
      OUTCOME_ENGAGEMENT: ['POST_ENGAGEMENT'],
      OUTCOME_LEADS: ['LEAD_GENERATION', 'QUALITY_LEAD', 'OFFSITE_CONVERSIONS'],
      OUTCOME_SALES: ['OFFSITE_CONVERSIONS', 'VALUE', 'LINK_CLICKS', 'LANDING_PAGE_VIEWS'],
      OUTCOME_APP_PROMOTION: ['APP_INSTALLS', 'LINK_CLICKS'],
    };

    const compatibleGoalValues = campaignObjective
      ? goalsByObjective[campaignObjective] || []
      : [];

    return OPTIMIZATION_GOALS.filter((goal) =>
      compatibleGoalValues.includes(goal.value)
    );
  };

  return (
    <Card title={<Title level={4}>Ad Set Configuration</Title>} className="mb-4">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Ad Set Name */}
        <Form.Item label="Ad Set Name" required>
          <Input
            placeholder="e.g., Summer Sale Ad Set 1"
            value={value.name}
            onChange={(e) => updateAdSet({ name: e.target.value })}
            maxLength={255}
          />
        </Form.Item>

        {/* Optimization Goal */}
        <Form.Item
          label={
            <Space>
              Optimization Goal
              <Tooltip title="What you want Meta to optimize for">
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          }
          required
        >
          <Select
            placeholder="Select optimization goal"
            value={value.optimization_goal}
            onChange={(optimization_goal) => updateAdSet({ optimization_goal })}
            options={getCompatibleGoals()}
            showSearch
          />
          {campaignObjective && (
            <Text type="secondary" className="block mt-1">
              Showing goals compatible with {campaignObjective}
            </Text>
          )}
        </Form.Item>

        {/* Billing Event */}
        <Form.Item
          label={
            <Space>
              Billing Event
              <Tooltip title="When you'll be charged for your ads">
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          }
          required
        >
          <Select
            placeholder="Select billing event"
            value={value.billing_event}
            onChange={(billing_event) => updateAdSet({ billing_event })}
            options={[
              { value: 'IMPRESSIONS', label: 'Impressions (Most Common)' },
              { value: 'LINK_CLICKS', label: 'Link Clicks' },
              { value: 'THRUPLAY', label: 'ThruPlay (Video Views)' },
              { value: 'PURCHASE', label: 'Purchase' },
            ]}
          />
        </Form.Item>

        {/* Ad Set Budget (if not using CBO) */}
        {!useCampaignBudget && (
          <>
            <Alert
              message="Ad Set Budget"
              description="Campaign Budget Optimization is disabled, so you must set a budget at the ad set level"
              type="info"
              showIcon
            />

            <Form.Item label="Budget Type" required>
              <Radio.Group
                value={value.daily_budget ? 'daily' : 'lifetime'}
                onChange={(e) => {
                  if (e.target.value === 'daily') {
                    updateAdSet({
                      daily_budget: value.daily_budget || 5000,
                      lifetime_budget: undefined,
                    });
                  } else {
                    updateAdSet({
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

            {value.daily_budget ? (
              <Form.Item label="Daily Budget" required>
                <InputNumber
                  prefix="$"
                  value={value.daily_budget ? value.daily_budget / 100 : undefined}
                  onChange={(val) =>
                    updateAdSet({ daily_budget: val ? Math.round(val * 100) : undefined })
                  }
                  min={1}
                  precision={2}
                  style={{ width: 200 }}
                />
                <Text type="secondary" className="ml-2">
                  (${((value.daily_budget || 0) / 100).toFixed(2)} per day)
                </Text>
              </Form.Item>
            ) : (
              <Form.Item label="Lifetime Budget" required>
                <InputNumber
                  prefix="$"
                  value={value.lifetime_budget ? value.lifetime_budget / 100 : undefined}
                  onChange={(val) =>
                    updateAdSet({ lifetime_budget: val ? Math.round(val * 100) : undefined })
                  }
                  min={1}
                  precision={2}
                  style={{ width: 200 }}
                />
                <Text type="secondary" className="ml-2">
                  (${((value.lifetime_budget || 0) / 100).toFixed(2)} total)
                </Text>
              </Form.Item>
            )}
          </>
        )}

        {/* Bid Amount (if bid strategy allows) */}
        <Form.Item
          label={
            <Space>
              Bid Amount (Optional)
              <Tooltip title="Manual bid amount - leave empty for automatic bidding">
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          }
        >
          <InputNumber
            prefix="$"
            value={value.bid_amount ? value.bid_amount / 100 : undefined}
            onChange={(val) =>
              updateAdSet({ bid_amount: val ? Math.round(val * 100) : undefined })
            }
            min={0.01}
            precision={2}
            style={{ width: 200 }}
            placeholder="Leave empty for automatic"
          />
          <Text type="secondary" className="ml-2">
            (optional)
          </Text>
        </Form.Item>

        {/* Frequency Cap */}
        <div>
          <Title level={5}>Frequency Cap (Optional)</Title>
          <Text type="secondary">
            Limit how often people see your ads
          </Text>

          <Form.Item label="Enable Frequency Cap" className="mt-2">
            <Switch
              checked={!!value.frequency_cap}
              onChange={(enabled) => {
                if (enabled) {
                  updateAdSet({
                    frequency_cap: { interval_days: 7, max_impressions: 3 },
                  });
                } else {
                  updateAdSet({ frequency_cap: undefined });
                }
              }}
            />
          </Form.Item>

          {value.frequency_cap && (
            <Space>
              <Form.Item label="Maximum Impressions">
                <InputNumber
                  min={1}
                  value={value.frequency_cap.max_impressions}
                  onChange={(max_impressions) =>
                    updateAdSet({
                      frequency_cap: {
                        ...value.frequency_cap!,
                        max_impressions: max_impressions || 1,
                      },
                    })
                  }
                />
              </Form.Item>

              <Form.Item label="Every (days)">
                <InputNumber
                  min={1}
                  max={90}
                  value={value.frequency_cap.interval_days}
                  onChange={(interval_days) =>
                    updateAdSet({
                      frequency_cap: {
                        ...value.frequency_cap!,
                        interval_days: interval_days || 1,
                      },
                    })
                  }
                />
              </Form.Item>
            </Space>
          )}

          {value.frequency_cap && (
            <Text type="secondary" className="block">
              People will see your ad maximum {value.frequency_cap.max_impressions} times every{' '}
              {value.frequency_cap.interval_days} days
            </Text>
          )}
        </div>

        {/* Ad Set Status */}
        <Form.Item label="Ad Set Status">
          <Radio.Group
            value={value.status || 'ACTIVE'}
            onChange={(e) => updateAdSet({ status: e.target.value })}
          >
            <Radio value="ACTIVE">Active</Radio>
            <Radio value="PAUSED">Paused</Radio>
          </Radio.Group>
        </Form.Item>

        {/* Optimization Tips */}
        {value.optimization_goal === 'OFFSITE_CONVERSIONS' && (
          <Alert
            message="Conversion Optimization"
            description="For best results with conversion optimization, make sure you have at least 50 conversions per week. Consider starting with Link Clicks or Landing Page Views if you have fewer conversions."
            type="info"
            showIcon
          />
        )}

        {value.optimization_goal === 'VALUE' && (
          <Alert
            message="Value Optimization"
            description="Value optimization requires passing purchase values to your Meta Pixel. Make sure your pixel is properly configured to track purchase values."
            type="info"
            showIcon
          />
        )}
      </Space>
    </Card>
  );
};
