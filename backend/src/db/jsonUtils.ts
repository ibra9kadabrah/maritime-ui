import fs from 'fs/promises';
import path from 'path';
import { User, Vessel, Voyage, Report, BunkerRecord } from '../types/dataTypes'; // Import types

const dataDir = path.join(__dirname, '..', '..', 'data');

// Helper function to get the full path to a data file
const getFilePath = (fileName: string): string => path.join(dataDir, fileName);

// Function to read data from a JSON file
// Using 'unknown' as a safe default, as this function reads various structures.
// Consider generics or type guards for more specific usage later.
const readData = async (fileName: string): Promise<unknown> => {
  const filePath = getFilePath(fileName);
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error: any) { // Using 'any' for error handling simplicity for now
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty object/array based on expected structure
      console.warn(`Data file ${fileName} not found. Returning empty data.`);
      // Determine appropriate empty structure based on filename
      // This is a basic heuristic and might need refinement
      if (['users.json', 'vessels.json', 'voyages.json', 'reports.json', 'bunker_tracking.json'].includes(fileName)) {
        return []; // These files store arrays
      }
      return {}; // Default to object
    }
    console.error(`Error reading data from ${fileName}:`, error);
    throw error; // Re-throw other errors
  }
};

// Type guard for writeData to accept known array types
type WritableData = User[] | Vessel[] | Voyage[] | Report[] | BunkerRecord[] | unknown;

// Function to write data to a JSON file
const writeData = async (fileName: string, data: WritableData): Promise<void> => {
  const filePath = getFilePath(fileName);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing data to ${fileName}:`, error);
    throw error;
  }
};

export {
  readData,
  writeData,
};
