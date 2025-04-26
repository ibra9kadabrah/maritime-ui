import React from 'react';
// Assuming DisplayReport is similar to the one in OfficePage.tsx
import { Report as BackendReport } from '../../../backend/src/types/dataTypes';

// Re-using the DataRow component structure for consistency
const DataRow: React.FC<{ label: string; value?: string | number | null; unit?: string }> = ({ label, value, unit }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex py-1">
      <span className="text-sm font-medium text-gray-500 w-40 shrink-0">{label}:</span>
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

interface ReportCargoDisplayProps {
  report: DisplayReport;
}

const ReportCargoDisplay: React.FC<ReportCargoDisplayProps> = ({ report }) => {
  // This component should only be rendered for Berth reports,
  // but we double-check the type here for robustness.
  if (report.type !== 'berth') {
    return null;
  }

  const reportData = typeof report.report_data === 'object' && report.report_data !== null ? report.report_data : {};

  // Check if relevant cargo data exists
  const hasCargoData = reportData.cargoOperationType !== undefined || reportData.cargoQuantityHandled !== undefined;

  // Only render the component if there's cargo data to show
  if (!hasCargoData) {
    return null;
  }

  return (
    <div>
      <h3 className="text-md font-semibold mb-3 text-blue-900 border-b pb-1">Cargo Operations</h3>
      <div className="space-y-1">
        <DataRow label="Operation Type" value={reportData.cargoOperationType} />
        <DataRow label="Quantity Handled" value={reportData.cargoQuantityHandled} unit="tons" />
        {/* Add other cargo-related fields if available */}
      </div>
    </div>
  );
};

export default ReportCargoDisplay;
