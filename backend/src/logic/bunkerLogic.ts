import { readData, writeData } from '../db/jsonUtils';
import { BunkerRecord } from '../types/dataTypes'; // Import the specific type

// Define more specific types based on BunkerRecord structure for clarity
// These represent the *inputs* for calculation, not the full record
interface BunkerLevels {
  lsifo_rob: number;
  lsmgo_rob: number;
  cyl_oil_rob: number;
  me_oil_rob: number;
  ae_oil_rob: number;
  vol_oil_rob: number;
}

interface BunkerChanges {
  lsifo_consumed?: number;
  lsmgo_consumed?: number;
  cyl_oil_consumed?: number;
  me_oil_consumed?: number;
  ae_oil_consumed?: number;
  vol_oil_consumed?: number;
  lsifo_supplied?: number;
  lsmgo_supplied?: number;
  cyl_oil_supplied?: number;
  me_oil_supplied?: number;
  ae_oil_supplied?: number;
  vol_oil_supplied?: number;
}


// Calculates new ROB levels based on previous levels, consumption, and supply
const calculateNewROB = (previousLevels: Partial<BunkerLevels>, consumption: Partial<BunkerChanges>, supply: Partial<BunkerChanges>): BunkerLevels => {
  console.log('Calculating New ROB:', { previousLevels, consumption, supply });

  // Perform calculation for each fuel type, handling potential undefined values
  const newLevels: BunkerLevels = {
    lsifo_rob: (previousLevels.lsifo_rob || 0) - (consumption.lsifo_consumed || 0) + (supply.lsifo_supplied || 0),
    lsmgo_rob: (previousLevels.lsmgo_rob || 0) - (consumption.lsmgo_consumed || 0) + (supply.lsmgo_supplied || 0),
    cyl_oil_rob: (previousLevels.cyl_oil_rob || 0) - (consumption.cyl_oil_consumed || 0) + (supply.cyl_oil_supplied || 0),
    me_oil_rob: (previousLevels.me_oil_rob || 0) - (consumption.me_oil_consumed || 0) + (supply.me_oil_supplied || 0),
    ae_oil_rob: (previousLevels.ae_oil_rob || 0) - (consumption.ae_oil_consumed || 0) + (supply.ae_oil_supplied || 0),
    vol_oil_rob: (previousLevels.vol_oil_rob || 0) - (consumption.vol_oil_consumed || 0) + (supply.vol_oil_supplied || 0),
  };

  // TODO: Add validation (e.g., ROB cannot be negative)

  return newLevels;
};

// Fetches the most recent bunker record for a given vessel
const getLatestBunkerRecord = async (vesselId: number): Promise<BunkerRecord | null> => {
  const allBunkerData = await readData('bunker_tracking.json') as BunkerRecord[];
  const vesselRecords = allBunkerData.filter(b => b.vessel_id === vesselId);
  // Sort by report_id primarily (or maybe report_date) to find the latest
  // Using id as a proxy for sequence if report_id isn't reliable yet
  vesselRecords.sort((a, b) => b.id - a.id); // Or b.report_id - a.report_id

  const latestRecord = vesselRecords.length > 0 ? vesselRecords[0] : null;
  console.log(`Latest bunker record for vessel ${vesselId}:`, latestRecord);
  return latestRecord;
};

// Fetches the specific bunker record associated with a given report ID
const getBunkerRecordByReportId = async (reportId: number, vesselId: number): Promise<BunkerRecord | null> => {
  if (reportId === 0) return null; // Cannot fetch for initial state like this
  const allBunkerData = await readData('bunker_tracking.json') as BunkerRecord[];
  // Find the record matching the reportId and vesselId
  // In theory, there should only be one per reportId, but find the latest if multiple exist (e.g., by bunker record ID)
  const reportBunkerRecords = allBunkerData
      .filter(b => b.report_id === reportId && b.vessel_id === vesselId)
      .sort((a, b) => b.id - a.id); // Sort descending by bunker record ID

  const specificRecord = reportBunkerRecords.length > 0 ? reportBunkerRecords[0] : null;
  console.log(`Bunker record for report ${reportId} (Vessel ${vesselId}):`, specificRecord);
  return specificRecord;
};


// Creates and saves a new bunker record based on previous state, consumption, supply, or initial values
const createAndSaveBunkerRecord = async (
    vesselId: number,
    reportId: number,
    reportDate: string,
    previousRecord: BunkerRecord | null, // The entire previous record
    consumption: Partial<BunkerChanges>, // Consumption since previous report
    supply: Partial<BunkerChanges>, // Supply at the time of this report
    initialRob?: Partial<BunkerLevels> // Optional: Initial ROB values for the very first record
): Promise<BunkerRecord> => {
  console.log('Creating Bunker Record:', { vesselId, reportId, reportDate, previousRecord, consumption, supply, initialRob });

  let newLevels: BunkerLevels;

  if (previousRecord) {
    // Calculate based on previous record
    const previousLevels: Partial<BunkerLevels> = {
      lsifo_rob: previousRecord.lsifo_rob,
      lsmgo_rob: previousRecord.lsmgo_rob,
      cyl_oil_rob: previousRecord.cyl_oil_rob,
      me_oil_rob: previousRecord.me_oil_rob,
      ae_oil_rob: previousRecord.ae_oil_rob,
      vol_oil_rob: previousRecord.vol_oil_rob,
    };
    newLevels = calculateNewROB(previousLevels, consumption, supply);
    console.log('Calculated new ROB based on previous record:', newLevels);
  } else if (initialRob && Object.keys(initialRob).length > 0) {
    // This is the first record. Calculate ROB at departure based on initial values,
    // pre-departure consumption, and supply received at departure.
    // The 'consumption' and 'supply' passed in represent these pre-departure adjustments.
    console.log('Calculating ROB for first record using initial values, consumption, and supply.');
    newLevels = calculateNewROB(initialRob, consumption, supply); // Use the same calculator function
    // Note: The 'consumption' and 'supply' objects passed in are stored directly below.
    // The calculateNewROB function here is just used to get the final ROB state at departure.
    console.log('Calculated ROB at departure (for first record):', newLevels);
  } else {
    // No previous record and no initial ROB provided - this is likely an error state
    // This case should ideally not be reached if the frontend ensures initialRob is sent for the first report.
    console.warn(`Warning: Creating first bunker record for vessel ${vesselId} without initial ROB values. Defaulting ROBs to 0.`);
    newLevels = { // Define default 0 ROBs without referencing initialRob
      lsifo_rob: 0,
      lsmgo_rob: 0,
      cyl_oil_rob: 0, // Corrected: Removed duplicate and reference to initialRob
      me_oil_rob: 0,
      ae_oil_rob: 0,
      vol_oil_rob: 0
    };
    // Consumption and supply are also unknown in this error state.
    consumption = {}; // Keep consumption as empty/0
    supply = {}; // Keep supply as empty/0
  }

  const allBunkerData = await readData('bunker_tracking.json') as BunkerRecord[];
  const nextId = allBunkerData.length > 0 ? Math.max(...allBunkerData.map(b => b.id)) + 1 : 1;

  const newRecord: BunkerRecord = {
    id: nextId,
    vessel_id: vesselId,
    report_id: reportId,
    report_date: reportDate,
    ...newLevels, // Spread the calculated ROB values
    // Record the consumption and supply figures used for this calculation
    lsifo_consumed: consumption.lsifo_consumed || 0,
    lsmgo_consumed: consumption.lsmgo_consumed || 0,
    cyl_oil_consumed: consumption.cyl_oil_consumed || 0,
    me_oil_consumed: consumption.me_oil_consumed || 0,
    ae_oil_consumed: consumption.ae_oil_consumed || 0,
    vol_oil_consumed: consumption.vol_oil_consumed || 0,
    lsifo_supplied: supply.lsifo_supplied || 0,
    lsmgo_supplied: supply.lsmgo_supplied || 0,
    cyl_oil_supplied: supply.cyl_oil_supplied || 0,
    me_oil_supplied: supply.me_oil_supplied || 0,
    ae_oil_supplied: supply.ae_oil_supplied || 0,
    vol_oil_supplied: supply.vol_oil_supplied || 0,
  };

  allBunkerData.push(newRecord);
  await writeData('bunker_tracking.json', allBunkerData);
  console.log('Saved new bunker record:', newRecord);

  return newRecord;
};


export {
  calculateNewROB,
  getLatestBunkerRecord,
  getBunkerRecordByReportId, // Export the new function
  createAndSaveBunkerRecord,
};
