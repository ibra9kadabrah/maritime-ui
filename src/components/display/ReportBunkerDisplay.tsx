import React from 'react';
// Assuming DisplayReport is similar to the one in OfficePage.tsx
import { Report as BackendReport } from '../../../backend/src/types/dataTypes';

// Re-using the DataRow component structure for consistency
const DataRow: React.FC<{ label: string; value?: string | number | null; unit?: string }> = ({ label, value, unit }) => {
  // Ensure value is treated as number for comparison if needed, but display as string
  const displayValue = (value !== undefined && value !== null && value !== '') ? String(value) : 'N/A';
  // Only render if value is meaningful (not undefined, null, or empty string)
  if (value === undefined || value === null || value === '') return null;

  return (
    <div className="flex py-1">
      <span className="text-sm font-medium text-gray-500 w-24 shrink-0">{label}:</span>
      <span className="text-sm">{displayValue}{unit ? ` ${unit}` : ''}</span>
    </div>
  );
};

interface DisplayReport extends BackendReport {
  id: number;
  ship?: string;
  voyage?: string;
  captain?: string;
}

interface ReportBunkerDisplayProps {
  report: DisplayReport;
}

const ReportBunkerDisplay: React.FC<ReportBunkerDisplayProps> = ({ report }) => {
  const reportData = typeof report.report_data === 'object' && report.report_data !== null ? report.report_data : {};
  const reportType = report.type;

  // Check if any ROB data exists using keys from dataTypes.ts (adjust if form keys differ)
  const hasRobData = reportData.lsifo_rob !== undefined || reportData.lsmgo_rob !== undefined || reportData.cyl_oil_rob !== undefined || reportData.me_oil_rob !== undefined || reportData.ae_oil_rob !== undefined || reportData.vol_oil_rob !== undefined;

  // Check if any Consumption data exists using keys from dataTypes.ts
  // Note: Berth reports might have 'harborLsifoConsumed' etc. Need to check both sets.
  const hasConsumptionData = reportData.lsifo_consumed !== undefined || reportData.lsmgo_consumed !== undefined || reportData.cyl_oil_consumed !== undefined || reportData.me_oil_consumed !== undefined || reportData.ae_oil_consumed !== undefined || reportData.vol_oil_consumed !== undefined ||
                             reportData.harborLsifoConsumed !== undefined || reportData.harborLsmgoConsumed !== undefined || reportData.harborCylOilConsumed !== undefined || reportData.harborMeOilConsumed !== undefined || reportData.harborAeOilConsumed !== undefined || reportData.harborVolOilConsumed !== undefined;


  // Check if any Supply data exists using keys from dataTypes.ts
  const hasSupplyData = reportData.lsifo_supplied !== undefined || reportData.lsmgo_supplied !== undefined || reportData.cyl_oil_supplied !== undefined || reportData.me_oil_supplied !== undefined || reportData.ae_oil_supplied !== undefined || reportData.vol_oil_supplied !== undefined;

  // Determine if the consumption section should be shown
  const showConsumption = (reportType === 'noon' || reportType === 'arrival' || reportType === 'berth') && hasConsumptionData;

  // Determine if the supply section should be shown
  const showSupply = reportType === 'berth' && hasSupplyData;

  // Only render the component if there's any bunker data to show
  if (!hasRobData && !showConsumption && !showSupply) {
    return null;
  }

  return (
    <div>
      <h3 className="text-md font-semibold mb-3 text-blue-900 border-b pb-1">Bunker Details</h3>
      <div className="space-y-3">
        {/* Remaining On Board (ROB) - Always shown if data exists */}
        {/* Remaining On Board (ROB) - Always shown if data exists */}
        {hasRobData && (
          <div>
            <h4 className="text-sm font-semibold mb-1 text-gray-700">Remaining On Board (ROB)</h4>
            {/* Using keys from dataTypes.ts - adjust if form keys differ */}
            <DataRow label="LSIFO" value={reportData.lsifo_rob} unit="MT" />
            <DataRow label="LSMGO" value={reportData.lsmgo_rob} unit="MT" />
            <DataRow label="Cyl Oil" value={reportData.cyl_oil_rob} unit="L" />
            <DataRow label="ME Oil" value={reportData.me_oil_rob} unit="L" />
            <DataRow label="AE Oil" value={reportData.ae_oil_rob} unit="L" />
            <DataRow label="VOL Oil" value={reportData.vol_oil_rob} unit="L" />
          </div>
        )}

        {/* Consumption - Shown for Noon, Arrival, Berth if data exists */}
        {showConsumption && (
          <div>
            <h4 className="text-sm font-semibold mb-1 text-gray-700">Consumption (Since Last / Harbour)</h4>
             {/* Using keys from dataTypes.ts - Showing both steaming and harbor if present */}
            <DataRow label="LSIFO" value={reportData.lsifo_consumed ?? reportData.harborLsifoConsumed} unit="MT" />
            <DataRow label="LSMGO" value={reportData.lsmgo_consumed ?? reportData.harborLsmgoConsumed} unit="MT" />
            <DataRow label="Cyl Oil" value={reportData.cyl_oil_consumed ?? reportData.harborCylOilConsumed} unit="L" />
            <DataRow label="ME Oil" value={reportData.me_oil_consumed ?? reportData.harborMeOilConsumed} unit="L" />
            <DataRow label="AE Oil" value={reportData.ae_oil_consumed ?? reportData.harborAeOilConsumed} unit="L" />
            <DataRow label="VOL Oil" value={reportData.vol_oil_consumed ?? reportData.harborVolOilConsumed} unit="L" />
          </div>
        )}

        {/* Supply - Shown for Berth if data exists */}
        {showSupply && (
          <div>
            <h4 className="text-sm font-semibold mb-1 text-gray-700">Bunker Supply</h4>
            {/* Using keys from dataTypes.ts */}
            <DataRow label="LSIFO" value={reportData.lsifo_supplied} unit="MT" />
            <DataRow label="LSMGO" value={reportData.lsmgo_supplied} unit="MT" />
            <DataRow label="Cyl Oil" value={reportData.cyl_oil_supplied} unit="L" />
            <DataRow label="ME Oil" value={reportData.me_oil_supplied} unit="L" />
            <DataRow label="AE Oil" value={reportData.ae_oil_supplied} unit="L" />
            <DataRow label="VOL Oil" value={reportData.vol_oil_supplied} unit="L" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportBunkerDisplay;
