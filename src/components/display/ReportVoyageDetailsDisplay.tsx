import React from 'react';
// Assuming DisplayReport is similar to the one in OfficePage.tsx
// Ideally, this type should be defined in a shared types file
import { Report as BackendReport, ReportType } from '../../../backend/src/types/dataTypes';

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

// Helper to format date/time strings (similar to OfficePage)
const formatDateTime = (dateStr?: string, timeStr?: string) => {
    if (!dateStr || !timeStr) return 'N/A';
    try {
        // Combine date and time for proper parsing, assuming YYYY-MM-DD and HH:MM format
        const dateTimeStr = `${dateStr}T${timeStr}:00`;
        const date = new Date(dateTimeStr);
        if (isNaN(date.getTime())) return `${dateStr} ${timeStr}`; // Fallback if invalid
        return date.toLocaleString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false
        });
    } catch {
        return `${dateStr} ${timeStr}`; // Fallback
    }
};

interface DisplayReport extends BackendReport {
  id: number;
  ship?: string;
  voyage?: string;
  captain?: string;
}

interface ReportVoyageDetailsDisplayProps {
  report: DisplayReport;
}

const ReportVoyageDetailsDisplay: React.FC<ReportVoyageDetailsDisplayProps> = ({ report }) => {
  // Extract report_data safely, assuming it might be missing or not an object
  const reportData = typeof report.report_data === 'object' && report.report_data !== null ? report.report_data : {};
  const reportType = report.type;

  return (
    <div>
      <h3 className="text-md font-semibold mb-3 text-blue-900 border-b pb-1">Voyage & Position Details</h3>
      <div className="space-y-1">
        {/* Common Fields */}
        <DataRow label="Time Zone" value={reportData.timezone} />
        <DataRow label="Fwd Draft" value={reportData.fwdDraft} unit="m" />
        <DataRow label="Aft Draft" value={reportData.aftDraft} unit="m" />
        <DataRow label="Dist. Traveled (Total)" value={report.distance_traveled} unit="NM" />
        <DataRow label="Dist. To Go" value={report.distance_to_go} unit="NM" />
        {/* Show Voyage/Harbour distance here if it's a departure report */}
        {reportType === 'departure' && (
            <>
                <DataRow label="Voyage Distance (Planned)" value={reportData.voyageDistance} unit="NM" />
                <DataRow label="Harbour Distance (Planned)" value={reportData.harbourDistance} unit="NM" />
            </>
        )}


        {/* Departure Specific Fields */}
        {reportType === 'departure' && (
          <>
            <hr className="my-2" />
            <DataRow label="Departure Port" value={reportData.departurePort} />
            <DataRow label="Destination Port" value={reportData.destinationPort} />
            <DataRow label="ETA" value={formatDateTime(reportData.etaDate, reportData.etaTime)} />
            <DataRow label="Cargo Type" value={reportData.cargoType} />
            <DataRow label="Cargo Quantity" value={reportData.cargoQuantity} unit="tons" />
            <DataRow label="Cargo Status" value={reportData.cargoStatus} />
            <DataRow label="FASP Date/Time" value={formatDateTime(reportData.faspDate, reportData.faspTime)} />
            <DataRow label="FASP Latitude" value={reportData.faspLatitude ? `${reportData.faspLatitude} ${reportData.faspLatitudeDir}` : null} />
            <DataRow label="FASP Longitude" value={reportData.faspLongitude ? `${reportData.faspLongitude} ${reportData.faspLongitudeDir}` : null} />
            <DataRow label="FASP Course" value={reportData.faspCourse} unit="deg" />
            {/* <DataRow label="Harbour Distance" value={reportData.harbourDistance} unit="NM" /> */} {/* Moved up */}
            <DataRow label="Harbour Time" value={reportData.harbourTime} unit="hrs" />
            {/* <DataRow label="Voyage Distance" value={reportData.voyageDistance} unit="NM" /> */} {/* Moved up */}
          </>
        )}

        {/* Noon/Arrival/Berth Specific Fields */}
        {(reportType === 'noon' || reportType === 'arrival' || reportType === 'berth') && (
          <>
            <hr className="my-2" />
            <DataRow label="Current Latitude" value={reportData.currentLatitude ? `${reportData.currentLatitude} ${reportData.currentLatitudeDir}` : null} />
            <DataRow label="Current Longitude" value={reportData.currentLongitude ? `${reportData.currentLongitude} ${reportData.currentLongitudeDir}` : null} />
            {/* Add other relevant fields for these report types if they exist in report_data */}
          </>
        )}

      </div>
    </div>
  );
};

export default ReportVoyageDetailsDisplay;
