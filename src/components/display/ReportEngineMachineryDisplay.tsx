import React from 'react';
// Assuming DisplayReport is similar to the one in OfficePage.tsx
import { Report as BackendReport } from '../../../backend/src/types/dataTypes';

// Re-using the DataRow component structure for consistency
const DataRow: React.FC<{ label: string; value?: string | number | null; unit?: string }> = ({ label, value, unit }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex py-1">
      <span className="text-sm font-medium text-gray-500 w-48 shrink-0">{label}:</span>
      <span className="text-sm">{String(value)}{unit ? ` ${unit}` : ''}</span>
    </div>
  );
};

// Helper function to format keys into readable labels
const formatLabel = (key: string): string => {
  // Add spaces before capital letters (except the first one)
  let spaced = key.replace(/([A-Z])/g, ' $1');
  // Capitalize the first letter and handle acronyms like RPM, PCO, JCFW
  spaced = spaced.charAt(0).toUpperCase() + spaced.slice(1);
  spaced = spaced.replace(/ Rpm/g, ' RPM');
  spaced = spaced.replace(/ P C O/g, ' PCO'); // Handle potential spaces from previous step
  spaced = spaced.replace(/ J C F W/g, ' JCFW');
  spaced = spaced.replace(/ Kw/g, ' kW');
  spaced = spaced.replace(/ K W/g, ' kW'); // Handle potential spaces
  spaced = spaced.replace(/ Lub /g, ' Lub. ');
  // Add more specific replacements as needed
  spaced = spaced.replace(/ D G /g, ' DG');
  spaced = spaced.replace(/ F O /g, ' FO');
  spaced = spaced.replace(/ F W /g, ' FW');
  spaced = spaced.replace(/ L O /g, ' LO');
  spaced = spaced.replace(/ Exh /g, ' Exh. ');
  return spaced.trim();
};

// Helper function to guess units based on key name parts
const guessUnit = (key: string): string | undefined => {
  const lowerKey = key.toLowerCase();
  if (lowerKey.includes('temp')) return '°C';
  if (lowerKey.includes('press')) return 'bar';
  if (lowerKey.includes('rpm')) return 'rpm';
  if (lowerKey.includes('kw')) return 'kW';
  if (lowerKey.includes('hour')) return 'hrs';
  if (lowerKey.includes('load')) return '%';
  if (lowerKey.includes('slip')) return '%';
  // Add more guesses if needed
  return undefined;
};


interface DisplayReport extends BackendReport {
  id: number;
  ship?: string;
  voyage?: string;
  captain?: string;
}

interface ReportEngineMachineryDisplayProps {
  report: DisplayReport;
}

const ReportEngineMachineryDisplay: React.FC<ReportEngineMachineryDisplayProps> = ({ report }) => {
  const reportData = typeof report.report_data === 'object' && report.report_data !== null ? report.report_data : {};

  // Dynamically filter keys likely related to engine/machinery
  const engineDataEntries = Object.entries(reportData).filter(([key, value]) => {
    const lowerKey = key.toLowerCase();
    // Include keys starting with common engine prefixes or specific known keys
    const isEngineKey = lowerKey.startsWith('engine') ||
                        lowerKey.startsWith('auxengine') ||
                        lowerKey.startsWith('mainengine') ||
                        lowerKey.startsWith('boiler') ||
                        lowerKey.startsWith('tc') || // For Turbocharger
                        lowerKey.includes('rpm') ||
                        lowerKey.includes('slip') ||
                        lowerKey.includes('thrustbearing');

    // Exclude keys that might be caught but belong elsewhere (if any identified)
    // const isExcludedKey = false;

    // Ensure value is present
    const hasValue = value !== undefined && value !== null && value !== '';

    return isEngineKey && hasValue; // && !isExcludedKey;
  });

  // Only render the component if there's any engine data to show
  if (engineDataEntries.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-md font-semibold mb-3 text-blue-900 border-b pb-1">Engine & Machinery</h3>
      <div className="space-y-1">
        {engineDataEntries.map(([key, value]) => (
          <DataRow
            key={key}
            label={formatLabel(key)}
            value={value as string | number} // Cast as value is checked for null/undefined
            unit={guessUnit(key)}
          />
        ))}
      </div>
    </div>
  );
};

export default ReportEngineMachineryDisplay;
