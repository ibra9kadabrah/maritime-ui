import React, { useState, useEffect } from 'react'; // Import useEffect
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ProcessedBerthFormData,
  berthReportSchema, // Use the simple schema export
  FORM_STYLES
} from './types/berthFormTypes';
// Import defaults and options from constants
import { defaultBerthValues, windDirectionOptions, seaDirectionOptions, swellDirectionOptions, latDirOptions, lonDirOptions } from './types/berthFormConstants';
import FormField from '../ui/FormField';
import api from '../../utils/api'; // Import the api utility
// Updated import path for bunker display components
import { SteamingConsumptionDisplay, BunkerRobDisplay } from './common/BunkerSections'; // Updated path
import EngineMachinerySection from './common/EngineMachinerySection'; // Import the new section component
import {
    POSITIVE_DECIMAL_ONLY,
    INTEGER_ONLY,
    TIMEZONE_FILTER,
    // filterInput, // Removed unused import
} from '../../utils/validationPatterns'; // Import shared patterns
// Import Vessel type as well
import { Voyage as BackendVoyage, Vessel, Report as BackendReport } from '../../../backend/src/types/dataTypes'; // Added BackendReport

interface BerthReportFormProps {
  vesselData?: Vessel | null; // Add vesselData prop
  voyageData: BackendVoyage | null; // Add prop for voyage data
  lastApprovedReport: BackendReport | null; // Still needed for ROB fetch logic
  precedingPortReport?: BackendReport | null; // Add prop for the specific preceding report
  cargoBeforeCurrentBerthOps: number; // Add prop for starting cargo quantity
  onSubmit: SubmitHandler<ProcessedBerthFormData>; // Use RHF SubmitHandler and Zod type
  onCancel: () => void;
}

const BerthReportForm: React.FC<BerthReportFormProps> = ({ vesselData, voyageData, lastApprovedReport, precedingPortReport, cargoBeforeCurrentBerthOps, onSubmit, onCancel }) => { // Destructure new prop
  const {
    control, // Keep control for FormField usage
    handleSubmit,
    formState: { errors, isSubmitting },
    register, // Use register for simple inputs
    watch, // Added watch for display components
    setError, // Add setError
    setValue // Import setValue
  } = useForm<ProcessedBerthFormData>({
    // Use the simple schema, context is not needed for this approach
    resolver: zodResolver(berthReportSchema),
    defaultValues: defaultBerthValues,
    mode: 'onChange', // Added mode
  });

  // TODO: Fetch or determine actual cargo status from voyage data
  const [cargoStatus] = useState<'loaded' | 'ballast'>('loaded'); // Keep simulation for now, removed unused setCargoStatus

  // Log the received preceding report prop for debugging Harbour Distance
  useEffect(() => {
    console.log("Berth Form received precedingPortReport:", precedingPortReport);
    console.log("Harbour distance from preceding report:", precedingPortReport?.report_data?.harbour_distance);
  }, [precedingPortReport]);

  // Add useEffect to fetch bunker data when the form loads or lastApprovedReport changes
  useEffect(() => {
    const fetchBunkerData = async () => {
      if (lastApprovedReport?.id) {
        console.log(`Berth Form: Fetching bunker data for last approved report ID: ${lastApprovedReport.id}`);
        try {
          const bunkerRecord = await api.getBunkerRecordForReport(lastApprovedReport.id);
          if (bunkerRecord) {
            console.log("Berth Form: Fetched bunker record:", bunkerRecord);
            // Set the ROB values in the form using setValue
            setValue('robLSIFO', bunkerRecord.lsifo_rob.toString());
            setValue('robLSMGO', bunkerRecord.lsmgo_rob.toString());
            setValue('robCYLOIL', bunkerRecord.cyl_oil_rob.toString());
            setValue('robMEOIL', bunkerRecord.me_oil_rob.toString());
            setValue('robAEOIL', bunkerRecord.ae_oil_rob.toString());
            setValue('robVOLOIL', bunkerRecord.vol_oil_rob.toString());
            console.log("Berth Form: Set ROB form values.");
          } else {
             console.log("Berth Form: No bunker record found for last approved report.");
          }
        } catch (error) {
          console.error('Berth Form: Failed to fetch bunker data:', error);
        }
      } else {
         console.log("Berth Form: No last approved report ID available.");
      }
    };

    fetchBunkerData();
  }, [lastApprovedReport?.id, setValue]); // Dependencies

  // Removed useEffect for Total Distance Travelled

  // Watch cargo fields for calculation
  const cargoUnloaded = watch('cargoUnloadedMT');
  const cargoLoaded = watch('cargoLoadedMT');
  // const initialCargo = voyageData?.cargo_quantity; // No longer use initial voyage cargo directly

  // Calculate remaining cargo based on cargo before this report's ops
  const calculateRemainingCargo = () => {
    // Use the passed prop as the starting point
    const initial = typeof cargoBeforeCurrentBerthOps === 'number' ? cargoBeforeCurrentBerthOps : 0;
    const unloaded = typeof cargoUnloaded === 'number' ? cargoUnloaded : 0;
    const loaded = typeof cargoLoaded === 'number' ? cargoLoaded : 0;
    // Basic logic: initial - unloaded + loaded. Adjust if business logic differs.
    return (initial - unloaded + loaded).toFixed(2); // Assuming 2 decimal places for cargo
  };

  const remainingCargoDisplay = calculateRemainingCargo();


  // --- Form Submission ---
  const handleFormSubmit: SubmitHandler<ProcessedBerthFormData> = async (data) => {
    console.log('Submitting Berth Report Data (Post-Zod):', data);

    // --- Manual Validation ---
    // Validate against the cargo *before* this report's operations
    const currentCargo = cargoBeforeCurrentBerthOps;
    // Check only if cargoUnloadedMT has a value and currentCargo is a number
    if (typeof currentCargo === 'number' && typeof data.cargoUnloadedMT === 'number' && data.cargoUnloadedMT > currentCargo) {
        setError('cargoUnloadedMT', {
            type: 'manual',
            message: `Cannot unload ${data.cargoUnloadedMT} MT. Only ${currentCargo} MT currently on board.`
        });
        console.error("Manual validation failed: Unload quantity exceeds current cargo.");
        return; // Stop submission
    }
    // --- End Manual Validation ---

    // --- Get actual vesselId and submittedBy from props ---
    const vesselId = vesselData?.id ?? 0; // Use actual vessel ID if available, fallback to 0
    const submittedBy = vesselData?.current_captain ?? 'unknown_captain'; // Use actual captain if available
    // ---

    // Transform input data to match backend expectations
    const transformedData = {
      ...data,
      // Map consumption fields to harbor*Consumed
      // Note: Berth form schema uses detailed ME/Aux/Boiler fields for input
      harborLsifoConsumed: (data.meLSIFO || 0) + (data.boilerLSIFO || 0) + (data.auxLSIFO || 0),
      harborLsmgoConsumed: (data.meLSMGO || 0) + (data.boilerLSMGO || 0) + (data.auxLSMGO || 0),
      harborCylOilConsumed: data.meCYLOIL || 0,
      harborMeOilConsumed: data.meMEOIL || 0,
      harborAeOilConsumed: data.meAEOIL || 0,
      harborVolOilConsumed: 0, // Default to 0 if not present

      // Map supply fields
      lsifoSupplied: data.supplyLSIFO || 0,
      lsmgoSupplied: data.supplyLSMGO || 0,
      cylOilSupplied: data.supplyCYLOIL || 0,
      meOilSupplied: data.supplyMEOIL || 0,
      aeOilSupplied: data.supplyAEOIL || 0,
      volOilSupplied: data.supplyVOLOIL || 0,

      // Map cargo fields
      cargoLoaded: data.cargoLoadedMT,
      cargoUnloaded: data.cargoUnloadedMT,
    };
     // Remove the detailed consumption/supply/cargo fields if they are not needed in report_data
     // delete transformedData.meLSIFO; // Example if needed
     // ... delete other detailed fields ...

    console.log('Transformed Berth Report Data for API:', transformedData);


    try {
      const createdReport = await api.submitReport(
        vesselId,
        submittedBy,
        'berth', // Explicitly set report type
        transformedData // Pass the transformed data
      );
      console.log('Berth Report submitted successfully:', createdReport);
      // Call original onSubmit prop ONLY on successful API call
      onSubmit(data); // Pass original data back to parent if needed
      // Optionally show success message
      alert('Berth Report submitted successfully!');
    } catch (err: any) { // Use err consistently
      console.error('Failed to submit Berth Report:', err);
      // Show specific backend error or generic message
      alert(`Failed to submit Berth Report: ${err.response?.data?.message || err.message || 'Unknown error'}`);
    }
    // Note: isSubmitting state is handled by RHF
  };

  // Function to handle scrolling to the first error
  const onFormError = (errorList: any) => {
      console.log("Berth Form validation failed (RHF)", errorList);
      const firstErrorKey = Object.keys(errorList)[0];
      if (firstErrorKey) {
          const firstErrorEl = document.querySelector(`[name="${firstErrorKey}"]`);
          if (firstErrorEl) {
              firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
      }
  };

  // --- Styling Helpers (getInputClassName, renderError) are removed ---

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Berth Report</h2>
      {/* Use RHF's handleSubmit */}
      <form onSubmit={handleSubmit(handleFormSubmit, onFormError)} noValidate>

        {/* General Information Section */}
        <div className="mb-6">
          <h3 className="font-bold border-b pb-2 mb-4">General Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Read-only fields - Use vesselData and voyageData props */}
            <div><label className="block text-sm font-medium mb-1">M/V (Vessel)</label><input type="text" className={FORM_STYLES.READONLY_INPUT} value={vesselData?.name || 'N/A'} readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div>
            <div><label className="block text-sm font-medium mb-1">Flag</label><input type="text" className={FORM_STYLES.READONLY_INPUT} value={vesselData?.flag || 'N/A'} readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div>
            <div><label className="block text-sm font-medium mb-1">Captain</label><input type="text" className={FORM_STYLES.READONLY_INPUT} value={vesselData?.current_captain || 'N/A'} readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div>
            <div><label className="block text-sm font-medium mb-1">Voyage #</label><input type="text" className={FORM_STYLES.READONLY_INPUT} value={voyageData?.voyage_number || 'N/A'} readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div>
            <div><label className="block text-sm font-medium mb-1">BLS Quantity</label><input type="text" className={FORM_STYLES.READONLY_INPUT} value={vesselData?.bls || 'N/A'} readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div>
            <div><label className="block text-sm font-medium mb-1">Cargo Type</label><input type="text" className={FORM_STYLES.READONLY_INPUT} value={voyageData?.cargo_type || 'N/A'} readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div>
            <div><label className="block text-sm font-medium mb-1">Cargo Quantity (MT)</label><input type="text" className={FORM_STYLES.READONLY_INPUT} value={voyageData?.cargo_quantity || 'N/A'} readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div>
            {/* Port should likely be the destination port from the voyage data for Berth report */}
            <div><label className="block text-sm font-medium mb-1">Port</label><input type="text" className={FORM_STYLES.READONLY_INPUT} value={voyageData?.destination_port || 'N/A'} readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div>

            {/* Editable fields using FormField */}
            <FormField name="date" label="Date" type="date" register={register} errors={errors} isRequired />
            <FormField name="timeZone" label="Zone +/-" type="text" register={register} errors={errors} control={control} validationPattern={TIMEZONE_FILTER} placeholder="e.g. +3 or -10" maxLength={3} isRequired />
            <FormField name="berthNumber" label="Berth Number" type="text" register={register} errors={errors} placeholder="e.g. B12" isRequired />
            <FormField name="fwdDraft" label="FWD Draft (M)" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired />
            <FormField name="aftDraft" label="AFT Draft (M)" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired />
          </div>
        </div>

        {/* Navigation Data Section (Berth Specific) */}
        <div className="mb-6">
           <h3 className="font-bold border-b pb-2 mb-4">Navigation Data</h3>
           {/* Berth Position */}
           <div className="bg-blue-50 p-4 rounded mb-4">
             <h4 className="font-bold mb-2">Berth Position & Time</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField name="faspDate" label="Date" type="date" register={register} errors={errors} isRequired wrapperClassName="mb-0" />
               <FormField name="faspTime" label="Time" type="time" register={register} errors={errors} isRequired wrapperClassName="mb-0" />
               {/* Latitude - Keep custom structure */}
               <div className="mb-4">
                 <label className="block text-sm font-medium mb-1">Latitude <span className="text-red-500">*</span></label>
                 <div className="flex">
                   <FormField
                        name="faspLatitude"
                        label=""
                        type="text"
                        inputMode="decimal"
                        register={register}
                        errors={errors}
                        control={control}
                        validationPattern={POSITIVE_DECIMAL_ONLY}
                        placeholder="e.g. 1.290"
                        isRequired
                        wrapperClassName="flex-grow mb-0"
                        inputClassName={`${FORM_STYLES.EDITABLE_INPUT.replace('rounded', 'rounded-l')} ${errors.faspLatitude ? FORM_STYLES.ERROR_BORDER : FORM_STYLES.NORMAL_BORDER}`}
                    />
                   <FormField
                        name="faspLatitudeDir"
                        label=""
                        type="select"
                        register={register}
                        errors={errors}
                        options={latDirOptions}
                        isRequired
                        wrapperClassName="mb-0"
                        inputClassName={`p-2 border bg-white border-l-0 rounded-r ${errors.faspLatitudeDir ? FORM_STYLES.ERROR_BORDER : FORM_STYLES.NORMAL_BORDER}`}
                    />
                 </div>
                 {(errors.faspLatitude || errors.faspLatitudeDir) && <p className="text-xs text-red-500 mt-1">{errors.faspLatitude?.message || errors.faspLatitudeDir?.message}</p>}
               </div>
               {/* Longitude - Keep custom structure */}
               <div className="mb-4">
                 <label className="block text-sm font-medium mb-1">Longitude <span className="text-red-500">*</span></label>
                 <div className="flex">
                   <FormField
                        name="faspLongitude"
                        label=""
                        type="text"
                        inputMode="decimal"
                        register={register}
                        errors={errors}
                        control={control}
                        validationPattern={POSITIVE_DECIMAL_ONLY}
                        placeholder="e.g. 103.851"
                        isRequired
                        wrapperClassName="flex-grow mb-0"
                        inputClassName={`${FORM_STYLES.EDITABLE_INPUT.replace('rounded', 'rounded-l')} ${errors.faspLongitude ? FORM_STYLES.ERROR_BORDER : FORM_STYLES.NORMAL_BORDER}`}
                    />
                   <FormField
                        name="faspLongitudeDir"
                        label=""
                        type="select"
                        register={register}
                        errors={errors}
                        options={lonDirOptions}
                        isRequired
                        wrapperClassName="mb-0"
                        inputClassName={`p-2 border bg-white border-l-0 rounded-r ${errors.faspLongitudeDir ? FORM_STYLES.ERROR_BORDER : FORM_STYLES.NORMAL_BORDER}`}
                    />
                 </div>
                 {(errors.faspLongitude || errors.faspLongitudeDir) && <p className="text-xs text-red-500 mt-1">{errors.faspLongitude?.message || errors.faspLongitudeDir?.message}</p>}
               </div>
             </div>
           </div>
           {/* Total Distance Traveled Display */}
           <div className="bg-gray-50 p-4 rounded mb-4">
             <h4 className="font-bold mb-2">Distance Data</h4>
             {/* Removed Total Distance Travelled display */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Adjust grid if only Harbour Distance remains */}
               {/* Display Harbour Distance from previous (Arrival) report */}
               <div>
                 <label className="block text-sm font-medium mb-1">Harbour Distance (NM)</label>
                 <input
                    type="text"
                    // Use the new precedingPortReport prop here, with extra check for report_data and type
                    value={
                      (typeof precedingPortReport?.report_data === 'object' && precedingPortReport.report_data !== null && typeof precedingPortReport.report_data.harbour_distance === 'number')
                      ? precedingPortReport.report_data.harbour_distance.toFixed(1)
                      : 'N/A'
                    }
                    className={FORM_STYLES.READONLY_INPUT}
                    readOnly
                 />
                 <p className="text-xs text-gray-500 mt-1">From previous Arrival report</p>
               </div>
             </div>
           </div>
           {/* Weather Data */}
            <div className="bg-gray-50 p-4 rounded mb-4">
             <h4 className="font-bold mb-2">Weather Data</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField name="windDirection" label="Wind Direction" type="select" register={register} errors={errors} options={windDirectionOptions} placeholder="Select" isRequired wrapperClassName="mb-0" />
               <FormField name="windForce" label="Wind Force (0-12)" type="text" inputMode="numeric" register={register} errors={errors} control={control} validationPattern={INTEGER_ONLY} isRequired wrapperClassName="mb-0" />
               <FormField name="seaDirection" label="Sea Direction" type="select" register={register} errors={errors} options={seaDirectionOptions} placeholder="Select" isRequired wrapperClassName="mb-0" />
               <FormField name="seaState" label="Sea State (0-9)" type="text" inputMode="numeric" register={register} errors={errors} control={control} validationPattern={INTEGER_ONLY} isRequired wrapperClassName="mb-0" />
               <FormField name="swellDirection" label="Swell Direction" type="select" register={register} errors={errors} options={swellDirectionOptions} placeholder="Select" isRequired wrapperClassName="mb-0" />
               <FormField name="swellHeight" label="Swell Height (0-9)" type="text" inputMode="numeric" register={register} errors={errors} control={control} validationPattern={INTEGER_ONLY} isRequired wrapperClassName="mb-0" />
             </div>
           </div>
           {/* Captain Remarks */}
           <FormField name="captainRemarks" label="Captain Remarks (Navigation/Weather)" type="textarea" register={register} errors={errors} placeholder="Optional remarks..." />
        </div>

        {/* Cargo Operations Section */}
        <div className="mb-6">
          <h3 className="font-bold border-b pb-2 mb-4">Cargo Operations</h3>
          <div className="bg-blue-50 p-4 rounded mb-4">
            <h4 className="font-bold mb-2">Current Cargo Status</h4>
            <div className="flex items-center space-x-4 mb-4">
              <div className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm">{cargoStatus === 'loaded' ? 'LOADED' : 'BALLAST'}</div>
              <p className="text-sm text-gray-600">{cargoStatus === 'loaded' ? 'Unloading operations available.' : 'Loading operations available.'}</p>
            </div>
            {cargoStatus === 'loaded' ? (
              <div className="bg-white p-4 rounded border">
                <h5 className="font-medium mb-3">Cargo Unloading</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="cargoUnloadedMT" label="Cargo Unloaded (MT)" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} />
                  {/* Display calculated remaining cargo */}
                  <div><label className="block text-sm font-medium mb-1">Remaining Cargo (MT)</label><input type="text" value={remainingCargoDisplay} className={FORM_STYLES.READONLY_INPUT} readOnly /><p className="text-xs text-gray-500 mt-1">Calculated</p></div>
                  <div><label className="block text-sm font-medium mb-1">Unloading Start</label><div className="grid grid-cols-2 gap-2"><FormField name="unloadingStartDate" label="" type="date" register={register} errors={errors} wrapperClassName="mb-0" /><FormField name="unloadingStartTime" label="" type="time" register={register} errors={errors} wrapperClassName="mb-0" /></div>{(errors.unloadingStartDate || errors.unloadingStartTime) && <p className="text-xs text-red-500 mt-1">{errors.unloadingStartDate?.message || errors.unloadingStartTime?.message}</p>}</div>
                  <div><label className="block text-sm font-medium mb-1">Unloading End</label><div className="grid grid-cols-2 gap-2"><FormField name="unloadingEndDate" label="" type="date" register={register} errors={errors} wrapperClassName="mb-0" /><FormField name="unloadingEndTime" label="" type="time" register={register} errors={errors} wrapperClassName="mb-0" /></div>{(errors.unloadingEndDate || errors.unloadingEndTime) && <p className="text-xs text-red-500 mt-1">{errors.unloadingEndDate?.message || errors.unloadingEndTime?.message}</p>}</div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-4 rounded border">
                <h5 className="font-medium mb-3">Cargo Loading</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Cargo Type</label><input type="text" className={FORM_STYLES.READONLY_INPUT} value="CONTAINERS" readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div> {/* Assuming type comes from voyage */}
                  <FormField name="cargoLoadedMT" label="Cargo Loaded (MT)" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} />
                  <div><label className="block text-sm font-medium mb-1">Loading Start</label><div className="grid grid-cols-2 gap-2"><FormField name="loadingStartDate" label="" type="date" register={register} errors={errors} wrapperClassName="mb-0" /><FormField name="loadingStartTime" label="" type="time" register={register} errors={errors} wrapperClassName="mb-0" /></div>{(errors.loadingStartDate || errors.loadingStartTime) && <p className="text-xs text-red-500 mt-1">{errors.loadingStartDate?.message || errors.loadingStartTime?.message}</p>}</div>
                  <div><label className="block text-sm font-medium mb-1">Loading End</label><div className="grid grid-cols-2 gap-2"><FormField name="loadingEndDate" label="" type="date" register={register} errors={errors} wrapperClassName="mb-0" /><FormField name="loadingEndTime" label="" type="time" register={register} errors={errors} wrapperClassName="mb-0" /></div>{(errors.loadingEndDate || errors.loadingEndTime) && <p className="text-xs text-red-500 mt-1">{errors.loadingEndDate?.message || errors.loadingEndTime?.message}</p>}</div>
                </div>
              </div>
            )}
          </div>
          <FormField name="cargoOpsRemarks" label="Cargo Operations Remarks" type="textarea" register={register} errors={errors} placeholder="Optional remarks..." />
        </div>

        {/* --- Bunker Section --- Use Controller for inputs */}
        <div className="mb-6">
          <h3 className="font-bold border-b pb-2 mb-4">Bunker Data</h3>
          {/* PRS RPM with Controller - Handle undefined */}
          <FormField name="prsRpm" label="PRS RPM" type="text" inputMode="numeric" register={register} errors={errors} control={control} validationPattern={INTEGER_ONLY} isRequired />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
            {/* Main Engine Consumption */}
            <div className="bg-gray-50 p-4 rounded"><h4 className="font-semibold mb-2">Main Engine Consumption</h4><div className="space-y-2">
              <FormField name="meLSIFO" label="LSIFO" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired labelClassName="text-sm" wrapperClassName="mb-0" />
              <FormField name="meLSMGO" label="LSMGO" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired labelClassName="text-sm" wrapperClassName="mb-0" />
              <FormField name="meCYLOIL" label="CYL OIL" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired labelClassName="text-sm" wrapperClassName="mb-0" />
              <FormField name="meMEOIL" label="M/E OIL" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired labelClassName="text-sm" wrapperClassName="mb-0" />
              <FormField name="meAEOIL" label="A/E OIL" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired labelClassName="text-sm" wrapperClassName="mb-0" />
            </div></div>
            {/* Boiler Consumption */}
            <div className="bg-gray-50 p-4 rounded"><h4 className="font-semibold mb-2">Boiler Consumption</h4><div className="space-y-2">
              <FormField name="boilerLSIFO" label="LSIFO" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired labelClassName="text-sm" wrapperClassName="mb-0" />
              <FormField name="boilerLSMGO" label="LSMGO" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired labelClassName="text-sm" wrapperClassName="mb-0" />
            </div></div>
            {/* Aux Consumption */}
            <div className="bg-gray-50 p-4 rounded"><h4 className="font-semibold mb-2">Aux Consumption</h4><div className="space-y-2">
              <FormField name="auxLSIFO" label="LSIFO" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired labelClassName="text-sm" wrapperClassName="mb-0" />
              <FormField name="auxLSMGO" label="LSMGO" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired labelClassName="text-sm" wrapperClassName="mb-0" />
            </div></div>
            {/* Bunker Supply (Optional) */}
            <div className="bg-gray-50 p-4 rounded"><h4 className="font-semibold mb-2">Bunker Supply (Optional)</h4><div className="space-y-2">
              <FormField name="supplyLSIFO" label="LSIFO" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} labelClassName="text-sm" wrapperClassName="mb-0" />
              <FormField name="supplyLSMGO" label="LSMGO" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} labelClassName="text-sm" wrapperClassName="mb-0" />
              <FormField name="supplyCYLOIL" label="CYL OIL" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} labelClassName="text-sm" wrapperClassName="mb-0" />
              <FormField name="supplyMEOIL" label="M/E OIL" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} labelClassName="text-sm" wrapperClassName="mb-0" />
              <FormField name="supplyAEOIL" label="A/E OIL" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} labelClassName="text-sm" wrapperClassName="mb-0" />
              <FormField name="supplyVOLOIL" label="VOL OIL" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} labelClassName="text-sm" wrapperClassName="mb-0" />
            </div></div>
            {/* Steaming Consumption (Read Only) - Use Component */}
            <SteamingConsumptionDisplay
              lsifo={watch('steamingLSIFO')}
              lsmgo={watch('steamingLSMGO')}
              cylOil={watch('steamingCYLOIL')}
              meOil={watch('steamingMEOIL')}
              aeOil={watch('steamingAEOIL')}
              volOil={watch('steamingVOLOIL')}
            />
            {/* Bunker ROB - Use Component */}
            <BunkerRobDisplay
              lsifo={watch('robLSIFO')}
              lsmgo={watch('robLSMGO')}
              cylOil={watch('robCYLOIL')}
              meOil={watch('robMEOIL')}
              aeOil={watch('robAEOIL')}
              volOil={watch('robVOLOIL')}
            />
          </div>
           {/* Bunker Remarks */}
           <FormField name="bunkerChiefEngineerRemarks" label="Chief Engineer Remarks (Bunker)" type="textarea" register={register} errors={errors} placeholder="Optional remarks..." />
        </div>

        {/* --- Engine/Machinery Section --- Replaced with component */}
        <EngineMachinerySection<ProcessedBerthFormData>
          register={register}
          errors={errors}
          control={control}
        />

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 mt-8">
        <button
          type="button"
          className="px-4 py-2 border rounded hover:bg-gray-100 transition-colors"
          onClick={onCancel}
          disabled={isSubmitting} // Use RHF isSubmitting
        >
          Cancel
        </button>
        <button
          type="submit" // Keep type as submit
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={isSubmitting} // Use RHF isSubmitting
        >
          {isSubmitting ? 'Submitting...' : 'Submit Berth Report'}
        </button>
      </div>
      </form> {/* Ensure closing form tag */}
    </div>
  );
};

export default BerthReportForm;
