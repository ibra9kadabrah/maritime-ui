// Basic interfaces for core data structures

export interface User {
  id: number;
  username: string;
  role: 'captain' | 'office';
}

export interface Vessel {
  id: number;
  name: string;
  flag: string;
  current_captain: string; // Corresponds to User username
  bls: number;
}

export interface Voyage {
  id: number;
  voyage_number: string; // Consider generating this
  vessel_id: number;
  starting_report_id?: number; // ID of the first Departure report
  ending_report_id?: number; // ID of the second Departure report that ends this voyage
  departure_port: string;
  destination_port: string;
  cargo_status: 'loaded' | 'ballast';
  cargo_type?: string;
  cargo_quantity?: number;
  total_distance?: number; // Total planned distance for this leg
  active: boolean;
  start_date: string; // ISO Date string
  end_date?: string; // ISO Date string
}

export type ReportType = 'departure' | 'noon' | 'arrival' | 'berth';
export type ReportStatus = 'pending' | 'approved' | 'rejected';

export interface Report {
  id: number;
  type: ReportType;
  voyage_id: number;
  vessel_id: number; // Added missing vessel ID link
  sequence_number: number; // Order within the voyage
  submitted_by: string; // User username
  submitted_at: string; // ISO DateTime string
  status: ReportStatus;
  reviewer?: string; // User username
  reviewed_at?: string; // ISO DateTime string
  rejection_reason?: string;
  report_date: string; // Date the report pertains to (ISO Date string)
  distance_traveled?: number; // Distance since last report (for Noon/Arrival)
  distance_to_go?: number; // Calculated remaining distance for the voyage leg
  report_data: ReportSpecificData; // Use a union type for specific data
}

// Union type for report-specific data
export type ReportSpecificData =
  | DepartureFormData
  | NoonReportData // Use the new specific type
  | ArrivalFormData
  | BerthFormData
  | any; // Fallback for now, ideally remove 'any' later

// Represents a snapshot of bunker levels and consumption/supply for a specific report
export interface BunkerRecord {
  id: number;
  vessel_id: number;
  report_id: number; // 0 for initial state, otherwise matches Report id
  report_date: string; // ISO Date string

  // ROB values at the time of the report
  lsifo_rob: number;
  lsmgo_rob: number;
  cyl_oil_rob: number;
  me_oil_rob: number;
  ae_oil_rob: number;
  vol_oil_rob: number;

  // Consumption since the *previous* report (0 for initial/departure)
  lsifo_consumed: number;
  lsmgo_consumed: number;
  cyl_oil_consumed: number;
  me_oil_consumed: number;
  ae_oil_consumed: number;
  vol_oil_consumed: number;

  // Supply added *at the time* of this report (e.g., during bunkering)
  lsifo_supplied: number;
  lsmgo_supplied: number;
  cyl_oil_supplied: number;
  me_oil_supplied: number;
  ae_oil_supplied: number;
  vol_oil_supplied: number;
}

// Placeholder for specific form data types - to be defined later
export interface DepartureFormData {
  // Fields specific to departure form
  departurePort: string;
  destinationPort: string;
  voyageDistance: number;
  harbourDistance: number; // Corrected spelling
  cargoStatus: 'loaded' | 'ballast';
  cargoType?: string; // Add cargo type
  cargoQuantity?: number; // Add cargo quantity
  bls_quantity?: number;
  // ... other fields like ETA, FASP details if submitted in departure
  etaDate?: string;
  etaTime?: string;
  faspDate?: string;
  faspTime?: string;
  faspLatitude?: number;
  faspLatitudeDir?: 'N' | 'S';
  faspLongitude?: number;
  faspLongitudeDir?: 'E' | 'W';
  faspCourse?: number;
  // Optional fields for initial ROB entry on first departure
  initialRobLSIFO?: number;
  initialRobLSMGO?: number;
  initialRobCYLOIL?: number;
  initialRobMEOIL?: number;
  initialRobAEOIL?: number;
  initialRobVOLOIL?: number;
  // Optional supply fields (might occur at departure)
  supplyLSIFO?: number;
  supplyLSMGO?: number;
  supplyCYLOIL?: number;
  supplyMEOIL?: number;
  supplyAEOIL?: number;
  supplyVOLOIL?: number;
  // Consumption fields (representing pre-departure/harbour consumption)
  meLSIFO?: number;
  meLSMGO?: number;
  meCYLOIL?: number;
  meMEOIL?: number;
  meAEOIL?: number;
  boilerLSIFO?: number;
  boilerLSMGO?: number;
  auxLSIFO?: number;
  auxLSMGO?: number;
  // Note: VOLOIL consumption is not typically tracked this way, assumed 0
}

export interface NoonFormData {
  // Fields specific to noon form - based on Zod schema ProcessedNoonFormData
  passageState: 'noon' | 'sosp' | 'rosp'; // Added passage state

  // General Info
  date: string;
  timeZone: string;
  fwdDraft: number;
  aftDraft: number;

  // Navigation - Position (Required regardless of state)
  positionDate: string;
  positionTime: string;
  positionLatitude: number;
  positionLatitudeDir: 'N' | 'S';
  positionLongitude: number;
  positionLongitudeDir: 'E' | 'W';
  course: number;

  // Navigation - SOSP/ROSP Specific Details (Optional)
  sospRosPDate?: string;
  sospRosPTime?: string;
  sospRosPLatitude?: number;
  sospRosPLatitudeDir?: 'N' | 'S';
  sospRosPLongitude?: number;
  sospRosPLongitudeDir?: 'E' | 'W';

  // Navigation - Distance
  distanceSinceLastReport: number; // Input: Distance covered since last report
  totalDistanceTraveled?: number; // Display only: Calculated cumulative distance
  distanceToGo?: number; // Display only: Calculated remaining sea distance

  // Navigation - Weather
  windDirection: string;
  windForce: number;
  seaDirection: string;
  seaState: number;
  swellDirection: string;
  swellHeight: number;

  // Navigation - Remarks
  captainRemarks?: string;

  // --- Bunker Section ---
  prsRpm: number;
  // Main Engine Consumption
  meLSIFO: number;
  meLSMGO: number;
  meCYLOIL: number;
  meMEOIL: number;
  meAEOIL: number;
  // Boiler Consumption
  boilerLSIFO: number;
  boilerLSMGO: number;
  // Aux Consumption
  auxLSIFO: number;
  auxLSMGO: number;
  // Bunker Supply (Optional)
  supplyLSIFO?: number;
  supplyLSMGO?: number;
  supplyCYLOIL?: number;
  supplyMEOIL?: number;
  supplyAEOIL?: number;
  supplyVOLOIL?: number;

  // Bunker Remarks
  bunkerChiefEngineerRemarks?: string;

  // --- Engine/Machinery Section ---
  // Main Engine Parameters
  engineLoadFOPressure: number;
  engineLoadLubOilPressure: number;
  engineLoadFWInletTemp: number;
  engineLoadLOInletTemp: number;
  engineLoadScavAirTemp: number;
  engineLoadTCRPM1: number;
  engineLoadTCRPM2?: number;
  engineLoadTCExhTempIn: number;
  engineLoadTCExhTempOut: number;
  engineLoadThrustBearingTemp: number;
  engineLoadDailyRunHour: number;
  // Engine Units (Units 1-6 Required, 7-8 Optional)
  engineUnit1ExhaustTemp: number;
  engineUnit1UnderPistonAir: number;
  engineUnit1PCOOutlet: number;
  engineUnit1JCFWOutletTemp: number;
  engineUnit2ExhaustTemp: number;
  engineUnit2UnderPistonAir: number;
  engineUnit2PCOOutlet: number;
  engineUnit2JCFWOutletTemp: number;
  engineUnit3ExhaustTemp: number;
  engineUnit3UnderPistonAir: number;
  engineUnit3PCOOutlet: number;
  engineUnit3JCFWOutletTemp: number;
  engineUnit4ExhaustTemp: number;
  engineUnit4UnderPistonAir: number;
  engineUnit4PCOOutlet: number;
  engineUnit4JCFWOutletTemp: number;
  engineUnit5ExhaustTemp: number;
  engineUnit5UnderPistonAir: number;
  engineUnit5PCOOutlet: number;
  engineUnit5JCFWOutletTemp: number;
  engineUnit6ExhaustTemp: number;
  engineUnit6UnderPistonAir: number;
  engineUnit6PCOOutlet: number;
  engineUnit6JCFWOutletTemp: number;
  // Optional Units (7-8)
  engineUnit7ExhaustTemp?: number;
  engineUnit7UnderPistonAir?: number;
  engineUnit7PCOOutlet?: number;
  engineUnit7JCFWOutletTemp?: number;
  engineUnit8ExhaustTemp?: number;
  engineUnit8UnderPistonAir?: number;
  engineUnit8PCOOutlet?: number;
  engineUnit8JCFWOutletTemp?: number;
  // Auxiliary Engines (DG1 Mandatory, others Optional)
  auxEngineDG1Load: number;
  auxEngineDG1KW: number;
  auxEngineDG1FOPress: number;
  auxEngineDG1LubOilPress: number;
  auxEngineDG1WaterTemp: number;
  auxEngineDG1DailyRunHour: number;
  // Optional Auxiliary Engines (DG2, DG3, V1)
  auxEngineDG2Load?: number;
  auxEngineDG2KW?: number;
  auxEngineDG2FOPress?: number;
  auxEngineDG2LubOilPress?: number;
  auxEngineDG2WaterTemp?: number;
  auxEngineDG2DailyRunHour?: number;
  auxEngineDG3Load?: number;
  auxEngineDG3KW?: number;
  auxEngineDG3FOPress?: number;
  auxEngineDG3LubOilPress?: number;
  auxEngineDG3WaterTemp?: number;
  auxEngineDG3DailyRunHour?: number;
  auxEngineV1Load?: number;
  auxEngineV1KW?: number;
  auxEngineV1FOPress?: number;
  auxEngineV1LubOilPress?: number;
  auxEngineV1WaterTemp?: number;
  auxEngineV1DailyRunHour?: number;
  // Engine Remarks
  engineChiefEngineerRemarks?: string;
}

// Renamed from NoonFormData to NoonReportData
export interface NoonReportData extends NoonFormData {} // Keep NoonFormData for now, extend it

export interface ArrivalFormData {
  // Fields specific to arrival form
  distanceSinceLastReport: number; // Distance covered on the final leg
  // Consumption figures since last report
  lsifoConsumed?: number;
  lsmgoConsumed?: number;
  cylOilConsumed?: number;
  meOilConsumed?: number;
  aeOilConsumed?: number;
  volOilConsumed?: number;
  // Supply fields (optional, but needed if bunkering occurred during arrival process)
  lsifoSupplied?: number;
  lsmgoSupplied?: number;
  cylOilSupplied?: number;
  meOilSupplied?: number;
  aeOilSupplied?: number;
  volOilSupplied?: number;
  // ... other arrival report specific fields like arrival time, final position etc.
}

export interface BerthFormData {
  // Fields specific to berth form
  // Harbor consumption figures while at berth
  harborLsifoConsumed?: number;
  harborLsmgoConsumed?: number;
  harborCylOilConsumed?: number;
  harborMeOilConsumed?: number; // Unlikely but possible
  harborAeOilConsumed?: number;
  harborVolOilConsumed?: number;
  // Bunkering supply received at berth
  lsifoSupplied?: number;
  lsmgoSupplied?: number;
  cylOilSupplied?: number;
  meOilSupplied?: number;
  aeOilSupplied?: number;
  volOilSupplied?: number;
  // Cargo operations
  cargoLoaded?: number; // Quantity loaded
  cargoUnloaded?: number; // Quantity unloaded
  // ... other berth report specific fields like berth name, time alongside etc.
}
