# FuelEU Maritime Compliance Platform - Assumptions & Design Decisions

## Overview

This document outlines the assumptions made and design decisions taken during the development of the FuelEU Maritime Compliance Platform.

---

## Technical Assumptions

### Data Model

1. **Vessel Identification**: Each vessel is uniquely identified by its IMO number. The platform assumes all vessels in the fleet have valid IMO registrations.

2. **Compliance Calculation**: GHG intensity is calculated in gCO₂eq/MJ (grams of CO2 equivalent per megajoule). The current 2025 target is set at 89.34 gCO₂eq/MJ based on FuelEU Maritime regulations.

3. **Fuel Types**: The platform supports the following fuel types with their respective GHG emission factors:
   - VLSFO (Very Low Sulphur Fuel Oil): 3.151 gCO₂eq/MJ
   - HFO (Heavy Fuel Oil): 3.206 gCO₂eq/MJ
   - LNG (Liquefied Natural Gas): 2.755 gCO₂eq/MJ
   - Methanol: 1.375 gCO₂eq/MJ
   - Ammonia: 0 gCO₂eq/MJ (green ammonia)
   - Hydrogen: 0 gCO₂eq/MJ (green hydrogen)

4. **Compliance Balance**: Positive values indicate surplus (below target), negative values indicate deficit (above target).

### Business Logic

1. **Banking Mechanism**:
   - Surplus compliance can be "banked" for future use (up to 2 reporting periods)
   - Deficit can be "borrowed" against future compliance with interest penalties
   - Transfers between vessels within the same ownership are permitted

2. **Pooling Rules**:
   - Minimum 2 vessels required to form a pool
   - Maximum pool size is unlimited but practical considerations apply
   - Pool balance is calculated as the sum of all member vessel balances
   - Vessels can only belong to one pool at a time

3. **Compliance Status Thresholds**:
   - **Compliant**: GHG intensity ≤ target AND positive balance
   - **At Risk**: GHG intensity within 5% of target OR small negative balance
   - **Non-Compliant**: GHG intensity > target by more than 5% OR significant negative balance

---

## Design Decisions

### User Interface

1. **Dark Theme**: Chosen for reduced eye strain during extended monitoring sessions and to convey a premium, professional aesthetic suitable for enterprise maritime applications.

2. **Color Palette**: Ocean-inspired teal/cyan primary colors were selected to align with the maritime industry context while maintaining accessibility standards.

3. **Glassmorphism Effects**: Applied to cards and panels to create depth and visual hierarchy without overwhelming the data-dense interface.

4. **Collapsible Sidebar**: Implemented to maximize screen real estate for data tables and charts on smaller displays while maintaining easy navigation.

### Data Visualization

1. **GHG Trajectory Chart**: Uses area charts with gradient fills to show both historical data and projections, with reference lines for regulatory targets.

2. **Radar Charts in Compare**: Chosen to visualize multi-dimensional performance metrics, allowing quick visual comparison of vessel efficiency across different parameters.

3. **Expandable Table Rows**: Implemented to keep the routes table scannable while providing detailed voyage information on demand.

### Architecture

1. **Client-Side State**: Mock data is used for demonstration purposes. In production, this would connect to a backend API with real-time data synchronization.

2. **Component Structure**: Pages are composed of smaller, reusable components to maintain code organization and enable future feature additions.

3. **No External Database**: Since the user declined database integration, all data is stored as static mock data in `lib/data.ts`. This can be easily replaced with API calls.

---

## Future Considerations

1. **Real-time Updates**: WebSocket connections for live vessel tracking and compliance monitoring
2. **Multi-tenant Support**: Organization-level access control and data isolation
3. **Regulatory Updates**: Configurable target thresholds to accommodate regulation changes
4. **Audit Trail**: Complete logging of all banking and pooling transactions
5. **Integration APIs**: Connect with AIS data providers and MRV reporting systems
