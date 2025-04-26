import { readData } from '../db/jsonUtils';
import { Report } from '../types/dataTypes'; // Import the specific type

const calculateInitialDistanceToGo = (totalVoyageDistance: number | undefined | null, harborDistance: number | undefined | null): number => {
  // Initial distance = Total distance - harbor distance covered at departure
  const initialDistance = (totalVoyageDistance || 0) - (harborDistance || 0);
  console.log('Calculating Initial Distance To Go:', { totalVoyageDistance, harborDistance, initialDistance });
  return Math.max(0, initialDistance); // Ensure non-negative
};

const calculateUpdatedDistanceToGo = (previousDistanceToGo: number | undefined | null, distanceSinceLastReport: number | undefined | null): number => {
  // Updated distance = Previous distance - distance covered since last report
  const updatedDistance = (previousDistanceToGo || 0) - (distanceSinceLastReport || 0);
  console.log('Calculating Updated Distance To Go:', { previousDistanceToGo, distanceSinceLastReport, updatedDistance });
  return Math.max(0, updatedDistance); // Ensure non-negative
};

// Fetches the distance_to_go from the most recent report for a given voyage
const getPreviousReportDistanceToGo = async (voyageId: number): Promise<number> => {
    const allReports = await readData('reports.json') as Report[];
    const voyageReports = allReports
        .filter(r => r.voyage_id === voyageId)
        .sort((a, b) => a.sequence_number - b.sequence_number); // Sort by sequence

    if (voyageReports.length === 0) {
        console.warn(`No previous reports found for voyage ${voyageId} to get distance from.`);
        return 0; // Or handle as error/default
    }

    const lastReport = voyageReports[voyageReports.length - 1];
    // Need to ensure distance_to_go is actually stored in the report object structure later
    const previousDistance = lastReport.distance_to_go || 0;
    console.log(`Previous report distance to go for voyage ${voyageId}:`, previousDistance);
    return previousDistance;
};


export {
  calculateInitialDistanceToGo,
  calculateUpdatedDistanceToGo,
  getPreviousReportDistanceToGo,
};
