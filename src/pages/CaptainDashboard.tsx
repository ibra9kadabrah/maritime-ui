import React, { useState } from 'react';
import { Ship, FileText, ChevronDown, ChevronUp, LogOut, AlertCircle } from 'lucide-react';
import DepartureReportForm from '../components/forms/DepartureReportForm';
import NoonReportForm from '../components/forms/NoonReportForm';
import ArrivalReportForm from '../components/forms/ArrivalReportForm';
import BerthReportForm from '../components/forms/BerthReportForm';
// We might not need the specific FormData type here anymore if handled within the form
// import { DepartureReportFormData } from '../components/forms/types/formTypes'; 

const CaptainDashboard = () => {
  // State management
  const [formsOpen, setFormsOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeVoyage, setActiveVoyage] = useState({
    vessel: 'NORTHERN STAR',
    voyage: '04/2025',
    departurePort: 'ROTTERDAM',
    destinationPort: 'SINGAPORE',
    cargoType: 'CONTAINERS',
    cargoQuantity: '32500 MT'
  });

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

  // Handle form submission - receives processed data from the form component
  // The 'data' type is 'any' here because the processing happens inside the form
  // Alternatively, define a specific 'ProcessedDepartureData' type if needed
  const handleDepartureFormSubmit = (data: any) => { 
    console.log('Departure report processed data:', data); 
    // Here you would typically send 'data' to your backend API
    alert(`Departure report submitted successfully!`);
    setSelectedForm(null); // Close the form
  };
  
  // Handle form cancellation
  const handleFormCancel = () => {
    setSelectedForm(null);
  };

  // Render the appropriate form based on selection
  const renderFormContent = () => {
    if (!selectedForm) {
      return (
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Welcome to the Maritime Reporting System</h2>
          <div className="flex items-center mb-6 bg-blue-50 p-4 rounded">
            <Ship className="text-blue-700 mr-3" size={24} />
            <div>
              <div className="font-bold">{activeVoyage.vessel}</div>
              <div className="text-sm">Voyage: {activeVoyage.voyage}</div>
              <div className="text-sm">{activeVoyage.departurePort} → {activeVoyage.destinationPort}</div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-bold mb-2">Active Voyage Details</h3>
            <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded">
              <div>Cargo Type:</div>
              <div className="font-medium">{activeVoyage.cargoType}</div>
              <div>Cargo Quantity:</div>
              <div className="font-medium">{activeVoyage.cargoQuantity}</div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-bold mb-2">Select a Report Form</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'departure', label: 'Departure Report', desc: 'Submit when leaving port' },
                { id: 'noon', label: 'Noon Report', desc: 'Daily status update at 12:00 UTC' },
                { id: 'arrival', label: 'Arrival Report', desc: 'Submit upon arrival at destination' },
                { id: 'berth', label: 'Berth Report', desc: 'Submit during loading/unloading operations' }
              ].map((form: { id: string; label: string; desc: string }) => (
                <div 
                  key={form.id}
                  className="border p-4 rounded hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => selectForm(form.id)}
                >
                  <h3 className="font-bold">{form.label}</h3>
                  <p className="text-sm text-gray-600">{form.desc}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex">
              <AlertCircle className="text-yellow-500 mr-2" size={20} />
              <div>
                <p className="font-medium">Important Notice</p>
                <p className="text-sm">All reports undergo office verification. Please ensure accuracy of all data before submission.</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Render the appropriate form component based on selection
    switch (selectedForm) {
      case 'departure':
        // Pass the updated submit handler
        return <DepartureReportForm onSubmit={handleDepartureFormSubmit} onCancel={handleFormCancel} />; 
      case 'noon':
        // TODO: Implement NoonReportForm with manual validation
        return <NoonReportForm onSubmit={() => alert('Noon report submitted!')} onCancel={handleFormCancel} />;
      case 'arrival':
        // TODO: Implement ArrivalReportForm with manual validation
        return <ArrivalReportForm onSubmit={() => alert('Arrival report submitted!')} onCancel={handleFormCancel} />;
      case 'berth':
        // TODO: Implement BerthReportForm with manual validation
        return <BerthReportForm onSubmit={() => alert('Berth report submitted!')} onCancel={handleFormCancel} />;
      default:
        return null;
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
            <div className="font-bold">{activeVoyage.vessel}</div>
            <div className="text-sm">Voyage: {activeVoyage.voyage}</div>
            <div className="text-sm truncate">{activeVoyage.departurePort} → {activeVoyage.destinationPort}</div>
          </div>
          
          {/* Navigation */}
          <div className="space-y-2">
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
                  <button 
                    className={`p-2 rounded w-full text-left hover:bg-blue-800 transition-colors ${selectedForm === 'departure' ? 'bg-blue-800' : ''}`}
                    onClick={() => selectForm('departure')}
                  >
                    Departure Report
                  </button>
                  
                  <button 
                    className={`p-2 rounded w-full text-left hover:bg-blue-800 transition-colors ${selectedForm === 'noon' ? 'bg-blue-800' : ''}`}
                    onClick={() => selectForm('noon')}
                  >
                    Noon Report
                  </button>
                  
                  <button 
                    className={`p-2 rounded w-full text-left hover:bg-blue-800 transition-colors ${selectedForm === 'arrival' ? 'bg-blue-800' : ''}`}
                    onClick={() => selectForm('arrival')}
                  >
                    Arrival Report
                  </button>
                  
                  <button 
                    className={`p-2 rounded w-full text-left hover:bg-blue-800 transition-colors ${selectedForm === 'berth' ? 'bg-blue-800' : ''}`}
                    onClick={() => selectForm('berth')}
                  >
                    Berth Report
                  </button>
                </div>
              )}
            </div>
            
            {/* Other menu items would go here */}
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
