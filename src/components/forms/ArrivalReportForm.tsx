import React, { useEffect } from 'react'; // Import useEffect
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ProcessedArrivalFormData, // Import Zod-inferred type
  arrivalReportSchema,      // Import Zod schema
  FORM_STYLES
} from './types/arrivalFormTypes';
// Import defaults and options from constants
import { defaultArrivalValues, windDirectionOptions, seaDirectionOptions, swellDirectionOptions, latDirOptions, lonDirOptions } from './types/arrivalFormConstants';
import FormField from '../ui/FormField';
import api from '../../utils/api'; // Import the api utility
// Updated import path for bunker display components
import { SteamingConsumptionDisplay, BunkerRobDisplay } from './common/BunkerSections'; // Updated path
import EngineMachinerySection from './common/EngineMachinerySection'; // Import the new section component
import {
  INTEGER_ONLY,
  TIMEZONE_FILTER,
  POSITIVE_DECIMAL_ONLY // Import specific patterns for filtering
} from '../../utils/validationPatterns';
// Import Vessel type as well
import { Voyage as BackendVoyage, Report as BackendReport, Vessel } from '../../../backend/src/types/dataTypes';

// Removed FormErrors interface

interface ArrivalReportFormProps {
  vesselData?: Vessel | null; // Add vesselData prop
  voyageData: BackendVoyage | null; // Add prop for voyage data
  lastApprovedReport: BackendReport | null; // Add prop for last approved report
  onSubmit: (formData: ProcessedArrivalFormData) => void; // Use Zod type
  onCancel: () => void;
}

const ArrivalReportForm: React.FC<ArrivalReportFormProps> = ({ vesselData, voyageData, lastApprovedReport, onSubmit, onCancel }) => { // Destructure vesselData
  // Use react-hook-form with Zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }, // Renamed formErrors to errors for consistency
    control,
    watch, // Added watch for display components
    setValue // Import setValue
  } = useForm<ProcessedArrivalFormData>({
    resolver: zodResolver(arrivalReportSchema),
    defaultValues: defaultArrivalValues,
    mode: 'onChange', // Enable onChange validation
  });

  // Removed useState for formData, errors, isSubmitting
  // Removed handleChange, validateField, validateForm

  // Add useEffect to fetch bunker data when the form loads or lastApprovedReport changes
  useEffect(() => {
    const fetchBunkerData = async () => {
      if (lastApprovedReport?.id) {
        console.log(`Arrival Form: Fetching bunker data for last approved report ID: ${lastApprovedReport.id}`);
        try {
          const bunkerRecord = await api.getBunkerRecordForReport(lastApprovedReport.id);
          if (bunkerRecord) {
            console.log("Arrival Form: Fetched bunker record:", bunkerRecord);
            // Set the ROB values in the form using setValue
            setValue('robLSIFO', bunkerRecord.lsifo_rob.toString());
            setValue('robLSMGO', bunkerRecord.lsmgo_rob.toString());
            setValue('robCYLOIL', bunkerRecord.cyl_oil_rob.toString());
            setValue('robMEOIL', bunkerRecord.me_oil_rob.toString());
            setValue('robAEOIL', bunkerRecord.ae_oil_rob.toString());
            setValue('robVOLOIL', bunkerRecord.vol_oil_rob.toString());
            console.log("Arrival Form: Set ROB form values.");
          } else {
             console.log("Arrival Form: No bunker record found for last approved report.");
          }
        } catch (error) {
          console.error('Arrival Form: Failed to fetch bunker data:', error);
        }
      } else {
         console.log("Arrival Form: No last approved report ID available.");
      }
    };

    fetchBunkerData();
  }, [lastApprovedReport?.id, setValue]); // Dependencies

  // Handle form submission - receives validated and coerced data from Zod
  const handleFormSubmit: SubmitHandler<ProcessedArrivalFormData> = async (data) => {
    console.log('Submitting Arrival Report Data:', data);

    // --- Get actual vesselId and submittedBy from props ---
    const vesselId = vesselData?.id ?? 0; // Use actual vessel ID if available, fallback to 0
    const submittedBy = vesselData?.current_captain ?? 'unknown_captain'; // Use actual captain if available
    // ---

    // Transform input data to match backend expectations for consumption
    const transformedData = {
      ...data, // Spread original data first
      harbourDistance: data.harbourDistance, // Explicitly include harbourDistance
      // Sum up the different consumption sources from the form fields
      lsifoConsumed: (data.meLSIFO || 0) + (data.boilerLSIFO || 0) + (data.auxLSIFO || 0),
      lsmgoConsumed: (data.meLSMGO || 0) + (data.boilerLSMGO || 0) + (data.auxLSMGO || 0),
      cylOilConsumed: data.meCYLOIL || 0,
      meOilConsumed: data.meMEOIL || 0,
      aeOilConsumed: data.meAEOIL || 0,
      volOilConsumed: 0, // Default to 0 if not present or tracked differently

      // Add supply transformations - this is the missing piece
      lsifoSupplied: data.supplyLSIFO || 0,
      lsmgoSupplied: data.supplyLSMGO || 0,
      cylOilSupplied: data.supplyCYLOIL || 0,
      meOilSupplied: data.supplyMEOIL || 0,
      aeOilSupplied: data.supplyAEOIL || 0,
      volOilSupplied: data.supplyVOLOIL || 0
    };
    // Remove the detailed consumption/supply fields if they are not needed in report_data
    // delete transformedData.meLSIFO; // Example if needed
    // ... delete other detailed fields ...

    console.log('Transformed Arrival Report Data for API:', transformedData);

    try {
      const createdReport = await api.submitReport(
        vesselId,
        submittedBy,
        'arrival', // Explicitly set report type
        transformedData // Pass the transformed data
      );
      console.log('Arrival Report submitted successfully:', createdReport);
      // Call original onSubmit prop ONLY on successful API call
      onSubmit(data);
      // Optionally show success message
      alert('Arrival Report submitted successfully!');
    } catch (err: any) { // Use err consistently
      console.error('Failed to submit Arrival Report:', err);
      // Show specific backend error or generic message
      alert(`Failed to submit Arrival Report: ${err.response?.data?.message || err.message || 'Unknown error'}`);
    }
    // RHF handles isSubmitting state automatically
  };

  // --- Styling Helpers (getInputClassName, renderError) are removed as FormField handles this ---

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Arrival Report</h2>
      {/* Use RHF handleSubmit */}
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>

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
          {/* Removed extra closing div tag here */}
          </div>
        </div>

        {/* Navigation Data Section - Connected */}
        <div className="mb-6">
          <h3 className="font-bold border-b pb-2 mb-4">Navigation Data</h3>

          {/* EOSP (End of Sea Passage) */}
          <div className="bg-blue-50 p-4 rounded mb-4">
            <h4 className="font-bold mb-2">EOSP (End of Sea Passage)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="eospDate" label="EOSP Date" type="date" register={register} errors={errors} isRequired wrapperClassName="mb-0" />
              <FormField name="eospTime" label="EOSP Time" type="time" register={register} errors={errors} isRequired wrapperClassName="mb-0" />
              {/* EOSP Latitude - Keep custom structure */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">EOSP Latitude <span className="text-red-500">*</span></label>
                <div className="flex">
                  <FormField
                    name="eospLatitude"
                    label=""
                    type="text"
                    inputMode="decimal"
                    register={register}
                    errors={errors}
                    control={control}
                    validationPattern={POSITIVE_DECIMAL_ONLY}
                    placeholder="e.g. 1.3521"
                    isRequired
                    wrapperClassName="flex-grow mb-0"
                    inputClassName={`${FORM_STYLES.EDITABLE_INPUT.replace('rounded', 'rounded-l')} ${errors.eospLatitude ? FORM_STYLES.ERROR_BORDER : FORM_STYLES.NORMAL_BORDER}`}
                  />
                  <FormField
                    name="eospLatitudeDir"
                    label=""
                    type="select"
                    register={register}
                    errors={errors}
                    options={latDirOptions}
                    isRequired
                    wrapperClassName="mb-0"
                    inputClassName={`p-2 border bg-white border-l-0 rounded-r ${errors.eospLatitudeDir ? FORM_STYLES.ERROR_BORDER : FORM_STYLES.NORMAL_BORDER}`}
                  />
                </div>
                {(errors.eospLatitude || errors.eospLatitudeDir) && <p className="text-xs text-red-500 mt-1">{errors.eospLatitude?.message || errors.eospLatitudeDir?.message}</p>}
              </div>
              {/* EOSP Longitude - Keep custom structure */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">EOSP Longitude <span className="text-red-500">*</span></label>
                <div className="flex">
                  <FormField
                    name="eospLongitude"
                    label=""
                    type="text"
                    inputMode="decimal"
                    register={register}
                    errors={errors}
                    control={control}
                    validationPattern={POSITIVE_DECIMAL_ONLY}
                    placeholder="e.g. 103.8198"
                    isRequired
                    wrapperClassName="flex-grow mb-0"
                    inputClassName={`${FORM_STYLES.EDITABLE_INPUT.replace('rounded', 'rounded-l')} ${errors.eospLongitude ? FORM_STYLES.ERROR_BORDER : FORM_STYLES.NORMAL_BORDER}`}
                  />
                  <FormField
                    name="eospLongitudeDir"
                    label=""
                    type="select"
                    register={register}
                    errors={errors}
                    options={lonDirOptions}
                    isRequired
                    wrapperClassName="mb-0"
                    inputClassName={`p-2 border bg-white border-l-0 rounded-r ${errors.eospLongitudeDir ? FORM_STYLES.ERROR_BORDER : FORM_STYLES.NORMAL_BORDER}`}
                  />
                </div>
                {(errors.eospLongitude || errors.eospLongitudeDir) && <p className="text-xs text-red-500 mt-1">{errors.eospLongitude?.message || errors.eospLongitudeDir?.message}</p>}
              </div>
              {/* Added EOSP Course Field */}
              <FormField name="eospCourse" label="EOSP Course" type="text" inputMode="numeric" register={register} errors={errors} control={control} validationPattern={INTEGER_ONLY} isRequired wrapperClassName="mb-0" />
            </div>
          </div>

          {/* ETB Fields */}
          <div className="bg-blue-50 p-4 rounded mb-4">
             <h4 className="font-bold mb-2">ETB (Estimated Time of Berthing)</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField name="etbDate" label="ETB Date" type="date" register={register} errors={errors} isRequired wrapperClassName="mb-0" />
               <FormField name="etbTime" label="ETB Time" type="time" register={register} errors={errors} isRequired wrapperClassName="mb-0" />
             </div>
           </div>

          {/* Harbour Steaming */}
          <div className="bg-gray-50 p-4 rounded mb-4">
            <h4 className="font-bold mb-2">Harbour Steaming</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="harbourDistance" label="Harbour Distance (NM)" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired wrapperClassName="mb-0" />
              <FormField name="harbourTime" label="Harbour Time (HH:MM)" type="time" register={register} errors={errors} isRequired wrapperClassName="mb-0" />
            </div>
          </div>

          {/* Distance Data */}
          <div className="bg-gray-50 p-4 rounded mb-4">
            <h4 className="font-bold mb-2">Distance Data</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> {/* Adjusted grid columns */}
              {/* Input field - Verified name is distanceSinceLastReport */}
              <FormField name="distanceSinceLastReport" label="Distance Since Last Report (NM)" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired wrapperClassName="mb-0" />
              {/* Display field 1: Total Distance Traveled */}
              <div>
                <label className="block text-sm font-medium mb-1">Total Distance Traveled (NM)</label>
                {/* TODO: Pass calculated value via props */}
                <input type="text" value={watch('totalDistanceTraveled') ?? ''} className={FORM_STYLES.READONLY_INPUT} readOnly />
                <p className="text-xs text-gray-500 mt-1">Calculated from all reports</p>
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

          {/* Weather Data - Connected */}
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
          <FormField name="captainRemarks" label="Captain Remarks" type="textarea" register={register} errors={errors} placeholder="Optional remarks about arrival conditions..." />
        {/* Removed extra closing div tag here */}
        </div>

        {/* --- Bunker Section --- Connected */}
        <div className="mb-6">
          <h3 className="font-bold border-b pb-2 mb-4">Bunker Data</h3>
          {/* PRS RPM with Controller - Already correct */}
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
        {/* Removed extra closing div tag here */}
        </div>

        {/* --- Engine/Machinery Section --- Replaced with component */}
        <EngineMachinerySection<ProcessedArrivalFormData>
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
          // onClick removed, handled by form onSubmit
          disabled={isSubmitting} // Use RHF isSubmitting
        >
          {isSubmitting ? 'Submitting...' : 'Submit Arrival Report'}
        </button>
      </div>
      </form> {/* Ensure closing form tag */}
    </div>
  );
};

export default ArrivalReportForm;
