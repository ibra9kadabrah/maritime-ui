import express, { Request, Response, Router, NextFunction } from 'express';
import { readData } from '../db/jsonUtils';
import { Voyage } from '../types/dataTypes';

const router: Router = express.Router();

// GET /api/voyages - List all voyages
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const voyages = await readData('voyages.json') as Voyage[];
        // Optionally add filtering or sorting here later
        res.status(200).json(voyages);
    } catch (error) {
        console.error('Error fetching voyages:', error);
        next(error); // Pass error to the error handling middleware
    }
});

// TODO: Add endpoints for GET by ID, POST, PUT, DELETE as needed

export default router;
