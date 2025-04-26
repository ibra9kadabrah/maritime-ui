import express, { Request, Response, Router, NextFunction } from 'express'; // Import NextFunction
import {
    processDepartureReport,
    processNoonReport,
    processArrivalReport,
    processBerthReport
} from '../logic/reportLogic';
// Import bunker logic function
import { getBunkerRecordByReportId } from '../logic/bunkerLogic';
// Import Voyage type as well
import { ReportType, Report, BunkerRecord, Voyage } from '../types/dataTypes';
import { readData, writeData } from '../db/jsonUtils'; // Import readData and writeData

const router: Router = express.Router();

// POST /api/reports - Submit a new report
router.post('/', async (req: Request, res: Response, next: NextFunction) => { // Add next parameter
    // TODO: Add input validation (e.g., using Zod)
    const { vesselId, submittedBy, reportType, reportData } = req.body;

    // Basic validation
    if (!vesselId || !submittedBy || !reportType || !reportData) {
        return res.status(400).json({ message: 'Missing required fields: vesselId, submittedBy, reportType, reportData' });
    }

    try {
        let newReport;
        const input = { vesselId: Number(vesselId), submittedBy, reportData }; // Ensure vesselId is number

        switch (reportType as ReportType) {
            case 'departure':
                newReport = await processDepartureReport(input);
                break;
            case 'noon':
                // TODO: Ensure reportData matches NoonFormData structure
                newReport = await processNoonReport(input);
                break;
            case 'arrival':
                // TODO: Ensure reportData matches ArrivalFormData structure
                newReport = await processArrivalReport(input);
                break;
            case 'berth':
                // TODO: Ensure reportData matches BerthFormData structure
                newReport = await processBerthReport(input);
                break;
            default:
                return res.status(400).json({ message: `Invalid report type: ${reportType}` });
        }

        res.status(201).json(newReport); // Respond with the created report
    } catch (error: any) {
        console.error(`Error processing report type ${reportType}:`, error);
        // Pass the error to the Express error handling middleware
        next(error);
    }
});

// GET /api/reports - List all reports (add filtering later)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        // TODO: Add filtering based on query parameters (e.g., voyageId, status, vesselId)
        const reports = await readData('reports.json'); // Reads the entire reports array
        res.status(200).json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        next(error);
    }
});

// GET /api/reports/:id - Get a specific report by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reportId = parseInt(req.params.id, 10);
        if (isNaN(reportId)) {
            return res.status(400).json({ message: 'Invalid report ID format.' });
        }

        const reports = await readData('reports.json') as Report[]; // Assuming Report type is correct
        const report = reports.find(r => r.id === reportId);

        if (!report) {
            return res.status(404).json({ message: `Report with ID ${reportId} not found.` });
        }

        res.status(200).json(report);
    } catch (error) {
        console.error(`Error fetching report ${req.params.id}:`, error);
        next(error);
    }
});

// GET /api/reports/:id/bunker-record - Get the bunker record associated with a specific report
router.get('/:id/bunker-record', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reportId = parseInt(req.params.id, 10);
        if (isNaN(reportId)) {
            return res.status(400).json({ message: 'Invalid report ID format.' });
        }

        // We need the vesselId to fetch the correct bunker record.
        // Let's first fetch the report to get the vesselId.
        const reports = await readData('reports.json') as Report[];
        const report = reports.find(r => r.id === reportId);

        if (!report) {
            return res.status(404).json({ message: `Report with ID ${reportId} not found.` });
        }

        // Now fetch the bunker record using the reportId and the vesselId from the report
        const bunkerRecord = await getBunkerRecordByReportId(reportId, report.vessel_id);

        if (!bunkerRecord) {
            // It's possible a bunker record doesn't exist yet if something went wrong during submission
            // or if it's an older report before bunker tracking was fully implemented.
            // Return 404 or an empty object/specific message based on desired frontend handling.
            console.warn(`Bunker record not found for Report ID ${reportId} (Vessel ID ${report.vessel_id})`);
            return res.status(404).json({ message: `Bunker record not found for Report ID ${reportId}.` });
        }

        res.status(200).json(bunkerRecord);

    } catch (error) {
        console.error(`Error fetching bunker record for report ${req.params.id}:`, error);
        next(error);
    }
});


// POST /api/reports/:id/approve - Approve a report
router.post('/:id/approve', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reportId = parseInt(req.params.id, 10);
        const { reviewer } = req.body; // Username of the office staff approving

        if (isNaN(reportId)) {
            return res.status(400).json({ message: 'Invalid report ID format.' });
        }
        if (!reviewer) {
            return res.status(400).json({ message: 'Reviewer username is required.' });
        }

        const reports = await readData('reports.json') as Report[];
        const reportIndex = reports.findIndex(r => r.id === reportId);

        if (reportIndex === -1) {
            return res.status(404).json({ message: `Report with ID ${reportId} not found.` });
        }

        // Update report status
        reports[reportIndex].status = 'approved';
        reports[reportIndex].reviewer = reviewer;
        reports[reportIndex].reviewed_at = new Date().toISOString();
        reports[reportIndex].rejection_reason = undefined; // Clear rejection reason if any

        await writeData('reports.json', reports);

        console.log(`Report ${reportId} approved by ${reviewer}`);
        res.status(200).json(reports[reportIndex]);

    } catch (error) {
        console.error(`Error approving report ${req.params.id}:`, error);
        next(error);
    }
});

// POST /api/reports/:id/reject - Reject a report
router.post('/:id/reject', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reportId = parseInt(req.params.id, 10);
        const { reviewer, rejectionReason } = req.body; // Username and reason

        if (isNaN(reportId)) {
            return res.status(400).json({ message: 'Invalid report ID format.' });
        }
        if (!reviewer || !rejectionReason) {
            return res.status(400).json({ message: 'Reviewer username and rejectionReason are required.' });
        }

        const reports = await readData('reports.json') as Report[];
        const reportIndex = reports.findIndex(r => r.id === reportId);

        if (reportIndex === -1) {
            return res.status(404).json({ message: `Report with ID ${reportId} not found.` });
        }

        // Update report status
        reports[reportIndex].status = 'rejected';
        reports[reportIndex].reviewer = reviewer;
        reports[reportIndex].reviewed_at = new Date().toISOString();
        const rejectedReport = reports[reportIndex];

        // Update report status
        rejectedReport.status = 'rejected';
        rejectedReport.reviewer = reviewer;
        rejectedReport.reviewed_at = new Date().toISOString();
        rejectedReport.rejection_reason = rejectionReason;

        let voyagesUpdated = false;
        let voyages: Voyage[] = []; // Declare voyages array
        let bunkerRecordsUpdated = false; // Flag for bunker record changes
        let bunkerRecords: BunkerRecord[] = []; // Declare bunker records array

        // Check if the rejected report was the starting report of a voyage
        if (rejectedReport.type === 'departure' && rejectedReport.sequence_number === 1) {
            // Also handle associated voyage and bunker record
            voyages = await readData('voyages.json') as Voyage[];
            const voyageIndex = voyages.findIndex(v => v.id === rejectedReport.voyage_id);

            if (voyageIndex !== -1 && voyages[voyageIndex].starting_report_id === rejectedReport.id) {
                // Deactivate the voyage since its starting report was rejected
                voyages[voyageIndex].active = false;
                // Optionally clear other fields like end_date or starting_report_id if needed
                // voyages[voyageIndex].starting_report_id = undefined;
                voyagesUpdated = true;
                console.log(`Deactivated Voyage ID ${voyages[voyageIndex].id} because its starting report (ID: ${reportId}) was rejected.`);

                // Also remove the corresponding bunker record
                try {
                    console.log(`Attempting to read bunker_tracking.json for potential removal (Report ID: ${reportId})`); // ADD LOG
                    bunkerRecords = await readData('bunker_tracking.json') as BunkerRecord[];
                    const initialLength = bunkerRecords.length;
                    console.log(`Read ${initialLength} bunker records.`); // ADD LOG
                    bunkerRecords = bunkerRecords.filter(br => br.report_id !== rejectedReport.id);
                    console.log(`Filtered bunker records. New length: ${bunkerRecords.length}`); // ADD LOG
                    if (bunkerRecords.length < initialLength) {
                        bunkerRecordsUpdated = true;
                        console.log(`Flagging bunker_tracking.json for update.`); // ADD LOG
                    } else {
                         console.log(`No bunker record found matching report ID ${rejectedReport.id}. No update needed.`); // ADD LOG
                    }
                } catch (err: any) {
                    // Ignore if bunker file doesn't exist, but log other errors
                    if (err.code === 'ENOENT') {
                         console.log('bunker_tracking.json not found, no removal needed.'); // ADD LOG
                    } else {
                        console.error(`Error reading or filtering bunker_tracking.json while rejecting report ${reportId}:`, err);
                    }
                    // Ensure bunkerRecordsUpdated remains false on error
                    bunkerRecordsUpdated = false;
                }
            }
        }

        // Save updated reports, voyages (if changed), and bunker records (if changed)
        await writeData('reports.json', reports);
        if (voyagesUpdated) {
            await writeData('voyages.json', voyages);
        }
        if (bunkerRecordsUpdated) {
            await writeData('bunker_tracking.json', bunkerRecords);
        }

        console.log(`Report ${reportId} rejected by ${reviewer}. Reason: ${rejectionReason}`);
        res.status(200).json(rejectedReport);

    } catch (error) {
        console.error(`Error rejecting report ${req.params.id}:`, error);
        next(error);
    }
});


export default router;
