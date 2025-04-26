import express, { Express, Request, Response, NextFunction } from 'express';
import reportRoutes from './routes/reportRoutes';
import voyageRoutes from './routes/voyageRoutes'; // Import voyage routes
import vesselsRoutes from './routes/vesselsRoutes';
import cors from 'cors';

const app: Express = express();
const port: number | string = process.env.PORT || 3001;

// --- CORS Configuration ---
// Allow requests only from the frontend development server origin
const corsOptions = {
  origin: 'http://localhost:5173', // Your frontend's origin
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions)); // Use CORS middleware *before* other middleware/routes

app.use(express.json()); // Middleware to parse JSON bodies

// Basic route for testing
app.get('/', (req: Request, res: Response) => {
  res.send('Ship Reporting Backend is running!');
});

// --- API Routes ---
app.use('/api/reports', reportRoutes);
app.use('/api/voyages', voyageRoutes); // Use voyage routes
app.use('/api/vessels', vesselsRoutes);


// TODO: Add other routes (vessels, users)

// --- Basic Error Handling Middleware ---
// This should be placed after all routes
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error caught by middleware:", err.stack || err); // Log the error stack
  const statusCode = err.statusCode || 500; // Default to 500 Internal Server Error
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ message });
});


app.listen(port, () => {
  // Check if port is a number before logging, as it could be a string (e.g., pipe/socket)
  if (typeof port === 'number') {
    console.log(`Server listening at http://localhost:${port}`);
  } else {
    console.log(`Server listening on port ${port}`);
  }
});
