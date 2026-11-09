export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface DashboardMetrics {
  total_stations: number;
  total_ports: number;
  total_capacity_kw: number;
  total_charging_sessions: number;
  current_demand_kw: number;
  forecasted_peak_demand_kw: number;
  peak_demand_time_window: string;
  average_station_utilization_percent: number;
  daily_energy_consumption_kwh: number;
  estimated_carbon_emissions_kg: number;
  overload_risk_stations_count: number;
  underutilized_stations_count: number;
  model_r2_score: number;
  model_mae_kw: number;
}

export interface ActualVsPredictedPoint {
  hour: string;
  hour_num: number;
  predicted_demand_kw: number;
  actual_demand_kw?: number;
  lower_bound_kw: number;
  upper_bound_kw: number;
  is_peak: boolean;
}

export interface HourlyEnergyPoint {
  hour: string;
  energy_kwh: number;
  tariff_rate: number;
  cost_usd: number;
}

export interface StationUtilizationItem {
  station_id: string;
  name: string;
  region: string;
  utilization_percent: number;
  peak_kw: number;
  capacity_kw: number;
  risk_level: string;
}

export interface HeatmapRow {
  hour: string;
  hour_num: number;
  Mon: number;
  Tue: number;
  Wed: number;
  Thu: number;
  Fri: number;
  Sat: number;
  Sun: number;
  [key: string]: any;
}

export interface RegionDemandItem {
  region: string;
  demand_kw: number;
  capacity_kw: number;
  utilization: number;
  station_count: number;
}

export interface EnergyTrendItem {
  date: string;
  energy_kwh: number;
  peak_demand_kw: number;
  sessions: number;
}

export interface CarbonTrendPoint {
  hour: string;
  emissions_kg: number;
  carbon_intensity: number;
  is_solar_window: boolean;
}

export interface DashboardVisualizations {
  actual_vs_predicted: ActualVsPredictedPoint[];
  hourly_energy: HourlyEnergyPoint[];
  station_utilization: StationUtilizationItem[];
  heatmap: HeatmapRow[];
  demand_by_region: RegionDemandItem[];
  energy_trends: EnergyTrendItem[];
  carbon_trends: CarbonTrendPoint[];
}

export interface Station {
  id: number;
  station_id: string;
  name: string;
  region: string;
  address?: string;
  latitude: number;
  longitude: number;
  charger_type: string;
  total_ports: number;
  max_power_kw: number;
  current_load_kw: number;
  utilization_rate: number;
  risk_level: 'Low' | 'Moderate' | 'High' | 'Critical';
  status: string;
  recommended_action?: string;
  created_at: string;
}

export interface ModelMetrics {
  model_name: string;
  mae: number;
  rmse: number;
  r2_score: number;
  mape: number;
  samples_trained: number;
  training_time_ms: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  impact_description: string;
}

export interface HourlyForecastItem {
  timestamp: string;
  hour: number;
  day_name: string;
  predicted_demand_kw: number;
  actual_demand_kw?: number;
  lower_bound_kw: number;
  upper_bound_kw: number;
  confidence_interval_percent: number;
  is_peak_hour: boolean;
  tariff_period: string;
  tariff_rate: number;
  carbon_intensity_kg_kwh: number;
}

export interface ForecastResponse {
  horizon_hours: number;
  model_used: string;
  generated_at: string;
  metrics: ModelMetrics;
  all_models_metrics: ModelMetrics[];
  hourly_forecast: HourlyForecastItem[];
  peak_demand_window: string;
  peak_demand_kw: number;
  total_energy_forecast_kwh: number;
  carbon_forecast_kg: number;
  feature_importance: FeatureImportance[];
  station_forecasts: any[];
}

export interface SimulationRequest {
  num_evs: number;
  num_stations: number;
  charger_capacity_kw: number;
  arrival_rate_per_hour: number;
  avg_charging_duration_min: number;
  peak_multiplier: number;
  battery_storage_kw: number;
}

export interface HourlySimPoint {
  hour: number;
  grid_demand_kw: number;
  bess_discharge_kw: number;
  active_evs: number;
  queue_wait_min: number;
  utilization_rate: number;
  overload_risk: boolean;
}

export interface SimulationResult {
  total_energy_kwh: number;
  peak_demand_kw: number;
  peak_hour: number;
  avg_station_utilization_percent: number;
  overload_probability_percent: number;
  avg_queue_delay_minutes: number;
  estimated_daily_cost_usd: number;
  bess_cost_savings_usd: number;
  estimated_carbon_kg: number;
  status_summary: string;
  hourly_simulation: HourlySimPoint[];
  station_stresses: any[];
  system_recommendations: string[];
}

export interface ScenarioMetricDelta {
  metric: string;
  baseline: number;
  scenario: number;
  delta: number;
  delta_percent: number;
  unit: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface ScenarioComparisonResponse {
  scenario_name: string;
  weather_applied: string;
  summary_verdict: string;
  metrics: ScenarioMetricDelta[];
  hourly_comparison: {
    hour: number;
    baseline_demand_kw: number;
    scenario_demand_kw: number;
    delta_kw: number;
    delta_percent: number;
    baseline_cost_usd: number;
    scenario_cost_usd: number;
  }[];
  key_findings: string[];
  capacity_planning_actions: string[];
}

export interface OptimizerRecommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  potential_savings: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  tag: string;
}

export interface OptimizerData {
  reference_session_kwh: number;
  cheapest_window: string;
  cheapest_rate_per_kwh: number;
  estimated_session_cost_cheapest: number;
  peak_window: string;
  peak_rate_per_kwh: number;
  estimated_session_cost_peak: number;
  potential_savings_usd: number;
  savings_percentage: number;
  cleanest_green_window: string;
  cleanest_carbon_intensity: number;
  carbon_saved_kg_per_session: number;
  load_balancing_pairs: any[];
  recommendations: OptimizerRecommendation[];
  hourly_price_carbon_profile: any[];
}

export interface FleetVehicle {
  vehicle_id: string;
  make_model: string;
  battery_capacity_kwh: number;
  current_soc_percent: number;
  target_soc_percent: number;
  arrival_hour: number;
  departure_hour: number;
  assigned_station_id: string;
}

export interface ScheduleItem {
  vehicle_id: string;
  make_model: string;
  station_id: string;
  start_hour: number;
  end_hour: number;
  duration_hours: number;
  allocated_power_kw: number;
  energy_delivered_kwh: number;
  scheduled_cost_usd: number;
  unmanaged_cost_usd: number;
  cost_savings_usd: number;
  is_deadline_met: boolean;
  status: string;
}

export interface FleetScheduleResult {
  total_vehicles_scheduled: number;
  all_deadlines_met: boolean;
  total_energy_kwh: number;
  optimized_cost_usd: number;
  unmanaged_cost_usd: number;
  total_savings_usd: number;
  savings_percent: number;
  peak_draw_kw: number;
  schedules: ScheduleItem[];
  hourly_fleet_load: any[];
  scheduling_notes: string[];
}

export interface CopilotResponse {
  query: string;
  answer: string;
  intent_detected: string;
  confidence_score: number;
  data_points: Record<string, any>;
  suggested_actions: string[];
  follow_up_questions: string[];
}

export interface CarbonData {
  status: string;
  data_source_disclosure: string;
  total_energy_forecast_kwh: number;
  total_carbon_emissions_kg: number;
  ice_baseline_emissions_kg: number;
  net_carbon_avoided_kg: number;
  decarbonization_rate_percent: number;
  clean_charging_window: string;
  clean_window_carbon_factor: number;
  peak_window_carbon_factor: number;
  hourly_carbon_curve: any[];
  reduction_scenarios: {
    name: string;
    description: string;
    emissions_reduction_kg: number;
    equivalent_trees_planted: number;
  }[];
}
