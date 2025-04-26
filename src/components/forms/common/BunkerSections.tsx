import React from 'react';
import { UseFormRegister, FieldErrors, Control, RegisterOptions } from 'react-hook-form'; // Import RegisterOptions
import FormField from '../../ui/FormField';
import { VALIDATION_PATTERNS } from '../../../utils/validationPatterns'; // Corrected import name
// Assuming FORM_STYLES might eventually move to a common types file,
// but for now, importing from one of the existing ones is fine.
import { FORM_STYLES } from '../types/departureFormTypes'; // Or a more generic location if available
// Removed incorrect import for ReportFormData

// --- Common Props for Input Sections ---
interface BunkerInputProps {
    register: UseFormRegister<any>; // Using 'any' for flexibility, or use a specific form data type if applicable
    errors: FieldErrors<any>;
    control: Control<any>;
}


// --- Helper function (can be shared within this file) ---
const renderReadOnlyField = (label: string, value: number | string | undefined | null) => (
  <div>
    <label className="text-sm">{label}</label>
    <input
      type="text"
      className={FORM_STYLES.READONLY_INPUT}
      value={value === undefined || value === null || value === '' ? 'N/A' : String(value)} // Handle undefined/null/empty
      readOnly
    />
  </div>
);

// --- Steaming Consumption Display (Existing) ---

interface SteamingConsumptionDisplayProps {
  lsifo?: number | string;
  lsmgo?: number | string;
  cylOil?: number | string;
  meOil?: number | string;
  aeOil?: number | string;
  volOil?: number | string;
}


export const SteamingConsumptionDisplay: React.FC<SteamingConsumptionDisplayProps> = ({
  lsifo,
  lsmgo,
  cylOil,
  meOil,
  aeOil,
  volOil,
}) => {
  return (
    <div className="bg-yellow-50 p-4 rounded">
      <h4 className="font-semibold mb-2">Steaming Consumption</h4>
      <p className="text-xs text-gray-500 mb-2">Read only - Calculated</p>
      <div className="space-y-2">
        {renderReadOnlyField('LSIFO', lsifo)}
        {renderReadOnlyField('LSMGO', lsmgo)}
        {renderReadOnlyField('CYL OIL', cylOil)}
        {renderReadOnlyField('M/E OIL', meOil)}
        {renderReadOnlyField('A/E OIL', aeOil)}
        {renderReadOnlyField('VOL OIL', volOil)}
      </div>
    </div>
  );
};


// --- Bunker ROB Display (Existing) ---

interface BunkerRobDisplayProps {
  lsifo?: number | string;
  lsmgo?: number | string;
  cylOil?: number | string;
  meOil?: number | string;
  aeOil?: number | string;
  volOil?: number | string;
}

export const BunkerRobDisplay: React.FC<BunkerRobDisplayProps> = ({
  lsifo,
  lsmgo,
  cylOil,
  meOil,
  aeOil,
  volOil,
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded">
      <h4 className="font-semibold mb-2">Bunker ROB</h4>
      <p className="text-xs text-gray-500 mb-2">Read only</p>
      <div className="space-y-2">
        {renderReadOnlyField('LSIFO', lsifo)}
        {renderReadOnlyField('LSMGO', lsmgo)}
        {renderReadOnlyField('CYL OIL', cylOil)}
        {renderReadOnlyField('M/E OIL', meOil)}
        {renderReadOnlyField('A/E OIL', aeOil)}
        {renderReadOnlyField('VOL OIL', volOil)}
      </div>
    </div>
  );
};


// --- Bunker Consumption Inputs (New) ---

export const BunkerConsumptionInputs: React.FC<BunkerInputProps> = ({ register, errors, control }) => {
    return (
        <div className="bg-blue-50 p-4 rounded">
            <h4 className="font-semibold mb-3">Bunker Consumption (Since Last Report)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                    label="Main Engine (MT)"
                    name="bunkerConsumptionME"
                    type="number"
                    step="0.01"
                    register={register} // Pass register function directly
                    errors={errors}
                    control={control}
                    inputMode="decimal" // Add inputMode hint
                    validationPattern={VALIDATION_PATTERNS.POSITIVE_DECIMAL_ONLY} // Use validationPattern prop for filtering
                    rules={{ // Pass other rules via the rules prop
                        required: 'ME Consumption is required',
                        valueAsNumber: true,
                        min: { value: 0, message: 'Must be non-negative' },
                        // Removed pattern from rules
                    }}
                />
                <FormField
                    label="Boiler (MT)"
                    name="bunkerConsumptionBoiler"
                    type="number"
                    step="0.01"
                    register={register} // Pass register function directly
                    errors={errors}
                    control={control}
                    inputMode="decimal" // Add inputMode hint
                    validationPattern={VALIDATION_PATTERNS.POSITIVE_DECIMAL_ONLY} // Use validationPattern prop for filtering
                    rules={{ // Pass other rules via the rules prop
                        required: 'Boiler Consumption is required',
                        valueAsNumber: true,
                        min: { value: 0, message: 'Must be non-negative' },
                        // Removed pattern from rules
                    }}
                />
                <FormField
                    label="Aux Engine (MT)"
                    name="bunkerConsumptionAux"
                    type="number"
                    step="0.01"
                    register={register} // Pass register function directly
                    errors={errors}
                    control={control}
                    inputMode="decimal" // Add inputMode hint
                    validationPattern={VALIDATION_PATTERNS.POSITIVE_DECIMAL_ONLY} // Use validationPattern prop for filtering
                    rules={{ // Pass other rules via the rules prop
                        required: 'Aux Consumption is required',
                        valueAsNumber: true,
                        min: { value: 0, message: 'Must be non-negative' },
                        // Removed pattern from rules
                    }}
                />
            </div>
        </div>
    );
};


// --- Bunker Supply Inputs (New) ---

export const BunkerSupplyInputs: React.FC<BunkerInputProps> = ({ register, errors, control }) => {
    return (
        <div className="bg-green-50 p-4 rounded">
            <h4 className="font-semibold mb-3">Bunker Supply (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                    label="Fuel Oil (MT)"
                    name="bunkerSupplyFO"
                    type="number"
                    step="0.01"
                    register={register} // Pass register function directly
                    errors={errors}
                    control={control}
                    inputMode="decimal" // Add inputMode hint
                    rules={{ // Pass rules via the rules prop
                        valueAsNumber: true,
                        min: { value: 0, message: 'Must be non-negative' },
                        // No pattern needed for optional, rely on min and type
                    }}
                />
                <FormField
                    label="Diesel Oil (MT)"
                    name="bunkerSupplyDO"
                    type="number"
                    step="0.01"
                    register={register} // Pass register function directly
                    errors={errors}
                    control={control}
                    inputMode="decimal" // Add inputMode hint
                    rules={{ // Pass rules via the rules prop
                        valueAsNumber: true,
                        min: { value: 0, message: 'Must be non-negative' },
                        // No pattern needed for optional, rely on min and type
                    }}
                />
                <FormField
                    label="Lube Oil (MT)"
                    name="bunkerSupplyLO"
                    type="number"
                    step="0.01"
                    register={register} // Pass register function directly
                    errors={errors}
                    control={control}
                    inputMode="decimal" // Add inputMode hint
                    rules={{ // Pass rules via the rules prop
                        valueAsNumber: true,
                        min: { value: 0, message: 'Must be non-negative' },
                        // No pattern needed for optional, rely on min and type
                    }}
                />
            </div>
        </div>
    );
};
