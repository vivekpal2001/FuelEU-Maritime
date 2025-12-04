-- Seed data per PDF KPIs Dataset specification
-- Run this after creating tables

-- Clear existing data
DELETE FROM pool_members;
DELETE FROM pools;
DELETE FROM bank_entries;
DELETE FROM ship_compliance;
DELETE FROM routes;

-- Insert the 5 routes per PDF KPIs Dataset
INSERT INTO routes (route_id, vessel_type, fuel_type, year, ghg_intensity, fuel_consumption, distance, total_emissions, is_baseline) VALUES
  ('R001', 'Container', 'HFO', 2024, 91.0, 5000, 12000, 4500, TRUE),
  ('R002', 'BulkCarrier', 'LNG', 2024, 88.0, 4800, 11500, 4200, FALSE),
  ('R003', 'Tanker', 'MGO', 2024, 93.5, 5100, 12500, 4700, FALSE),
  ('R004', 'RoRo', 'HFO', 2025, 89.2, 4900, 11800, 4300, FALSE),
  ('R005', 'Container', 'LNG', 2025, 90.5, 4950, 11900, 4400, FALSE);

-- Calculate and insert ship compliance records
-- Target = 89.3368 gCO2e/MJ
-- Energy = fuelConsumption * 41000 MJ/t
-- CB = (Target - Actual) * Energy

-- R001: (89.3368 - 91.0) * 5000 * 41000 = -34,095,600 gCO2eq
INSERT INTO ship_compliance (ship_id, year, cb_gco2eq) VALUES ('R001', 2024, -34095600);

-- R002: (89.3368 - 88.0) * 4800 * 41000 = 26,316,864 gCO2eq
INSERT INTO ship_compliance (ship_id, year, cb_gco2eq) VALUES ('R002', 2024, 26316864);

-- R003: (89.3368 - 93.5) * 5100 * 41000 = -87,051,960 gCO2eq
INSERT INTO ship_compliance (ship_id, year, cb_gco2eq) VALUES ('R003', 2024, -87051960);

-- R004: (89.3368 - 89.2) * 4900 * 41000 = 274,811.2 gCO2eq
INSERT INTO ship_compliance (ship_id, year, cb_gco2eq) VALUES ('R004', 2025, 274811.2);

-- R005: (89.3368 - 90.5) * 4950 * 41000 = -23,608,974 gCO2eq
INSERT INTO ship_compliance (ship_id, year, cb_gco2eq) VALUES ('R005', 2025, -23608974);

-- Add bank entries for ships with positive CB (R002 and R004)
-- Bank 50% of surplus for R002
INSERT INTO bank_entries (ship_id, year, amount_gco2eq, type) VALUES ('R002', 2024, 13158432, 'bank');

-- Bank 50% of surplus for R004
INSERT INTO bank_entries (ship_id, year, amount_gco2eq, type) VALUES ('R004', 2025, 137405.6, 'bank');
