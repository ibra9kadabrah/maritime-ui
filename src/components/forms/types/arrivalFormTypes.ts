// src/components/forms/types/arrivalFormTypes.ts

// --- Reusable Validation Patterns ---
// (Copied from departureFormTypes.ts)
export const VALIDATION_PATTERNS = {
  TEXT_ONLY: /^[a-zA-Z\s]*$/,
  INTEGER_ONLY: /^\d*$/,
  NUMBER_ONLY: /^-?\d*\.?\d*$/, // Allows optional leading minus and decimal
  TIME_HHMM: /^([01]\d|2[0-3]):([0-5]\d)$/, // HH:MM format
  DATE_YYYYMMDD: /^\d{4}-\d{2}-\d{2}$/,
  TIMEZONE: /^[+-](0\d|1[0-4])$/, // e.g., +05, -10
  LATITUDE: /^\d{1,2}(\.\d+)?$/, // Basic latitude format check (e.g., 51.9244)
  LONGITUDE: /^\d{1,3}(\.\d+)?$/, // Basic longitude format check (e.g., 4.4777, 103.8198)
  COURSE: /^\d{1,3}$/, // 0-359
  WIND_FORCE: /^(0|([1-9]|1[0-2]))$/, // 0-12
  SEA_STATE: /^[0-9]$/, // 0-9
  SWELL_HEIGHT: /^[0-9]$/, // 0-9
};

// --- Reusable Form Styles ---
// (Copied from departureFormTypes.ts)
export const FORM_STYLES = {
  EDITABLE_INPUT: 'w-full p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
  READONLY_INPUT: 'w-full p-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed',
  ERROR_BORDER: 'border-red-500',
  NORMAL_BORDER: 'border-gray-300', // Ensure this is the default border color used in EDITABLE_INPUT
};


// --- Arrival Report Specific Data Structure ---
export interface ArrivalReportFormData {
  // General Info
  date: string;
  timeZone: string;
  fwdDraft: string;
  aftDraft: string;

  // Navigation - EOSP
  eospDate: string;
  eospTime: string;
  eospLatitude: string;
  eospLatitudeDir: 'N' | 'S';
  eospLongitude: string;
  eospLongitudeDir: 'E' | 'W';

  // Navigation - Harbour Steaming
  harbourDistance: string;
  harbourTime: string; // Storing as HH:MM string

  // Navigation - Distance
  distanceSinceLastReport: string;
  // totalDistanceTraveled: string; // This will likely be calculated/read-only

  // Navigation - Weather
  windDirection: string;
  windForce: string;
  seaDirection: string;
  seaState: string;
  swellDirection: string;
  swellHeight: string;

  // Navigation - Remarks
  captainRemarks: string;

  // --- Copied Sections (Keep structure for now, refine fields later if needed) ---

  // Bunker Data
  prsRpm: string;
  meLSIFO: string;
  meLSMGO: string;
  meCYLOIL: string;
  meMEOIL: string;
  meAEOIL: string;
  boilerLSIFO: string;
  boilerLSMGO: string;
  auxLSIFO: string;
  auxLSMGO: string;
  harbourLSIFO: string; // Keep for Arrival
  harbourLSMGO: string; // Keep for Arrival
  supplyLSIFO: string;
  supplyLSMGO: string;
  supplyCYLOIL: string;
  supplyMEOIL: string;
  supplyAEOIL: string;
  supplyVOLOIL: string;
  // robLSIFO: string; // ROB fields are typically read-only/calculated
  // robLSMGO: string;
  // robCYLOIL: string;
  // robMEOIL: string;
  // robAEOIL: string;
  // robVOLOIL: string;
  bunkerChiefEngineerRemarks: string;

  // Engine/Machinery Data
  engineLoadFOPressure: string;
  engineLoadLubOilPressure: string;
  engineLoadFWInletTemp: string;
  engineLoadLOInletTemp: string;
  engineLoadScavAirTemp: string;
  engineLoadTCRPM1: string;
  engineLoadTCRPM2: string;
  engineLoadTCExhTempIn: string;
  engineLoadTCExhTempOut: string;
  engineLoadThrustBearingTemp: string;
  engineLoadDailyRunHour: string;
  engineUnit1ExhaustTemp: string;
  engineUnit1UnderPistonAir: string;
  engineUnit1PCOOutlet: string;
  engineUnit1JCFWOutletTemp: string;
  engineUnit2ExhaustTemp: string;
  engineUnit2UnderPistonAir: string;
  engineUnit2PCOOutlet: string;
  engineUnit2JCFWOutletTemp: string;
  engineUnit3ExhaustTemp: string;
  engineUnit3UnderPistonAir: string;
  engineUnit3PCOOutlet: string;
  engineUnit3JCFWOutletTemp: string;
  engineUnit4ExhaustTemp: string;
  engineUnit4UnderPistonAir: string;
  engineUnit4PCOOutlet: string;
  engineUnit4JCFWOutletTemp: string;
  engineUnit5ExhaustTemp: string;
  engineUnit5UnderPistonAir: string;
  engineUnit5PCOOutlet: string;
  engineUnit5JCFWOutletTemp: string;
  engineUnit6ExhaustTemp: string;
  engineUnit6UnderPistonAir: string;
  engineUnit6PCOOutlet: string;
  engineUnit6JCFWOutletTemp: string;
  engineUnit7ExhaustTemp: string; // Optional Unit
  engineUnit7UnderPistonAir: string; // Optional Unit
  engineUnit7PCOOutlet: string; // Optional Unit
  engineUnit7JCFWOutletTemp: string; // Optional Unit
  engineUnit8ExhaustTemp: string; // Optional Unit
  engineUnit8UnderPistonAir: string; // Optional Unit
  engineUnit8PCOOutlet: string; // Optional Unit
  engineUnit8JCFWOutletTemp: string; // Optional Unit
  auxEngineDG1Load: string;
  auxEngineDG1KW: string;
  auxEngineDG1FOPress: string;
  auxEngineDG1LubOilPress: string;
  auxEngineDG1WaterTemp: string;
  auxEngineDG1DailyRunHour: string;
  auxEngineDG2Load: string; // Optional AE
  auxEngineDG2KW: string; // Optional AE
  auxEngineDG2FOPress: string; // Optional AE
  auxEngineDG2LubOilPress: string; // Optional AE
  auxEngineDG2WaterTemp: string; // Optional AE
  auxEngineDG2DailyRunHour: string; // Optional AE
  auxEngineDG3Load: string; // Optional AE
  auxEngineDG3KW: string; // Optional AE
  auxEngineDG3FOPress: string; // Optional AE
  auxEngineDG3LubOilPress: string; // Optional AE
  auxEngineDG3WaterTemp: string; // Optional AE
  auxEngineDG3DailyRunHour: string; // Optional AE
  auxEngineV1Load: string; // Optional AE
  auxEngineV1KW: string; // Optional AE
  auxEngineV1FOPress: string; // Optional AE
  auxEngineV1LubOilPress: string; // Optional AE
  auxEngineV1WaterTemp: string; // Optional AE
  auxEngineV1DailyRunHour: string; // Optional AE
  engineChiefEngineerRemarks: string;
}

// --- Default Values for Arrival Report ---
export const defaultArrivalValues: ArrivalReportFormData = {
  // General Info
  date: '',
  timeZone: '',
  fwdDraft: '',
  aftDraft: '',

  // Navigation - EOSP
  eospDate: '',
  eospTime: '',
  eospLatitude: '',
  eospLatitudeDir: 'N',
  eospLongitude: '',
  eospLongitudeDir: 'E',

  // Navigation - Harbour Steaming
  harbourDistance: '',
  harbourTime: '',

  // Navigation - Distance
  distanceSinceLastReport: '',

  // Navigation - Weather
  windDirection: '',
  windForce: '',
  seaDirection: '',
  seaState: '',
  swellDirection: '',
  swellHeight: '',

  // Navigation - Remarks
  captainRemarks: '',

  // --- Copied Sections Defaults ---
  // Bunker Data
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
  supplyLSIFO: '',
  supplyLSMGO: '',
  supplyCYLOIL: '',
  supplyMEOIL: '',
  supplyAEOIL: '',
  supplyVOLOIL: '',
  bunkerChiefEngineerRemarks: '',

  // Engine/Machinery Data
  engineLoadFOPressure: '',
  engineLoadLubOilPressure: '',
  engineLoadFWInletTemp: '',
  engineLoadLOInletTemp: '',
  engineLoadScavAirTemp: '',
  engineLoadTCRPM1: '',
  engineLoadTCRPM2: '',
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
  engineUnit7ExhaustTemp: '',
  engineUnit7UnderPistonAir: '',
  engineUnit7PCOOutlet: '',
  engineUnit7JCFWOutletTemp: '',
  engineUnit8ExhaustTemp: '',
  engineUnit8UnderPistonAir: '',
  engineUnit8PCOOutlet: '',
  engineUnit8JCFWOutletTemp: '',
  auxEngineDG1Load: '',
  auxEngineDG1KW: '',
  auxEngineDG1FOPress: '',
  auxEngineDG1LubOilPress: '',
  auxEngineDG1WaterTemp: '',
  auxEngineDG1DailyRunHour: '',
  auxEngineDG2Load: '',
  auxEngineDG2KW: '',
  auxEngineDG2FOPress: '',
  auxEngineDG2LubOilPress: '',
  auxEngineDG2WaterTemp: '',
  auxEngineDG2DailyRunHour: '',
  auxEngineDG3Load: '',
  auxEngineDG3KW: '',
  auxEngineDG3FOPress: '',
  auxEngineDG3LubOilPress: '',
  auxEngineDG3WaterTemp: '',
  auxEngineDG3DailyRunHour: '',
  auxEngineV1Load: '',
  auxEngineV1KW: '',
  auxEngineV1FOPress: '',
  auxEngineV1LubOilPress: '',
  auxEngineV1WaterTemp: '',
  auxEngineV1DailyRunHour: '',
  engineChiefEngineerRemarks: '',
};

// --- Validation Rules ---
// Generic type for validation rules
export interface ValidationRule {
  required?: boolean;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: string) => boolean; // For complex validation
  errorMessage: string;
}

// Type for the validation rules object, keyed by field names
// Ensure this type is exported
export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule;
};

// --- Arrival Report Specific Validation Rules ---
export const arrivalValidationRules: ValidationRules<ArrivalReportFormData> = {
  // General Info
  date: { required: true, pattern: VALIDATION_PATTERNS.DATE_YYYYMMDD, errorMessage: 'Valid date is required' },
  timeZone: { required: true, pattern: VALIDATION_PATTERNS.TIMEZONE, errorMessage: 'Valid timezone (e.g., +03, -10) is required' },
  fwdDraft: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Valid FWD draft (number) is required' },
  aftDraft: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Valid AFT draft (number) is required' },

  // Navigation - EOSP
  eospDate: { required: true, pattern: VALIDATION_PATTERNS.DATE_YYYYMMDD, errorMessage: 'Valid EOSP date is required' },
  eospTime: { required: true, pattern: VALIDATION_PATTERNS.TIME_HHMM, errorMessage: 'Valid EOSP time (HH:MM) is required' },
  eospLatitude: { required: true, pattern: VALIDATION_PATTERNS.LATITUDE, errorMessage: 'Valid EOSP latitude is required' },
  eospLongitude: { required: true, pattern: VALIDATION_PATTERNS.LONGITUDE, errorMessage: 'Valid EOSP longitude is required' },
  // eospLatitudeDir and eospLongitudeDir are selects, usually don't need pattern validation if options are controlled

  // Navigation - Harbour Steaming
  harbourDistance: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Valid harbour distance (number) is required' },
  harbourTime: { required: true, pattern: VALIDATION_PATTERNS.TIME_HHMM, errorMessage: 'Valid harbour time (HH:MM) is required' },

  // Navigation - Distance
  distanceSinceLastReport: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Valid distance (number) is required' },

  // Navigation - Weather
  windDirection: { required: true, errorMessage: 'Wind direction is required' },
  windForce: { required: true, pattern: VALIDATION_PATTERNS.WIND_FORCE, errorMessage: 'Valid wind force (0-12) is required' },
  seaDirection: { required: true, errorMessage: 'Sea direction is required' },
  seaState: { required: true, pattern: VALIDATION_PATTERNS.SEA_STATE, errorMessage: 'Valid sea state (0-9) is required' },
  swellDirection: { required: true, errorMessage: 'Swell direction is required' },
  swellHeight: { required: true, pattern: VALIDATION_PATTERNS.SWELL_HEIGHT, errorMessage: 'Valid swell height (0-9) is required' },

  // --- Copied Sections Validation (Using Departure rules as placeholders) ---
  // Bunker Data
  prsRpm: { required: true, pattern: VALIDATION_PATTERNS.INTEGER_ONLY, errorMessage: 'Valid PRS RPM (integer) is required' },
  meLSIFO: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Valid ME LSIFO (number) is required' },
  meLSMGO: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Valid ME LSMGO (number) is required' },
  meCYLOIL: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Valid ME CYL OIL (number) is required' },
  meMEOIL: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Valid ME M/E OIL (number) is required' },
  meAEOIL: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Valid ME A/E OIL (number) is required' },
  boilerLSIFO: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Valid Boiler LSIFO (number) is required' },
  boilerLSMGO: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Valid Boiler LSMGO (number) is required' },
  auxLSIFO: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Valid Aux LSIFO (number) is required' },
  auxLSMGO: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Valid Aux LSMGO (number) is required' },
  harbourLSIFO: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Valid Harbour LSIFO (number) is required' },
  harbourLSMGO: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Valid Harbour LSMGO (number) is required' },
  supplyLSIFO: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Supply LSIFO must be a number' },
  supplyLSMGO: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Supply LSMGO must be a number' },
  supplyCYLOIL: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Supply CYL OIL must be a number' },
  supplyMEOIL: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Supply M/E OIL must be a number' },
  supplyAEOIL: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Supply A/E OIL must be a number' },
  supplyVOLOIL: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Supply VOL OIL must be a number' },

  // Engine/Machinery Data (Placeholders - using Departure rules)
  engineLoadFOPressure: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Valid FO Pressure is required' },
  engineLoadLubOilPressure: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Valid Lub Oil Pressure is required' },
  engineLoadFWInletTemp: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Valid FW Inlet Temp is required' },
  engineLoadLOInletTemp: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Valid LO Inlet Temp is required' },
  engineLoadScavAirTemp: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Valid Scavenge Air Temp is required' },
  engineLoadTCRPM1: { required: true, pattern: VALIDATION_PATTERNS.INTEGER_ONLY, errorMessage: 'Valid TC RPM #1 is required' },
  engineLoadTCRPM2: { pattern: VALIDATION_PATTERNS.INTEGER_ONLY, errorMessage: 'TC RPM #2 must be an integer' }, // Optional
  engineLoadTCExhTempIn: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Valid TC Exhaust Temp In is required' },
  engineLoadTCExhTempOut: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Valid TC Exhaust Temp Out is required' },
  engineLoadThrustBearingTemp: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Valid Thrust Bearing Temp is required' },
  engineLoadDailyRunHour: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Valid Daily Run Hour is required' },
  // Engine Units 1-6 (Required)
  engineUnit1ExhaustTemp: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Required' },
  engineUnit1UnderPistonAir: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Required' },
  engineUnit1PCOOutlet: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Required' },
  engineUnit1JCFWOutletTemp: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Required' },
  engineUnit2ExhaustTemp: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Required' },
  engineUnit2UnderPistonAir: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Required' },
  engineUnit2PCOOutlet: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Required' },
  engineUnit2JCFWOutletTemp: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Required' },
  engineUnit3ExhaustTemp: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Required' },
  engineUnit3UnderPistonAir: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Required' },
  engineUnit3PCOOutlet: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Required' },
  engineUnit3JCFWOutletTemp: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Required' },
  engineUnit4ExhaustTemp: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Required' },
  engineUnit4UnderPistonAir: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Required' },
  engineUnit4PCOOutlet: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Required' },
  engineUnit4JCFWOutletTemp: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Required' },
  engineUnit5ExhaustTemp: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Required' },
  engineUnit5UnderPistonAir: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Required' },
  engineUnit5PCOOutlet: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Required' },
  engineUnit5JCFWOutletTemp: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Required' },
  engineUnit6ExhaustTemp: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Required' },
  engineUnit6UnderPistonAir: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Required' },
  engineUnit6PCOOutlet: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Required' },
  engineUnit6JCFWOutletTemp: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Required' },
  // Engine Units 7-8 (Optional)
  engineUnit7ExhaustTemp: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Must be a number' },
  engineUnit7UnderPistonAir: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Must be a number' },
  engineUnit7PCOOutlet: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Must be a number' },
  engineUnit7JCFWOutletTemp: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Must be a number' },
  engineUnit8ExhaustTemp: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Must be a number' },
  engineUnit8UnderPistonAir: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Must be a number' },
  engineUnit8PCOOutlet: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Must be a number' },
  engineUnit8JCFWOutletTemp: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Must be a number' },
  // Aux Engines DG1 (Required)
  auxEngineDG1Load: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Required' },
  auxEngineDG1KW: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Required' },
  auxEngineDG1FOPress: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Required' },
  auxEngineDG1LubOilPress: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Required' },
  auxEngineDG1WaterTemp: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Required' },
  auxEngineDG1DailyRunHour: { required: true, pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Required' },
  // Aux Engines DG2, DG3, V1 (Optional)
  auxEngineDG2Load: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Must be a number' },
  auxEngineDG2KW: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Must be a number' },
  auxEngineDG2FOPress: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Must be a number' },
  auxEngineDG2LubOilPress: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Must be a number' },
  auxEngineDG2WaterTemp: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Must be a number' },
  auxEngineDG2DailyRunHour: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Must be a number' },
  auxEngineDG3Load: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Must be a number' },
  auxEngineDG3KW: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Must be a number' },
  auxEngineDG3FOPress: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Must be a number' },
  auxEngineDG3LubOilPress: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Must be a number' },
  auxEngineDG3WaterTemp: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Must be a number' },
  auxEngineDG3DailyRunHour: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Must be a number' },
  auxEngineV1Load: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Must be a number' },
  auxEngineV1KW: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Must be a number' },
  auxEngineV1FOPress: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Must be a number' },
  auxEngineV1LubOilPress: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Must be a number' },
  auxEngineV1WaterTemp: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Must be a number' },
  auxEngineV1DailyRunHour: { pattern: VALIDATION_PATTERNS.NUMBER_ONLY, errorMessage: 'Must be a number' },

};
