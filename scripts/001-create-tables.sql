-- FuelEU Maritime Compliance Database Schema
-- Run this script to create all necessary tables

-- Vessels table
CREATE TABLE IF NOT EXISTS vessels (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  imo VARCHAR(20) UNIQUE NOT NULL,
  type VARCHAR(100) NOT NULL,
  flag VARCHAR(10) NOT NULL,
  capacity INTEGER NOT NULL,
  compliance_balance DECIMAL(10, 2) DEFAULT 0,
  ghg_intensity DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'compliant' CHECK (status IN ('compliant', 'at-risk', 'non-compliant')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Voyages table
CREATE TABLE IF NOT EXISTS voyages (
  id VARCHAR(50) PRIMARY KEY,
  vessel_id VARCHAR(50) REFERENCES vessels(id) ON DELETE CASCADE,
  departure_port VARCHAR(255) NOT NULL,
  arrival_port VARCHAR(255) NOT NULL,
  departure_date DATE NOT NULL,
  arrival_date DATE NOT NULL,
  distance DECIMAL(10, 2) NOT NULL,
  fuel_consumed DECIMAL(10, 2) NOT NULL,
  fuel_type VARCHAR(50) NOT NULL,
  ghg_intensity DECIMAL(10, 2) NOT NULL,
  compliance_balance DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'compliant' CHECK (status IN ('compliant', 'at-risk', 'non-compliant')),
  co2_emissions DECIMAL(10, 2) NOT NULL,
  energy_used DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pool groups table
CREATE TABLE IF NOT EXISTS pool_groups (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  total_balance DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('active', 'pending')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pool group vessels (many-to-many relationship)
CREATE TABLE IF NOT EXISTS pool_group_vessels (
  pool_id VARCHAR(50) REFERENCES pool_groups(id) ON DELETE CASCADE,
  vessel_id VARCHAR(50) REFERENCES vessels(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (pool_id, vessel_id)
);

-- Banking transactions table
CREATE TABLE IF NOT EXISTS banking_transactions (
  id VARCHAR(50) PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer')),
  amount DECIMAL(10, 2) NOT NULL,
  from_vessel_id VARCHAR(50) REFERENCES vessels(id) ON DELETE SET NULL,
  to_vessel_id VARCHAR(50) REFERENCES vessels(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('completed', 'pending')),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Compliance thresholds table
CREATE TABLE IF NOT EXISTS compliance_thresholds (
  year INTEGER PRIMARY KEY,
  threshold DECIMAL(10, 2) NOT NULL
);

-- Fuel types reference table
CREATE TABLE IF NOT EXISTS fuel_types (
  name VARCHAR(50) PRIMARY KEY,
  ghg_factor DECIMAL(10, 3) NOT NULL,
  color VARCHAR(50)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_voyages_vessel_id ON voyages(vessel_id);
CREATE INDEX IF NOT EXISTS idx_voyages_departure_date ON voyages(departure_date);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON banking_transactions(date);
CREATE INDEX IF NOT EXISTS idx_vessels_status ON vessels(status);
