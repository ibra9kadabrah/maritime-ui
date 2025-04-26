import axios from 'axios';
// Import Voyage, Vessel, and BunkerRecord types
import { Report, ReportType, Voyage, Vessel, BunkerRecord } from '../../backend/src/types/dataTypes'; // Adjust path as needed

// Assuming the backend runs on port 3001
const API_BASE_URL = 'http://localhost:3001/api';

// Define a generic type for report form data submission
// Specific form data types (DepartureFormData, etc.) should be used when calling
type ReportFormData = any;

const api = {
  // --- Report Endpoints ---

  getVessel: async (id: number): Promise<Vessel> => {
    const response = await axios.get(`${API_BASE_URL}/vessels/${id}`);
    return response.data;
  },

  /**
   * Fetches all vessels.
   * @returns A Promise resolving to an array of Vessel objects.
   */
  getVessels: async (): Promise<Vessel[]> => {
    const response = await axios.get(`${API_BASE_URL}/vessels`);
    return response.data;
  },

  /**
   * Submits a new report to the backend.
   * @param vesselId - The ID of the vessel submitting the report.
   * @param submittedBy - The username of the person submitting.
   * @param reportType - The type of report ('departure', 'noon', 'arrival', 'berth').
   * @param reportData - The specific data object for the report type.
   * @returns A Promise resolving to the created Report object.
   */
  submitReport: async (
    vesselId: number,
    submittedBy: string,
    reportType: ReportType,
    reportData: ReportFormData
  ): Promise<Report> => {
    const response = await axios.post(`${API_BASE_URL}/reports`, {
      vesselId,
      submittedBy,
      reportType,
      reportData,
    });
    return response.data;
  },

  /**
   * Fetches all reports.
   * TODO: Add filtering parameters.
   * @returns A Promise resolving to an array of Report objects.
   */
  getReports: async (): Promise<Report[]> => {
    const response = await axios.get(`${API_BASE_URL}/reports`);
    return response.data;
  },

  /**
   * Fetches a specific report by its ID.
   * @param id - The ID of the report to fetch.
   * @returns A Promise resolving to the Report object.
   */
  getReportById: async (id: number): Promise<Report> => {
    const response = await axios.get(`${API_BASE_URL}/reports/${id}`);
    return response.data;
  },

  /**
   * Fetches the bunker record associated with a specific report ID.
   * @param reportId - The ID of the report.
   * @returns A Promise resolving to the BunkerRecord object or null if not found.
   */
  getBunkerRecordForReport: async (reportId: number): Promise<BunkerRecord | null> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reports/${reportId}/bunker-record`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.warn(`Bunker record not found for report ID ${reportId}`);
        return null; // Return null if not found (404)
      }
      console.error(`Error fetching bunker record for report ${reportId}:`, error);
      throw error; // Re-throw other errors
    }
  },

  /**
   * Approves a specific report.
   * @param id - The ID of the report to approve.
   * @param reviewer - The username of the office staff approving.
   * @returns A Promise resolving to the updated Report object.
   */
  approveReport: async (id: number, reviewer: string): Promise<Report> => {
    const response = await axios.post(`${API_BASE_URL}/reports/${id}/approve`, { reviewer });
    return response.data;
  },

  /**
   * Rejects a specific report.
   * @param id - The ID of the report to reject.
   * @param reviewer - The username of the office staff rejecting.
   * @param rejectionReason - The reason for rejection.
   * @returns A Promise resolving to the updated Report object.
   */
  rejectReport: async (id: number, reviewer: string, rejectionReason: string): Promise<Report> => {
    const response = await axios.post(`${API_BASE_URL}/reports/${id}/reject`, {
      reviewer,
      rejectionReason,
    });
    return response.data;
  },

  /**
   * Checks if a vessel has existing bunker records.
   * @param vesselId - The ID of the vessel to check.
   * @returns A Promise resolving to a boolean indicating if records exist.
   */
  checkVesselHasBunkerRecords: async (vesselId: number): Promise<boolean> => {
    const response = await axios.get(`${API_BASE_URL}/vessels/${vesselId}/has-bunker-records`);
    return response.data.hasBunkerRecords; // The endpoint returns { hasBunkerRecords: boolean }
  },

  // --- Voyage Endpoints ---

  /**
   * Fetches all voyages.
   * @returns A Promise resolving to an array of Voyage objects.
   */
  getVoyages: async (): Promise<Voyage[]> => { // Corrected return type
    const response = await axios.get(`${API_BASE_URL}/voyages`);
    return response.data;
  },

  // TODO: Add endpoints for Vessels, Users as needed

  // --- New function to check for previous departures ---
  checkVesselHasPreviousDeparture: async (vesselId: number): Promise<{hasPreviousDeparture: boolean, lastDestinationPort: string | null}> => {
    try {
      // These calls might be inefficient if data is already fetched elsewhere (e.g., CaptainDashboard)
      // Consider passing fetched data if available to avoid redundant calls.
      const reports = await api.getReports(); // Assuming api object is accessible here or refactor
      const voyages = await api.getVoyages(); // Assuming api object is accessible here or refactor

      // Find any approved departure reports for this vessel
      const departureReports = reports.filter(r =>
        r.vessel_id === vesselId &&
        r.type === 'departure' &&
        r.status === 'approved'
      );

      if (departureReports.length === 0) {
        console.log(`Vessel ${vesselId}: No previous approved departure reports found.`);
        return { hasPreviousDeparture: false, lastDestinationPort: null };
      }

      // Find the voyage ID associated with the most recent approved departure report
      // Sort by submitted_at descending to find the latest report
      departureReports.sort((a, b) => new Date(b.submitted_at || 0).getTime() - new Date(a.submitted_at || 0).getTime());
      const latestDepartureReport = departureReports[0];
      const lastVoyageId = latestDepartureReport.voyage_id;

      // Find the voyage details using the voyage ID
      const lastVoyage = voyages.find(v => v.id === lastVoyageId);

      if (!lastVoyage) {
         console.warn(`Vessel ${vesselId}: Found departure report (ID: ${latestDepartureReport.id}) but couldn't find associated voyage (ID: ${lastVoyageId}).`);
         // Decide fallback behavior: treat as no previous departure or handle differently?
         // For now, returning true for hasPreviousDeparture but null for port.
         return { hasPreviousDeparture: true, lastDestinationPort: null };
      }

      console.log(`Vessel ${vesselId}: Found previous approved departure report (ID: ${latestDepartureReport.id}) for voyage ${lastVoyageId}. Last destination: ${lastVoyage.destination_port}`);
      return {
        hasPreviousDeparture: true,
        lastDestinationPort: lastVoyage.destination_port || null // Return destination port or null
      };
    } catch (error) {
      console.error(`Error checking previous departures for vessel ${vesselId}:`, error);
      // Return default state in case of error to avoid blocking UI
      return { hasPreviousDeparture: false, lastDestinationPort: null };
    }
  }
  // --- End new function ---

};

export default api;
