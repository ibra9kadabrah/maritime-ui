// src/components/forms/types/departureFormConstants.ts
import type { ProcessedDepartureFormData } from './departureFormTypes'; // Import the type

// --- Options for Select/Radio Fields ---
export const windDirectionOptions = [
  { value: 'N', label: 'N' }, { value: 'NE', label: 'NE' }, { value: 'E', label: 'E' },
  { value: 'SE', label: 'SE' }, { value: 'S', label: 'S' }, { value: 'SW', label: 'SW' },
  { value: 'W', label: 'W' }, { value: 'NW', label: 'NW' },
];

export const seaDirectionOptions = [...windDirectionOptions]; // Same as wind
export const swellDirectionOptions = [...windDirectionOptions]; // Same as wind

export const latDirOptions = [ { value: 'N', label: 'N' }, { value: 'S', label: 'S' } ];
export const lonDirOptions = [ { value: 'E', label: 'E' }, { value: 'W', label: 'W' } ];

export const cargoStatusOptions = [
  { value: 'loaded', label: 'Loaded' },
  { value: 'ballast', label: 'Ballast' },
];


// --- Default Form Values ---
// Default values aligned with Zod schema types (use undefined for ALL number fields)
// Use Partial because some read-only fields might not be in the schema for submission
export const defaultDepartureValues: Partial<ProcessedDepartureFormData> = {
  date: '',
  timeZone: '',
  cargoType: '',
  cargoQuantity: undefined, // Use undefined for required number input
  fwdDraft: undefined,      // Use undefined for required number input
  aftDraft: undefined,      // Use undefined for required number input
  departurePort: '',
  destinationPort: '',
  etaDate: '',
  etaTime: '',
  cargoStatus: 'loaded', // Default selection
  faspDate: '',
  faspTime: '',
  faspLatitude: undefined,    // Use undefined for required number input
  faspLatitudeDir: 'N',
  faspLongitude: undefined,   // Use undefined for required number input
  faspLongitudeDir: 'E',
  faspCourse: undefined,      // Use undefined for required number input
  harbourDistance: undefined, // Use undefined for required number input
  harbourTime: '',
  voyageDistance: undefined,  // Use undefined for required number input
  totalDistanceTraveled: undefined, // Display only
  distanceToGo: undefined, // Display only
  windDirection: '',   // Default for select
  windForce: undefined,       // Use undefined for required number input
  seaDirection: '',    // Default for select
  seaState: undefined,        // Use undefined for required number input
  swellDirection: '',  // Default for select
  swellHeight: undefined,     // Use undefined for required number input
  captainRemarks: '',
  // Bunker Defaults
  prsRpm: undefined,          // Use undefined for required number input
  meLSIFO: undefined,         // Use undefined for required number input
  meLSMGO: undefined,         // Use undefined for required number input
  meCYLOIL: undefined,        // Use undefined for required number input
  meMEOIL: undefined,         // Use undefined for required number input
  meAEOIL: undefined,         // Use undefined for required number input
  boilerLSIFO: undefined,     // Use undefined for required number input
  boilerLSMGO: undefined,     // Use undefined for required number input
  auxLSIFO: undefined,        // Use undefined for required number input
  auxLSMGO: undefined,        // Use undefined for required number input
  // harbourLSIFO: undefined,    // Removed
  // harbourLSMGO: undefined,    // Removed
  supplyLSIFO: undefined, // Use undefined for optional number
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
  // Engine/Machinery Defaults
  engineLoadFOPressure: undefined,      // Use undefined for required number input
  engineLoadLubOilPressure: undefined,  // Use undefined for required number input
  engineLoadFWInletTemp: undefined,     // Use undefined for required number input
  engineLoadLOInletTemp: undefined,     // Use undefined for required number input
  engineLoadScavAirTemp: undefined,     // Use undefined for required number input
  engineLoadTCRPM1: undefined,          // Use undefined for required number input
  engineLoadTCRPM2: undefined,   // Use undefined for optional number
  engineLoadTCExhTempIn: undefined,     // Use undefined for required number input
  engineLoadTCExhTempOut: undefined,    // Use undefined for required number input
  engineLoadThrustBearingTemp: undefined,// Use undefined for required number input
  engineLoadDailyRunHour: undefined,    // Use undefined for required number input
  engineUnit1ExhaustTemp: undefined,    // Use undefined for required number input
  engineUnit1UnderPistonAir: undefined, // Use undefined for required number input
  engineUnit1PCOOutlet: undefined,      // Use undefined for required number input
  engineUnit1JCFWOutletTemp: undefined, // Use undefined for required number input
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
  engineUnit7ExhaustTemp: undefined,    // Use undefined for optional number
  engineUnit7UnderPistonAir: undefined,
  engineUnit7PCOOutlet: undefined,
  engineUnit7JCFWOutletTemp: undefined,
  engineUnit8ExhaustTemp: undefined,
  engineUnit8UnderPistonAir: undefined,
  engineUnit8PCOOutlet: undefined,
  engineUnit8JCFWOutletTemp: undefined,
  auxEngineDG1Load: undefined,          // Use undefined for required number input
  auxEngineDG1KW: undefined,            // Use undefined for required number input
  auxEngineDG1FOPress: undefined,       // Use undefined for required number input
  auxEngineDG1LubOilPress: undefined,   // Use undefined for required number input
  auxEngineDG1WaterTemp: undefined,     // Use undefined for required number input
  auxEngineDG1DailyRunHour: undefined,  // Use undefined for required number input
  auxEngineDG2Load: undefined,   // Use undefined for optional number
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
  engineChiefEngineerRemarks: ''
};
