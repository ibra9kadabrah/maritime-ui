// src/components/forms/types/noonFormTypes.ts
import * as z from 'zod';
import * as Patterns from '../../../utils/validationPatterns'; // Import all patterns

// Re-export the patterns under the original name for compatibility (might be removable later)
export const VALIDATION_PATTERNS = Patterns.VALIDATION_PATTERNS;

// --- Reusable Form Styles ---
// (Keep as is)
export const FORM_STYLES = {
  EDITABLE_INPUT: 'w-full p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
  READONLY_INPUT: 'w-full p-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed',
  ERROR_BORDER: 'border-red-500',
  NORMAL_BORDER: 'border-gray-300', // Ensure this is the default border color used in EDITABLE_INPUT
};

// --- Zod Schema Definition ---

// Helper Schemas
const requiredString = z.string().min(1, { message: "This field is required" });
const requiredPositiveNumber = z.coerce.number({
  required_error: "This field is required",
  invalid_type_error: "Must be a number"
}).positive({ message: "Must be a positive number" });
const requiredNumber = z.coerce.number({
  required_error: "This field is required",
  invalid_type_error: "Must be a number"
});
const requiredInteger = z.coerce.number({
  required_error: "This field is required",
  invalid_type_error: "Must be a whole number"
}).int({ message: "Must be a whole number" });

const preprocessOptionalString = (val: unknown) => (val === '' ? undefined : val);
const optionalPositiveNumber = z.preprocess(
  preprocessOptionalString,
  z.coerce.number({ invalid_type_error: "Must be a number" })
    .positive({ message: "Must be a positive number" })
    .optional()
);
const optionalNumber = z.preprocess(
  preprocessOptionalString,
  z.coerce.number({ invalid_type_error: "Must be a number" }).optional()
);
const optionalInteger = z.preprocess(
  preprocessOptionalString,
  z.coerce.number({ invalid_type_error: "Must be a whole number" })
    .int({ message: "Must be a whole number" })
    .positive({ message: "Must be positive" }) // Assuming optional integers should also be positive
    .optional()
);


// Main Zod Schema for Noon Report
export const noonReportSchema = z.object({
  // General Info
  date: requiredString, // Assuming YYYY-MM-DD
  timeZone: z.string().regex(VALIDATION_PATTERNS.TIMEZONE, { message: "Time zone must be like +03 or -10" }),
  fwdDraft: requiredPositiveNumber.max(30, { message: 'Draft must be between 0 and 30' }), // Added range like departure
  aftDraft: requiredPositiveNumber.max(30, { message: 'Draft must be between 0 and 30' }), // Added range like departure

  // Navigation - Position (Required regardless of state)
  positionDate: requiredString,
  positionTime: requiredString.regex(VALIDATION_PATTERNS.TIME_HHMM, { message: "Time must be HH:MM" }),
  positionLatitude: requiredNumber.min(0).max(90, { message: 'Latitude must be 0-90' }),
  positionLatitudeDir: z.enum(['N', 'S']),
  positionLongitude: requiredNumber.min(0).max(180, { message: 'Longitude must be 0-180' }),
  positionLongitudeDir: z.enum(['E', 'W']),
  course: requiredInteger.min(0).max(359, { message: 'Course must be 0-359' }),

  // Navigation - SOSP/ROSP Specific Details (Optional - Zod handles optionality)
  // These fields are only relevant if passageState is 'sosp' or 'rosp',
  // but we define them as optional in the base schema. Logic to require them
  // based on passageState would need refinement (e.g., using .superRefine or conditional logic in component).
  sospRosPDate: z.preprocess(preprocessOptionalString, z.string().optional()), // Preprocess empty string to undefined
  sospRosPTime: z.preprocess(
      preprocessOptionalString, // Convert "" to undefined first
      z.string().regex(VALIDATION_PATTERNS.TIME_HHMM, { message: "Time must be HH:MM" }).optional() // Then apply regex if not undefined
  ),
  sospRosPLatitude: optionalNumber.refine(val => val === undefined || (val >= 0 && val <= 90), { message: 'Latitude must be 0-90' }), // optionalNumber already preprocesses
  sospRosPLatitudeDir: z.preprocess(preprocessOptionalString, z.enum(['N', 'S']).optional()), // Preprocess empty string to undefined
  sospRosPLongitude: optionalNumber.refine(val => val === undefined || (val >= 0 && val <= 180), { message: 'Longitude must be 0-180' }), // optionalNumber already preprocesses
  sospRosPLongitudeDir: z.enum(['E', 'W']).optional(),

  // Navigation - Distance
  distanceSinceLastReport: requiredPositiveNumber, // Input: Distance covered since last report
  totalDistanceTraveled: z.number().optional(), // Display only: Calculated cumulative distance
  distanceToGo: z.number().optional(), // Display only: Calculated remaining sea distance

  // Navigation - Weather
  windDirection: requiredString, // Assuming select dropdown prevents empty selection if required
  windForce: requiredInteger.min(0).max(12, { message: 'Wind force must be 0-12' }),
  seaDirection: requiredString,
  seaState: requiredInteger.min(0).max(9, { message: 'Sea state must be 0-9' }),
  swellDirection: requiredString,
  swellHeight: requiredInteger.min(0).max(9, { message: 'Swell height must be 0-9' }),

  // Navigation - Remarks
  captainRemarks: z.string().optional(),

  // --- Bunker Section (No Harbour) ---
  prsRpm: requiredInteger.positive({ message: "PRS RPM must be positive" }),
  // Main Engine Consumption
  meLSIFO: requiredPositiveNumber,
  meLSMGO: requiredPositiveNumber,
  meCYLOIL: requiredPositiveNumber,
  meMEOIL: requiredPositiveNumber,
  meAEOIL: requiredPositiveNumber,
  // Boiler Consumption
  boilerLSIFO: requiredPositiveNumber,
  boilerLSMGO: requiredPositiveNumber,
  // Aux Consumption
  auxLSIFO: requiredPositiveNumber,
  auxLSMGO: requiredPositiveNumber,
  // Bunker Supply (Optional)
  supplyLSIFO: optionalPositiveNumber,
  supplyLSMGO: optionalPositiveNumber,
  supplyCYLOIL: optionalPositiveNumber,
  supplyMEOIL: optionalPositiveNumber,
  supplyAEOIL: optionalPositiveNumber,
  supplyVOLOIL: optionalPositiveNumber,

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

  // Bunker Remarks
  bunkerChiefEngineerRemarks: z.string().optional(),

  // --- Engine/Machinery Section ---
  // Main Engine Parameters
  engineLoadFOPressure: requiredPositiveNumber,
  engineLoadLubOilPressure: requiredPositiveNumber,
  engineLoadFWInletTemp: requiredNumber, // Assuming temp can be negative
  engineLoadLOInletTemp: requiredNumber, // Assuming temp can be negative
  engineLoadScavAirTemp: requiredNumber, // Assuming temp can be negative
  engineLoadTCRPM1: requiredInteger.positive({ message: "TC RPM #1 must be positive" }),
  engineLoadTCRPM2: optionalInteger, // Already positive check in helper
  engineLoadTCExhTempIn: requiredNumber,
  engineLoadTCExhTempOut: requiredNumber,
  engineLoadThrustBearingTemp: requiredNumber,
  engineLoadDailyRunHour: requiredPositiveNumber,
  // Engine Units (Units 1-6 Required, 7-8 Optional)
  engineUnit1ExhaustTemp: requiredNumber,
  engineUnit1UnderPistonAir: requiredPositiveNumber,
  engineUnit1PCOOutlet: requiredPositiveNumber,
  engineUnit1JCFWOutletTemp: requiredNumber,
  engineUnit2ExhaustTemp: requiredNumber,
  engineUnit2UnderPistonAir: requiredPositiveNumber,
  engineUnit2PCOOutlet: requiredPositiveNumber,
  engineUnit2JCFWOutletTemp: requiredNumber,
  engineUnit3ExhaustTemp: requiredNumber,
  engineUnit3UnderPistonAir: requiredPositiveNumber,
  engineUnit3PCOOutlet: requiredPositiveNumber,
  engineUnit3JCFWOutletTemp: requiredNumber,
  engineUnit4ExhaustTemp: requiredNumber,
  engineUnit4UnderPistonAir: requiredPositiveNumber,
  engineUnit4PCOOutlet: requiredPositiveNumber,
  engineUnit4JCFWOutletTemp: requiredNumber,
  engineUnit5ExhaustTemp: requiredNumber,
  engineUnit5UnderPistonAir: requiredPositiveNumber,
  engineUnit5PCOOutlet: requiredPositiveNumber,
  engineUnit5JCFWOutletTemp: requiredNumber,
  engineUnit6ExhaustTemp: requiredNumber,
  engineUnit6UnderPistonAir: requiredPositiveNumber,
  engineUnit6PCOOutlet: requiredPositiveNumber,
  engineUnit6JCFWOutletTemp: requiredNumber,
  // Optional Units (7-8)
  engineUnit7ExhaustTemp: optionalNumber,
  engineUnit7UnderPistonAir: optionalPositiveNumber,
  engineUnit7PCOOutlet: optionalPositiveNumber,
  engineUnit7JCFWOutletTemp: optionalNumber,
  engineUnit8ExhaustTemp: optionalNumber,
  engineUnit8UnderPistonAir: optionalPositiveNumber,
  engineUnit8PCOOutlet: optionalPositiveNumber,
  engineUnit8JCFWOutletTemp: optionalNumber,
  // Auxiliary Engines (DG1 Mandatory, others Optional)
  auxEngineDG1Load: requiredPositiveNumber,
  auxEngineDG1KW: requiredPositiveNumber,
  auxEngineDG1FOPress: requiredPositiveNumber,
  auxEngineDG1LubOilPress: requiredPositiveNumber,
  auxEngineDG1WaterTemp: requiredNumber,
  auxEngineDG1DailyRunHour: requiredPositiveNumber,
  // Optional Auxiliary Engines (DG2, DG3, V1)
  auxEngineDG2Load: optionalPositiveNumber,
  auxEngineDG2KW: optionalPositiveNumber,
  auxEngineDG2FOPress: optionalPositiveNumber,
  auxEngineDG2LubOilPress: optionalPositiveNumber,
  auxEngineDG2WaterTemp: optionalNumber,
  auxEngineDG2DailyRunHour: optionalPositiveNumber,
  auxEngineDG3Load: optionalPositiveNumber,
  auxEngineDG3KW: optionalPositiveNumber,
  auxEngineDG3FOPress: optionalPositiveNumber,
  auxEngineDG3LubOilPress: optionalPositiveNumber,
  auxEngineDG3WaterTemp: optionalNumber,
  auxEngineDG3DailyRunHour: optionalPositiveNumber,
  auxEngineV1Load: optionalPositiveNumber,
  auxEngineV1KW: optionalPositiveNumber,
  auxEngineV1FOPress: optionalPositiveNumber,
  auxEngineV1LubOilPress: optionalPositiveNumber,
  auxEngineV1WaterTemp: optionalNumber,
  auxEngineV1DailyRunHour: optionalPositiveNumber,
  // Engine Remarks
  engineChiefEngineerRemarks: z.string().optional(),
});

// Inferred type from the schema
export type ProcessedNoonFormData = z.infer<typeof noonReportSchema>;

// --- Remove Old Interface and Validation Rules ---
// export interface NoonReportFormData { ... } // Removed
// export interface ValidationRule { ... }; // Removed
// export type ValidationRules<T> = { ... }; // Removed
// export const noonValidationRules: ValidationRules<NoonReportFormData> = { ... }; // Removed
