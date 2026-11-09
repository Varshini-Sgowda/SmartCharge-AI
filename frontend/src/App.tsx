import React, { useState } from 'react';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ForecastingPage } from './pages/ForecastingPage';
import { StationMapPage } from './pages/StationMapPage';
import { StationsPage } from './pages/StationsPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { ScenariosPage } from './pages/ScenariosPage';
import { OptimizerPage } from './pages/OptimizerPage';
import { FleetPage } from './pages/FleetPage';
import { CopilotPage } from './pages/CopilotPage';
import { CarbonPage } from './pages/CarbonPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [currentRole, setCurrentRole] = useState<string>('Grid Operator');

  const renderActivePage = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage onEnterApp={() => setActiveTab('dashboard')} />;
      case 'dashboard':
        return <DashboardPage onNavigateTab={(tab) => setActiveTab(tab)} />;
      case 'forecasting':
        return <ForecastingPage />;
      case 'station-map':
        return <StationMapPage />;
      case 'stations':
        return <StationsPage />;
      case 'digital-twin':
        return <DigitalTwinPage />;
      case 'scenarios':
        return <ScenariosPage />;
      case 'optimizer':
        return <OptimizerPage />;
      case 'fleet':
        return <FleetPage />;
      case 'copilot':
        return <CopilotPage />;
      case 'carbon':
        return <CarbonPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage currentRole={currentRole} setCurrentRole={setCurrentRole} />;
      default:
        return <DashboardPage onNavigateTab={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      currentRole={currentRole}
      setCurrentRole={setCurrentRole}
    >
      {renderActivePage()}
    </Layout>
  );
};

export default App;
