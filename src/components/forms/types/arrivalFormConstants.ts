// src/components/forms/types/arrivalFormConstants.ts
import type { ProcessedArrivalFormData } from './arrivalFormTypes'; // Import the Zod-inferred type

// --- Options for Select Fields (Copied from departureFormConstants) ---
export const windDirectionOptions = [
  { value: 'N', label: 'N' }, { value: 'NE', label: 'NE' }, { value: 'E', label: 'E' },
  { value: 'SE', label: 'SE' }, { value: 'S', label: 'S' }, { value: 'SW', label: 'SW' },
  { value: 'W', label: 'W' }, { value: 'NW', label: 'NW' },
];

export const seaDirectionOptions = [...windDirectionOptions]; // Same as wind
export const swellDirectionOptions = [...windDirectionOptions]; // Same as wind

export const latDirOptions = [ { value: 'N', label: 'N' }, { value: 'S', label: 'S' } ];
export const lonDirOptions = [ { value: 'E', label: 'E' }, { value: 'W', label: 'W' } ];

// Note: cargoStatusOptions might not be needed for Arrival, but kept here for potential future use or if schema changes.
export const cargoStatusOptions = [
  { value: 'loaded', label: 'Loaded' },
  { value: 'ballast', label: 'Ballast' },
];


// --- Default Values for Arrival Report (Aligned with Zod Schema) ---
// Use Partial because read-only fields might not be part of the schema.
// Use undefined for number fields to work correctly with Zod coercion.
export const defaultArrivalValues: Partial<ProcessedArrivalFormData> = {
  // General Info
  date: '',
  timeZone: '',
  fwdDraft: undefined,
  aftDraft: undefined,

  // Navigation - EOSP
  eospDate: '',
  eospTime: '',
  eospLatitude: undefined,
  eospLatitudeDir: 'N',
  eospLongitude: undefined,
  eospLongitudeDir: 'E',

  // Navigation - Harbour Steaming
  harbourDistance: undefined,
  harbourTime: '',

  // Navigation - Distance
  distanceSinceLastReport: undefined,
  totalDistanceTraveled: undefined, // Display only
  distanceToGo: undefined, // Display only

  // Navigation - Weather
  windDirection: '', // Default for select
  windForce: undefined,
  seaDirection: '', // Default for select
  seaState: undefined,
  swellDirection: '', // Default for select
  swellHeight: undefined,

  // Navigation - Remarks
  captainRemarks: '',

  // --- Bunker Section Defaults ---
  prsRpm: undefined,
  meLSIFO: undefined,
  meLSMGO: undefined,
  meCYLOIL: undefined,
  meMEOIL: undefined,
  meAEOIL: undefined,
  boilerLSIFO: undefined,
  boilerLSMGO: undefined,
  auxLSIFO: undefined,
  auxLSMGO: undefined,
  // harbourLSIFO: undefined, // Removed
  // harbourLSMGO: undefined, // Removed
  supplyLSIFO: undefined,
  supplyLSMGO: undefined,
  supplyCYLOIL: undefined,
  supplyMEOIL: undefined,
  supplyAEOIL: undefined,
  supplyVOLOIL: undefined,
  // ROB and Steaming are read-only, can keep string defaults if needed for display
  robLSIFO: '',
  robLSMGO: '',
  robCYLOIL: '',
  robMEOIL: '',
  robAEOIL: '',
  robVOLOIL: '',
  steamingLSIFO: '',
  steamingLSMGO: '',
  steamingCYLOIL: '',
  steamingMEOIL: '',
  steamingAEOIL: '',
  steamingVOLOIL: '',
  bunkerChiefEngineerRemarks: '',

  // --- Engine/Machinery Defaults ---
  engineLoadFOPressure: undefined,
  engineLoadLubOilPressure: undefined,
  engineLoadFWInletTemp: undefined,
  engineLoadLOInletTemp: undefined,
  engineLoadScavAirTemp: undefined,
  engineLoadTCRPM1: undefined,
  engineLoadTCRPM2: undefined,
  engineLoadTCExhTempIn: undefined,
  engineLoadTCExhTempOut: undefined,
  engineLoadThrustBearingTemp: undefined,
  engineLoadDailyRunHour: undefined,
  engineUnit1ExhaustTemp: undefined,
  engineUnit1UnderPistonAir: undefined,
  engineUnit1PCOOutlet: undefined,
  engineUnit1JCFWOutletTemp: undefined,
  engineUnit2ExhaustTemp: undefined,
  engineUnit2UnderPistonAir: undefined,
  engineUnit2PCOOutlet: undefined,
  engineUnit2JCFWOutletTemp: undefined,
  engineUnit3ExhaustTemp: undefined,
  engineUnit3UnderPistonAir: undefined,
  engineUnit3PCOOutlet: undefined,
  engineUnit3JCFWOutletTemp: undefined,
  engineUnit4ExhaustTemp: undefined,
  engineUnit4UnderPistonAir: undefined,
  engineUnit4PCOOutlet: undefined,
  engineUnit4JCFWOutletTemp: undefined,
  engineUnit5ExhaustTemp: undefined,
  engineUnit5UnderPistonAir: undefined,
  engineUnit5PCOOutlet: undefined,
  engineUnit5JCFWOutletTemp: undefined,
  engineUnit6ExhaustTemp: undefined,
  engineUnit6UnderPistonAir: undefined,
  engineUnit6PCOOutlet: undefined,
  engineUnit6JCFWOutletTemp: undefined,
  engineUnit7ExhaustTemp: undefined,
  engineUnit7UnderPistonAir: undefined,
  engineUnit7PCOOutlet: undefined,
  engineUnit7JCFWOutletTemp: undefined,
  engineUnit8ExhaustTemp: undefined,
  engineUnit8UnderPistonAir: undefined,
  engineUnit8PCOOutlet: undefined,
  engineUnit8JCFWOutletTemp: undefined,
  auxEngineDG1Load: undefined,
  auxEngineDG1KW: undefined,
  auxEngineDG1FOPress: undefined,
  auxEngineDG1LubOilPress: undefined,
  auxEngineDG1WaterTemp: undefined,
  auxEngineDG1DailyRunHour: undefined,
  auxEngineDG2Load: undefined,
  auxEngineDG2KW: undefined,
  auxEngineDG2FOPress: undefined,
  auxEngineDG2LubOilPress: undefined,
  auxEngineDG2WaterTemp: undefined,
  auxEngineDG2DailyRunHour: undefined,
  auxEngineDG3Load: undefined,
  auxEngineDG3KW: undefined,
  auxEngineDG3FOPress: undefined,
  auxEngineDG3LubOilPress: undefined,
  auxEngineDG3WaterTemp: undefined,
  auxEngineDG3DailyRunHour: undefined,
  auxEngineV1Load: undefined,
  auxEngineV1KW: undefined,
  auxEngineV1FOPress: undefined,
  auxEngineV1LubOilPress: undefined,
  auxEngineV1WaterTemp: undefined,
  auxEngineV1DailyRunHour: undefined,
  engineChiefEngineerRemarks: '',
};
