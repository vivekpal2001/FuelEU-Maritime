-- Seed data for FuelEU Maritime Compliance Platform
-- Run this after creating tables

-- Insert fuel types
INSERT INTO fuel_types (name, ghg_factor, color) VALUES
  ('VLSFO', 3.151, 'hsl(210, 70%, 50%)'),
  ('HFO', 3.206, 'hsl(25, 70%, 50%)'),
  ('LNG', 2.755, 'hsl(145, 70%, 45%)'),
  ('Methanol', 1.375, 'hsl(280, 60%, 55%)'),
  ('Ammonia', 0, 'hsl(175, 70%, 45%)'),
  ('Hydrogen', 0, 'hsl(195, 80%, 50%)')
ON CONFLICT (name) DO NOTHING;

-- Insert compliance thresholds
INSERT INTO compliance_thresholds (year, threshold) VALUES
  (2025, 89.34),
  (2030, 80.41),
  (2035, 71.48),
  (2040, 62.55),
  (2050, 44.69)
ON CONFLICT (year) DO NOTHING;

-- Insert vessels
INSERT INTO vessels (id, name, imo, type, flag, capacity, compliance_balance, ghg_intensity, status) VALUES
  ('v1', 'Atlantic Pioneer', '9876543', 'Container', 'NL', 14500, 245.8, 82.4, 'compliant'),
  ('v2', 'Nordic Voyager', '9876544', 'Bulk Carrier', 'NO', 82000, -45.2, 94.6, 'at-risk'),
  ('v3', 'Mediterranean Star', '9876545', 'Tanker', 'GR', 115000, -128.5, 102.3, 'non-compliant'),
  ('v4', 'Baltic Express', '9876546', 'RoRo', 'SE', 4200, 178.3, 78.9, 'compliant'),
  ('v5', 'Pacific Guardian', '9876547', 'Container', 'DE', 18200, 312.6, 76.2, 'compliant'),
  ('v6', 'Arctic Horizon', '9876548', 'LNG Carrier', 'FR', 174000, 89.4, 85.1, 'compliant')
ON CONFLICT (id) DO NOTHING;

-- Insert voyages
INSERT INTO voyages (id, vessel_id, departure_port, arrival_port, departure_date, arrival_date, distance, fuel_consumed, fuel_type, ghg_intensity, compliance_balance, status, co2_emissions, energy_used) VALUES
  ('voy1', 'v1', 'Rotterdam', 'Singapore', '2024-11-01', '2024-11-28', 8420, 2840, 'VLSFO', 82.4, 45.2, 'compliant', 8945, 108500),
  ('voy2', 'v1', 'Singapore', 'Shanghai', '2024-11-30', '2024-12-05', 2320, 785, 'VLSFO', 81.2, 18.6, 'compliant', 2468, 29950),
  ('voy3', 'v2', 'Newcastle', 'Hamburg', '2024-11-15', '2024-11-18', 580, 425, 'HFO', 96.8, -22.4, 'at-risk', 1365, 16200),
  ('voy4', 'v3', 'Jeddah', 'Piraeus', '2024-11-10', '2024-11-18', 1840, 1520, 'HFO', 104.5, -68.2, 'non-compliant', 4880, 58000),
  ('voy5', 'v4', 'Gothenburg', 'Kiel', '2024-11-20', '2024-11-21', 280, 95, 'LNG', 72.4, 28.5, 'compliant', 285, 3620),
  ('voy6', 'v5', 'Los Angeles', 'Tokyo', '2024-10-25', '2024-11-08', 5450, 1980, 'VLSFO', 76.2, 82.4, 'compliant', 6227, 75500)
ON CONFLICT (id) DO NOTHING;

-- Insert pool groups
INSERT INTO pool_groups (id, name, total_balance, status, created_at) VALUES
  ('p1', 'North Sea Alliance', 736.7, 'active', '2024-01-15'),
  ('p2', 'Mediterranean Coalition', -173.7, 'active', '2024-03-22')
ON CONFLICT (id) DO NOTHING;

-- Insert pool group vessels
INSERT INTO pool_group_vessels (pool_id, vessel_id) VALUES
  ('p1', 'v1'),
  ('p1', 'v4'),
  ('p1', 'v5'),
  ('p2', 'v2'),
  ('p2', 'v3')
ON CONFLICT (pool_id, vessel_id) DO NOTHING;

-- Insert banking transactions
INSERT INTO banking_transactions (id, type, amount, from_vessel_id, to_vessel_id, date, status, description) VALUES
  ('t1', 'deposit', 125.5, NULL, 'v1', '2024-11-28', 'completed', 'Q4 compliance surplus banked'),
  ('t2', 'transfer', 45.0, 'v5', 'v2', '2024-11-25', 'completed', 'Inter-fleet balance transfer'),
  ('t3', 'withdrawal', 68.2, 'v3', NULL, '2024-11-20', 'pending', 'Compliance deficit coverage')
ON CONFLICT (id) DO NOTHING;
