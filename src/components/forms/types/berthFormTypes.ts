// src/components/forms/types/berthFormTypes.ts
import { z } from 'zod';
import {
    DATE_YYYYMMDD,
    TIME_HHMM,
    TIMEZONE,
    LATITUDE,
    LONGITUDE,
    WIND_FORCE,
    SEA_STATE,
    SWELL_HEIGHT,
} from '../../../utils/validationPatterns'; // Import shared patterns

// --- Reusable Form Styles ---
// (Copied from arrivalFormTypes.ts) - Kept as it might be used elsewhere or directly by the form
export const FORM_STYLES = {
  EDITABLE_INPUT: 'w-full p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
  READONLY_INPUT: 'w-full p-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed',
  ERROR_BORDER: 'border-red-500',
  NORMAL_BORDER: 'border-gray-300', // Ensure this is the default border color used in EDITABLE_INPUT
};

// --- Zod Schema for Berth Report ---
export const berthReportSchema = z.object({
  // General Info
  date: z.string().regex(DATE_YYYYMMDD, { message: 'Valid date (YYYY-MM-DD) is required' }),
  timeZone: z.string().regex(TIMEZONE, { message: 'Valid timezone (e.g., +03, -10) is required' }),
  berthNumber: z.string().min(1, { message: 'Berth number is required' }),
  fwdDraft: z.coerce.number({ invalid_type_error: 'Valid FWD draft (number) is required' }).positive({ message: 'FWD draft must be positive' }),
  aftDraft: z.coerce.number({ invalid_type_error: 'Valid AFT draft (number) is required' }).positive({ message: 'AFT draft must be positive' }),

  // Navigation (Simplified for Berth)
  faspDate: z.string().regex(DATE_YYYYMMDD, { message: 'Valid berth date (YYYY-MM-DD) is required' }),
  faspTime: z.string().regex(TIME_HHMM, { message: 'Valid berth time (HH:MM) is required' }),
  faspLatitude: z.string().regex(LATITUDE, { message: 'Valid berth latitude is required' }), // Keep as string for input flexibility
  faspLatitudeDir: z.enum(['N', 'S']),
  faspLongitude: z.string().regex(LONGITUDE, { message: 'Valid berth longitude is required' }), // Keep as string for input flexibility
  faspLongitudeDir: z.enum(['E', 'W']),
  totalDistanceTraveled: z.number().optional(), // Display only: Calculated cumulative distance

  // Navigation - Weather
  windDirection: z.string().min(1, { message: 'Wind direction is required' }),
  windForce: z.string().regex(WIND_FORCE, { message: 'Valid wind force (0-12) is required' }), // Keep as string for input flexibility
  seaDirection: z.string().min(1, { message: 'Sea direction is required' }),
  seaState: z.string().regex(SEA_STATE, { message: 'Valid sea state (0-9) is required' }), // Keep as string for input flexibility
  swellDirection: z.string().min(1, { message: 'Swell direction is required' }),
  swellHeight: z.string().regex(SWELL_HEIGHT, { message: 'Valid swell height (0-9) is required' }), // Keep as string for input flexibility

  // Navigation - Remarks
  captainRemarks: z.string().optional(),

  // Cargo Operations (Optional numeric fields)
  cargoUnloadedMT: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Must be a number' }).positive().optional()),
  cargoLoadedMT: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Must be a number' }).positive().optional()),
  loadingStartDate: z.string().regex(DATE_YYYYMMDD, { message: 'Invalid date format' }).optional().or(z.literal('')),
  loadingStartTime: z.string().regex(TIME_HHMM, { message: 'Invalid time format' }).optional().or(z.literal('')),
  loadingEndDate: z.string().regex(DATE_YYYYMMDD, { message: 'Invalid date format' }).optional().or(z.literal('')),
  loadingEndTime: z.string().regex(TIME_HHMM, { message: 'Invalid time format' }).optional().or(z.literal('')),
  unloadingStartDate: z.string().regex(DATE_YYYYMMDD, { message: 'Invalid date format' }).optional().or(z.literal('')),
  unloadingStartTime: z.string().regex(TIME_HHMM, { message: 'Invalid time format' }).optional().or(z.literal('')),
  unloadingEndDate: z.string().regex(DATE_YYYYMMDD, { message: 'Invalid date format' }).optional().or(z.literal('')),
  unloadingEndTime: z.string().regex(TIME_HHMM, { message: 'Invalid time format' }).optional().or(z.literal('')),
  cargoOpsRemarks: z.string().optional(),

  // Bunker Data (Matching Noon Report Structure - ME fields optional)
  prsRpm: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'PRS RPM must be an integer' }).int().nonnegative().optional()), // Added optional PRS RPM
  meLSIFO: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'ME LSIFO must be a number' }).nonnegative().optional()), // Added optional ME LSIFO
  meLSMGO: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'ME LSMGO must be a number' }).nonnegative().optional()), // Added optional ME LSMGO
  meCYLOIL: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'ME CYL OIL must be a number' }).nonnegative().optional()), // Added optional ME CYL OIL
  meMEOIL: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'ME M/E OIL must be a number' }).nonnegative().optional()), // Added optional ME M/E OIL
  meAEOIL: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'ME A/E OIL must be a number' }).nonnegative().optional()), // Added optional ME A/E OIL
  boilerLSIFO: z.coerce.number({ invalid_type_error: 'Valid Boiler LSIFO (number) is required' }).nonnegative(),
  boilerLSMGO: z.coerce.number({ invalid_type_error: 'Valid Boiler LSMGO (number) is required' }).nonnegative(),
  auxLSIFO: z.coerce.number({ invalid_type_error: 'Valid Aux LSIFO (number) is required' }).nonnegative(),
  auxLSMGO: z.coerce.number({ invalid_type_error: 'Valid Aux LSMGO (number) is required' }).nonnegative(),
  // harbourLSIFO: z.coerce.number({ invalid_type_error: 'Valid Harbour LSIFO (number) is required' }).nonnegative(), // Removed Harbour fields
  // harbourLSMGO: z.coerce.number({ invalid_type_error: 'Valid Harbour LSMGO (number) is required' }).nonnegative(), // Removed Harbour fields
  supplyLSIFO: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Supply LSIFO must be a number' }).nonnegative().optional()),
  supplyLSMGO: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Supply LSMGO must be a number' }).nonnegative().optional()),
  supplyCYLOIL: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Supply CYL OIL must be a number' }).nonnegative().optional()),
  supplyMEOIL: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Supply M/E OIL must be a number' }).nonnegative().optional()),
  supplyAEOIL: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Supply A/E OIL must be a number' }).nonnegative().optional()),
  supplyVOLOIL: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Supply VOL OIL must be a number' }).nonnegative().optional()),

  // Bunker ROB (Read Only - not part of validation schema for submission, but keep for type)
  robLSIFO: z.string().optional(),
  robLSMGO: z.string().optional(),
  robCYLOIL: z.string().optional(),
  robMEOIL: z.string().optional(),
  robAEOIL: z.string().optional(),
  robVOLOIL: z.string().optional(),

  // Steaming Consumption (Read Only - not part of validation schema)
  steamingLSIFO: z.string().optional(),
  steamingLSMGO: z.string().optional(),
  steamingCYLOIL: z.string().optional(),
  steamingMEOIL: z.string().optional(),
  steamingAEOIL: z.string().optional(),
  steamingVOLOIL: z.string().optional(),

  bunkerChiefEngineerRemarks: z.string().optional(),

  // Engine/Machinery Data (Required and Optional numeric fields)
  engineLoadFOPressure: z.coerce.number({ invalid_type_error: 'Valid FO Pressure is required' }).nonnegative(),
  engineLoadLubOilPressure: z.coerce.number({ invalid_type_error: 'Valid Lub Oil Pressure is required' }).nonnegative(),
  engineLoadFWInletTemp: z.coerce.number({ invalid_type_error: 'Valid FW Inlet Temp is required' }).nonnegative(), // Assuming temp can be 0
  engineLoadLOInletTemp: z.coerce.number({ invalid_type_error: 'Valid LO Inlet Temp is required' }).nonnegative(), // Assuming temp can be 0
  engineLoadScavAirTemp: z.coerce.number({ invalid_type_error: 'Valid Scavenge Air Temp is required' }).nonnegative(), // Assuming temp can be 0
  engineLoadTCRPM1: z.coerce.number({ invalid_type_error: 'Valid TC RPM #1 is required' }).int().nonnegative(),
  engineLoadTCRPM2: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'TC RPM #2 must be an integer' }).int().nonnegative().optional()),
  engineLoadTCExhTempIn: z.coerce.number({ invalid_type_error: 'Valid TC Exhaust Temp In is required' }).nonnegative(), // Assuming temp can be 0
  engineLoadTCExhTempOut: z.coerce.number({ invalid_type_error: 'Valid TC Exhaust Temp Out is required' }).nonnegative(), // Assuming temp can be 0
  engineLoadThrustBearingTemp: z.coerce.number({ invalid_type_error: 'Valid Thrust Bearing Temp is required' }).nonnegative(), // Assuming temp can be 0
  engineLoadDailyRunHour: z.coerce.number({ invalid_type_error: 'Valid Daily Run Hour is required' }).nonnegative(),

  // Engine Units 1-6 (Required) - Assuming non-negative numbers
  engineUnit1ExhaustTemp: z.coerce.number({ invalid_type_error: 'Required' }).nonnegative(),
  engineUnit1UnderPistonAir: z.coerce.number({ invalid_type_error: 'Required' }).nonnegative(),
  engineUnit1PCOOutlet: z.coerce.number({ invalid_type_error: 'Required' }).nonnegative(),
  engineUnit1JCFWOutletTemp: z.coerce.number({ invalid_type_error: 'Required' }).nonnegative(),
  engineUnit2ExhaustTemp: z.coerce.number({ invalid_type_error: 'Required' }).nonnegative(),
  engineUnit2UnderPistonAir: z.coerce.number({ invalid_type_error: 'Required' }).nonnegative(),
  engineUnit2PCOOutlet: z.coerce.number({ invalid_type_error: 'Required' }).nonnegative(),
  engineUnit2JCFWOutletTemp: z.coerce.number({ invalid_type_error: 'Required' }).nonnegative(),
  engineUnit3ExhaustTemp: z.coerce.number({ invalid_type_error: 'Required' }).nonnegative(),
  engineUnit3UnderPistonAir: z.coerce.number({ invalid_type_error: 'Required' }).nonnegative(),
  engineUnit3PCOOutlet: z.coerce.number({ invalid_type_error: 'Required' }).nonnegative(),
  engineUnit3JCFWOutletTemp: z.coerce.number({ invalid_type_error: 'Required' }).nonnegative(),
  engineUnit4ExhaustTemp: z.coerce.number({ invalid_type_error: 'Required' }).nonnegative(),
  engineUnit4UnderPistonAir: z.coerce.number({ invalid_type_error: 'Required' }).nonnegative(),
  engineUnit4PCOOutlet: z.coerce.number({ invalid_type_error: 'Required' }).nonnegative(),
  engineUnit4JCFWOutletTemp: z.coerce.number({ invalid_type_error: 'Required' }).nonnegative(),
  engineUnit5ExhaustTemp: z.coerce.number({ invalid_type_error: 'Required' }).nonnegative(),
  engineUnit5UnderPistonAir: z.coerce.number({ invalid_type_error: 'Required' }).nonnegative(),
  engineUnit5PCOOutlet: z.coerce.number({ invalid_type_error: 'Required' }).nonnegative(),
  engineUnit5JCFWOutletTemp: z.coerce.number({ invalid_type_error: 'Required' }).nonnegative(),
  engineUnit6ExhaustTemp: z.coerce.number({ invalid_type_error: 'Required' }).nonnegative(),
  engineUnit6UnderPistonAir: z.coerce.number({ invalid_type_error: 'Required' }).nonnegative(),
  engineUnit6PCOOutlet: z.coerce.number({ invalid_type_error: 'Required' }).nonnegative(),
  engineUnit6JCFWOutletTemp: z.coerce.number({ invalid_type_error: 'Required' }).nonnegative(),

  // Engine Units 7-8 (Optional)
  engineUnit7ExhaustTemp: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Must be a number' }).nonnegative().optional()),
  engineUnit7UnderPistonAir: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Must be a number' }).nonnegative().optional()),
  engineUnit7PCOOutlet: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Must be a number' }).nonnegative().optional()),
  engineUnit7JCFWOutletTemp: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Must be a number' }).nonnegative().optional()),
  engineUnit8ExhaustTemp: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Must be a number' }).nonnegative().optional()),
  engineUnit8UnderPistonAir: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Must be a number' }).nonnegative().optional()),
  engineUnit8PCOOutlet: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Must be a number' }).nonnegative().optional()),
  engineUnit8JCFWOutletTemp: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Must be a number' }).nonnegative().optional()),

  // Aux Engines DG1 (Required)
  auxEngineDG1Load: z.coerce.number({ invalid_type_error: 'Required' }).nonnegative(),
  auxEngineDG1KW: z.coerce.number({ invalid_type_error: 'Required' }).nonnegative(),
  auxEngineDG1FOPress: z.coerce.number({ invalid_type_error: 'Required' }).nonnegative(),
  auxEngineDG1LubOilPress: z.coerce.number({ invalid_type_error: 'Required' }).nonnegative(),
  auxEngineDG1WaterTemp: z.coerce.number({ invalid_type_error: 'Required' }).nonnegative(),
  auxEngineDG1DailyRunHour: z.coerce.number({ invalid_type_error: 'Required' }).nonnegative(),

  // Aux Engines DG2, DG3, V1 (Optional)
  auxEngineDG2Load: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Must be a number' }).nonnegative().optional()),
  auxEngineDG2KW: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Must be a number' }).nonnegative().optional()),
  auxEngineDG2FOPress: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Must be a number' }).nonnegative().optional()),
  auxEngineDG2LubOilPress: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Must be a number' }).nonnegative().optional()),
  auxEngineDG2WaterTemp: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Must be a number' }).nonnegative().optional()),
  auxEngineDG2DailyRunHour: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Must be a number' }).nonnegative().optional()),
  auxEngineDG3Load: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Must be a number' }).nonnegative().optional()),
  auxEngineDG3KW: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Must be a number' }).nonnegative().optional()),
  auxEngineDG3FOPress: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Must be a number' }).nonnegative().optional()),
  auxEngineDG3LubOilPress: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Must be a number' }).nonnegative().optional()),
  auxEngineDG3WaterTemp: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Must be a number' }).nonnegative().optional()),
  auxEngineDG3DailyRunHour: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Must be a number' }).nonnegative().optional()),
  auxEngineV1Load: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Must be a number' }).nonnegative().optional()),
  auxEngineV1KW: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Must be a number' }).nonnegative().optional()),
  auxEngineV1FOPress: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Must be a number' }).nonnegative().optional()),
  auxEngineV1LubOilPress: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Must be a number' }).nonnegative().optional()),
  auxEngineV1WaterTemp: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Must be a number' }).nonnegative().optional()),
  auxEngineV1DailyRunHour: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number({ invalid_type_error: 'Must be a number' }).nonnegative().optional()),

  engineChiefEngineerRemarks: z.string().optional(),
});

// --- Inferred Type from Zod Schema ---
export type ProcessedBerthFormData = z.infer<typeof berthReportSchema>;

// Note: defaultBerthValues is now defined in berthFormConstants.ts
// Note: The old BerthReportFormData interface, VALIDATION_PATTERNS, defaultBerthValues,
//       ValidationRule interface, ValidationRules type, and berthValidationRules object
//       have been removed as they are replaced by the Zod schema and shared patterns.
