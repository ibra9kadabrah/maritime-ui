import React, { useState, useEffect } from 'react'; // Import useEffect
import { Ship, ClipboardCheck, Clock, ChevronDown, ChevronUp, Check, X, Eye, Filter, Calendar, LogOut } from 'lucide-react';
import api from '../utils/api'; // Import the api utility
// Import the Report, Voyage, Vessel, and BunkerRecord types from the backend definition
import { Report as BackendReport, Voyage as BackendVoyage, Vessel, ReportStatus, ReportType, BunkerRecord } from '../../backend/src/types/dataTypes';

// Unused imports removed after modal refactor
// import ReportGeneralInfoDisplay from '../components/display/ReportGeneralInfoDisplay';
// import ReportVoyageDetailsDisplay from '../components/display/ReportVoyageDetailsDisplay';
// import ReportBunkerDisplay from '../components/display/ReportBunkerDisplay';


// Use the backend Report type, potentially adding frontend-specific fields if needed
interface DisplayReport extends BackendReport {
  // Ensure id is number if it comes as number from backend
  id: number;
  // vessel_id and voyage_id are inherited from BackendReport now
  // Add frontend-specific display properties derived from backend data
  ship?: string; // Placeholder for ship name
  voyage?: string; // Placeholder for voyage number
  captain?: string; // Placeholder for captain name (same as submitted_by)
}

function MaritimeOfficeDashboard() {
  // State management
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [allReports, setAllReports] = useState<DisplayReport[]>([]); // State for fetched reports
  const [voyagesData, setVoyagesData] = useState<BackendVoyage[]>([]); // State for fetched voyages
  const [isLoading, setIsLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const [selectedShip, setSelectedShip] = useState<string | number>('all'); // Store vessel ID or 'all'
  const [selectedVoyage, setSelectedVoyage] = useState<string>('all'); // Keep filter state
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<DisplayReport | null>(null);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [selectedBunkerRecord, setSelectedBunkerRecord] = useState<BunkerRecord | null>(null); // State for bunker record
  const [vessels, setVessels] = useState<Vessel[]>([]); // State for fetched vessels
  // State for showing/hiding sections in the new modal
  const [expandedSections, setExpandedSections] = useState({
    voyageDetails: true,
    engineParameters: true,
    auxiliaryEngines: true,
    bunkerDetails: true,
    weatherConditions: true,
    cargoOps: true // Added for Cargo Operations section
  });


  // --- Data Fetching ---
  const fetchData = async () => { // Renamed to fetch all data
    setIsLoading(true);
    setError(null);
    try {
      // Fetch reports, voyages, and vessels
      const [fetchedReports, fetchedVoyages, fetchedVessels] = await Promise.all([
        api.getReports(),
        api.getVoyages(),
        api.getVessels() // Fetch all vessels
      ]);

      // Map reports to DisplayReport
      const displayReports: DisplayReport[] = fetchedReports.map(r => ({
        ...r,
        id: Number(r.id), // Ensure ID is number
        // Placeholder mapping - replace with actual data joining/fetching later if needed
        ship: `Vessel ${r.vessel_id}`,
        voyage: `Voyage ${r.voyage_id}`, // Assuming voyage_id is sufficient for now
        captain: r.submitted_by,
      }));
      setAllReports(displayReports);
      setVoyagesData(fetchedVoyages); // Set voyage data
      setVessels(fetchedVessels); // Set vessel data

    } catch (err: any) {
      console.error("Failed to fetch data:", err);
      setError(err.response?.data?.message || err.message || 'Failed to load data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Call the combined fetch function
  }, []); // Fetch data on component mount

  // --- Filtering Logic ---
  const filteredPendingReports = allReports.filter(report => {
    const matchesStatus = report.status === 'pending';
    // Filter by vessel_id
    const matchesShip = selectedShip === 'all' || report.vessel_id === Number(selectedShip);
    // Filter by voyage_number if available, otherwise use the placeholder 'voyage' string
    const reportVoyageNumber = voyagesData.find(v => v.id === report.voyage_id)?.voyage_number || report.voyage;
    const matchesVoyage = selectedVoyage === 'all' || reportVoyageNumber === selectedVoyage;
    return matchesStatus && matchesShip && matchesVoyage;
  });

  const filteredHistoryReports = allReports.filter(report => {
    const matchesStatus = report.status === 'approved' || report.status === 'rejected';
    // Filter by vessel_id
    const matchesShip = selectedShip === 'all' || report.vessel_id === Number(selectedShip);
    const reportVoyageNumber = voyagesData.find(v => v.id === report.voyage_id)?.voyage_number || report.voyage;
    const matchesVoyage = selectedVoyage === 'all' || reportVoyageNumber === selectedVoyage;
    return matchesStatus && matchesShip && matchesVoyage;
  });

  // --- Handlers ---
  const handleViewDetails = async (report: DisplayReport) => {
    setSelectedReport(report);
    setSelectedVessel(null); // Reset vessel data
    setSelectedBunkerRecord(null); // Reset bunker record
    setShowModal(true);
    // Reset expanded sections when opening a new modal
    setExpandedSections({
        voyageDetails: true,
        engineParameters: true,
        auxiliaryEngines: true,
        bunkerDetails: true,
        weatherConditions: true,
        cargoOps: true
    });
    // Fetch vessel and bunker data concurrently
    try {
      console.log(`Fetching data for Report ID: ${report.id}, Vessel ID: ${report.vessel_id}`);
      const [vesselData, bunkerData] = await Promise.all([
        api.getVessel(report.vessel_id),
        api.getBunkerRecordForReport(report.id) // Fetch bunker record
      ]);
      setSelectedVessel(vesselData);
      setSelectedBunkerRecord(bunkerData); // Store bunker record (can be null)
      console.log("Fetched vessel data:", vesselData);
      console.log("Fetched bunker data:", bunkerData);
    } catch (err) {
      console.error(`Failed to fetch details for report ID ${report.id}:`, err);
      // Optionally set an error state to display in the modal
      setSelectedVessel(null);
      setSelectedBunkerRecord(null);
    }
  };

  const handleApprove = async (reportId: number) => {
    const reviewer = 'office_user'; // Placeholder for actual logged-in user
    try {
      await api.approveReport(reportId, reviewer);
      alert(`Report ${reportId} approved successfully.`);
      fetchData(); // Refresh all data
      setShowModal(false); // Close modal after action
    } catch (err: any) {
      console.error(`Failed to approve report ${reportId}:`, err);
      alert(`Failed to approve report: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleReject = async (reportId: number) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      const reviewer = 'office_user'; // Placeholder
      try {
        await api.rejectReport(reportId, reviewer, reason);
        alert(`Report ${reportId} rejected successfully.`);
        fetchData(); // Refresh all data
        setShowModal(false); // Close modal after action
      } catch (err: any) {
        console.error(`Failed to reject report ${reportId}:`, err);
        alert(`Failed to reject report: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  // Toggle section visibility for the new modal
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };


  // Helper to format date/time strings (keep existing one)
  const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      // Format to a more readable date and time
      return new Date(isoString).toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
      });
    } catch {
      return isoString; // Fallback if date is invalid
    }
  };

  // --- Render ---
  return (
    <>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="w-64 bg-blue-900 text-white flex flex-col">
          <div className="p-4 border-b border-blue-800">
            <h1 className="text-xl font-bold">Maritime Reporting</h1>
            <div className="text-sm mt-1">Office Dashboard</div>
          </div>
          <div className="p-4 flex-grow">
            <div className="mb-6">
              <div className="text-sm opacity-70 mb-2">NAVIGATION</div>
              <ul className="space-y-1">
                <li><button className={`flex items-center w-full p-2 rounded ${activeTab === 'pending' ? 'bg-blue-700' : 'hover:bg-blue-800'}`} onClick={() => setActiveTab('pending')}><Clock size={18} className="mr-2" /><span>Pending Reports</span></button></li>
                <li><button className={`flex items-center w-full p-2 rounded ${activeTab === 'history' ? 'bg-blue-700' : 'hover:bg-blue-800'}`} onClick={() => setActiveTab('history')}><ClipboardCheck size={18} className="mr-2" /><span>Report History</span></button></li>
              </ul>
            </div>
          </div>
          <div className="p-4 border-t border-blue-800"><button className="flex items-center w-full p-2 rounded hover:bg-blue-800"><LogOut size={18} className="mr-2" /><span>Logout</span></button></div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white shadow-sm p-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold">{activeTab === 'pending' ? 'Pending Reports' : 'Report History'}</h1>
              <div className="flex items-center">
                <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md mr-4 bg-white hover:bg-gray-50" onClick={() => setShowFilters(!showFilters)}>
                  <Filter size={18} className="mr-2 text-gray-600" /><span>Filters</span>{showFilters ? <ChevronUp size={18} className="ml-2" /> : <ChevronDown size={18} className="ml-2" />}
                </button>
              </div>
            </div>
            {/* Filters */}
            {showFilters && (
              <div className="mt-4 p-4 border rounded-md bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ship</label>
                  {/* Update select to use vessel ID and map over fetched vessels */}
                  <select className="w-full border-gray-300 rounded-md shadow-sm p-2" value={selectedShip} onChange={(e) => setSelectedShip(e.target.value)}>
                    <option value="all">All Ships</option>
                    {/* Populate ships from fetched vessel data */}
                    {vessels.map(vessel => (<option key={vessel.id} value={vessel.id}>{vessel.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Voyage Number</label>
                  <select className="w-full border-gray-300 rounded-md shadow-sm p-2" value={selectedVoyage} onChange={(e) => setSelectedVoyage(e.target.value)}>
                    <option value="all">All Voyages</option>
                    {/* Populate dropdown from fetched voyagesData */}
                    {voyagesData.map(voyage => (
                      <option key={voyage.id} value={voyage.voyage_number}>{voyage.voyage_number}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </header>

          {/* Content area */}
          <main className="flex-1 overflow-auto p-6">
            {isLoading && <div className="text-center p-8">Loading reports...</div>}
            {error && <div className="text-center p-8 text-red-600">Error: {error}</div>}

            {/* Pending Reports Tab */}
            {!isLoading && !error && activeTab === 'pending' && (
              <div className="bg-white rounded-lg shadow">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Report Type</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Ship</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Voyage</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Captain</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredPendingReports.length > 0 ? (
                        filteredPendingReports.map(report => (
                          <tr key={report.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 whitespace-nowrap capitalize">{report.type} Report</td>
                            <td className="py-3 px-4 whitespace-nowrap">{report.ship || `Vessel ${report.vessel_id}`}</td>
                            <td className="py-3 px-4 whitespace-nowrap">{report.voyage || `Voyage ${report.voyage_id}`}</td>
                            <td className="py-3 px-4 whitespace-nowrap">{report.submitted_by}</td>
                            <td className="py-3 px-4 whitespace-nowrap">{formatDateTime(report.submitted_at)}</td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <button className="p-1 text-blue-600 hover:text-blue-800" onClick={() => handleViewDetails(report)} title="View Details">
                                <Eye size={18} />
                              </button>
                              {/* Approve/Reject icons removed */}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={6} className="py-8 text-center text-gray-500">No pending reports found matching filters.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Report History Tab */}
            {!isLoading && !error && activeTab === 'history' && (
              <div className="bg-white rounded-lg shadow">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Report Type</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Ship</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Voyage</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Captain</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredHistoryReports.length > 0 ? (
                        filteredHistoryReports.map(report => (
                          <tr key={report.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 whitespace-nowrap capitalize">{report.type} Report</td>
                            <td className="py-3 px-4 whitespace-nowrap">{report.ship || `Vessel ${report.vessel_id}`}</td>
                            <td className="py-3 px-4 whitespace-nowrap">{report.voyage || `Voyage ${report.voyage_id}`}</td>
                            <td className="py-3 px-4 whitespace-nowrap">{report.submitted_by}</td>
                            <td className="py-3 px-4 whitespace-nowrap">{formatDateTime(report.submitted_at)}</td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {report.status === 'approved' ? (<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>)
                               : (<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>)}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <button className="p-1 text-blue-600 hover:text-blue-800" onClick={() => handleViewDetails(report)} title="View Details">
                                <Eye size={18} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={7} className="py-8 text-center text-gray-500">No report history found matching filters.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* --- New Interactive Report Details Modal --- */}
      {showModal && selectedReport && (() => {
        // Define helper components inside the render logic to access state/props easily
        const SectionHeader: React.FC<{ title: string; section: keyof typeof expandedSections; icon?: React.ReactNode }> = ({ title, section, icon }) => (
          <div
            className="flex items-center justify-between bg-gray-50 p-3 rounded-t border-b border-gray-200 cursor-pointer hover:bg-gray-100"
            onClick={() => toggleSection(section)}
          >
            <h3 className="text-md font-semibold text-blue-800 flex items-center">
              {icon}
              <span className="ml-2">{title}</span>
            </h3>
            {expandedSections[section] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        );

        // Modified DataRow to always render and show 'N/A' for missing/empty values
        const DataRow: React.FC<{ label: string; value?: string | number | null; unit?: string }> = ({ label, value, unit }) => {
          const displayValue = (value === undefined || value === null || value === '') ? 'N/A' : String(value);
          return (
            <div className="flex items-center text-sm py-1 border-b border-gray-100 last:border-0">
              <span className="font-medium text-gray-500 w-40 shrink-0">{label}:</span>
              {/* Display N/A in a slightly muted color */}
              <span className={displayValue === 'N/A' ? 'text-gray-400' : ''}>
                {displayValue}{unit && displayValue !== 'N/A' ? ` ${unit}` : ''}
              </span>
            </div>
          );
        };

        // Extract report data safely
        const reportData = typeof selectedReport.report_data === 'object' && selectedReport.report_data !== null ? selectedReport.report_data : {};
        // Find the corresponding voyage data
        const voyage = voyagesData.find(v => v.id === selectedReport.voyage_id);

        // Dynamically find engine unit keys (e.g., engineUnit1..., engineUnit2...)
        const engineUnitKeys = Object.keys(reportData)
          .filter(key => key.startsWith('engineUnit') && key.includes('ExhaustTemp')) // Find one key per unit
          .map(key => key.match(/engineUnit(\d+)/)?.[1]) // Extract the unit number
          .filter((num): num is string => !!num) // Filter out null matches and ensure type is string
          .sort((a, b) => parseInt(a) - parseInt(b)); // Sort numerically

        // Determine passage state for display logic (default to 'noon' if not present)
        const passageState = reportData.passageState || 'noon';

        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl my-4 flex flex-col relative">
              {/* Modal Header */}
              <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-blue-900 text-white sticky top-0 z-10">
                <h2 className="text-lg font-semibold capitalize flex items-center">
                  <Ship size={20} className="mr-2" />
                  {selectedReport.type} Report Details (ID: {selectedReport.id})
                </h2>
                <button className="text-white hover:text-gray-200" onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body - Redesigned Layout */}
              <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 120px)" }}> {/* Adjust maxHeight as needed */}
                <div className="p-6">
                  {/* Top Summary Card */}
                  <div className="bg-blue-50 rounded-lg shadow-sm p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h3 className="text-sm font-semibold uppercase text-blue-800 border-b border-blue-200 pb-1 mb-2">Vessel</h3>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <span className="font-medium w-24">Name:</span>
                            <span className="font-bold">{selectedReport.ship || `Vessel ${selectedReport.vessel_id}`}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="font-medium w-24">Voyage:</span>
                            <span className="font-bold">{selectedReport.voyage || `Voyage ${selectedReport.voyage_id}`}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold uppercase text-blue-800 border-b border-blue-200 pb-1 mb-2">Submission</h3>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <span className="font-medium w-24">Captain:</span>
                            <span>{selectedReport.submitted_by}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="font-medium w-24">Date:</span>
                            <span>{formatDateTime(selectedReport.submitted_at)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Section Removed */}
                      {/* ... */}
                    </div>
                  </div>

                  {/* Main Content Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Voyage Details Section - Add conditional background */}
                    <div className={`
                      rounded-lg shadow-sm border border-gray-200
                      ${selectedReport.type === 'noon' && passageState === 'sosp' ? 'bg-red-50' : ''}
                      ${selectedReport.type === 'noon' && passageState === 'rosp' ? 'bg-green-50' : ''}
                      ${selectedReport.type !== 'noon' || passageState === 'noon' ? 'bg-white' : ''}
                    `}>
                      <SectionHeader
                        title="Voyage & Position Details"
                        section="voyageDetails"
                        icon={<Calendar size={16} />}
                      />

                      {expandedSections.voyageDetails && (
                        <div className="p-4">
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-blue-700 mb-2">Route Information</h4>
                            {/* Use voyage data */}
                            <DataRow label="Departure Port" value={voyage?.departure_port} />
                            <DataRow label="Destination Port" value={voyage?.destination_port} />
                            {/* Hide ETA for Noon reports */}
                            {selectedReport.type !== 'noon' && <DataRow label="ETA" value={reportData.etaDate && reportData.etaTime ? `${reportData.etaDate} ${reportData.etaTime}` : 'N/A'} />}
                            <DataRow label="Cargo Type" value={voyage?.cargo_type} />
                            <DataRow label="Cargo Quantity" value={voyage?.cargo_quantity} unit="tons" />
                            <DataRow label="Cargo Status" value={voyage?.cargo_status} />
                            {/* Correctly display BLS from selectedVessel */}
                            <DataRow label="BLS Quantity" value={selectedVessel?.bls} />
                            {/* Show ETA only for Departure */}
                            {selectedReport.type === 'departure' && <DataRow label="ETA" value={reportData.etaDate && reportData.etaTime ? `${reportData.etaDate} ${reportData.etaTime}` : 'N/A'} />}
                            {/* Show ETB only for Arrival */}
                            {selectedReport.type === 'arrival' && <DataRow label="ETB Date" value={reportData.etbDate} />}
                            {selectedReport.type === 'arrival' && <DataRow label="ETB Time" value={reportData.etbTime} />}
                          </div>

                          <div className="mb-4">
                             {/* Dynamic Position Heading based on Report Type */}
                             <h4 className="text-sm font-semibold text-blue-700 mb-2">
                                {selectedReport.type === 'departure' ? 'FASP Position' : ''}
                                {selectedReport.type === 'noon' ? (passageState === 'sosp' ? 'SOSP Position' : passageState === 'rosp' ? 'ROSP Position' : 'Noon Position') : ''}
                                {selectedReport.type === 'arrival' ? 'EOSP Position' : ''}
                                {selectedReport.type === 'berth' ? 'Berth Position' : ''}
                                {' & Distance'}
                             </h4>
                            <DataRow label="Forward Draft" value={reportData.fwdDraft} unit="m" />
                            <DataRow label="Aft Draft" value={reportData.aftDraft} unit="m" />
                            <DataRow label="Distance To Go" value={selectedReport.distance_to_go} unit="NM" />
                            {/* Add Distance Since Last Report for Noon */}
                            {selectedReport.type === 'noon' && <DataRow label="Dist. Since Last" value={reportData.distanceSinceLastReport} unit="NM" />}
                            {/* Show Voyage Distance from voyage data */}
                            <DataRow label="Voyage Distance" value={voyage?.total_distance} unit="NM" />
                            {/* Show Harbour Distance if available in reportData (relevant for Arrival/Berth) */}
                            <DataRow label="Harbour Distance" value={reportData.harbourDistance} unit="NM" />
                            {/* Show current position rows only for Noon/Arrival/Berth */}
                            {selectedReport.type !== 'departure' && (
                              <>
                                {/* Display Logic for Position based on Report Type */}
                                <DataRow
                                  label={
                                    selectedReport.type === 'arrival' ? 'EOSP Latitude' :
                                    selectedReport.type === 'berth' ? 'Berth Latitude' :
                                    (passageState === 'sosp' ? 'SOSP Latitude' : passageState === 'rosp' ? 'ROSP Latitude' : 'Latitude')
                                  }
                                  value={
                                    selectedReport.type === 'arrival' ? (reportData.eospLatitude ? `${reportData.eospLatitude} ${reportData.eospLatitudeDir}` : null) :
                                    selectedReport.type === 'berth' ? (reportData.faspLatitude ? `${reportData.faspLatitude} ${reportData.faspLatitudeDir}` : null) : // Use fasp for Berth
                                    (passageState === 'sosp' || passageState === 'rosp') ? (reportData.sospRosPLatitude ? `${reportData.sospRosPLatitude} ${reportData.sospRosPLatitudeDir}` : null) :
                                    (reportData.positionLatitude ? `${reportData.positionLatitude} ${reportData.positionLatitudeDir}` : null)
                                  }
                                />
                                <DataRow
                                  label={
                                    selectedReport.type === 'arrival' ? 'EOSP Longitude' :
                                    selectedReport.type === 'berth' ? 'Berth Longitude' :
                                    (passageState === 'sosp' ? 'SOSP Longitude' : passageState === 'rosp' ? 'ROSP Longitude' : 'Longitude')
                                  }
                                  value={
                                    selectedReport.type === 'arrival' ? (reportData.eospLongitude ? `${reportData.eospLongitude} ${reportData.eospLongitudeDir}` : null) :
                                    selectedReport.type === 'berth' ? (reportData.faspLongitude ? `${reportData.faspLongitude} ${reportData.faspLongitudeDir}` : null) : // Use fasp for Berth
                                    (passageState === 'sosp' || passageState === 'rosp') ? (reportData.sospRosPLongitude ? `${reportData.sospRosPLongitude} ${reportData.sospRosPLongitudeDir}` : null) :
                                    (reportData.positionLongitude ? `${reportData.positionLongitude} ${reportData.positionLongitudeDir}` : null)
                                  }
                                />
                                <DataRow
                                  label={
                                    selectedReport.type === 'arrival' ? 'EOSP Date' :
                                    selectedReport.type === 'berth' ? 'Berth Date' :
                                    (passageState === 'sosp' ? 'SOSP Date' : passageState === 'rosp' ? 'ROSP Date' : 'Position Date')
                                  }
                                  value={
                                    selectedReport.type === 'arrival' ? reportData.eospDate :
                                    selectedReport.type === 'berth' ? reportData.faspDate : // Use fasp for Berth
                                    (passageState === 'sosp' || passageState === 'rosp') ? reportData.sospRosPDate :
                                    reportData.positionDate
                                  }
                                />
                                <DataRow
                                  label={
                                    selectedReport.type === 'arrival' ? 'EOSP Time' :
                                    selectedReport.type === 'berth' ? 'Berth Time' :
                                    (passageState === 'sosp' ? 'SOSP Time' : passageState === 'rosp' ? 'ROSP Time' : 'Position Time')
                                  }
                                  value={
                                    selectedReport.type === 'arrival' ? reportData.eospTime :
                                    selectedReport.type === 'berth' ? reportData.faspTime : // Use fasp for Berth
                                    (passageState === 'sosp' || passageState === 'rosp') ? reportData.sospRosPTime :
                                    reportData.positionTime
                                  }
                                />
                                {/* Course might not apply to Berth, display only if not Berth */}
                                {selectedReport.type !== 'berth' &&
                                  <DataRow label={selectedReport.type === 'arrival' ? 'EOSP Course' : 'Course'} value={selectedReport.type === 'arrival' ? reportData.eospCourse : reportData.course} unit="deg" />
                                }
                              </>
                            )}
                          </div>

                          {/* Conditionally show FASP Details section (Only for Departure) */}
                          {selectedReport.type === 'departure' && (
                            <div>
                              <h4 className="text-sm font-semibold text-blue-700 mb-2">FASP Details</h4>
                              <DataRow label="FASP Date/Time" value={reportData.faspDate && reportData.faspTime ? `${reportData.faspDate} ${reportData.faspTime}` : 'N/A'} />
                              <DataRow
                                label="FASP Latitude"
                                value={reportData.faspLatitude ? `${reportData.faspLatitude} ${reportData.faspLatitudeDir}` : null}
                              />
                              <DataRow
                                label="FASP Longitude"
                                value={reportData.faspLongitude ? `${reportData.faspLongitude} ${reportData.faspLongitudeDir}` : null}
                              />
                              <DataRow label="FASP Course" value={reportData.faspCourse} unit="deg" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Weather Conditions */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                      <SectionHeader
                        title="Weather Conditions"
                        section="weatherConditions"
                        icon={
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                          </svg>
                        }
                      />

                      {expandedSections.weatherConditions && (
                        <div className="p-4 space-y-1"> {/* Changed grid to space-y-1 */}
                          {/* Removed sub-headings and grid structure */}
                          <DataRow label="Wind Direction" value={reportData.windDirection} />
                          <DataRow label="Wind Force" value={reportData.windForce} unit="Beaufort" />
                          <DataRow label="Sea Direction" value={reportData.seaDirection} />
                          <DataRow label="Sea State" value={reportData.seaState} />
                          <DataRow label="Swell Direction" value={reportData.swellDirection} />
                          <DataRow label="Swell Height" value={reportData.swellHeight} />
                        </div>
                      )}
                    </div>

                    {/* Engine Parameters */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 md:col-span-2">
                      <SectionHeader
                        title="Engine Parameters"
                        section="engineParameters"
                        icon={
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        }
                      />

                      {expandedSections.engineParameters && (
                        <div className="p-4">
                          {/* Removed sub-groupings, list main engine params directly */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 mb-6"> {/* Added mb-6 */}
                            <DataRow label="PRS RPM" value={reportData.prsRpm} unit="rpm" /> {/* Corrected key: prsRpm */}
                            <DataRow label="FO Pressure" value={reportData.engineLoadFOPressure} unit="bar" />
                            <DataRow label="Lub. Oil Pressure" value={reportData.engineLoadLubOilPressure} unit="bar" />
                            <DataRow label="Daily Run Hours" value={reportData.engineLoadDailyRunHour} unit="hrs" />
                            <DataRow label="FW Inlet Temp" value={reportData.engineLoadFWInletTemp} unit="°C" />
                            <DataRow label="LO Inlet Temp" value={reportData.engineLoadLOInletTemp} unit="°C" />
                            <DataRow label="Scav Air Temp" value={reportData.engineLoadScavAirTemp} unit="°C" />
                            <DataRow label="TC Exh. Temp In" value={reportData.engineLoadTCExhTempIn} unit="°C" />
                            <DataRow label="TC Exh. Temp Out" value={reportData.engineLoadTCExhTempOut} unit="°C" />
                            <DataRow label="Thrust Bearing Temp" value={reportData.engineLoadThrustBearingTemp} unit="°C" />
                            <DataRow label="TC RPM #1" value={reportData.engineLoadTCRPM1} unit="rpm" />
                            <DataRow label="TC RPM #2" value={reportData.engineLoadTCRPM2} unit="rpm" />
                          </div>

                          {/* Dynamic Engine Units */}
                          {engineUnitKeys.length > 0 && (
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {engineUnitKeys.map(unitNum => (
                                <div className="bg-gray-50 p-3 rounded border border-gray-200" key={unitNum}>
                                  <h4 className="text-sm font-semibold text-blue-700 mb-2">Unit {unitNum}</h4>
                                  {/* Changed grid to simple list of DataRows */}
                                  <div className="space-y-1">
                                    <DataRow label="Exhaust Temp" value={reportData[`engineUnit${unitNum}ExhaustTemp`]} unit="°C" />
                                    <DataRow label="Under Piston Air" value={reportData[`engineUnit${unitNum}UnderPistonAir`]} />
                                    <DataRow label="PCO Outlet" value={reportData[`engineUnit${unitNum}PCOOutlet`]} />
                                    <DataRow label="JCFW Outlet Temp" value={reportData[`engineUnit${unitNum}JCFWOutletTemp`]} unit="°C" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Auxiliary Engines */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                      <SectionHeader
                        title="Auxiliary Engines" // Removed "& Boiler"
                        section="auxiliaryEngines"
                        icon={
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        }
                      />

                      {expandedSections.auxiliaryEngines && (
                        <div className="p-4">
                          {/* DG1 */}
                          <h4 className="text-sm font-semibold text-blue-700 mb-2">DG 1</h4>
                          <div className="grid grid-cols-2 gap-x-4 mb-4">
                            <DataRow label="Load" value={reportData.auxEngineDG1Load} unit="%" />
                            <DataRow label="kW" value={reportData.auxEngineDG1KW} unit="kW" /> {/* Corrected key */}
                            <DataRow label="FO Pressure" value={reportData.auxEngineDG1FOPress} unit="bar" />
                            <DataRow label="Lub. Oil Pressure" value={reportData.auxEngineDG1LubOilPress} unit="bar" />
                            <DataRow label="Water Temp" value={reportData.auxEngineDG1WaterTemp} unit="°C" />
                            <DataRow label="Daily Run Hours" value={reportData.auxEngineDG1DailyRunHour} unit="hrs" />
                          </div>

                          {/* Boiler Consumption is moved to Bunker Details */}
                          {/* Add other DGs (DG2, DG3, V1) dynamically if present */}
                        </div>
                      )}
                    </div>

                    {/* Bunker Details */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                      <SectionHeader
                        title="Bunker Details"
                        section="bunkerDetails"
                        icon={
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        }
                      />

                      {expandedSections.bunkerDetails && (
                        <div className="p-4">
                          <h4 className="text-sm font-semibold text-blue-700 mb-2">Remaining On Board (ROB)</h4>
                          <div className="grid grid-cols-2 gap-x-4 mb-4">
                            {/* Use data from selectedBunkerRecord */}
                            <DataRow label="LSIFO" value={selectedBunkerRecord?.lsifo_rob} unit="MT" />
                            <DataRow label="LSMGO" value={selectedBunkerRecord?.lsmgo_rob} unit="MT" />
                            <DataRow label="Cyl Oil" value={selectedBunkerRecord?.cyl_oil_rob} unit="L" />
                            <DataRow label="ME Oil" value={selectedBunkerRecord?.me_oil_rob} unit="L" />
                            <DataRow label="AE Oil" value={selectedBunkerRecord?.ae_oil_rob} unit="L" />
                            <DataRow label="VOL Oil" value={selectedBunkerRecord?.vol_oil_rob} unit="L" />
                          </div>

                          {/* --- Consumption Section (Expanded) --- */}
                          {/* Always show Consumption section */}
                          <>
                            {/* --- Consumption Section (Using BunkerRecord) --- */}
                            <h4 className="text-sm font-semibold text-blue-700 mb-2 mt-4">Consumption Since Last Report</h4>
                            <div className="grid grid-cols-2 gap-x-4 mb-4">
                              {/* Use data from selectedBunkerRecord */}
                              <DataRow label="LSIFO" value={selectedBunkerRecord?.lsifo_consumed} unit="MT" />
                              <DataRow label="LSMGO" value={selectedBunkerRecord?.lsmgo_consumed} unit="MT" />
                              <DataRow label="Cyl Oil" value={selectedBunkerRecord?.cyl_oil_consumed} unit="L" />
                              <DataRow label="ME Oil" value={selectedBunkerRecord?.me_oil_consumed} unit="L" />
                              <DataRow label="AE Oil" value={selectedBunkerRecord?.ae_oil_consumed} unit="L" />
                              <DataRow label="VOL Oil" value={selectedBunkerRecord?.vol_oil_consumed} unit="L" />
                            </div>
                          </>

                          {/* --- Steaming Consumption (Calculated) - REMOVED --- */}
                          {/* This section is redundant if we show ROB, Consumption, Supply */}

                          {/* --- Supply Section (Using BunkerRecord) --- */}
                          <h4 className="text-sm font-semibold text-blue-700 mb-2 mt-4">Bunker Supply Received</h4>
                          <div className="grid grid-cols-2 gap-x-4 mb-4">
                            {/* Use data from selectedBunkerRecord */}
                            <DataRow label="LSIFO" value={selectedBunkerRecord?.lsifo_supplied} unit="MT" />
                            <DataRow label="LSMGO" value={selectedBunkerRecord?.lsmgo_supplied} unit="MT" />
                            <DataRow label="Cyl Oil" value={selectedBunkerRecord?.cyl_oil_supplied} unit="L" />
                            <DataRow label="ME Oil" value={selectedBunkerRecord?.me_oil_supplied} unit="L" />
                            <DataRow label="AE Oil" value={selectedBunkerRecord?.ae_oil_supplied} unit="L" />
                            <DataRow label="VOL Oil" value={selectedBunkerRecord?.vol_oil_supplied} unit="L" />
                          </div>
                        </div>
                      )}
                    </div>
                     {/* Cargo Display for Berth */}
                     {/* Always show Cargo Operations section */}
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <SectionHeader
                          title="Cargo Operations"
                          section="cargoOps" // Assuming you add 'cargoOps' to expandedSections state
                          icon={ <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> } // Example icon
                        />
                        {expandedSections.cargoOps && (
                           <div className="p-4">
                               {/* Derive Cargo Ops from loaded/unloaded fields */}
                               {(() => {
                                 const unloaded = reportData.cargoUnloaded;
                                 const loaded = reportData.cargoLoaded;
                                 let opType = 'N/A';
                                 let quantity = 'N/A';
                                 let unit: string | undefined = undefined;

                                 if (typeof unloaded === 'number' && unloaded > 0) {
                                   opType = 'Unloading';
                                   quantity = unloaded.toString();
                                   unit = 'MT';
                                 } else if (typeof loaded === 'number' && loaded > 0) {
                                   opType = 'Loading';
                                   quantity = loaded.toString();
                                   unit = 'MT';
                                 }

                                 return (
                                   <>
                                     <DataRow label="Operation Type" value={opType} />
                                     <DataRow label="Quantity Handled" value={quantity} unit={unit} />
                                     {/* Optionally display start/end times if available */}
                                     {/* <DataRow label="Start Date" value={reportData.unloadingStartDate || reportData.loadingStartDate} /> */}
                                     {/* <DataRow label="Start Time" value={reportData.unloadingStartTime || reportData.loadingStartTime} /> */}
                                     {/* <DataRow label="End Date" value={reportData.unloadingEndDate || reportData.loadingEndDate} /> */}
                                     {/* <DataRow label="End Time" value={reportData.unloadingEndTime || reportData.loadingEndTime} /> */}
                                   </>
                                 );
                               })()}
                           </div>
                        )}
                      </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-2 sticky bottom-0 z-10">
                {selectedReport.status === 'pending' && (
                  <>
                    <button
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 flex items-center"
                      onClick={() => setShowModal(false)} // Use existing handler
                    >
                      <X size={16} className="mr-1" /> Cancel
                    </button>
                    <button
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center"
                      onClick={() => handleReject(selectedReport.id)} // Use existing handler
                    >
                      <X size={16} className="mr-1" /> Reject
                    </button>
                    <button
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
                      onClick={() => handleApprove(selectedReport.id)} // Use existing handler
                    >
                      <Check size={16} className="mr-1" /> Approve
                    </button>
                  </>
                )}
                {selectedReport.status !== 'pending' && (
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                    onClick={() => setShowModal(false)} // Use existing handler
                  >
                    <Check size={16} className="mr-1" /> Close
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })()}
    </>
  );
}

export default MaritimeOfficeDashboard;
