import {
  DashboardMetrics,
  DashboardVisualizations,
  Station,
  ForecastResponse,
  SimulationRequest,
  SimulationResult,
  ScenarioComparisonResponse,
  OptimizerData,
  FleetVehicle,
  FleetScheduleResult,
  CopilotResponse,
  CarbonData,
  User
} from '../types';

const API_BASE = '/api';

export const api = {
  // Auth
  async login(username_or_email: string, password: string):Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username_or_email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`);
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  // Dashboard
  async getMetrics(): Promise<DashboardMetrics> {
    const res = await fetch(`${API_BASE}/dashboard/metrics`);
    if (!res.ok) throw new Error('Failed to fetch metrics');
    return res.json();
  },

  async getVisualizations(): Promise<DashboardVisualizations> {
    const res = await fetch(`${API_BASE}/dashboard/visualizations`);
    if (!res.ok) throw new Error('Failed to fetch visualizations');
    return res.json();
  },

  // Stations
  async getStations(): Promise<Station[]> {
    const res = await fetch(`${API_BASE}/stations`);
    if (!res.ok) throw new Error('Failed to fetch stations');
    return res.json();
  },

  // Forecasting
  async getForecast(horizon_hours: number = 24, model_type: string = 'RandomForest', station_id?: string): Promise<ForecastResponse> {
    let url = `${API_BASE}/forecast?horizon_hours=${horizon_hours}&model_type=${model_type}`;
    if (station_id) url += `&station_id=${station_id}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch forecast');
    return res.json();
  },

  // Digital Twin Simulator
  async runSimulation(params: SimulationRequest): Promise<SimulationResult> {
    const res = await fetch(`${API_BASE}/simulator/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Simulation failed');
    return res.json();
  },

  // What-If Scenario Lab
  async evaluateScenario(params: any): Promise<ScenarioComparisonResponse> {
    const res = await fetch(`${API_BASE}/scenarios/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Scenario evaluation failed');
    return res.json();
  },

  // Smart Charging Optimizer
  async getOptimizerData(session_kwh: number = 50): Promise<OptimizerData> {
    const res = await fetch(`${API_BASE}/optimizer/recommendations?session_kwh=${session_kwh}`);
    if (!res.ok) throw new Error('Failed to fetch optimizer recommendations');
    return res.json();
  },

  // Fleet Management
  async getFleetVehicles(): Promise<FleetVehicle[]> {
    const res = await fetch(`${API_BASE}/fleet/vehicles`);
    if (!res.ok) throw new Error('Failed to fetch fleet vehicles');
    return res.json();
  },

  async scheduleFleet(max_power_kw: number = 350, objective: string = 'Cost & Peak Avoidance'): Promise<FleetScheduleResult> {
    const res = await fetch(`${API_BASE}/fleet/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ max_station_power_kw: max_power_kw, optimization_objective: objective }),
    });
    if (!res.ok) throw new Error('Fleet scheduling failed');
    return res.json();
  },

  // Copilot
  async queryCopilot(query: string): Promise<CopilotResponse> {
    const res = await fetch(`${API_BASE}/copilot/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error('Copilot query failed');
    return res.json();
  },

  // Carbon
  async getCarbonIntelligence(): Promise<CarbonData> {
    const res = await fetch(`${API_BASE}/carbon/metrics`);
    if (!res.ok) throw new Error('Failed to fetch carbon intelligence');
    return res.json();
  },

  // Reports download URLs
  getPdfReportUrl(): string {
    return `${API_BASE}/reports/pdf`;
  },
  getExcelReportUrl(): string {
    return `${API_BASE}/reports/excel`;
  },
  getCsvReportUrl(): string {
    return `${API_BASE}/reports/csv`;
  }
};
