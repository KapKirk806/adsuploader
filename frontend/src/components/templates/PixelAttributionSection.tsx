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
  Radio,
} from 'antd';
import { InfoCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { PixelConfig, AttributionSpec } from '../../types/metaAds';

const { Text, Title, Paragraph } = Typography;

interface PixelAttributionSectionProps {
  pixelConfig?: PixelConfig;
  attributionSpec?: AttributionSpec;
  onPixelChange?: (config: PixelConfig | undefined) => void;
  onAttributionChange?: (spec: AttributionSpec) => void;
  requiresPixel?: boolean;
}

export const PixelAttributionSection: React.FC<PixelAttributionSectionProps> = ({
  pixelConfig,
  attributionSpec = { click_window: '7d_click' },
  onPixelChange,
  onAttributionChange,
  requiresPixel = false,
}) => {
  const [pixelEnabled, setPixelEnabled] = React.useState(!!pixelConfig);

  const updatePixel = (updates: Partial<PixelConfig>) => {
    if (pixelConfig) {
      onPixelChange?.({ ...pixelConfig, ...updates });
    }
  };

  const updateAttribution = (updates: Partial<AttributionSpec>) => {
    onAttributionChange?.({ ...attributionSpec, ...updates });
  };

  const handlePixelToggle = (enabled: boolean) => {
    setPixelEnabled(enabled);
    if (enabled) {
      onPixelChange?.({
        pixel_id: '',
        capi_integration: { enabled: false },
      });
    } else {
      onPixelChange?.(undefined);
    }
  };

  return (
    <Card title={<Title level={4}>Pixel & Attribution</Title>} className="mb-4">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Meta Pixel */}
        <div>
          <Form.Item
            label={
              <Space>
                Meta Pixel
                <Tooltip title="Track conversions and optimize for website actions">
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
          >
            <Switch
              checked={pixelEnabled}
              onChange={handlePixelToggle}
              disabled={requiresPixel}
            />
            <Text type="secondary" className="ml-2">
              {pixelEnabled ? 'Pixel tracking enabled' : 'No pixel tracking'}
            </Text>
          </Form.Item>

          {requiresPixel && !pixelEnabled && (
            <Alert
              message="Pixel Required"
              description="This objective requires a Meta Pixel to track conversions"
              type="error"
              showIcon
              className="mb-3"
            />
          )}

          {pixelEnabled && (
            <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 16 }}>
              {/* Pixel ID */}
              <Form.Item
                label="Pixel ID"
                required
                help="Find your Pixel ID in Meta Events Manager"
              >
                <Input
                  placeholder="e.g., 123456789012345"
                  value={pixelConfig?.pixel_id}
                  onChange={(e) => updatePixel({ pixel_id: e.target.value })}
                  maxLength={20}
                />
              </Form.Item>

              {/* Standard Event */}
              <Form.Item
                label={
                  <Space>
                    Standard Event
                    <Tooltip title="The Meta standard event to optimize for">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                }
              >
                <Select
                  placeholder="Select standard event (optional)"
                  value={pixelConfig?.standard_event}
                  onChange={(standard_event) => updatePixel({ standard_event })}
                  allowClear
                  options={[
                    { value: 'Purchase', label: 'Purchase' },
                    { value: 'Lead', label: 'Lead' },
                    { value: 'CompleteRegistration', label: 'Complete Registration' },
                    { value: 'AddToCart', label: 'Add to Cart' },
                    { value: 'AddToWishlist', label: 'Add to Wishlist' },
                    { value: 'InitiateCheckout', label: 'Initiate Checkout' },
                    { value: 'AddPaymentInfo', label: 'Add Payment Info' },
                    { value: 'ViewContent', label: 'View Content' },
                    { value: 'Search', label: 'Search' },
                    { value: 'Contact', label: 'Contact' },
                    { value: 'Subscribe', label: 'Subscribe' },
                  ]}
                />
              </Form.Item>

              {/* Custom Event */}
              <Form.Item
                label={
                  <Space>
                    Custom Event Type
                    <Tooltip title="Custom event name (if not using standard events)">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                }
              >
                <Input
                  placeholder="e.g., CustomPurchase"
                  value={pixelConfig?.custom_event_type}
                  onChange={(e) => updatePixel({ custom_event_type: e.target.value })}
                />
              </Form.Item>

              {/* Conversions API (CAPI) */}
              <Form.Item
                label={
                  <Space>
                    Conversions API (CAPI)
                    <Tooltip title="Server-side tracking for better accuracy (recommended for 2025)">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                }
              >
                <Switch
                  checked={pixelConfig?.capi_integration?.enabled}
                  onChange={(enabled) =>
                    updatePixel({
                      capi_integration: {
                        ...pixelConfig?.capi_integration,
                        enabled,
                      },
                    })
                  }
                />
                <Text type="secondary" className="ml-2">
                  {pixelConfig?.capi_integration?.enabled
                    ? 'CAPI enabled - Server-side tracking active'
                    : 'CAPI disabled - Browser-only tracking'}
                </Text>
              </Form.Item>

              {pixelConfig?.capi_integration?.enabled && (
                <Form.Item
                  label="CAPI Access Token"
                  help="Optional: Server-side API access token"
                >
                  <Input.Password
                    placeholder="Enter CAPI access token (optional)"
                    value={pixelConfig?.capi_integration?.access_token}
                    onChange={(e) =>
                      updatePixel({
                        capi_integration: {
                          ...pixelConfig?.capi_integration,
                          access_token: e.target.value,
                        },
                      })
                    }
                  />
                </Form.Item>
              )}

              <Alert
                message="Best Practice (2025)"
                description="Use Meta Pixel + Conversions API together for most accurate tracking and best performance"
                type="info"
                showIcon
              />
            </Space>
          )}
        </div>

        {/* Attribution Windows */}
        <div>
          <Title level={5}>Attribution Windows</Title>
          <Paragraph type="secondary">
            How long after someone sees or clicks your ad should conversions be attributed to it
          </Paragraph>

          {/* Click Attribution */}
          <Form.Item
            label={
              <Space>
                Click Attribution Window
                <Tooltip title="Track conversions up to this many days after ad click">
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
            required
          >
            <Radio.Group
              value={attributionSpec.click_window}
              onChange={(e) => updateAttribution({ click_window: e.target.value })}
            >
              <Radio value="1d_click">1 day</Radio>
              <Radio value="7d_click">7 days (Recommended)</Radio>
            </Radio.Group>
          </Form.Item>

          {/* View Attribution */}
          <Form.Item
            label={
              <Space>
                View Attribution Window
                <Tooltip title="Track conversions up to this many days after ad view">
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
          >
            <Radio.Group
              value={attributionSpec.view_window || 'none'}
              onChange={(e) => {
                if (e.target.value === 'none') {
                  const { view_window, ...rest } = attributionSpec;
                  onAttributionChange?.(rest);
                } else {
                  updateAttribution({ view_window: e.target.value });
                }
              }}
            >
              <Radio value="none">None (Recommended for 2025)</Radio>
              <Radio value="1d_view">1 day</Radio>
              <Radio value="7d_view">7 days</Radio>
            </Radio.Group>
          </Form.Item>

          {attributionSpec.view_window && (
            <Alert
              message={
                <Space>
                  <WarningOutlined />
                  View Attribution Deprecation Warning
                </Space>
              }
              description="Meta is deprecating view-through attribution in 2026. Consider using click attribution only for future-proof campaigns."
              type="warning"
              showIcon
              closable
              className="mt-2"
            />
          )}

          {/* Attribution Explanation */}
          <Alert
            message="Attribution Settings Explained"
            description={
              <div>
                <p><strong>Click Attribution:</strong> Conversions are counted if they happen within the selected window after someone clicks your ad.</p>
                <p><strong>View Attribution:</strong> Conversions are counted if they happen within the selected window after someone views your ad (without clicking).</p>
                <p className="mb-0"><strong>Recommended:</strong> 7-day click attribution provides a good balance between accuracy and credit for your ads.</p>
              </div>
            }
            type="info"
            className="mt-3"
          />
        </div>
      </Space>
    </Card>
  );
};
