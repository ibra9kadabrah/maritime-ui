
// Common validation patterns
export const VALIDATION_PATTERNS = {
  TEXT_ONLY: /^[a-zA-Z\s\-.,]*$/,
  NUMBER_ONLY: /^\d+(\.\d+)?$/,
  INTEGER_ONLY: /^\d+$/,
  LATITUDE: /^([0-8]?[0-9](\.\d+)?|90(\.0+)?)$/,
  LONGITUDE: /^((1?[0-7]?|[0-9]?)[0-9](\.\d+)?|180(\.0+)?)$/,
  TIME_ZONE: /^[+-]?([0-9]|1[0-2])$/
};

// Form field validation rule
export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
  errorMessage: string;
}

// Map of field names to validation rules
export type ValidationRules = {
  [key: string]: ValidationRule;
};

// Departure Report Form data interface
export interface DepartureReportFormData {
  // General Information
  date: string;
  timeZone: string;
  cargoType: string;
  cargoQuantity: string;
  fwdDraft: string;
  aftDraft: string;
  departurePort: string;
  destinationPort: string;
  
  // Voyage Information
  etaDate: string;
  etaTime: string;
  cargoStatus: 'loaded' | 'ballast';
  
  // Navigation Data - FASP
  faspDate: string;
  faspTime: string;
  faspLatitude: string;
  faspLatitudeDir: 'N' | 'S';
  faspLongitude: string;
  faspLongitudeDir: 'E' | 'W';
  faspCourse: string;
  
  // Harbour Steaming
  harbourDistance: string;
  harbourTime: string;
  
  // Voyage Distance
  voyageDistance: string;
  
  // Weather Data
  windDirection: string;
  windForce: string;
  seaDirection: string;
  seaState: string;
  swellDirection: string;
  swellHeight: string;
  
  // Remarks
  captainRemarks: string;

  // --- Bunker Section ---
  prsRpm: string; 
  // Main Engine Consumption
  meLSIFO: string;
  meLSMGO: string;
  meCYLOIL: string;
  meMEOIL: string;
  meAEOIL: string;
  // Boiler Consumption
  boilerLSIFO: string;
  boilerLSMGO: string;
  // Aux Consumption
  auxLSIFO: string;
  auxLSMGO: string;
  // Harbour Consumption
  harbourLSIFO: string;
  harbourLSMGO: string;
  // Bunker Supply (Optional)
  supplyLSIFO?: string;
  supplyLSMGO?: string;
  supplyCYLOIL?: string;
  supplyMEOIL?: string;
  supplyAEOIL?: string;
  supplyVOLOIL?: string;
  // Bunker ROB (Read Only - will be populated from backend/state)
  robLSIFO?: string; 
  robLSMGO?: string;
  robCYLOIL?: string;
  robMEOIL?: string;
  robAEOIL?: string;
  robVOLOIL?: string;
   // Steaming Consumption (Read Only - calculated display)
  steamingLSIFO?: string;
  steamingLSMGO?: string;
  steamingCYLOIL?: string;
  steamingMEOIL?: string;
  steamingAEOIL?: string;
  steamingVOLOIL?: string;
  // Bunker Remarks
  bunkerChiefEngineerRemarks?: string;

  // --- Engine/Machinery Section ---
  // Main Engine Parameters
  engineLoadFOPressure: string;
  engineLoadLubOilPressure: string;
  engineLoadFWInletTemp: string;
  engineLoadLOInletTemp: string;
  engineLoadScavAirTemp: string;
  engineLoadTCRPM1: string;
  engineLoadTCRPM2?: string; // Optional
  engineLoadTCExhTempIn: string;
  engineLoadTCExhTempOut: string;
  engineLoadThrustBearingTemp: string;
  engineLoadDailyRunHour: string;
  // Engine Units (Example for 8 units, adjust if needed)
  engineUnit1ExhaustTemp?: string;
  engineUnit1UnderPistonAir?: string;
  engineUnit1PCOOutlet?: string;
  engineUnit1JCFWOutletTemp?: string;
  engineUnit2ExhaustTemp?: string;
  engineUnit2UnderPistonAir?: string;
  engineUnit2PCOOutlet?: string;
  engineUnit2JCFWOutletTemp?: string;
  engineUnit3ExhaustTemp?: string;
  engineUnit3UnderPistonAir?: string;
  engineUnit3PCOOutlet?: string;
  engineUnit3JCFWOutletTemp?: string;
  engineUnit4ExhaustTemp?: string;
  engineUnit4UnderPistonAir?: string;
  engineUnit4PCOOutlet?: string;
  engineUnit4JCFWOutletTemp?: string;
  engineUnit5ExhaustTemp?: string;
  engineUnit5UnderPistonAir?: string;
  engineUnit5PCOOutlet?: string;
  engineUnit5JCFWOutletTemp?: string;
  engineUnit6ExhaustTemp?: string;
  engineUnit6UnderPistonAir?: string;
  engineUnit6PCOOutlet?: string;
  engineUnit6JCFWOutletTemp?: string;
  engineUnit7ExhaustTemp?: string; // Optional Unit
  engineUnit7UnderPistonAir?: string; // Optional Unit
  engineUnit7PCOOutlet?: string; // Optional Unit
  engineUnit7JCFWOutletTemp?: string; // Optional Unit
  engineUnit8ExhaustTemp?: string; // Optional Unit
  engineUnit8UnderPistonAir?: string; // Optional Unit
  engineUnit8PCOOutlet?: string; // Optional Unit
  engineUnit8JCFWOutletTemp?: string; // Optional Unit
  // Auxiliary Engines
  auxEngineDG1Load?: string; // DG1 Mandatory
  auxEngineDG1KW?: string;
  auxEngineDG1FOPress?: string;
  auxEngineDG1LubOilPress?: string;
  auxEngineDG1WaterTemp?: string;
  auxEngineDG1DailyRunHour?: string;
  auxEngineDG2Load?: string; // Optional
  auxEngineDG2KW?: string;
  auxEngineDG2FOPress?: string;
  auxEngineDG2LubOilPress?: string;
  auxEngineDG2WaterTemp?: string;
  auxEngineDG2DailyRunHour?: string;
  auxEngineDG3Load?: string; // Optional
  auxEngineDG3KW?: string;
  auxEngineDG3FOPress?: string;
  auxEngineDG3LubOilPress?: string;
  auxEngineDG3WaterTemp?: string;
  auxEngineDG3DailyRunHour?: string;
  auxEngineV1Load?: string; // Optional
  auxEngineV1KW?: string;
  auxEngineV1FOPress?: string;
  auxEngineV1LubOilPress?: string;
  auxEngineV1WaterTemp?: string;
  auxEngineV1DailyRunHour?: string;
  // Engine Remarks
  engineChiefEngineerRemarks?: string;
}

// Default values for the form
export const defaultDepartureValues: DepartureReportFormData = {
  date: '',
  timeZone: '',
  cargoType: '',
  cargoQuantity: '',
  fwdDraft: '',
  aftDraft: '',
  departurePort: '',
  destinationPort: '',
  etaDate: '',
  etaTime: '',
  cargoStatus: 'loaded',
  faspDate: '',
  faspTime: '',
  faspLatitude: '',
  faspLatitudeDir: 'N',
  faspLongitude: '',
  faspLongitudeDir: 'E',
  faspCourse: '',
  harbourDistance: '',
  harbourTime: '',
  voyageDistance: '',
  windDirection: '',
  windForce: '',
  seaDirection: '',
  seaState: '',
  swellDirection: '',
  swellHeight: '',
  captainRemarks: '',
  // Bunker Defaults
  prsRpm: '', 
  meLSIFO: '',
  meLSMGO: '',
  meCYLOIL: '',
  meMEOIL: '',
  meAEOIL: '',
  boilerLSIFO: '',
  boilerLSMGO: '',
  auxLSIFO: '',
  auxLSMGO: '',
  harbourLSIFO: '',
  harbourLSMGO: '',
  supplyLSIFO: '', // Optional defaults to empty
  supplyLSMGO: '',
  supplyCYLOIL: '',
  supplyMEOIL: '',
  supplyAEOIL: '',
  supplyVOLOIL: '',
  // ROB and Steaming are read-only, no default needed in form state usually
  bunkerChiefEngineerRemarks: '',
  // Engine/Machinery Defaults
  engineLoadFOPressure: '',
  engineLoadLubOilPressure: '',
  engineLoadFWInletTemp: '',
  engineLoadLOInletTemp: '',
  engineLoadScavAirTemp: '',
  engineLoadTCRPM1: '',
  engineLoadTCRPM2: '', // Optional
  engineLoadTCExhTempIn: '',
  engineLoadTCExhTempOut: '',
  engineLoadThrustBearingTemp: '',
  engineLoadDailyRunHour: '',
  engineUnit1ExhaustTemp: '',
  engineUnit1UnderPistonAir: '',
  engineUnit1PCOOutlet: '',
  engineUnit1JCFWOutletTemp: '',
  engineUnit2ExhaustTemp: '',
  engineUnit2UnderPistonAir: '',
  engineUnit2PCOOutlet: '',
  engineUnit2JCFWOutletTemp: '',
  engineUnit3ExhaustTemp: '',
  engineUnit3UnderPistonAir: '',
  engineUnit3PCOOutlet: '',
  engineUnit3JCFWOutletTemp: '',
  engineUnit4ExhaustTemp: '',
  engineUnit4UnderPistonAir: '',
  engineUnit4PCOOutlet: '',
  engineUnit4JCFWOutletTemp: '',
  engineUnit5ExhaustTemp: '',
  engineUnit5UnderPistonAir: '',
  engineUnit5PCOOutlet: '',
  engineUnit5JCFWOutletTemp: '',
  engineUnit6ExhaustTemp: '',
  engineUnit6UnderPistonAir: '',
  engineUnit6PCOOutlet: '',
  engineUnit6JCFWOutletTemp: '',
  engineUnit7ExhaustTemp: '', // Optional
  engineUnit7UnderPistonAir: '', // Optional
  engineUnit7PCOOutlet: '', // Optional
  engineUnit7JCFWOutletTemp: '', // Optional
  engineUnit8ExhaustTemp: '', // Optional
  engineUnit8UnderPistonAir: '', // Optional
  engineUnit8PCOOutlet: '', // Optional
  engineUnit8JCFWOutletTemp: '', // Optional
  auxEngineDG1Load: '', 
  auxEngineDG1KW: '',
  auxEngineDG1FOPress: '',
  auxEngineDG1LubOilPress: '',
  auxEngineDG1WaterTemp: '',
  auxEngineDG1DailyRunHour: '',
  auxEngineDG2Load: '', // Optional
  auxEngineDG2KW: '',
  auxEngineDG2FOPress: '',
  auxEngineDG2LubOilPress: '',
  auxEngineDG2WaterTemp: '',
  auxEngineDG2DailyRunHour: '',
  auxEngineDG3Load: '', // Optional
  auxEngineDG3KW: '',
  auxEngineDG3FOPress: '',
  auxEngineDG3LubOilPress: '',
  auxEngineDG3WaterTemp: '',
  auxEngineDG3DailyRunHour: '',
  auxEngineV1Load: '', // Optional
  auxEngineV1KW: '',
  auxEngineV1FOPress: '',
  auxEngineV1LubOilPress: '',
  auxEngineV1WaterTemp: '',
  auxEngineV1DailyRunHour: '',
  engineChiefEngineerRemarks: ''
};

// Validation rules for each field
export const departureValidationRules: ValidationRules = {
  date: {
    required: true,
    errorMessage: 'Date is required'
  },
  timeZone: {
    required: true,
    pattern: VALIDATION_PATTERNS.TIME_ZONE,
    errorMessage: 'Time zone must be between -12 and +12'
  },
  cargoType: {
    required: true,
    pattern: VALIDATION_PATTERNS.TEXT_ONLY,
    errorMessage: 'Cargo type must contain only letters and spaces'
  },
  cargoQuantity: {
    required: true,
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    min: 0,
    errorMessage: 'Cargo quantity must be a positive number'
  },
  fwdDraft: {
    required: true,
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    min: 0,
    max: 30,
    errorMessage: 'Forward draft must be a number between 0 and 30'
  },
  aftDraft: {
    required: true,
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    min: 0,
    max: 30,
    errorMessage: 'Aft draft must be a number between 0 and 30'
  },
  departurePort: {
    required: true,
    pattern: VALIDATION_PATTERNS.TEXT_ONLY,
    errorMessage: 'Departure port must contain only letters and spaces'
  },
  destinationPort: {
    required: true,
    pattern: VALIDATION_PATTERNS.TEXT_ONLY,
    errorMessage: 'Destination port must contain only letters and spaces'
  },
  etaDate: {
    required: true,
    errorMessage: 'ETA date is required'
  },
  etaTime: {
    required: true,
    errorMessage: 'ETA time is required'
  },
  cargoStatus: {
    required: true,
    errorMessage: 'Cargo status is required'
  },
  faspDate: {
    required: true,
    errorMessage: 'FASP date is required'
  },
  faspTime: {
    required: true,
    errorMessage: 'FASP time is required'
  },
  faspLatitude: {
    required: true,
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    min: 0,
    max: 90,
    errorMessage: 'Latitude must be a number between 0 and 90'
  },
  faspLatitudeDir: {
    required: true,
    errorMessage: 'Latitude direction is required'
  },
  faspLongitude: {
    required: true,
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    min: 0,
    max: 180,
    errorMessage: 'Longitude must be a number between 0 and 180'
  },
  faspLongitudeDir: {
    required: true,
    errorMessage: 'Longitude direction is required'
  },
  faspCourse: {
    required: true,
    pattern: VALIDATION_PATTERNS.INTEGER_ONLY,
    min: 0,
    max: 359,
    errorMessage: 'Course must be a whole number between 0 and 359'
  },
  harbourDistance: {
    required: true,
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    min: 0,
    errorMessage: 'Harbour distance must be a positive number'
  },
  harbourTime: {
    required: true,
    errorMessage: 'Harbour time is required'
  },
  voyageDistance: {
    required: true,
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    min: 0,
    errorMessage: 'Voyage distance must be a positive number'
  },
  windDirection: {
    required: true,
    errorMessage: 'Wind direction is required'
  },
  windForce: {
    required: true,
    pattern: VALIDATION_PATTERNS.INTEGER_ONLY,
    min: 0,
    max: 12,
    errorMessage: 'Wind force must be a whole number between 0 and 12'
  },
  seaDirection: {
    required: true,
    errorMessage: 'Sea direction is required'
  },
  seaState: {
    required: true,
    pattern: VALIDATION_PATTERNS.INTEGER_ONLY,
    min: 0,
    max: 9,
    errorMessage: 'Sea state must be a whole number between 0 and 9'
  },
  swellDirection: {
    required: true,
    errorMessage: 'Swell direction is required'
  },
  swellHeight: {
    required: true,
    pattern: VALIDATION_PATTERNS.INTEGER_ONLY,
    min: 0,
    max: 9,
    errorMessage: 'Swell height must be a whole number between 0 and 9'
  },
  captainRemarks: {
    // Optional, no specific rules here unless max length etc. needed
    required: false, 
    errorMessage: '' 
  },

  // --- Bunker Validation Rules ---
  prsRpm: {
    required: true,
    pattern: VALIDATION_PATTERNS.INTEGER_ONLY,
    min: 0,
    errorMessage: 'PRS RPM must be a positive whole number'
  },
  // Main Engine Consumption
  meLSIFO: {
    required: true,
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    min: 0,
    errorMessage: 'ME LSIFO consumption must be a positive number'
  },
  meLSMGO: {
    required: true,
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    min: 0,
    errorMessage: 'ME LSMGO consumption must be a positive number'
  },
  meCYLOIL: {
    required: true,
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    min: 0,
    errorMessage: 'ME CYL OIL consumption must be a positive number'
  },
  meMEOIL: {
    required: true,
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    min: 0,
    errorMessage: 'ME M/E OIL consumption must be a positive number'
  },
  meAEOIL: {
    required: true,
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    min: 0,
    errorMessage: 'ME A/E OIL consumption must be a positive number'
  },
  // Boiler Consumption
  boilerLSIFO: {
    required: true,
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    min: 0,
    errorMessage: 'Boiler LSIFO consumption must be a positive number'
  },
  boilerLSMGO: {
    required: true,
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    min: 0,
    errorMessage: 'Boiler LSMGO consumption must be a positive number'
  },
  // Aux Consumption
  auxLSIFO: {
    required: true,
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    min: 0,
    errorMessage: 'Aux LSIFO consumption must be a positive number'
  },
  auxLSMGO: {
    required: true,
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    min: 0,
    errorMessage: 'Aux LSMGO consumption must be a positive number'
  },
  // Harbour Consumption
  harbourLSIFO: {
    required: true, // Mandatory in Departure form
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    min: 0,
    errorMessage: 'Harbour LSIFO consumption must be a positive number'
  },
  harbourLSMGO: {
    required: true, // Mandatory in Departure form
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    min: 0,
    errorMessage: 'Harbour LSMGO consumption must be a positive number'
  },
  // Bunker Supply (Optional fields - only pattern/min validation if value exists)
  supplyLSIFO: {
    required: false,
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    min: 0,
    errorMessage: 'Supply LSIFO must be a positive number if entered'
  },
  supplyLSMGO: {
    required: false,
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    min: 0,
    errorMessage: 'Supply LSMGO must be a positive number if entered'
  },
  supplyCYLOIL: {
    required: false,
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    min: 0,
    errorMessage: 'Supply CYL OIL must be a positive number if entered'
  },
  supplyMEOIL: {
    required: false,
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    min: 0,
    errorMessage: 'Supply M/E OIL must be a positive number if entered'
  },
  supplyAEOIL: {
    required: false,
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    min: 0,
    errorMessage: 'Supply A/E OIL must be a positive number if entered'
  },
  supplyVOLOIL: {
    required: false,
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    min: 0,
    errorMessage: 'Supply VOL OIL must be a positive number if entered'
  },
   // Bunker ROB fields are read-only, no validation needed from user input
   // Steaming Consumption fields are read-only, no validation needed
  bunkerChiefEngineerRemarks: {
    required: false, 
    errorMessage: '' 
  },

  // --- Engine/Machinery Validation Rules ---
  // Main Engine Parameters
  engineLoadFOPressure: {
    required: true,
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    min: 0,
    errorMessage: 'FO Pressure must be a positive number'
  },
  engineLoadLubOilPressure: {
    required: true,
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    min: 0,
    errorMessage: 'Lub Oil Pressure must be a positive number'
  },
  engineLoadFWInletTemp: {
    required: true,
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY, // Allow decimals, adjust if integer needed
    errorMessage: 'FW Inlet Temp must be a number'
  },
  engineLoadLOInletTemp: {
    required: true,
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    errorMessage: 'LO Inlet Temp must be a number'
  },
  engineLoadScavAirTemp: {
    required: true,
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    errorMessage: 'Scavenge Air Temp must be a number'
  },
  engineLoadTCRPM1: {
    required: true,
    pattern: VALIDATION_PATTERNS.INTEGER_ONLY,
    min: 0,
    errorMessage: 'TC RPM #1 must be a positive whole number'
  },
  engineLoadTCRPM2: { // Optional
    required: false,
    pattern: VALIDATION_PATTERNS.INTEGER_ONLY,
    min: 0,
    errorMessage: 'TC RPM #2 must be a positive whole number if entered'
  },
  engineLoadTCExhTempIn: {
    required: true,
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    errorMessage: 'TC Exhaust Temp In must be a number'
  },
  engineLoadTCExhTempOut: {
    required: true,
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    errorMessage: 'TC Exhaust Temp Out must be a number'
  },
  engineLoadThrustBearingTemp: {
    required: true,
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    errorMessage: 'Thrust Bearing Temp must be a number'
  },
  engineLoadDailyRunHour: {
    required: true,
    pattern: VALIDATION_PATTERNS.NUMBER_ONLY,
    min: 0,
    errorMessage: 'Daily Run Hour must be a positive number'
  },
  // Engine Units (Mandatory Units 1-6) - Apply similar numeric validation
  engineUnit1ExhaustTemp: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 1 Exhaust Temp is required' },
  engineUnit1UnderPistonAir: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 1 Under Piston Air is required' },
  engineUnit1PCOOutlet: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 1 P.C.O Outlet is required' },
  engineUnit1JCFWOutletTemp: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 1 J.C.F.W Outlet Temp is required' },
  engineUnit2ExhaustTemp: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 2 Exhaust Temp is required' },
  engineUnit2UnderPistonAir: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 2 Under Piston Air is required' },
  engineUnit2PCOOutlet: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 2 P.C.O Outlet is required' },
  engineUnit2JCFWOutletTemp: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 2 J.C.F.W Outlet Temp is required' },
  engineUnit3ExhaustTemp: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 3 Exhaust Temp is required' },
  engineUnit3UnderPistonAir: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 3 Under Piston Air is required' },
  engineUnit3PCOOutlet: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 3 P.C.O Outlet is required' },
  engineUnit3JCFWOutletTemp: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 3 J.C.F.W Outlet Temp is required' },
  engineUnit4ExhaustTemp: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 4 Exhaust Temp is required' },
  engineUnit4UnderPistonAir: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 4 Under Piston Air is required' },
  engineUnit4PCOOutlet: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 4 P.C.O Outlet is required' },
  engineUnit4JCFWOutletTemp: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 4 J.C.F.W Outlet Temp is required' },
  engineUnit5ExhaustTemp: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 5 Exhaust Temp is required' },
  engineUnit5UnderPistonAir: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 5 Under Piston Air is required' },
  engineUnit5PCOOutlet: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 5 P.C.O Outlet is required' },
  engineUnit5JCFWOutletTemp: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 5 J.C.F.W Outlet Temp is required' },
  engineUnit6ExhaustTemp: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 6 Exhaust Temp is required' },
  engineUnit6UnderPistonAir: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 6 Under Piston Air is required' },
  engineUnit6PCOOutlet: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 6 P.C.O Outlet is required' },
  engineUnit6JCFWOutletTemp: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 6 J.C.F.W Outlet Temp is required' },
  // Engine Units (Optional Units 7-8) - Only validate if entered
  engineUnit7ExhaustTemp: { required: false, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 7 Exhaust Temp must be a number if entered' },
  engineUnit7UnderPistonAir: { required: false, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 7 Under Piston Air must be a number if entered' },
  engineUnit7PCOOutlet: { required: false, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 7 P.C.O Outlet must be a number if entered' },
  engineUnit7JCFWOutletTemp: { required: false, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 7 J.C.F.W Outlet Temp must be a number if entered' },
  engineUnit8ExhaustTemp: { required: false, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 8 Exhaust Temp must be a number if entered' },
  engineUnit8UnderPistonAir: { required: false, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 8 Under Piston Air must be a number if entered' },
  engineUnit8PCOOutlet: { required: false, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 8 P.C.O Outlet must be a number if entered' },
  engineUnit8JCFWOutletTemp: { required: false, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Unit 8 J.C.F.W Outlet Temp must be a number if entered' },
  // Auxiliary Engines (DG1 Mandatory)
  auxEngineDG1Load: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, min: 0, errorMessage: 'DG#1 Load must be a positive number' },
  auxEngineDG1KW: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, min: 0, errorMessage: 'DG#1 KW must be a positive number' },
  auxEngineDG1FOPress: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, min: 0, errorMessage: 'DG#1 FO Press must be a positive number' },
  auxEngineDG1LubOilPress: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, min: 0, errorMessage: 'DG#1 Lub Oil Press must be a positive number' },
  auxEngineDG1WaterTemp: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'DG#1 Water Temp must be a number' },
  auxEngineDG1DailyRunHour: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, min: 0, errorMessage: 'DG#1 Daily Run Hour must be a positive number' },
  // Auxiliary Engines (Optional - DG2, DG3, V1) - Validate only if entered
  // We might need custom logic here if enabling one requires others
  auxEngineDG2Load: { required: false, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, min: 0, errorMessage: 'DG#2 Load must be a positive number if entered' },
  auxEngineDG2KW: { required: false, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, min: 0, errorMessage: 'DG#2 KW must be a positive number if entered' },
  auxEngineDG2FOPress: { required: false, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, min: 0, errorMessage: 'DG#2 FO Press must be a positive number if entered' },
  auxEngineDG2LubOilPress: { required: false, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, min: 0, errorMessage: 'DG#2 Lub Oil Press must be a positive number if entered' },
  auxEngineDG2WaterTemp: { required: false, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'DG#2 Water Temp must be a number if entered' },
  auxEngineDG2DailyRunHour: { required: false, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, min: 0, errorMessage: 'DG#2 Daily Run Hour must be a positive number if entered' },
  auxEngineDG3Load: { required: false, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, min: 0, errorMessage: 'DG#3 Load must be a positive number if entered' },
  auxEngineDG3KW: { required: false, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, min: 0, errorMessage: 'DG#3 KW must be a positive number if entered' },
  auxEngineDG3FOPress: { required: false, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, min: 0, errorMessage: 'DG#3 FO Press must be a positive number if entered' },
  auxEngineDG3LubOilPress: { required: false, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, min: 0, errorMessage: 'DG#3 Lub Oil Press must be a positive number if entered' },
  auxEngineDG3WaterTemp: { required: false, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'DG#3 Water Temp must be a number if entered' },
  auxEngineDG3DailyRunHour: { required: false, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, min: 0, errorMessage: 'DG#3 Daily Run Hour must be a positive number if entered' },
  auxEngineV1Load: { required: false, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, min: 0, errorMessage: 'V#1 Load must be a positive number if entered' },
  auxEngineV1KW: { required: false, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, min: 0, errorMessage: 'V#1 KW must be a positive number if entered' },
  auxEngineV1FOPress: { required: false, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, min: 0, errorMessage: 'V#1 FO Press must be a positive number if entered' },
  auxEngineV1LubOilPress: { required: false, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, min: 0, errorMessage: 'V#1 Lub Oil Press must be a positive number if entered' },
  auxEngineV1WaterTemp: { required: false, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'V#1 Water Temp must be a number if entered' },
  auxEngineV1DailyRunHour: { required: false, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, min: 0, errorMessage: 'V#1 Daily Run Hour must be a positive number if entered' },
  engineChiefEngineerRemarks: { 
    required: false, 
    errorMessage: '' 
  }
};

// CSS class constants for consistent styling
export const FORM_STYLES = {
  // Base classes for inputs
  EDITABLE_INPUT: "w-full p-2 border rounded bg-white",
  READONLY_INPUT: "w-full p-2 border rounded bg-gray-100 cursor-not-allowed", 
  ERROR_BORDER: "border-red-500",
  NORMAL_BORDER: "border-gray-300"
};
