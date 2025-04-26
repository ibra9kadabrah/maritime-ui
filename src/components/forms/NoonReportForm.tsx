import React, { useState, useEffect } from 'react'; // Import useEffect
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ProcessedNoonFormData, // Import Zod-inferred type
  noonReportSchema,      // Import Zod schema
  FORM_STYLES
} from './types/noonFormTypes';
// Import defaults and options from constants
import { defaultNoonValues, windDirectionOptions, seaDirectionOptions, swellDirectionOptions, latDirOptions, lonDirOptions } from './types/noonFormConstants';
import FormField from '../ui/FormField';
import api from '../../utils/api'; // Import the api utility
// Updated import path for bunker display components
import { SteamingConsumptionDisplay, BunkerRobDisplay } from './common/BunkerSections'; // Updated path
import EngineMachinerySection from './common/EngineMachinerySection'; // Import the new section component
import {
  INTEGER_ONLY,
  TIMEZONE_FILTER,
  POSITIVE_DECIMAL_ONLY
} from '../../utils/validationPatterns';
// Import Vessel type as well
import { Voyage as BackendVoyage, Report as BackendReport, Vessel } from '../../../backend/src/types/dataTypes';

interface NoonReportFormProps {
  vesselData?: Vessel | null; // Add vesselData prop
  voyageData: BackendVoyage | null; // Add prop for voyage data
  lastApprovedReport: BackendReport | null; // Add prop for last approved report
  onSubmit: (formData: ProcessedNoonFormData) => void; // Use Zod type
  onCancel: () => void;
}

const NoonReportForm: React.FC<NoonReportFormProps> = ({ vesselData, voyageData, lastApprovedReport, onSubmit, onCancel }) => { // Destructure vesselData
  // Use react-hook-form with Zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }, // Keep errors name
    control,
    clearErrors,
    watch,
    setError, // Import setError
    setValue // Import setValue
  } = useForm<ProcessedNoonFormData>({
    resolver: zodResolver(noonReportSchema),
    defaultValues: defaultNoonValues,
    mode: 'onChange', // Enable onChange validation
  });

  // Determine initial and last approved passage state
  const lastApprovedState = lastApprovedReport?.report_data?.passageState as 'noon' | 'sosp' | 'rosp' | undefined ?? (lastApprovedReport?.type === 'departure' ? 'departure' : undefined);
  const initialPassageState = lastApprovedState === 'sosp' ? 'sosp' : 'noon';

  // State for passage state selection
  const [passageState, setPassageState] = useState<'noon' | 'sosp' | 'rosp'>(initialPassageState);

  // Add useEffect to fetch bunker data when the form loads or lastApprovedReport changes
  useEffect(() => {
    const fetchBunkerData = async () => {
      if (lastApprovedReport?.id) {
        console.log(`Fetching bunker data for last approved report ID: ${lastApprovedReport.id}`); // Log fetching attempt
        try {
          // Fetch bunker record for the last approved report
          const bunkerRecord = await api.getBunkerRecordForReport(lastApprovedReport.id);
          if (bunkerRecord) {
            console.log("Fetched bunker record:", bunkerRecord); // Log fetched data
            // Set the ROB values in the form using setValue
            setValue('robLSIFO', bunkerRecord.lsifo_rob.toString());
            setValue('robLSMGO', bunkerRecord.lsmgo_rob.toString());
            setValue('robCYLOIL', bunkerRecord.cyl_oil_rob.toString());
            setValue('robMEOIL', bunkerRecord.me_oil_rob.toString());
            setValue('robAEOIL', bunkerRecord.ae_oil_rob.toString());
            setValue('robVOLOIL', bunkerRecord.vol_oil_rob.toString());
            console.log("Set ROB form values from fetched bunker record."); // Log success
          } else {
            console.log("No bunker record found for the last approved report."); // Log if not found
          }
        } catch (error) {
          console.error('Failed to fetch bunker data:', error);
        }
      } else {
         console.log("No last approved report ID available to fetch bunker data."); // Log if no ID
      }
    };

    fetchBunkerData();
  }, [lastApprovedReport?.id, setValue]); // Dependencies: refetch if report ID changes or setValue changes


  // --- Validation and Handler Functions ---

  // Removed handleChange - Controller handles this now

   // Handle radio button changes specifically for passageState
   const handlePassageStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newState = e.target.value as 'noon' | 'sosp' | 'rosp';
    setPassageState(newState);
    // Clear potential SOSP/ROSP detail errors when changing state
    // Zod schema handles optionality, but clearing errors on state change is good UX
    const detailKeys: Array<keyof ProcessedNoonFormData> = ['sospRosPDate', 'sospRosPTime', 'sospRosPLatitude', 'sospRosPLongitude', 'sospRosPLatitudeDir', 'sospRosPLongitudeDir'];
    detailKeys.forEach(key => clearErrors(key));
  };


  // Handle form submission - receives validated and coerced data from Zod
  const handleFormSubmit: SubmitHandler<ProcessedNoonFormData> = async (data) => {
    console.log("--- handleFormSubmit CALLED ---");
    // Data is already validated and processed by Zod resolver
    console.log("Submitting Noon Report Data (Validated by Zod):", data);

    // --- Copy position data to SOSP/ROSP fields if applicable ---
    // This ensures the manual check below works correctly
    if (passageState === 'sosp' || passageState === 'rosp') {
      data.sospRosPDate = data.positionDate;
      data.sospRosPTime = data.positionTime;
      data.sospRosPLatitude = data.positionLatitude;
      data.sospRosPLatitudeDir = data.positionLatitudeDir;
      data.sospRosPLongitude = data.positionLongitude;
      data.sospRosPLongitudeDir = data.positionLongitudeDir;
    }

    // --- Manual Check for SOSP/ROSP fields based on passageState ---
    let hasManualError = false;
    const sospRosPFields: Array<keyof ProcessedNoonFormData> = [
        'sospRosPDate', 'sospRosPTime', 'sospRosPLatitude', 'sospRosPLatitudeDir', 'sospRosPLongitude', 'sospRosPLongitudeDir'
    ];

    if (passageState === 'sosp' || passageState === 'rosp') {
        sospRosPFields.forEach(fieldName => {
            if (data[fieldName] === undefined || data[fieldName] === null || data[fieldName] === '') {
                setError(fieldName, {
                    type: 'manual',
                    message: `This field is required for ${passageState.toUpperCase()}`
                });
                hasManualError = true;
            }
        });
    }

    if (hasManualError) {
        console.error("Manual validation failed for SOSP/ROSP fields");
        return; // Stop submission if manual validation fails
    }
    // --- End Manual Check ---


    const finalData = { ...data }; // Copy data

    // Add the selected passage state (if needed by backend)
    (finalData as any).passageState = passageState;

    // Remove SOSP/ROSP details if state is Noon (optional, Zod handles undefined)
    // This ensures clean data submission if backend expects these fields to be absent
    if (passageState === 'noon') {
        const detailKeys: Array<keyof ProcessedNoonFormData> = ['sospRosPDate', 'sospRosPTime', 'sospRosPLatitude', 'sospRosPLongitude', 'sospRosPLatitudeDir', 'sospRosPLongitudeDir'];
        detailKeys.forEach(key => delete (finalData as any)[key]); // Use any temporarily for deletion
    }


    console.log('Noon report submitted data (Zod processed):', finalData);
    // onSubmit(finalData); // REMOVE: Don't call original onSubmit before API call

    // --- Get actual vesselId and submittedBy from props ---
    const vesselId = vesselData?.id ?? 0; // Use actual vessel ID if available, fallback to 0
    const submittedBy = vesselData?.current_captain ?? 'unknown_captain'; // Use actual captain if available
    // ---

    try {
      const createdReport = await api.submitReport(
        vesselId,
        submittedBy,
        'noon', // Explicitly set report type
        finalData // Pass the processed form data
      );
      console.log('Noon Report submitted successfully:', createdReport);
      // Call original onSubmit prop ONLY on successful API call
      onSubmit(finalData);
      // Optionally show success message
      alert('Noon Report submitted successfully!');
    } catch (err: any) {
      console.error('Failed to submit Noon Report:', err);
      // Show specific backend error or generic message
      alert(`Failed to submit Noon Report: ${err.response?.data?.message || err.message || 'Unknown error'}`);
    }

    // RHF handles isSubmitting state automatically
  };

  // --- Styling Helpers (getInputClassName, renderError) are removed as FormField handles this ---

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Noon Report</h2>
      {/* Use RHF handleSubmit directly, add error log */}
      <form onSubmit={handleSubmit(handleFormSubmit, (errors) => console.error("RHF Validation Errors:", errors))} noValidate>

        {/* General Information Section - Connected */}
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
            <div><label className="block text-sm font-medium mb-1">Departure Port</label><input type="text" className={FORM_STYLES.READONLY_INPUT} value={voyageData?.departure_port || 'N/A'} readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div>
            <div><label className="block text-sm font-medium mb-1">Destination Port</label><input type="text" className={FORM_STYLES.READONLY_INPUT} value={voyageData?.destination_port || 'N/A'} readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div>

            {/* Editable fields using FormField */}
            <FormField name="date" label="Date" type="date" register={register} errors={errors} isRequired />
            <FormField name="timeZone" label="Zone +/-" type="text" register={register} errors={errors} control={control} validationPattern={TIMEZONE_FILTER} placeholder="e.g. +3 or -10" maxLength={3} isRequired />
            <FormField name="fwdDraft" label="FWD Draft (M)" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired />
            <FormField name="aftDraft" label="AFT Draft (M)" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired />
          </div> {/* Close grid div */}
        </div> {/* Close General Info div */}

        {/* Navigation Data Section - Connected */}
        <div className="mb-6">
          <h3 className="font-bold border-b pb-2 mb-4">Navigation Data</h3>

          {/* Passage State Selection - Updated disabling logic */}
          <div className="bg-blue-50 p-4 rounded mb-4">
            <h4 className="font-bold mb-2">Passage State</h4>
            <div className="flex space-x-4">
               {/* Disable Noon if last approved was SOSP */}
               <label className={`inline-flex items-center ${lastApprovedState === 'sosp' ? 'cursor-not-allowed opacity-50' : ''}`}>
                 <input
                   type="radio"
                   name="passageState"
                   value="noon"
                   checked={passageState === 'noon'}
                   onChange={handlePassageStateChange}
                   className="mr-2"
                   disabled={lastApprovedState === 'sosp'}
                 /> Noon
               </label>
               {/* SOSP is generally always allowed as a next state unless already SOSP? Backend handles transition logic. */}
               <label className="inline-flex items-center">
                 <input
                   type="radio"
                   name="passageState"
                   value="sosp"
                   checked={passageState === 'sosp'}
                   onChange={handlePassageStateChange}
                   className="mr-2"
                   // disabled={lastApprovedState === 'sosp'} // Optional: prevent re-selecting SOSP? Backend validates anyway.
                 /> SOSP (Stop)
               </label>
               {/* Disable ROSP unless last approved was SOSP */}
               <label className={`inline-flex items-center ${lastApprovedState !== 'sosp' ? 'cursor-not-allowed opacity-50' : ''}`}>
                 <input
                   type="radio"
                   name="passageState"
                   value="rosp"
                   checked={passageState === 'rosp'}
                   onChange={handlePassageStateChange}
                   className="mr-2"
                   disabled={lastApprovedState !== 'sosp'}
                 /> ROSP (Resume)
               </label>
            </div>
          </div>

          {/* Position Data - Use register or Controller */}
          <div className={`p-4 rounded mb-4 ${passageState === 'sosp' ? 'bg-red-50' : passageState === 'rosp' ? 'bg-green-50' : 'bg-gray-50'}`}>
            <h4 className="font-bold mb-2">{passageState === 'sosp' ? 'SOSP Position' : passageState === 'rosp' ? 'ROSP Position' : 'Noon Position'}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="positionDate" label={passageState === 'sosp' ? 'SOSP Date' : passageState === 'rosp' ? 'ROSP Date' : 'Date'} type="date" register={register} errors={errors} isRequired wrapperClassName="mb-0" />
              <FormField name="positionTime" label={passageState === 'sosp' ? 'SOSP Time' : passageState === 'rosp' ? 'ROSP Time' : 'Time'} type="time" register={register} errors={errors} isRequired wrapperClassName="mb-0" />
              {/* Latitude - Keep custom structure */}
              <div className="mb-4">
                 <label className="block text-sm font-medium mb-1">{passageState === 'sosp' ? 'SOSP Latitude' : passageState === 'rosp' ? 'ROSP Latitude' : 'Latitude'} <span className="text-red-500">*</span></label>
                <div className="flex">
                   <FormField
                        name="positionLatitude"
                        label=""
                        type="text"
                        inputMode="decimal"
                        register={register}
                        errors={errors}
                        control={control}
                        validationPattern={POSITIVE_DECIMAL_ONLY}
                        placeholder="e.g. 51.9244"
                        isRequired
                        wrapperClassName="flex-grow mb-0"
                        inputClassName={`${FORM_STYLES.EDITABLE_INPUT.replace('rounded', 'rounded-l')} ${errors.positionLatitude ? FORM_STYLES.ERROR_BORDER : FORM_STYLES.NORMAL_BORDER}`}
                    />
                  <FormField
                        name="positionLatitudeDir"
                        label=""
                        type="select"
                        register={register}
                        errors={errors}
                        options={latDirOptions}
                        isRequired
                        wrapperClassName="mb-0"
                        inputClassName={`p-2 border bg-white border-l-0 rounded-r ${errors.positionLatitudeDir ? FORM_STYLES.ERROR_BORDER : FORM_STYLES.NORMAL_BORDER}`}
                    />
                </div>
                {(errors.positionLatitude || errors.positionLatitudeDir) && <p className="text-xs text-red-500 mt-1">{errors.positionLatitude?.message || errors.positionLatitudeDir?.message}</p>}
              </div>
              {/* Longitude - Keep custom structure */}
              <div className="mb-4">
                 <label className="block text-sm font-medium mb-1">{passageState === 'sosp' ? 'SOSP Longitude' : passageState === 'rosp' ? 'ROSP Longitude' : 'Longitude'} <span className="text-red-500">*</span></label>
                <div className="flex">
                   <FormField
                        name="positionLongitude"
                        label=""
                        type="text"
                        inputMode="decimal"
                        register={register}
                        errors={errors}
                        control={control}
                        validationPattern={POSITIVE_DECIMAL_ONLY}
                        placeholder="e.g. 4.4777"
                        isRequired
                        wrapperClassName="flex-grow mb-0"
                        inputClassName={`${FORM_STYLES.EDITABLE_INPUT.replace('rounded', 'rounded-l')} ${errors.positionLongitude ? FORM_STYLES.ERROR_BORDER : FORM_STYLES.NORMAL_BORDER}`}
                    />
                  <FormField
                        name="positionLongitudeDir"
                        label=""
                        type="select"
                        register={register}
                        errors={errors}
                        options={lonDirOptions}
                        isRequired
                        wrapperClassName="mb-0"
                        inputClassName={`p-2 border bg-white border-l-0 rounded-r ${errors.positionLongitudeDir ? FORM_STYLES.ERROR_BORDER : FORM_STYLES.NORMAL_BORDER}`}
                    />
                </div>
                {(errors.positionLongitude || errors.positionLongitudeDir) && <p className="text-xs text-red-500 mt-1">{errors.positionLongitude?.message || errors.positionLongitudeDir?.message}</p>}
              </div>
              {/* Course */}
              <FormField name="course" label="Course" type="text" inputMode="numeric" register={register} errors={errors} control={control} validationPattern={INTEGER_ONLY} isRequired wrapperClassName="mb-0" />
            </div> {/* Close grid div */}
          </div> {/* Close Position Data div */}

          {/* Distance Data - Use Controller */}
          <div className="bg-gray-50 p-4 rounded mb-4">
            <h4 className="font-bold mb-2">Distance Data</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> {/* Adjusted grid columns */}
              <FormField name="distanceSinceLastReport" label="Distance Since Last Report (NM)" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired wrapperClassName="mb-0" />
              {/* Display field 1: Total Distance Traveled */}
              <div>
                <label className="block text-sm font-medium mb-1">Total Distance Traveled (NM)</label>
                {/* TODO: Pass calculated value via props */}
                <input type="text" value={watch('totalDistanceTraveled') ?? ''} className={FORM_STYLES.READONLY_INPUT} readOnly />
                <p className="text-xs text-gray-500 mt-1">Calculated cumulative distance</p>
              </div>
              {/* Display field 2: Distance To Go */}
              <div>
                <label className="block text-sm font-medium mb-1">Distance To Go (NM)</label>
                {/* Use value from last approved report */}
                <input type="text" value={lastApprovedReport?.distance_to_go ?? 'N/A'} className={FORM_STYLES.READONLY_INPUT} readOnly />
                <p className="text-xs text-gray-500 mt-1">From last approved report</p>
              </div>
            </div>
          </div>

          {/* Weather Data - Use register or Controller */}
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
          <FormField name="captainRemarks" label="Captain Remarks" type="textarea" register={register} errors={errors} placeholder="Optional remarks about navigation conditions..." />
        </div> {/* Close Navigation Data div */}

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
        </div> {/* Close Bunker Data div */}

        {/* --- Engine/Machinery Section --- Replaced with component */}
        <EngineMachinerySection<ProcessedNoonFormData>
          register={register}
          errors={errors}
          control={control}
        />

      {/* Form Actions - No change needed */}
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
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={isSubmitting} // Use RHF isSubmitting
        >
          {isSubmitting ? 'Submitting...' : 'Submit Noon Report'}
        </button>
      </div>
      </form>
    </div>
  );
};

export default NoonReportForm;
