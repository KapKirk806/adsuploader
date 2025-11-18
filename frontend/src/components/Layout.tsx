import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout as AntLayout,
  Menu,
  Button,
  Dropdown,
  Avatar,
  Space,
} from 'antd';
import {
  DashboardOutlined,
  UploadOutlined,
  FileTextOutlined,
  UnorderedListOutlined,
  FacebookOutlined,
  TeamOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useStore } from '../store/useStore';
import { api } from '../services/api';

const { Header, Sider, Content } = AntLayout;

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useStore();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/upload',
      icon: <UploadOutlined />,
      label: 'Upload Ads',
    },
    {
      key: '/templates',
      icon: <FileTextOutlined />,
      label: 'Templates',
    },
    {
      key: '/jobs',
      icon: <UnorderedListOutlined />,
      label: 'Jobs',
    },
    {
      key: '/ad-accounts',
      icon: <FacebookOutlined />,
      label: 'Ad Accounts',
    },
    {
      key: '/team',
      icon: <TeamOutlined />,
      label: 'Team',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
  ];

  const handleUserMenuClick = async ({ key }: { key: string }) => {
    if (key === 'logout') {
      await api.logout();
      useStore.getState().setUser(null);
      navigate('/login');
    } else if (key === 'profile') {
      navigate('/profile');
    } else if (key === 'settings') {
      navigate('/settings');
    }
  };

  return (
    <AntLayout className="app-layout">
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo" style={{ textAlign: 'center', color: 'white', paddingTop: '8px' }}>
          {collapsed ? 'AU' : 'AdsUploader'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <AntLayout>
        <Header style={{ padding: '0 16px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }}>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar src={user?.avatar_url} icon={<UserOutlined />} />
              <span>{user?.name || 'User'}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: '#fff' }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
}
