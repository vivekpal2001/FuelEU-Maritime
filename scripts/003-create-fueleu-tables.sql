-- FuelEU Maritime Compliance Database Schema (Per PDF Specification)
-- This script creates the exact tables required by the PDF

-- Routes table (per PDF specification)
CREATE TABLE IF NOT EXISTS routes (
  id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  route_id VARCHAR(20) UNIQUE NOT NULL,
  vessel_type VARCHAR(100) NOT NULL,
  fuel_type VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL,
  ghg_intensity DECIMAL(10, 4) NOT NULL,
  fuel_consumption DECIMAL(10, 2) NOT NULL,
  distance DECIMAL(10, 2) NOT NULL,
  total_emissions DECIMAL(10, 2) NOT NULL,
  is_baseline BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ship compliance table (per PDF specification)
CREATE TABLE IF NOT EXISTS ship_compliance (
  id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ship_id VARCHAR(20) NOT NULL,
  year INTEGER NOT NULL,
  cb_gco2eq DECIMAL(20, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(ship_id, year)
);

-- Bank entries table (per PDF specification)
CREATE TABLE IF NOT EXISTS bank_entries (
  id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ship_id VARCHAR(20) NOT NULL,
  year INTEGER NOT NULL,
  amount_gco2eq DECIMAL(20, 2) NOT NULL,
  type VARCHAR(20) DEFAULT 'bank' CHECK (type IN ('bank', 'apply')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pools table (per PDF specification)
CREATE TABLE IF NOT EXISTS pools (
  id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  year INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pool members table (per PDF specification)
CREATE TABLE IF NOT EXISTS pool_members (
  id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  pool_id VARCHAR(50) REFERENCES pools(id) ON DELETE CASCADE,
  ship_id VARCHAR(20) NOT NULL,
  cb_before DECIMAL(20, 2) NOT NULL,
  cb_after DECIMAL(20, 2) NOT NULL,
  UNIQUE(pool_id, ship_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_routes_year ON routes(year);
CREATE INDEX IF NOT EXISTS idx_routes_vessel_type ON routes(vessel_type);
CREATE INDEX IF NOT EXISTS idx_routes_fuel_type ON routes(fuel_type);
CREATE INDEX IF NOT EXISTS idx_routes_baseline ON routes(is_baseline);
CREATE INDEX IF NOT EXISTS idx_ship_compliance_ship_year ON ship_compliance(ship_id, year);
CREATE INDEX IF NOT EXISTS idx_bank_entries_ship_year ON bank_entries(ship_id, year);
CREATE INDEX IF NOT EXISTS idx_pool_members_pool ON pool_members(pool_id);
