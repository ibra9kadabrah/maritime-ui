import { readData, writeData } from '../db/jsonUtils';
import {
  Vessel, Voyage, Report, BunkerRecord, ReportStatus, ReportType, DepartureFormData,
  NoonReportData, // Import the new specific type
  ArrivalFormData, BerthFormData, ReportSpecificData // Import other types for casting
} from '../types/dataTypes'; // Import necessary types
import { calculateInitialDistanceToGo, calculateUpdatedDistanceToGo } from './distanceLogic'; // Re-add calculateUpdatedDistanceToGo
import { getLatestBunkerRecord, createAndSaveBunkerRecord, getBunkerRecordByReportId } from './bunkerLogic'; // Import getBunkerRecordByReportId
import { v4 as uuidv4 } from 'uuid'; // For generating voyage numbers

// --- Report Processing Functions ---

// TODO: Define specific type for the combined input (e.g., vesselId, captainUsername, formData)
const processDepartureReport = async (inputData: { vesselId: number, submittedBy: string, reportData: DepartureFormData }): Promise<Report> => {
  console.log('Processing Departure Report Input:', inputData);
  const { vesselId, submittedBy, reportData } = inputData;
  const reportDate = new Date().toISOString().split('T')[0]; // Or use date from reportData if available
  const submittedAt = new Date().toISOString();

  // 1. Read existing data
  const voyages = await readData('voyages.json') as Voyage[];
  const reports = await readData('reports.json') as Report[];
  const vessels = await readData('vessels.json') as Vessel[];

  // 2. Find the vessel
  const vessel = vessels.find(v => v.id === vesselId);
  if (!vessel) {
    throw new Error(`Vessel with ID ${vesselId} not found.`);
  }

  // 3. Check for and end the previous active voyage for this vessel
  let previousVoyageEnded = false;
  const activeVoyageIndex = voyages.findIndex(v => v.vessel_id === vesselId && v.active);
  if (activeVoyageIndex > -1) {
    voyages[activeVoyageIndex].active = false;
    voyages[activeVoyageIndex].end_date = submittedAt; // Mark end date
    // We'll set ending_report_id later when the new report is created
    previousVoyageEnded = true;
    console.log(`Ended active voyage ${voyages[activeVoyageIndex].id} for vessel ${vesselId}`);
  }

  // 4. Create new voyage record
  const nextVoyageId = voyages.length > 0 ? Math.max(...voyages.map(v => v.id)) + 1 : 1;
  const newVoyageNumber = `VOY-${vessel.name.replace(/\s+/g, '')}-${nextVoyageId}`; // Example voyage number

  const newVoyage: Voyage = {
    id: nextVoyageId,
    voyage_number: newVoyageNumber,
    vessel_id: vesselId,
    departure_port: reportData.departurePort,
    destination_port: reportData.destinationPort,
    cargo_status: reportData.cargoStatus,
    cargo_type: reportData.cargoType, // Save cargo type from report data
    cargo_quantity: reportData.cargoQuantity, // Save cargo quantity from report data
    total_distance: reportData.voyageDistance,
    active: true,
    start_date: submittedAt,
    // starting_report_id and ending_report_id will be set later
  };

  // 5. Calculate initial distance_to_go
  const initialDistanceToGo = calculateInitialDistanceToGo(reportData.voyageDistance, reportData.harbourDistance); // Corrected spelling
  reportData.bls_quantity = vessel.bls;

  // 6. Create the new report record
  const nextReportId = reports.length > 0 ? Math.max(...reports.map(r => r.id)) + 1 : 1;
  const newReport: Report = {
    id: nextReportId,
    type: 'departure',
    vessel_id: vesselId, // Add vesselId
    voyage_id: newVoyage.id,
    sequence_number: 1, // First report of the new voyage
    submitted_by: submittedBy,
    submitted_at: submittedAt,
    status: 'pending', // Initial status
    report_date: reportDate, // Or use specific date from form
    distance_traveled: reportData.harbourDistance, // Corrected spelling // Harbor distance is the 'traveled' for departure
    distance_to_go: initialDistanceToGo,
    report_data: reportData, // Store the original form data
  };

  // 7. Link report to voyage (starting_report_id)
  newVoyage.starting_report_id = newReport.id;

  // 8. If a previous voyage was ended, set its ending_report_id
  if (previousVoyageEnded && activeVoyageIndex > -1) {
      voyages[activeVoyageIndex].ending_report_id = newReport.id;
  }

  // 9. Handle Bunker Record Creation
  const previousBunkerRecord = await getLatestBunkerRecord(vesselId);

  // Calculate consumption from the departure form data (represents pre-departure/harbour consumption)
  const departureConsumption = {
      lsifo_consumed: (reportData.meLSIFO || 0) + (reportData.boilerLSIFO || 0) + (reportData.auxLSIFO || 0),
      lsmgo_consumed: (reportData.meLSMGO || 0) + (reportData.boilerLSMGO || 0) + (reportData.auxLSMGO || 0),
      cyl_oil_consumed: reportData.meCYLOIL || 0,
      me_oil_consumed: reportData.meMEOIL || 0,
      ae_oil_consumed: reportData.meAEOIL || 0,
      vol_oil_consumed: 0, // Assuming VOL OIL is not consumed this way
  };

  // Extract supply received at departure
  const departureSupply = {
      lsifo_supplied: reportData.supplyLSIFO || 0,
      lsmgo_supplied: reportData.supplyLSMGO || 0,
      cyl_oil_supplied: reportData.supplyCYLOIL || 0,
      me_oil_supplied: reportData.supplyMEOIL || 0,
      ae_oil_supplied: reportData.supplyAEOIL || 0,
      vol_oil_supplied: reportData.supplyVOLOIL || 0,
  };

  // Extract initial ROB values (before pre-departure consumption/supply)
  let initialRob = undefined;
  if (!previousBunkerRecord) { // Only relevant for the very first report
      initialRob = {
          lsifo_rob: reportData.initialRobLSIFO,
          lsmgo_rob: reportData.initialRobLSMGO,
          cyl_oil_rob: reportData.initialRobCYLOIL,
          me_oil_rob: reportData.initialRobMEOIL,
          ae_oil_rob: reportData.initialRobAEOIL,
          vol_oil_rob: reportData.initialRobVOLOIL,
      };
      // Filter out undefined values
      initialRob = Object.fromEntries(Object.entries(initialRob).filter(([_, v]) => v !== undefined));
      console.log("Extracted initial ROB (before pre-departure adjustments):", initialRob);
      console.log("Calculated pre-departure consumption:", departureConsumption);
      console.log("Supply received at departure:", departureSupply);
  }

  // For subsequent departure reports (if any), consumption/supply logic might differ.
  // Currently, the form doesn't capture consumption *since last report* for a Departure report.
  // We pass the calculated departureConsumption and departureSupply.
  // The bunkerLogic will handle whether to use initialRob or previousRecord.
  // If it's not the first report, bunkerLogic will use previousRecord and these consumption/supply values.
  // If it *is* the first report, bunkerLogic will use initialRob, departureConsumption, and departureSupply.
  await createAndSaveBunkerRecord(
      vesselId,
      newReport.id,
      newReport.report_date,
      previousBunkerRecord, // Will be null for the first report
      departureConsumption, // Consumption that happened *before* this report's ROB state
      departureSupply,      // Supply received *at* the time of this report's ROB state
      initialRob            // Initial ROB *before* pre-departure adjustments (only used if previousRecord is null)
  );

  // 10. Save updated/new data
  voyages.push(newVoyage); // Add the new voyage
  reports.push(newReport);
  await writeData('voyages.json', voyages); // Overwrite voyages file with updated list
  await writeData('reports.json', reports);

  console.log('Created new Voyage:', newVoyage);
  console.log('Created new Report:', newReport);

  return newReport; // Return the newly created report
};

// --- Process Noon Report ---
const processNoonReport = async (inputData: { vesselId: number, submittedBy: string, reportData: NoonReportData }): Promise<Report> => {
  console.log('Processing Noon Report Input:', inputData);
  const { vesselId, submittedBy, reportData } = inputData;
  const reportDate = reportData.date; // Use date from reportData
  const submittedAt = new Date().toISOString();

  // 1. Read existing data
  const reports = await readData('reports.json') as Report[];

  // 2. Find the last approved report for this vessel to determine the correct voyage and baseline
  const vesselReports = reports
      .filter(r => r.vessel_id === vesselId)
      .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()); // Sort descending by time

  const lastApprovedReport = vesselReports.find(r => r.status === 'approved');

  if (!lastApprovedReport) {
      throw new Error(`Cannot submit Noon report: No approved report found for vessel ${vesselId} to base calculations on.`);
  }

  // Use the voyage ID from the last approved report
  const currentVoyageId = lastApprovedReport.voyage_id;
  console.log(`Continuing voyage ID: ${currentVoyageId} based on last approved report ID: ${lastApprovedReport.id}`);

  // 3. Find reports for the *correct* voyage for validation
  const voyageReportsForCurrentVoyage = reports
    .filter(r => r.voyage_id === currentVoyageId)
    .sort((a, b) => a.sequence_number - b.sequence_number);

  // --- 3a. Find Key Reports & Implement Submission Validation ---
  const latestReportInVoyage = voyageReportsForCurrentVoyage.length > 0 ? voyageReportsForCurrentVoyage[voyageReportsForCurrentVoyage.length - 1] : null;

  if (latestReportInVoyage && latestReportInVoyage.status === 'pending') {
    throw new Error(`Cannot submit report: The previous report in this voyage (ID: ${latestReportInVoyage.id}, Type: ${latestReportInVoyage.type}) is still pending approval.`);
  }

  const baselineReport = lastApprovedReport; // Use the already found last approved report
  const nextSequenceNumber = baselineReport.sequence_number + 1;
  // --- End Submission Validation ---


  // --- 3b. State Transition Validation (Based on Last Approved Report's State) ---
  const previousApprovedState = baselineReport.type === 'departure'
    ? 'departure' // Implicit state after departure
    : (baselineReport.report_data as NoonReportData)?.passageState; // Get state from last approved noon report

  const currentState = reportData.passageState;

  console.log(`Validating state transition: Previous Approved=${previousApprovedState}, Current=${currentState}`);

  if (previousApprovedState) {
      if (currentState === 'sosp') {
          if (previousApprovedState !== 'noon' && previousApprovedState !== 'rosp') {
              throw new Error(`Invalid passage state transition: Cannot submit SOSP report after ${previousApprovedState.toUpperCase()} report.`);
          }
      } else if (currentState === 'rosp') {
          if (previousApprovedState !== 'sosp') {
              throw new Error(`Invalid passage state transition: Cannot submit ROSP report after ${previousApprovedState.toUpperCase()} report.`);
          }
      } else if (currentState === 'noon') {
          if (previousApprovedState === 'sosp') {
              throw new Error(`Invalid passage state transition: Cannot submit NOON report after SOSP report. Must submit ROSP first.`);
          }
      }
  }
  // --- End State Transition Validation ---


  // 4. Calculate distance traveled and new distance_to_go (Based on Last Approved Report)
  let distanceTraveled = 0;
  let newDistanceToGo = baselineReport.distance_to_go ?? 0;

  if (currentState !== 'sosp') {
      // Logic for calculating distance traveled based on coordinates or reported distance
      // (Keeping existing logic for now, which relies on reportData.distanceSinceLastReport)
      distanceTraveled = reportData.distanceSinceLastReport;
      newDistanceToGo = calculateUpdatedDistanceToGo(newDistanceToGo, distanceTraveled);
  } else {
      const distanceCoveredBeforeStop = reportData.distanceSinceLastReport || 0;
      newDistanceToGo = calculateUpdatedDistanceToGo(newDistanceToGo, distanceCoveredBeforeStop);
      distanceTraveled = 0;
      console.log(`SOSP state: Distance covered before stop = ${distanceCoveredBeforeStop} NM. New DTG = ${newDistanceToGo}. Report distance_traveled set to 0.`);
  }


  // 5. Create the new report record
  const nextReportId = reports.length > 0 ? Math.max(...reports.map(r => r.id)) + 1 : 1;
  const newReport: Report = {
    id: nextReportId,
    type: 'noon',
    vessel_id: vesselId,
    voyage_id: currentVoyageId, // Use the determined voyage ID
    sequence_number: nextSequenceNumber,
    submitted_by: submittedBy,
    submitted_at: submittedAt,
    status: 'pending',
    report_date: reportDate,
    distance_traveled: distanceTraveled,
    distance_to_go: newDistanceToGo,
    report_data: reportData,
  };

  // 6. Handle Bunker Record Creation (Based on Last Approved Report's Bunker State)
  const previousApprovedBunkerRecord = await getBunkerRecordByReportId(baselineReport.id, vesselId);
  if (!previousApprovedBunkerRecord) {
      console.error(`Could not find bunker record for the last approved report (ID: ${baselineReport.id})`);
      throw new Error(`Data inconsistency: Bunker record missing for approved report ID ${baselineReport.id}.`);
  }

  // Extract consumption from NoonReportData
  const consumption = {
      lsifo_consumed: (reportData.meLSIFO || 0) + (reportData.boilerLSIFO || 0) + (reportData.auxLSIFO || 0),
      lsmgo_consumed: (reportData.meLSMGO || 0) + (reportData.boilerLSMGO || 0) + (reportData.auxLSMGO || 0),
      cyl_oil_consumed: reportData.meCYLOIL || 0,
      me_oil_consumed: reportData.meMEOIL || 0,
      ae_oil_consumed: reportData.meAEOIL || 0,
      vol_oil_consumed: 0,
  };
  // Extract supply from NoonReportData
  const supply = {
      lsifo_supplied: reportData.supplyLSIFO || 0,
      lsmgo_supplied: reportData.supplyLSMGO || 0,
      cyl_oil_supplied: reportData.supplyCYLOIL || 0,
      me_oil_supplied: reportData.supplyMEOIL || 0,
      ae_oil_supplied: reportData.supplyAEOIL || 0,
      vol_oil_supplied: reportData.supplyVOLOIL || 0,
  };

  await createAndSaveBunkerRecord(
      vesselId,
      newReport.id,
      newReport.report_date,
      previousApprovedBunkerRecord,
      consumption,
      supply
      // No initialRob needed here
  );

  // 7. Save the new report
  reports.push(newReport);
  await writeData('reports.json', reports);

  console.log('Created new Noon Report:', newReport);

  return newReport;
};

// --- Process Arrival Report ---
const processArrivalReport = async (inputData: { vesselId: number, submittedBy: string, reportData: ArrivalFormData }): Promise<Report> => {
  console.log('Processing Arrival Report Input:', inputData);
  const { vesselId, submittedBy, reportData } = inputData;
  const reportDate = new Date().toISOString().split('T')[0]; // Or use date from reportData
  const submittedAt = new Date().toISOString();

  // 1. Read existing data
  const reports = await readData('reports.json') as Report[];

  // 2. Find the last approved report for this vessel to determine the correct voyage and baseline
  const vesselReports = reports
      .filter(r => r.vessel_id === vesselId)
      .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());

  const lastApprovedReport = vesselReports.find(r => r.status === 'approved');

  if (!lastApprovedReport) {
      throw new Error(`Cannot submit Arrival report: No approved report found for vessel ${vesselId} to base calculations on.`);
  }

  // Use the voyage ID from the last approved report
  const currentVoyageId = lastApprovedReport.voyage_id;
  console.log(`Continuing voyage ID: ${currentVoyageId} based on last approved report ID: ${lastApprovedReport.id}`);

  // 3. Find reports for the *correct* voyage for validation
  const voyageReportsForCurrentVoyage = reports
    .filter(r => r.voyage_id === currentVoyageId)
    .sort((a, b) => a.sequence_number - b.sequence_number);

  // --- 3a. Find Key Reports & Implement Submission Validation ---
  const latestReportInVoyage = voyageReportsForCurrentVoyage.length > 0 ? voyageReportsForCurrentVoyage[voyageReportsForCurrentVoyage.length - 1] : null;

  if (latestReportInVoyage && latestReportInVoyage.status === 'pending') {
    throw new Error(`Cannot submit report: The previous report in this voyage (ID: ${latestReportInVoyage.id}, Type: ${latestReportInVoyage.type}) is still pending approval.`);
  }

  const baselineReport = lastApprovedReport;
  const nextSequenceNumber = baselineReport.sequence_number + 1;
  // --- End Submission Validation ---

  // 4. Calculate final distance and set distance_to_go to 0
  const finalDistanceTraveled = reportData.distanceSinceLastReport;
  const finalDistanceToGo = calculateUpdatedDistanceToGo(baselineReport.distance_to_go, finalDistanceTraveled);
  
  // 5. Create the new report record
  const nextReportId = reports.length > 0 ? Math.max(...reports.map(r => r.id)) + 1 : 1;
  const newReport: Report = {
    id: nextReportId,
    type: 'arrival',
    vessel_id: vesselId,
    voyage_id: currentVoyageId, // Use the determined voyage ID
    sequence_number: nextSequenceNumber,
    submitted_by: submittedBy,
    submitted_at: submittedAt,
    status: 'pending',
    report_date: reportDate,
    distance_traveled: finalDistanceTraveled,
    distance_to_go: finalDistanceToGo,
    report_data: reportData,
  };

  // 6. Handle Bunker Record Creation (Based on Last Approved Report's Bunker State)
  const previousApprovedBunkerRecord = await getBunkerRecordByReportId(baselineReport.id, vesselId);
   if (!previousApprovedBunkerRecord) {
      console.error(`Could not find bunker record for the last approved report (ID: ${baselineReport.id})`);
      throw new Error(`Data inconsistency: Bunker record missing for approved report ID ${baselineReport.id}.`);
  }
  // Extract consumption from ArrivalFormData - Use the correct field names from the type definition
  const consumption = {
      lsifo_consumed: reportData.lsifoConsumed || 0, // Corrected field name
      lsmgo_consumed: reportData.lsmgoConsumed || 0, // Corrected field name
      cyl_oil_consumed: reportData.cylOilConsumed || 0, // Corrected field name
      me_oil_consumed: reportData.meOilConsumed || 0, // Corrected field name
      ae_oil_consumed: reportData.aeOilConsumed || 0, // Corrected field name
      vol_oil_consumed: reportData.volOilConsumed || 0, // Corrected field name
  };
  // Extract supply from ArrivalFormData - Use the correct field names
  const supply = {
      lsifo_supplied: reportData.lsifoSupplied || 0,
      lsmgo_supplied: reportData.lsmgoSupplied || 0,
      cyl_oil_supplied: reportData.cylOilSupplied || 0,
      me_oil_supplied: reportData.meOilSupplied || 0,
      ae_oil_supplied: reportData.aeOilSupplied || 0,
      vol_oil_supplied: reportData.volOilSupplied || 0,
  };
  await createAndSaveBunkerRecord(
      vesselId,
      newReport.id,
      newReport.report_date,
      previousApprovedBunkerRecord, // Use record from last approved
      consumption,
      supply
      // No initialRob needed here
  );

  // 7. Save the new report
  reports.push(newReport);
  await writeData('reports.json', reports);

  console.log('Created new Arrival Report:', newReport);

  return newReport;
};

// --- Process Berth Report ---
const processBerthReport = async (inputData: { vesselId: number, submittedBy: string, reportData: BerthFormData }): Promise<Report> => {
  console.log('Processing Berth Report Input:', inputData);
  const { vesselId, submittedBy, reportData } = inputData;
  const reportDate = new Date().toISOString().split('T')[0]; // Or use date from reportData
  const submittedAt = new Date().toISOString();

  // 1. Read existing data
  const voyages = await readData('voyages.json') as Voyage[];
  const reports = await readData('reports.json') as Report[];

  // 2. Find the last approved report for this vessel to determine the correct voyage and baseline
  const vesselReports = reports
      .filter(r => r.vessel_id === vesselId)
      .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());

  const lastApprovedReport = vesselReports.find(r => r.status === 'approved');

  if (!lastApprovedReport) {
      throw new Error(`Cannot submit Berth report: No approved report found for vessel ${vesselId} to base calculations on.`);
  }

  // Use the voyage ID from the last approved report
  const currentVoyageId = lastApprovedReport.voyage_id;
  console.log(`Continuing voyage ID: ${currentVoyageId} based on last approved report ID: ${lastApprovedReport.id}`);

  // 3. Find reports for the *correct* voyage for validation
  const voyageReportsForCurrentVoyage = reports
    .filter(r => r.voyage_id === currentVoyageId)
    .sort((a, b) => a.sequence_number - b.sequence_number);

  // --- 3a. Find Key Reports & Implement Submission Validation ---
  const latestReportInVoyage = voyageReportsForCurrentVoyage.length > 0 ? voyageReportsForCurrentVoyage[voyageReportsForCurrentVoyage.length - 1] : null;

  if (latestReportInVoyage && latestReportInVoyage.status === 'pending') {
    throw new Error(`Cannot submit report: The previous report in this voyage (ID: ${latestReportInVoyage.id}, Type: ${latestReportInVoyage.type}) is still pending approval.`);
  }

  const baselineReport = lastApprovedReport;
  const nextSequenceNumber = baselineReport.sequence_number + 1;
  // --- End Submission Validation ---


  // 4. Create the new report record
  const nextReportId = reports.length > 0 ? Math.max(...reports.map(r => r.id)) + 1 : 1;
  const newReport: Report = {
    id: nextReportId,
    type: 'berth',
    vessel_id: vesselId,
    voyage_id: currentVoyageId, // Use the determined voyage ID
    sequence_number: nextSequenceNumber,
    submitted_by: submittedBy,
    submitted_at: submittedAt,
    status: 'pending',
    report_date: reportDate,
    distance_traveled: 0,
    distance_to_go: baselineReport.distance_to_go,
    report_data: reportData,
  };

  // 5. Handle Bunker Record Creation (Based on Last Approved Report's Bunker State)
  const previousApprovedBunkerRecord = await getBunkerRecordByReportId(baselineReport.id, vesselId);
   if (!previousApprovedBunkerRecord) {
      console.error(`Could not find bunker record for the last approved report (ID: ${baselineReport.id})`);
      throw new Error(`Data inconsistency: Bunker record missing for approved report ID ${baselineReport.id}.`);
  }
  // Extract harbor consumption and supply from BerthFormData
  const consumption = {
      lsifo_consumed: reportData.harborLsifoConsumed || 0,
      lsmgo_consumed: reportData.harborLsmgoConsumed || 0,
      cyl_oil_consumed: reportData.harborCylOilConsumed || 0,
      me_oil_consumed: reportData.harborMeOilConsumed || 0,
      ae_oil_consumed: reportData.harborAeOilConsumed || 0,
      vol_oil_consumed: reportData.harborVolOilConsumed || 0,
  };
  const supply = {
      lsifo_supplied: reportData.lsifoSupplied || 0,
      lsmgo_supplied: reportData.lsmgoSupplied || 0,
      cyl_oil_supplied: reportData.cylOilSupplied || 0,
      me_oil_supplied: reportData.meOilSupplied || 0,
      ae_oil_supplied: reportData.aeOilSupplied || 0,
      vol_oil_supplied: reportData.volOilSupplied || 0,
  };
  await createAndSaveBunkerRecord(
      vesselId,
      newReport.id,
      newReport.report_date,
      previousApprovedBunkerRecord, // Use record from last approved
      consumption,
      supply
      // No initialRob needed here
  );

  // 6. Handle Cargo Operations (Update Voyage) - Needs to find the correct voyage in the main array
  let voyageUpdated = false;
  const currentVoyageIndex = voyages.findIndex(v => v.id === currentVoyageId); // Find index in the main array

  if (currentVoyageIndex !== -1) {
      const voyageToUpdate = voyages[currentVoyageIndex]; // Get reference to the voyage object
      if (reportData.cargoLoaded !== undefined && reportData.cargoLoaded > 0) {
          voyageToUpdate.cargo_quantity = (voyageToUpdate.cargo_quantity || 0) + reportData.cargoLoaded;
          voyageUpdated = true;
          console.log(`Voyage ${currentVoyageId}: Cargo loaded, new quantity = ${voyageToUpdate.cargo_quantity}`);
      }
      if (reportData.cargoUnloaded !== undefined && reportData.cargoUnloaded > 0) {
          voyageToUpdate.cargo_quantity = Math.max(0, (voyageToUpdate.cargo_quantity || 0) - reportData.cargoUnloaded);
          voyageUpdated = true;
          console.log(`Voyage ${currentVoyageId}: Cargo unloaded, new quantity = ${voyageToUpdate.cargo_quantity}`);
      }
  } else {
      console.warn(`Could not find voyage with ID ${currentVoyageId} to update cargo quantities.`);
  }

  // 7. Save the new report and potentially updated voyage data
  reports.push(newReport);
  await writeData('reports.json', reports);
  if (voyageUpdated) {
      // Overwrite the voyages file only if cargo changed
      await writeData('voyages.json', voyages);
  }

  console.log('Created new Berth Report:', newReport);

  return newReport;
};

// Corrected final export block
export {
  processDepartureReport,
  processNoonReport,
  processArrivalReport,
  processBerthReport,
};
