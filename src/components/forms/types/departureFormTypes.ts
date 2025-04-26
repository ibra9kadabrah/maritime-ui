import * as z from 'zod';

// Common validation patterns (can be removed later if Zod handles all cases)
// export const VALIDATION_PATTERNS = { ... };

// Form field validation rule (OLD - can be removed after refactor)
// export interface ValidationRule { ... };

// Map of field names to validation rules (OLD - can be removed after refactor)
// export type ValidationRules = { ... };

// Departure Report Form data interface (OLD - Zod schema will infer the type)
/*
export interface DepartureReportFormData { ... }
*/

// --- Zod Schema Definition ---

// Helper Schemas for common patterns

// Required string: Must not be empty
const requiredString = z.string().min(1, { message: "This field is required" });

// Preprocessor for optional fields: Convert empty string to undefined
const preprocessOptionalString = (val: unknown) => (val === '' ? undefined : val);

// Main Zod Schema for Departure Report
export const departureReportSchema = z.object({
  // General Information
  date: requiredString, // Assuming HTML date input provides YYYY-MM-DD
  timeZone: z.string().regex(/^[+-](0\d|1[0-4])$/, { message: "Time zone must be like +03 or -10" }),
  cargoType: requiredString.regex(/^[a-zA-Z\s\-.,]*$/, { message: 'Invalid characters in Cargo Type' }),
  cargoQuantity: z.coerce.number({
    required_error: "Cargo quantity is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),

  fwdDraft: z.coerce.number({
    required_error: "Forward draft is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" })
    .max(30, { message: 'Draft must be between 0 and 30' }),

  aftDraft: z.coerce.number({
    required_error: "Aft draft is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" })
    .max(30, { message: 'Draft must be between 0 and 30' }),

  departurePort: requiredString.regex(/^[a-zA-Z\s\-.,]*$/, { message: 'Invalid characters in Departure Port' }),
  destinationPort: requiredString.regex(/^[a-zA-Z\s\-.,]*$/, { message: 'Invalid characters in Destination Port' }),

  // Voyage Information
  etaDate: requiredString, // Assuming HTML date input
  etaTime: requiredString, // Assuming HTML time input HH:MM
  cargoStatus: z.enum(['loaded', 'ballast'], { errorMap: () => ({ message: 'Cargo status is required' }) }),

  // Navigation Data - FASP
  faspDate: requiredString,
  faspTime: requiredString,
  faspLatitude: z.coerce.number({
    required_error: "Latitude is required",
    invalid_type_error: "Must be a number"
  }).min(0, { message: 'Latitude must be between 0 and 90' })
    .max(90, { message: 'Latitude must be between 0 and 90' }),

  faspLatitudeDir: z.enum(['N', 'S'], { errorMap: () => ({ message: 'Latitude direction is required' }) }),

  faspLongitude: z.coerce.number({
    required_error: "Longitude is required",
    invalid_type_error: "Must be a number"
  }).min(0, { message: 'Longitude must be between 0 and 180' })
    .max(180, { message: 'Longitude must be between 0 and 180' }),

  faspLongitudeDir: z.enum(['E', 'W'], { errorMap: () => ({ message: 'Longitude direction is required' }) }),

  faspCourse: z.coerce.number({
    required_error: "Course is required",
    invalid_type_error: "Must be a whole number"
  }).int({ message: "Must be a whole number" })
    .min(0, { message: 'Course must be between 0 and 359' })
    .max(359, { message: 'Course must be between 0 and 359' }),

  // Harbour Steaming
  harbourDistance: z.coerce.number({
    required_error: "Harbour distance is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),

  harbourTime: requiredString, // Assuming HH:MM format

  // Voyage Distance
  voyageDistance: z.coerce.number({ // Input: Planned voyage distance FASP to EOSP
    required_error: "Voyage distance is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),
  totalDistanceTraveled: z.number().optional(), // Display only: Calculated cumulative distance (starts with harbourDistance)
  distanceToGo: z.number().optional(), // Display only: Calculated remaining sea distance (starts with voyageDistance)


  // Weather Data
  windDirection: requiredString, // Assuming select dropdown has a default "" value

  windForce: z.coerce.number({
    required_error: "Wind force is required",
    invalid_type_error: "Must be a whole number"
  }).int({ message: "Must be a whole number" })
    .min(0, { message: 'Wind force must be between 0 and 12' })
    .max(12, { message: 'Wind force must be between 0 and 12' }),

  seaDirection: requiredString, // Assuming select dropdown

  seaState: z.coerce.number({
    required_error: "Sea state is required",
    invalid_type_error: "Must be a whole number"
  }).int({ message: "Must be a whole number" })
    .min(0, { message: 'Sea state must be between 0 and 9' })
    .max(9, { message: 'Sea state must be between 0 and 9' }),

  swellDirection: requiredString, // Assuming select dropdown

  swellHeight: z.coerce.number({
    required_error: "Swell height is required",
    invalid_type_error: "Must be a whole number"
  }).int({ message: "Must be a whole number" })
    .min(0, { message: 'Swell height must be between 0 and 9' })
    .max(9, { message: 'Swell height must be between 0 and 9' }),

  // Remarks
  captainRemarks: z.string().optional(),

  // --- Bunker Section ---
  prsRpm: z.coerce.number({
    required_error: "PRS RPM is required",
    invalid_type_error: "Must be a whole number"
  }).int({ message: "Must be a whole number" })
    .positive({ message: "PRS RPM must be positive" }),

  // Main Engine Consumption
  meLSIFO: z.coerce.number({
    required_error: "ME LSIFO is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),

  meLSMGO: z.coerce.number({
    required_error: "ME LSMGO is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),

  meCYLOIL: z.coerce.number({
    required_error: "ME CYL OIL is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),

  meMEOIL: z.coerce.number({
    required_error: "ME M/E OIL is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),

  meAEOIL: z.coerce.number({
    required_error: "ME A/E OIL is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),

  // Boiler Consumption
  boilerLSIFO: z.coerce.number({
    required_error: "Boiler LSIFO is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),

  boilerLSMGO: z.coerce.number({
    required_error: "Boiler LSMGO is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),

  // Aux Consumption
  auxLSIFO: z.coerce.number({
    required_error: "Aux LSIFO is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),

  auxLSMGO: z.coerce.number({
    required_error: "Aux LSMGO is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),

  // Harbour Consumption - REMOVED
  // harbourLSIFO: z.coerce.number({ ... }),
  // harbourLSMGO: z.coerce.number({ ... }),

  // Bunker Supply (Optional)
  supplyLSIFO: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" })
      .positive({ message: "Must be a positive number" })
      .optional()
  ),

  supplyLSMGO: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" })
      .positive({ message: "Must be a positive number" })
      .optional()
  ),

  supplyCYLOIL: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" })
      .positive({ message: "Must be a positive number" })
      .optional()
  ),

  supplyMEOIL: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" })
      .positive({ message: "Must be a positive number" })
      .optional()
  ),

  supplyAEOIL: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" })
      .positive({ message: "Must be a positive number" })
      .optional()
  ),

  supplyVOLOIL: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" })
      .positive({ message: "Must be a positive number" })
      .optional()
  ),

  // Initial Bunker ROB (Optional - only for the very first departure report)
  initialRobLSIFO: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" })
      .positive({ message: "Must be a positive number" })
      .optional()
  ),
  initialRobLSMGO: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" })
      .positive({ message: "Must be a positive number" })
      .optional()
  ),
  initialRobCYLOIL: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" })
      .positive({ message: "Must be a positive number" })
      .optional()
  ),
  initialRobMEOIL: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" })
      .positive({ message: "Must be a positive number" })
      .optional()
  ),
  initialRobAEOIL: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" })
      .positive({ message: "Must be a positive number" })
      .optional()
  ),
  initialRobVOLOIL: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" })
      .positive({ message: "Must be a positive number" })
      .optional()
  ),

  // Calculated/Displayed Bunker ROB (Read Only - not part of validation schema for submission, but keep for type)
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
  engineLoadFOPressure: z.coerce.number({
    required_error: "FO Pressure is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),

  engineLoadLubOilPressure: z.coerce.number({
    required_error: "Lub Oil Pressure is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),

  engineLoadFWInletTemp: z.coerce.number({
    required_error: "FW Inlet Temp is required",
    invalid_type_error: "Must be a number"
  }),

  engineLoadLOInletTemp: z.coerce.number({
    required_error: "LO Inlet Temp is required",
    invalid_type_error: "Must be a number"
  }),

  engineLoadScavAirTemp: z.coerce.number({
    required_error: "Scav Air Temp is required",
    invalid_type_error: "Must be a number"
  }),

  engineLoadTCRPM1: z.coerce.number({
    required_error: "TC RPM #1 is required",
    invalid_type_error: "Must be a whole number"
  }).int({ message: "Must be a whole number" })
    .positive({ message: "TC RPM #1 must be positive" }),

  engineLoadTCRPM2: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a whole number" })
      .int({ message: "Must be a whole number" })
      .positive({ message: "TC RPM #2 must be positive" })
      .optional()
  ),

  engineLoadTCExhTempIn: z.coerce.number({
    required_error: "TC Exh Temp In is required",
    invalid_type_error: "Must be a number"
  }),

  engineLoadTCExhTempOut: z.coerce.number({
    required_error: "TC Exh Temp Out is required",
    invalid_type_error: "Must be a number"
  }),

  engineLoadThrustBearingTemp: z.coerce.number({
    required_error: "Thrust Bearing Temp is required",
    invalid_type_error: "Must be a number"
  }),

  engineLoadDailyRunHour: z.coerce.number({
    required_error: "Daily Run Hour is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),

  // Engine Units (Units 1-6 Required, 7-8 Optional)
  engineUnit1ExhaustTemp: z.coerce.number({
    required_error: "Unit 1 Exhaust Temp is required",
    invalid_type_error: "Must be a number"
  }),

  engineUnit1UnderPistonAir: z.coerce.number({
    required_error: "Unit 1 Under Piston Air is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),

  engineUnit1PCOOutlet: z.coerce.number({
    required_error: "Unit 1 PCO Outlet is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),

  engineUnit1JCFWOutletTemp: z.coerce.number({
    required_error: "Unit 1 JCFW Outlet Temp is required",
    invalid_type_error: "Must be a number"
  }),

  engineUnit2ExhaustTemp: z.coerce.number({
    required_error: "Unit 2 Exhaust Temp is required",
    invalid_type_error: "Must be a number"
  }),

  engineUnit2UnderPistonAir: z.coerce.number({
    required_error: "Unit 2 Under Piston Air is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),

  engineUnit2PCOOutlet: z.coerce.number({
    required_error: "Unit 2 PCO Outlet is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),

  engineUnit2JCFWOutletTemp: z.coerce.number({
    required_error: "Unit 2 JCFW Outlet Temp is required",
    invalid_type_error: "Must be a number"
  }),

  engineUnit3ExhaustTemp: z.coerce.number({
    required_error: "Unit 3 Exhaust Temp is required",
    invalid_type_error: "Must be a number"
  }),

  engineUnit3UnderPistonAir: z.coerce.number({
    required_error: "Unit 3 Under Piston Air is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),

  engineUnit3PCOOutlet: z.coerce.number({
    required_error: "Unit 3 PCO Outlet is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),

  engineUnit3JCFWOutletTemp: z.coerce.number({
    required_error: "Unit 3 JCFW Outlet Temp is required",
    invalid_type_error: "Must be a number"
  }),

  engineUnit4ExhaustTemp: z.coerce.number({
    required_error: "Unit 4 Exhaust Temp is required",
    invalid_type_error: "Must be a number"
  }),

  engineUnit4UnderPistonAir: z.coerce.number({
    required_error: "Unit 4 Under Piston Air is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),

  engineUnit4PCOOutlet: z.coerce.number({
    required_error: "Unit 4 PCO Outlet is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),

  engineUnit4JCFWOutletTemp: z.coerce.number({
    required_error: "Unit 4 JCFW Outlet Temp is required",
    invalid_type_error: "Must be a number"
  }),

  engineUnit5ExhaustTemp: z.coerce.number({
    required_error: "Unit 5 Exhaust Temp is required",
    invalid_type_error: "Must be a number"
  }),

  engineUnit5UnderPistonAir: z.coerce.number({
    required_error: "Unit 5 Under Piston Air is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),

  engineUnit5PCOOutlet: z.coerce.number({
    required_error: "Unit 5 PCO Outlet is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),

  engineUnit5JCFWOutletTemp: z.coerce.number({
    required_error: "Unit 5 JCFW Outlet Temp is required",
    invalid_type_error: "Must be a number"
  }),

  engineUnit6ExhaustTemp: z.coerce.number({
    required_error: "Unit 6 Exhaust Temp is required",
    invalid_type_error: "Must be a number"
  }),

  engineUnit6UnderPistonAir: z.coerce.number({
    required_error: "Unit 6 Under Piston Air is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),

  engineUnit6PCOOutlet: z.coerce.number({
    required_error: "Unit 6 PCO Outlet is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),

  engineUnit6JCFWOutletTemp: z.coerce.number({
    required_error: "Unit 6 JCFW Outlet Temp is required",
    invalid_type_error: "Must be a number"
  }),

  // Optional Units (7-8)
  engineUnit7ExhaustTemp: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" }).optional()
  ),

  engineUnit7UnderPistonAir: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" })
      .positive({ message: "Must be a positive number" })
      .optional()
  ),

  engineUnit7PCOOutlet: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" })
      .positive({ message: "Must be a positive number" })
      .optional()
  ),

  engineUnit7JCFWOutletTemp: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" }).optional()
  ),

  engineUnit8ExhaustTemp: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" }).optional()
  ),

  engineUnit8UnderPistonAir: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" })
      .positive({ message: "Must be a positive number" })
      .optional()
  ),

  engineUnit8PCOOutlet: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" })
      .positive({ message: "Must be a positive number" })
      .optional()
  ),

  engineUnit8JCFWOutletTemp: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" }).optional()
  ),

  // Auxiliary Engines (DG1 Mandatory, others Optional)
  auxEngineDG1Load: z.coerce.number({
    required_error: "DG1 Load is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),

  auxEngineDG1KW: z.coerce.number({
    required_error: "DG1 KW is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),

  auxEngineDG1FOPress: z.coerce.number({
    required_error: "DG1 FO Press is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),

  auxEngineDG1LubOilPress: z.coerce.number({
    required_error: "DG1 Lub Oil Press is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),

  auxEngineDG1WaterTemp: z.coerce.number({
    required_error: "DG1 Water Temp is required",
    invalid_type_error: "Must be a number"
  }),

  auxEngineDG1DailyRunHour: z.coerce.number({
    required_error: "DG1 Daily Run Hour is required",
    invalid_type_error: "Must be a number"
  }).positive({ message: "Must be a positive number" }),

  // Optional Auxiliary Engines (DG2, DG3, V1)
  auxEngineDG2Load: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" })
      .positive({ message: "Must be a positive number" })
      .optional()
  ),

  auxEngineDG2KW: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" })
      .positive({ message: "Must be a positive number" })
      .optional()
  ),

  auxEngineDG2FOPress: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" })
      .positive({ message: "Must be a positive number" })
      .optional()
  ),

  auxEngineDG2LubOilPress: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" })
      .positive({ message: "Must be a positive number" })
      .optional()
  ),

  auxEngineDG2WaterTemp: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" }).optional()
  ),

  auxEngineDG2DailyRunHour: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" })
      .positive({ message: "Must be a positive number" })
      .optional()
  ),

  auxEngineDG3Load: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" })
      .positive({ message: "Must be a positive number" })
      .optional()
  ),

  auxEngineDG3KW: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" })
      .positive({ message: "Must be a positive number" })
      .optional()
  ),

  auxEngineDG3FOPress: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" })
      .positive({ message: "Must be a positive number" })
      .optional()
  ),

  auxEngineDG3LubOilPress: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" })
      .positive({ message: "Must be a positive number" })
      .optional()
  ),

  auxEngineDG3WaterTemp: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" }).optional()
  ),

  auxEngineDG3DailyRunHour: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" })
      .positive({ message: "Must be a positive number" })
      .optional()
  ),

  auxEngineV1Load: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" })
      .positive({ message: "Must be a positive number" })
      .optional()
  ),

  auxEngineV1KW: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" })
      .positive({ message: "Must be a positive number" })
      .optional()
  ),

  auxEngineV1FOPress: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" })
      .positive({ message: "Must be a positive number" })
      .optional()
  ),

  auxEngineV1LubOilPress: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" })
      .positive({ message: "Must be a positive number" })
      .optional()
  ),

  auxEngineV1WaterTemp: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" }).optional()
  ),

  auxEngineV1DailyRunHour: z.preprocess(
    preprocessOptionalString,
    z.coerce.number({ invalid_type_error: "Must be a number" })
      .positive({ message: "Must be a positive number" })
      .optional()
  ),

  // Engine Remarks
  engineChiefEngineerRemarks: z.string().optional(),
});

// Inferred type from the schema - This is the type for validated data
export type ProcessedDepartureFormData = z.infer<typeof departureReportSchema>;


// CSS class constants for consistent styling (Keep as is)
export const FORM_STYLES = {
  // Base classes for inputs
  EDITABLE_INPUT: "w-full p-2 border rounded bg-white border-gray-300", // Ensure default border is here
  READONLY_INPUT: "w-full p-2 border rounded bg-gray-100 cursor-not-allowed border-gray-300",
  ERROR_BORDER: "border-red-500",
  NORMAL_BORDER: "border-gray-300" // Keep for reference or specific use cases
};

// OLD Validation rules - can be removed once DepartureReportForm is refactored
// export const departureValidationRules: ValidationRules = { ... }; // Commented out
