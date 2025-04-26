import React from 'react';
// Assuming DisplayReport is similar to the one in OfficePage.tsx
// Ideally, this type should be defined in a shared types file
import { Report as BackendReport } from '../../../backend/src/types/dataTypes';

interface DisplayReport extends BackendReport {
  id: number;
  ship?: string;
  voyage?: string;
  captain?: string;
}

interface ReportGeneralInfoDisplayProps {
  report: DisplayReport;
}

// Helper to format date/time strings (similar to OfficePage)
const formatDateTime = (isoString?: string) => {
  if (!isoString) return 'N/A';
  try {
    return new Date(isoString).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false
    });
  } catch {
    return isoString; // Fallback
  }
};

const DataRow: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex py-1">
      <span className="text-sm font-medium text-gray-500 w-32 shrink-0">{label}:</span>
      <span className="text-sm">{String(value)}</span>
    </div>
  );
};

const ReportGeneralInfoDisplay: React.FC<ReportGeneralInfoDisplayProps> = ({ report }) => {
  return (
    <div>
      <h3 className="text-md font-semibold mb-3 text-blue-900 border-b pb-1">General Information</h3>
      <div className="space-y-1">
        <DataRow label="Vessel ID" value={report.vessel_id} />
        <DataRow label="Vessel Name" value={report.ship} />
        <DataRow label="Voyage ID" value={report.voyage_id} />
        <DataRow label="Voyage #" value={report.voyage} />
        <DataRow label="Submitted By" value={report.submitted_by} />
        <DataRow label="Report Date" value={report.report_date} />
        <DataRow label="Submitted At" value={formatDateTime(report.submitted_at)} />

        {/* Review/Status Info */}
        {report.status !== 'pending' && (
          <>
            <hr className="my-2" />
            <DataRow label="Reviewed At" value={formatDateTime(report.reviewed_at)} />
            <DataRow label="Reviewer" value={report.reviewer} />
            <div className="flex py-1">
              <span className="text-sm font-medium text-gray-500 w-32 shrink-0">Status:</span>
              <span className={`text-sm font-semibold ${report.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
              </span>
            </div>
            {report.status === 'rejected' && (
              <DataRow label="Reason" value={report.rejection_reason} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReportGeneralInfoDisplay;
