-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    facebook_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    avatar_url TEXT,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on facebook_id for faster lookups
CREATE INDEX idx_users_facebook_id ON users(facebook_id);
CREATE INDEX idx_users_email ON users(email);

-- Ad Accounts table
CREATE TABLE IF NOT EXISTS ad_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    facebook_ad_account_id VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    currency VARCHAR(10),
    timezone VARCHAR(50),
    account_status VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, facebook_ad_account_id)
);

CREATE INDEX idx_ad_accounts_user_id ON ad_accounts(user_id);
CREATE INDEX idx_ad_accounts_fb_id ON ad_accounts(facebook_ad_account_id);

-- Campaign Templates table
CREATE TABLE IF NOT EXISTS campaign_templates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    objective VARCHAR(50),
    campaign_config JSONB,
    adset_config JSONB,
    ad_config JSONB,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_templates_user_id ON campaign_templates(user_id);

-- Upload Jobs table
CREATE TABLE IF NOT EXISTS upload_jobs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ad_account_id INTEGER REFERENCES ad_accounts(id) ON DELETE CASCADE,
    template_id INTEGER REFERENCES campaign_templates(id) ON DELETE SET NULL,
    job_type VARCHAR(50) DEFAULT 'bulk_upload',
    status VARCHAR(50) DEFAULT 'pending',
    total_ads INTEGER DEFAULT 0,
    completed_ads INTEGER DEFAULT 0,
    failed_ads INTEGER DEFAULT 0,
    error_log JSONB,
    campaign_id VARCHAR(255),
    adset_id VARCHAR(255),
    progress_percentage INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_jobs_user_id ON upload_jobs(user_id);
CREATE INDEX idx_jobs_status ON upload_jobs(status);
CREATE INDEX idx_jobs_created_at ON upload_jobs(created_at DESC);

-- Creatives table
CREATE TABLE IF NOT EXISTS creatives (
    id SERIAL PRIMARY KEY,
    upload_job_id INTEGER REFERENCES upload_jobs(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255),
    file_type VARCHAR(50),
    file_size INTEGER,
    file_url TEXT,
    thumbnail_url TEXT,
    facebook_creative_id VARCHAR(255),
    facebook_ad_id VARCHAR(255),
    aspect_ratio VARCHAR(20),
    width INTEGER,
    height INTEGER,
    duration INTEGER,
    variation_group VARCHAR(100),
    variation_number INTEGER,
    status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_creatives_job_id ON creatives(upload_job_id);
CREATE INDEX idx_creatives_user_id ON creatives(user_id);
CREATE INDEX idx_creatives_variation_group ON creatives(variation_group);

-- Team Members table (for multi-user access)
CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    team_owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    permissions JSONB,
    is_active BOOLEAN DEFAULT true,
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, team_owner_id)
);

CREATE INDEX idx_team_members_owner ON team_members(team_owner_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

-- Activity Logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INTEGER,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Google Drive Connections table
CREATE TABLE IF NOT EXISTS google_drive_connections (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX idx_google_drive_user_id ON google_drive_connections(user_id);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_accounts_updated_at BEFORE UPDATE ON ad_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON campaign_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON upload_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creatives_updated_at BEFORE UPDATE ON creatives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_drive_updated_at BEFORE UPDATE ON google_drive_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
