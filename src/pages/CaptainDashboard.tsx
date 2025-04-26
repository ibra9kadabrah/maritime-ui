import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { Ship, FileText, ChevronDown, ChevronUp, LogOut, AlertCircle, Clock, ListChecks } from 'lucide-react'; // Added icons
import DepartureReportForm from '../components/forms/DepartureReportForm';
import NoonReportForm from '../components/forms/NoonReportForm';
import ArrivalReportForm from '../components/forms/ArrivalReportForm';
import BerthReportForm from '../components/forms/BerthReportForm';
import { ProcessedDepartureFormData } from '../components/forms/types/departureFormTypes';
import { ProcessedNoonFormData } from '../components/forms/types/noonFormTypes';
import { ProcessedArrivalFormData } from '../components/forms/types/arrivalFormTypes';
import { ProcessedBerthFormData } from '../components/forms/types/berthFormTypes';
import api from '../utils/api'; // Import API utility
// Import Vessel type as well
import { Report as BackendReport, Voyage as BackendVoyage, Vessel as BackendVessel } from '../../backend/src/types/dataTypes';

// Helper to format date/time strings
const formatDateTime = (isoString?: string) => {
  if (!isoString) return 'N/A';
  try {
    return new Date(isoString).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false
    });
  } catch {
    return isoString; // Fallback if date is invalid
  }
};


const CaptainDashboard = () => {
  // State management
  const [formsOpen, setFormsOpen] = useState(true); // Keep forms open by default
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allReports, setAllReports] = useState<BackendReport[]>([]);
  const [allVoyages, setAllVoyages] = useState<BackendVoyage[]>([]);
  const [captainActiveVoyage, setCaptainActiveVoyage] = useState<BackendVoyage | null>(null);
  const [lastApprovedReport, setLastApprovedReport] = useState<BackendReport | null>(null);
  const [hasPendingReport, setHasPendingReport] = useState<boolean>(false);
  const [currentVesselData, setCurrentVesselData] = useState<BackendVessel | null>(null);
  const [isFirstDeparture, setIsFirstDeparture] = useState<boolean | null>(null); // For initial ROB fields
  // const [isFirstEverReportForVessel, setIsFirstEverReportForVessel] = useState<boolean | null>(null); // No longer needed with new API call
  // const [previousDestinationPort, setPreviousDestinationPort] = useState<string | null>(null); // Replaced by lastDestinationPortForForm
  // const [previousVoyage, setPreviousVoyage] = useState<BackendVoyage | null>(null); // No longer needed for this logic

  // New state for the revised departure port logic
  const [hasPreviousDeparture, setHasPreviousDeparture] = useState<boolean>(false);
  const [lastDestinationPortForForm, setLastDestinationPortForForm] = useState<string | null>(null);


  // --- TODO: Replace with actual user/vessel context ---
  // const currentCaptainUsername = 'captain_smith'; // REMOVED HARDCODED USERNAME
  const currentVesselId = 1; // Keep vessel ID for now, assuming it's correct
  // ---

  // Define fetchData using useCallback to memoize it
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsFirstDeparture(null); // Reset on refetch
    // Reset new state variables
    setHasPreviousDeparture(false);
    setLastDestinationPortForForm(null);
    setError(null);
    try {
      // Fetch vessel data, reports, voyages, and bunker status
      const [fetchedReports, fetchedVoyages, fetchedVessel, hasBunkerRecords] = await Promise.all([
        api.getReports(),
        api.getVoyages(),
        api.getVessel(currentVesselId),
        api.checkVesselHasBunkerRecords(currentVesselId) // Check bunker records status
      ]);
      setAllReports(fetchedReports);
      setAllVoyages(fetchedVoyages);
      setIsFirstDeparture(!hasBunkerRecords); // Set state based on API result (for initial ROB)
      setCurrentVesselData(fetchedVessel); // Store fetched vessel data

      // Determine if it's the first ever report for this vessel (Removed state setter, keeping log for now if useful)
      const hasAnyPreviousReports = fetchedReports.some(report => report.vessel_id === currentVesselId);
      // setIsFirstEverReportForVessel(!hasAnyPreviousReports); // Removed this line
      console.log(`Vessel ${currentVesselId}: Has any previous reports = ${hasAnyPreviousReports}`); // Simplified log

      // Determine active voyage for the current vessel
      const activeVoyage = fetchedVoyages.find(v => v.vessel_id === currentVesselId && v.active);
      setCaptainActiveVoyage(activeVoyage || null);

      // Check for pending reports for the active voyage
      if (activeVoyage) {
        const pending = fetchedReports.some(r => r.voyage_id === activeVoyage.id && r.status === 'pending');
        setHasPendingReport(pending);
        console.log(`Voyage ${activeVoyage.id} has pending report: ${pending}`);

        // Find the last approved report for the active voyage (inside the if block)
        const voyageReports = fetchedReports.filter(r => r.voyage_id === activeVoyage.id);
        const approvedReports = voyageReports.filter(r => r.status === 'approved');
        // Sort by sequence number descending (assuming higher means later)
        approvedReports.sort((a, b) => (b.sequence_number ?? 0) - (a.sequence_number ?? 0));
        const latestApproved = approvedReports.length > 0 ? approvedReports[0] : null;
        setLastApprovedReport(latestApproved);
        console.log("Last approved report for active voyage:", latestApproved);

      } else {
        setLastApprovedReport(null); // No active voyage means no relevant last approved report for *next* step logic
        setHasPendingReport(false);
        console.log("No active voyage found for this vessel.");
      }

      // --- Check for previous departure using the new API function ---
      const departureCheckResult = await api.checkVesselHasPreviousDeparture(currentVesselId);
      setHasPreviousDeparture(departureCheckResult.hasPreviousDeparture);
      setLastDestinationPortForForm(departureCheckResult.lastDestinationPort);
      console.log(`Vessel ${currentVesselId}: Has previous departure = ${departureCheckResult.hasPreviousDeparture}, Last Destination = ${departureCheckResult.lastDestinationPort}`);
      // --- End previous departure check ---


    } catch (err: any) {
      console.error("Failed to fetch captain dashboard data:", err);
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  }, [currentVesselId]); // Dependency remains currentVesselId

  // --- Removed determineLastDestinationPort function ---


  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]); // Call the memoized fetchData

  // Use fetched vessel data for display
  const displayVoyageInfo = captainActiveVoyage ? {
    vessel: currentVesselData?.name || `Vessel ${currentVesselId}`, // Use fetched name or fallback
    voyage: captainActiveVoyage.voyage_number,
    departurePort: captainActiveVoyage.departure_port,
    destinationPort: captainActiveVoyage.destination_port,
    cargoType: captainActiveVoyage.cargo_type || 'N/A',
    cargoQuantity: captainActiveVoyage.cargo_quantity ? `${captainActiveVoyage.cargo_quantity} MT` : 'N/A'
  } : {
    vessel: currentVesselData?.name || `Vessel ${currentVesselId}`, // Use fetched name or fallback even if no active voyage
    voyage: 'N/A',
    departurePort: 'N/A',
    destinationPort: 'N/A',
    cargoType: 'N/A',
    cargoQuantity: 'N/A'
  };


  // Toggle functions
  const toggleForms = () => setFormsOpen(!formsOpen);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  
  // Form selection
  const selectForm = (form: string | null) => {
    setSelectedForm(form);
    // Close mobile menu if open
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  // Generic success handler after API call succeeds in form components
  const handleFormSuccess = (reportType: string) => {
    // alert(`${reportType} report submitted successfully!`); // Alert is now inside form component
    setSelectedForm(null); // Close the form
    // Refetch ALL data using the main fetchData function to update everything,
    // including previousDestinationPort state.
    fetchData();
  };


  // Handle form cancellation
  const handleFormCancel = () => {
    setSelectedForm(null);
  };

  // Render the appropriate form based on selection
  const renderFormContent = () => {
    // Use the captain's name from the fetched vessel data for filtering
    const currentCaptainUsername = currentVesselData?.current_captain;

    // Filter reports for the current captain (all statuses) and sort by submission date descending
    const captainReportHistory = currentCaptainUsername
      ? allReports
          .filter(report => report.submitted_by === currentCaptainUsername)
          .sort((a, b) => new Date(b.submitted_at ?? 0).getTime() - new Date(a.submitted_at ?? 0).getTime())
      : []; // Show empty history if captain name isn't loaded yet

    if (!selectedForm) {
      // Main dashboard view
      return (
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Captain Dashboard</h2>
          {/* Active Voyage Summary */}
          <div className="flex items-center mb-6 bg-blue-50 p-4 rounded">
            <Ship className="text-blue-700 mr-3" size={24} />
            <div>
              <div className="font-bold">{displayVoyageInfo.vessel}</div>
              <div className="text-sm">Voyage: {displayVoyageInfo.voyage}</div>
              {captainActiveVoyage && <div className="text-sm">{displayVoyageInfo.departurePort} → {displayVoyageInfo.destinationPort}</div>}
              {!captainActiveVoyage && <div className="text-sm text-gray-500">No active voyage</div>}
            </div>
          </div>

          {/* Report History Table */}
          <div className="mb-6">
            <h3 className="font-bold mb-2 flex items-center"><ListChecks size={18} className="mr-2" /> Report History</h3>
            {isLoading ? <p>Loading reports...</p> : error ? <p className="text-red-500">Error loading reports: {error}</p> : (
              <div className="overflow-x-auto border rounded">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Report Type</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Voyage #</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {captainReportHistory.length > 0 ? (
                      captainReportHistory.map(report => (
                        <tr key={report.id}>
                          <td className="py-2 px-3 whitespace-nowrap capitalize">{report.type}</td>
                          <td className="py-2 px-3 whitespace-nowrap">{allVoyages.find(v => v.id === report.voyage_id)?.voyage_number || 'N/A'}</td>
                          <td className="py-2 px-3 whitespace-nowrap">{formatDateTime(report.submitted_at)}</td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            {report.status === 'pending' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                            )}
                            {report.status === 'approved' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Approved
                              </span>
                            )}
                             {report.status === 'rejected' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Rejected
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-gray-500">No reports submitted yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Removed the "Select a Report Form" section */}

          {/* Important Notice */}
          <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
             <div className="flex">
               <AlertCircle className="text-yellow-500 mr-2" size={20} />
               <div>
                 <p className="font-medium">Important Notice</p>
                 <p className="text-sm">All reports undergo office verification. Please ensure accuracy of all data before submission.</p>
                 {hasPendingReport && <p className="text-sm mt-1 text-red-600 font-medium">You have a pending report that must be approved or rejected before submitting a new one.</p>}
               </div>
             </div>
           </div>
        </div>
      );
    }

    // Render the appropriate form component based on selection, passing vesselData
    switch (selectedForm) {
      case 'departure':
        // Pass isFirstDeparture prop
        return <DepartureReportForm
                  vesselData={currentVesselData}
                  isFirstDeparture={isFirstDeparture} // For initial ROB (still needed)
                  hasPreviousDeparture={hasPreviousDeparture} // New prop
                  lastDestinationPort={lastDestinationPortForForm} // New prop
                  onSubmit={(data: ProcessedDepartureFormData) => handleFormSuccess('Departure')}
                  onCancel={handleFormCancel}
               />;
      case 'noon':
        // Pass active voyage data, last approved report, and vessel data as props
        return <NoonReportForm vesselData={currentVesselData} voyageData={captainActiveVoyage} lastApprovedReport={lastApprovedReport} onSubmit={(data: ProcessedNoonFormData) => handleFormSuccess('Noon')} onCancel={handleFormCancel} />;
      case 'arrival':
         // Pass active voyage data, last approved report, and vessel data as props
        return <ArrivalReportForm vesselData={currentVesselData} voyageData={captainActiveVoyage} lastApprovedReport={lastApprovedReport} onSubmit={(data: ProcessedArrivalFormData) => handleFormSuccess('Arrival')} onCancel={handleFormCancel} />;
      case 'berth':
         // Pass active voyage data, last approved report, and vessel data as props
         // Also find the specific preceding approved Arrival/Berth report for Harbour Distance
         const precedingPortReport = captainActiveVoyage
            ? allReports
                .filter(r => r.voyage_id === captainActiveVoyage.id && (r.type === 'arrival' || r.type === 'berth') && r.status === 'approved')
                .sort((a, b) => new Date(b.submitted_at || 0).getTime() - new Date(a.submitted_at || 0).getTime())[0] // Get the latest one
            : null;
         console.log("Preceding Port Report for Berth Form:", precedingPortReport);

         // Calculate cargo remaining before this potential Berth report
         // Use captainActiveVoyage here, not voyageData
         let cargoBeforeCurrentBerthOps = captainActiveVoyage?.cargo_quantity ?? 0;
         if (captainActiveVoyage) {
             const approvedReportsForVoyage = allReports
                 .filter(r => r.voyage_id === captainActiveVoyage.id && r.status === 'approved')
                 .sort((a, b) => (a.sequence_number ?? 0) - (b.sequence_number ?? 0)); // Sort by sequence ascending

             approvedReportsForVoyage.forEach(report => {
                 if (report.type === 'berth' && typeof report.report_data === 'object' && report.report_data !== null) {
                     const loaded = typeof report.report_data.cargoLoaded === 'number' ? report.report_data.cargoLoaded : 0;
                     const unloaded = typeof report.report_data.cargoUnloaded === 'number' ? report.report_data.cargoUnloaded : 0;
                     cargoBeforeCurrentBerthOps += loaded - unloaded;
                 }
             });
         }
         console.log("Cargo before current Berth ops:", cargoBeforeCurrentBerthOps);


        return <BerthReportForm
                  vesselData={currentVesselData}
                  voyageData={captainActiveVoyage}
                  lastApprovedReport={lastApprovedReport} // Still needed for ROB fetch logic in BerthForm
                  precedingPortReport={precedingPortReport} // Pass the specific preceding report for Harbour Distance
                  cargoBeforeCurrentBerthOps={cargoBeforeCurrentBerthOps} // Pass calculated starting cargo
                  onSubmit={(data: ProcessedBerthFormData) => handleFormSuccess('Berth')}
                  onCancel={handleFormCancel}
               />;
      default:
        return null; // Should not happen if selectedForm is managed correctly
    }
  };

  // --- Determine Allowed Next Reports ---
  // Find the absolute latest report for the active voyage, regardless of status
  const latestReportForActiveVoyage = captainActiveVoyage
    ? allReports
        .filter(r => r.voyage_id === captainActiveVoyage.id)
        .sort((a, b) => (b.sequence_number ?? 0) - (a.sequence_number ?? 0))[0] // Get the one with highest sequence
    : null;

  const lastApprovedType = lastApprovedReport?.type; // Type of the last *approved* report

  // Departure: Allowed if no active voyage, or last report was Arrival/Berth (any status), or last report was Departure and rejected.
  const canSubmitDeparture = !hasPendingReport && (
    !captainActiveVoyage ||
    (latestReportForActiveVoyage?.type === 'arrival') ||
    (latestReportForActiveVoyage?.type === 'berth') ||
    (latestReportForActiveVoyage?.type === 'departure' && latestReportForActiveVoyage?.status === 'rejected')
  );

  // Noon/Arrival: Require an active voyage and the last *approved* report must be Departure or Noon.
  const canSubmitNoon = captainActiveVoyage && !hasPendingReport && (lastApprovedType === 'departure' || lastApprovedType === 'noon');
  const canSubmitArrival = captainActiveVoyage && !hasPendingReport && (lastApprovedType === 'departure' || lastApprovedType === 'noon');

  // Berth: Require an active voyage and the last *approved* report must be Arrival or Berth.
  const canSubmitBerth = captainActiveVoyage && !hasPendingReport && (lastApprovedType === 'arrival' || lastApprovedType === 'berth');

  // --- Tooltip Generation ---
  const getButtonTitle = (reportType: 'departure' | 'noon' | 'arrival' | 'berth'): string => {
    if (hasPendingReport) return "Previous report pending approval";
    if (!captainActiveVoyage && reportType !== 'departure') return "No active voyage";

    switch (reportType) {
      case 'departure':
        if (!captainActiveVoyage) return "Submit to start a new voyage";
        if (lastApprovedType === 'arrival' || lastApprovedType === 'berth') return "Submit when leaving current port";
        return "Cannot submit Departure during active passage"; // Should only happen if last was Noon/Departure
      case 'noon':
        if (!captainActiveVoyage) return "No active voyage"; // Should be covered above, but for safety
        if (lastApprovedType === 'arrival' || lastApprovedType === 'berth') return "Cannot submit Noon after Arrival/Berth";
        return "Daily status update";
      case 'arrival':
        if (!captainActiveVoyage) return "No active voyage";
        if (lastApprovedType === 'arrival' || lastApprovedType === 'berth') return "Cannot submit Arrival after Arrival/Berth";
        return "Submit upon arrival";
      case 'berth':
        if (!captainActiveVoyage) return "No active voyage";
        if (lastApprovedType === 'departure' || lastApprovedType === 'noon') return "Cannot submit Berth before Arrival";
        return "Submit during port operations";
      default:
        return "";
    }
  };


  // Main render
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile overlay for sidebar */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-10"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar - always visible on desktop, toggleable on mobile */}
      <div className={`fixed md:relative w-64 h-full bg-blue-900 text-white z-20 transition-all duration-300 ease-in-out ${
        mobileMenuOpen ? "left-0" : "-left-64 md:left-0"
      }`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-blue-800 flex justify-between items-center">
          <h1 className="text-xl font-bold">Maritime Reporting</h1>
          {mobileMenuOpen && (
            <button 
              onClick={toggleMobileMenu} 
              className="md:hidden text-white hover:text-gray-300"
            >
              ✕
            </button>
          )}
        </div>
        
        {/* Sidebar Content */}
        <div className="p-4">
          {/* Active Vessel Info */}
          <div className="bg-blue-800 p-3 rounded mb-4">
            <div className="font-bold">{displayVoyageInfo.vessel}</div>
            <div className="text-sm">Voyage: {displayVoyageInfo.voyage}</div>
            <div className="text-sm truncate">{displayVoyageInfo.departurePort} → {displayVoyageInfo.destinationPort}</div>
          </div>

          {/* Navigation */}
          <div className="space-y-2">
            {/* Forms Accordion */}
            {/* Forms Accordion */}
            <div>
              <button
                onClick={toggleForms}
                className="flex items-center justify-between w-full p-2 rounded text-left hover:bg-blue-800 transition-colors"
              >
                <div className="flex items-center">
                  <FileText size={18} className="mr-2" />
                  <span>Report Forms</span>
                </div>
                {formsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {formsOpen && (
                <div className="ml-2 mt-1 space-y-1 border-l border-blue-700 pl-4">
                  {/* Departure Report Button */}
                  <button
                    className={`p-2 rounded w-full text-left transition-colors ${selectedForm === 'departure' ? 'bg-blue-800' : ''} ${!canSubmitDeparture ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-blue-800'}`}
                    onClick={() => canSubmitDeparture && selectForm('departure')}
                    disabled={!canSubmitDeparture}
                    title={getButtonTitle('departure')}
                  >
                    Departure Report
                  </button>

                  {/* Noon Report Button */}
                   <button
                    className={`p-2 rounded w-full text-left transition-colors ${selectedForm === 'noon' ? 'bg-blue-800' : ''} ${!canSubmitNoon ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-blue-800'}`}
                    onClick={() => canSubmitNoon && selectForm('noon')}
                    disabled={!canSubmitNoon}
                    title={getButtonTitle('noon')}
                  >
                    Noon Report
                  </button>

                  {/* Arrival Report Button */}
                   <button
                    className={`p-2 rounded w-full text-left transition-colors ${selectedForm === 'arrival' ? 'bg-blue-800' : ''} ${!canSubmitArrival ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-blue-800'}`}
                    onClick={() => canSubmitArrival && selectForm('arrival')}
                    disabled={!canSubmitArrival}
                    title={getButtonTitle('arrival')}
                  >
                    Arrival Report
                  </button>

                  {/* Berth Report Button */}
                   <button
                    className={`p-2 rounded w-full text-left transition-colors ${selectedForm === 'berth' ? 'bg-blue-800' : ''} ${!canSubmitBerth ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-blue-800'}`}
                    onClick={() => canSubmitBerth && selectForm('berth')}
                    disabled={!canSubmitBerth}
                    title={getButtonTitle('berth')}
                  >
                    Berth Report
                  </button>
                </div>
              )}
            </div>

            {/* Log out button at bottom */}
            <div className="pt-4 mt-6 border-t border-blue-800">
              <button className="flex items-center w-full p-2 rounded hover:bg-blue-800 transition-colors">
                <LogOut size={18} className="mr-2" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <header className="bg-white p-4 border-b flex md:hidden items-center shadow-sm">
          <button 
            className="mr-4"
            onClick={toggleMobileMenu}
          >
            ☰
          </button>
          <h1 className="text-xl">Maritime Reporting</h1>
        </header>
        
        {/* Content area */}
        <main className="flex-1 p-6 overflow-auto">
          {renderFormContent()}
        </main>
      </div>
    </div>
  );
};

export default CaptainDashboard;
