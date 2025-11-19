import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Space,
  Typography,
  Alert,
  Divider,
  Steps,
  Card,
  message,
  Spin,
} from 'antd';
import {
  SaveOutlined,
  ThunderboltOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { CampaignTemplate } from '../../types/metaAds';
import { CampaignConfigSection } from './CampaignConfigSection';
import { PixelAttributionSection } from './PixelAttributionSection';
import { TargetingSection } from './TargetingSection';
import { PlacementsSection } from './PlacementsSection';
import { AdSetConfigSection } from './AdSetConfigSection';
import { CreativeConfigSection } from './CreativeConfigSection';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Step } = Steps;

interface AdvancedTemplateFormProps {
  initialTemplate?: Partial<CampaignTemplate>;
  onSubmit?: (template: CampaignTemplate) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

export const AdvancedTemplateForm: React.FC<AdvancedTemplateFormProps> = ({
  initialTemplate,
  onSubmit,
  onCancel,
  mode = 'create',
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Template state
  const [template, setTemplate] = useState<Partial<CampaignTemplate>>(
    initialTemplate || {
      name: '',
      description: '',
      is_default: false,
      campaign_config: {
        name: '',
        objective: 'OUTCOME_SALES',
        status: 'ACTIVE',
        buying_type: 'AUCTION',
        special_ad_categories: ['NONE'],
        bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
        daily_budget: 5000,
      },
      adset_config: {
        name: '',
        status: 'ACTIVE',
        optimization_goal: 'OFFSITE_CONVERSIONS',
        billing_event: 'IMPRESSIONS',
        attribution_spec: {
          click_window: '7d_click',
        },
        targeting: {
          age_min: 18,
          age_max: 65,
          geo_locations: {
            countries: ['US'],
          },
          advantage_audience: {
            enabled: true,
            targeting_expansion: 'AUTOMATIC',
          },
        },
        placements: {
          advantage_placements: {
            enabled: true,
          },
        },
      },
      ad_config: {
        name: '',
        status: 'ACTIVE',
        creative: {
          name: '',
        },
      },
    }
  );

  const updateTemplate = (updates: Partial<CampaignTemplate>) => {
    setTemplate({ ...template, ...updates });
    setValidationErrors([]); // Clear errors when user makes changes
  };

  const handleSubmit = async () => {
    setLoading(true);
    setValidationErrors([]);
    setValidationWarnings([]);

    try {
      const response = await axios.post('/api/templates', template);

      if (response.data.warnings) {
        setValidationWarnings(response.data.warnings);
      }

      message.success('Template saved successfully!');
      onSubmit?.(response.data.template);
    } catch (error: any) {
      if (error.response?.data?.error) {
        const errorMessage = error.response.data.error;
        // Split validation errors if they're concatenated with semicolons
        const errors = errorMessage.split('; ').filter(Boolean);
        setValidationErrors(errors);
        message.error('Validation failed. Please fix the errors and try again.');
      } else {
        message.error('Failed to save template. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: 'Basic Info',
      description: 'Template name and description',
    },
    {
      title: 'Campaign',
      description: 'Objective, budget, bid strategy',
    },
    {
      title: 'Tracking',
      description: 'Pixel and attribution',
    },
    {
      title: 'Targeting',
      description: 'Audience selection',
    },
    {
      title: 'Placements',
      description: 'Where ads show',
    },
    {
      title: 'Ad Set',
      description: 'Optimization and budget',
    },
    {
      title: 'Creative',
      description: 'Ad content and format',
    },
  ];

  const isConversionObjective =
    template.campaign_config?.objective === 'OUTCOME_SALES' ||
    template.campaign_config?.objective === 'OUTCOME_LEADS';

  const hasSpecialAdCategory = template.campaign_config?.special_ad_categories?.some(
    (cat) => cat !== 'NONE'
  );

  return (
    <div>
      {/* Header */}
      <Card className="mb-4">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title level={2}>
            <Space>
              <ThunderboltOutlined />
              {mode === 'create' ? 'Create Advanced Template' : 'Edit Template'}
            </Space>
          </Title>
          <Paragraph>
            Configure all Meta Ads features including Advantage+ Audience, Placements, and Creative
            enhancements for maximum performance in 2025.
          </Paragraph>
        </Space>
      </Card>

      {/* Progress Steps */}
      <Card className="mb-4">
        <Steps current={currentStep} size="small">
          {steps.map((step) => (
            <Step
              key={step.title}
              title={step.title}
              description={step.description}
            />
          ))}
        </Steps>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert
          message="Validation Errors"
          description={
            <ul className="mb-0">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          }
          type="error"
          showIcon
          icon={<WarningOutlined />}
          closable
          className="mb-4"
        />
      )}

      {/* Validation Warnings */}
      {validationWarnings.length > 0 && (
        <Alert
          message="Recommendations"
          description={
            <ul className="mb-0">
              {validationWarnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          }
          type="warning"
          showIcon
          closable
          className="mb-4"
        />
      )}

      <Spin spinning={loading}>
        {/* Step 0: Basic Info */}
        {currentStep === 0 && (
          <Card>
            <Title level={4}>Template Information</Title>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Form.Item label="Template Name" required>
                <Input
                  placeholder="e.g., E-commerce Conversion Campaign"
                  value={template.name}
                  onChange={(e) => updateTemplate({ name: e.target.value })}
                  size="large"
                />
              </Form.Item>

              <Form.Item label="Description">
                <TextArea
                  placeholder="Describe what this template is for..."
                  value={template.description}
                  onChange={(e) => updateTemplate({ description: e.target.value })}
                  rows={4}
                />
              </Form.Item>
            </Space>
          </Card>
        )}

        {/* Step 1: Campaign Config */}
        {currentStep === 1 && (
          <CampaignConfigSection
            value={template.campaign_config}
            onChange={(campaign_config) => updateTemplate({ campaign_config })}
          />
        )}

        {/* Step 2: Pixel & Attribution */}
        {currentStep === 2 && (
          <PixelAttributionSection
            pixelConfig={template.adset_config?.pixel_config}
            attributionSpec={template.adset_config?.attribution_spec}
            onPixelChange={(pixel_config) =>
              updateTemplate({
                adset_config: {
                  ...template.adset_config!,
                  pixel_config,
                },
              })
            }
            onAttributionChange={(attribution_spec) =>
              updateTemplate({
                adset_config: {
                  ...template.adset_config!,
                  attribution_spec,
                },
              })
            }
            requiresPixel={isConversionObjective}
          />
        )}

        {/* Step 3: Targeting */}
        {currentStep === 3 && (
          <TargetingSection
            value={template.adset_config?.targeting}
            onChange={(targeting) =>
              updateTemplate({
                adset_config: {
                  ...template.adset_config!,
                  targeting,
                },
              })
            }
            specialAdCategory={hasSpecialAdCategory}
          />
        )}

        {/* Step 4: Placements */}
        {currentStep === 4 && (
          <PlacementsSection
            value={template.adset_config?.placements}
            onChange={(placements) =>
              updateTemplate({
                adset_config: {
                  ...template.adset_config!,
                  placements,
                },
              })
            }
          />
        )}

        {/* Step 5: Ad Set Config */}
        {currentStep === 5 && (
          <AdSetConfigSection
            value={template.adset_config}
            onChange={(adset_config) =>
              updateTemplate({
                adset_config: {
                  ...template.adset_config,
                  ...adset_config,
                },
              })
            }
            campaignObjective={template.campaign_config?.objective}
            useCampaignBudget={template.campaign_config?.campaign_budget_optimization?.enabled}
          />
        )}

        {/* Step 6: Creative */}
        {currentStep === 6 && (
          <CreativeConfigSection
            value={template.ad_config}
            onChange={(ad_config) => updateTemplate({ ad_config })}
          />
        )}

        {/* Navigation */}
        <Card className="mt-4">
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space>
              {currentStep > 0 && (
                <Button onClick={() => setCurrentStep(currentStep - 1)}>
                  Previous
                </Button>
              )}
              {currentStep === 0 && onCancel && (
                <Button onClick={onCancel}>Cancel</Button>
              )}
            </Space>

            <Space>
              {currentStep < steps.length - 1 ? (
                <Button type="primary" onClick={() => setCurrentStep(currentStep + 1)}>
                  Next
                </Button>
              ) : (
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSubmit}
                  loading={loading}
                  size="large"
                >
                  {mode === 'create' ? 'Create Template' : 'Update Template'}
                </Button>
              )}
            </Space>
          </Space>

          {/* Progress Indicator */}
          <Divider />
          <Text type="secondary">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
          </Text>
        </Card>
      </Spin>
    </div>
  );
};
