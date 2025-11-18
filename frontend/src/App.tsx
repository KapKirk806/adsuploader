import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Templates from './pages/Templates';
import Jobs from './pages/Jobs';
import Layout from './components/Layout';
import './App.css';

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="upload" element={<Upload />} />
            <Route path="templates" element={<Templates />} />
            <Route path="jobs" element={<Jobs />} />
          </Route>
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
