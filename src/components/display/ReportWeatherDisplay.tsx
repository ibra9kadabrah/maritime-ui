import React from 'react';
// Assuming DisplayReport is similar to the one in OfficePage.tsx
import { Report as BackendReport } from '../../../backend/src/types/dataTypes';

// Re-using the DataRow component structure for consistency
const DataRow: React.FC<{ label: string; value?: string | number | null; unit?: string }> = ({ label, value, unit }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex py-1">
      <span className="text-sm font-medium text-gray-500 w-32 shrink-0">{label}:</span>
      <span className="text-sm">{String(value)}{unit ? ` ${unit}` : ''}</span>
    </div>
  );
};

interface DisplayReport extends BackendReport {
  id: number;
  ship?: string;
  voyage?: string;
  captain?: string;
}

interface ReportWeatherDisplayProps {
  report: DisplayReport;
}

const ReportWeatherDisplay: React.FC<ReportWeatherDisplayProps> = ({ report }) => {
  const reportData = typeof report.report_data === 'object' && report.report_data !== null ? report.report_data : {};

  // Check if any weather data exists using keys from departureFormTypes.ts
  const hasWeatherData = reportData.windDirection !== undefined || reportData.windForce !== undefined || reportData.seaDirection !== undefined || reportData.seaState !== undefined || reportData.swellDirection !== undefined || reportData.swellHeight !== undefined;

  // Only render the component if there's any weather data to show
  if (!hasWeatherData) {
    return null;
  }

  return (
    <div>
      <h3 className="text-md font-semibold mb-3 text-blue-900 border-b pb-1">Weather Conditions</h3>
      <div className="space-y-1">
        <DataRow label="Wind Direction" value={reportData.windDirection} /> {/* Assuming direction is text like N, E, SW */}
        <DataRow label="Wind Force" value={reportData.windForce} unit="Beaufort" />
        <DataRow label="Sea Direction" value={reportData.seaDirection} /> {/* Assuming direction is text */}
        <DataRow label="Sea State" value={reportData.seaState} /> {/* Douglas Sea Scale 0-9 */}
        <DataRow label="Swell Direction" value={reportData.swellDirection} /> {/* Assuming direction is text */}
        <DataRow label="Swell Height" value={reportData.swellHeight} /> {/* Scale 0-9 */}
      </div>
    </div>
  );
};

export default ReportWeatherDisplay;
