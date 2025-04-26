// src/routes/vesselsRoutes.ts
import express, { Request, Response, Router, NextFunction } from 'express';
import { readData } from '../db/jsonUtils';
import { Vessel, BunkerRecord, Report } from '../types/dataTypes'; // Import Report type

const router: Router = express.Router();

// GET /api/vessels - Get all vessels
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vessels = await readData('vessels.json') as Vessel[];
        res.status(200).json(vessels);
    } catch (error) {
        console.error('Error fetching all vessels:', error);
        next(error);
    }
});

// GET /api/vessels/:id - Get vessel by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vesselId = parseInt(req.params.id, 10);
        if (isNaN(vesselId)) {
            return res.status(400).json({ message: 'Invalid vessel ID format.' });
        }

        const vessels = await readData('vessels.json') as Vessel[];
        const vessel = vessels.find(v => v.id === vesselId);

        if (!vessel) {
            return res.status(404).json({ message: `Vessel with ID ${vesselId} not found.` });
        }

        res.status(200).json(vessel);
    } catch (error) {
        console.error(`Error fetching vessel ${req.params.id}:`, error);
        next(error);
    }
});

// GET /api/vessels/:vesselId/has-bunker-records - Check if bunker records exist for a vessel
router.get('/:vesselId/has-bunker-records', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vesselId = parseInt(req.params.vesselId, 10);
        if (isNaN(vesselId)) {
            return res.status(400).json({ message: 'Invalid vessel ID format.' });
        }

        // Read bunker tracking data and reports concurrently
        const [bunkerData, reports] = await Promise.all([
            readData('bunker_tracking.json').catch(err => {
                if (err.code === 'ENOENT') return []; // Return empty array if file not found
                throw err; // Re-throw other errors
            }) as Promise<BunkerRecord[]>,
            readData('reports.json').catch(err => {
                if (err.code === 'ENOENT') return []; // Return empty array if file not found
                throw err; // Re-throw other errors
            }) as Promise<Report[]>
        ]);

        // Filter to only approved reports for the specific vessel
        const approvedReportIds = reports
            .filter(report => report.vessel_id === vesselId && report.status === 'approved')
            .map(report => report.id);

        // Check if any bunker record exists for the vessel AND is linked to an approved report
        const hasApprovedBunkerRecords = bunkerData.some(record =>
            record.vessel_id === vesselId &&
            approvedReportIds.includes(record.report_id)
        );

        console.log(`Vessel ${vesselId}: Found approved report IDs: [${approvedReportIds.join(', ')}]. Has approved bunker records: ${hasApprovedBunkerRecords}`); // Add logging

        res.status(200).json({ hasBunkerRecords: hasApprovedBunkerRecords }); // Return based on approved records

    } catch (error) {
        console.error(`Error checking approved bunker records for vessel ${req.params.vesselId}:`, error);
        // If any error occurs (other than file not found handled above), pass it on
        next(error);
    } // Added missing closing brace for the try block
});


export default router;
