import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  departureReportSchema, // Use the simple schema export
  ProcessedDepartureFormData,
  FORM_STYLES
} from './types/departureFormTypes';
import { defaultDepartureValues, windDirectionOptions, seaDirectionOptions, swellDirectionOptions, latDirOptions, lonDirOptions, cargoStatusOptions } from './types/departureFormConstants';
import FormField from '../ui/FormField';
import api from '../../utils/api'; // Import the api utility
// Updated import path for bunker display components
import { SteamingConsumptionDisplay, BunkerRobDisplay } from './common/BunkerSections'; // Updated path
import EngineMachinerySection from './common/EngineMachinerySection'; // Import the new section component
import {
  TEXT_WITH_COMMON_PUNCTUATION,
  POSITIVE_DECIMAL_ONLY,
  INTEGER_ONLY,
  TIMEZONE_FILTER
  // Removed POSITIVE_INTEGER_ONLY import
} from '../../utils/validationPatterns'; // Import specific patterns
import React, { useEffect } from 'react'; // Added useEffect
import { Vessel } from '../../../backend/src/types/dataTypes'; // Removed BackendVoyage import


interface DepartureReportFormProps {
  vesselData?: Vessel | null;
  isFirstDeparture: boolean | null; // For initial ROB fields
  // previousVoyage?: BackendVoyage | null; // Removed
  // Add new props based on the revised plan
  hasPreviousDeparture: boolean;
  lastDestinationPort: string | null;
  onSubmit: (formData: ProcessedDepartureFormData) => void;
  onCancel: () => void;
}

// Regex patterns are now imported from validationPatterns.ts

const DepartureReportForm: React.FC<DepartureReportFormProps> = ({
  vesselData,
  isFirstDeparture,
  // previousVoyage, // Removed
  // Destructure new props
  hasPreviousDeparture,
  lastDestinationPort,
  onSubmit,
  onCancel
}) => {
  // Keep mode onChange for Zod validation feedback

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    control, // Keep control for FormField
    setError, // Add setError
    setValue // Import setValue for the effect hook
  } = useForm<ProcessedDepartureFormData>({
    // Use the simple schema, context is not needed for this approach
    resolver: zodResolver(departureReportSchema),
    defaultValues: defaultDepartureValues,
    mode: 'onChange', // Ensure mode is onChange for instant feedback
    // Pass context if needed for other reasons, but bls is now part of the schema closure
    // context: { bls: vesselData?.bls } // Example if context was needed elsewhere
  });

  // Watch relevant fields for calculation
  const voyageDistance = watch('voyageDistance');
  const harbourDistance = watch('harbourDistance');
  // Remove internal state and useEffect for vesselData, as it's now passed via props

  // Calculate distance to go
  const calculateDistanceToGo = () => {
    if (voyageDistance !== undefined && harbourDistance !== undefined) {
      // Ensure they are numbers before calculation
      const voyNum = typeof voyageDistance === 'number' ? voyageDistance : NaN;
      const harbNum = typeof harbourDistance === 'number' ? harbourDistance : NaN;
      if (!isNaN(voyNum) && !isNaN(harbNum)) {
         return (voyNum - harbNum).toFixed(1);
      }
    }
    return '';
  };

  const distanceToGo = calculateDistanceToGo();

  // Remove the old useEffect and isFirstVoyage logic based on previousVoyage
  // The logic is now handled by the props hasPreviousDeparture and lastDestinationPort


  // Submit handler receiving validated data
  const handleFormSubmit = async (data: ProcessedDepartureFormData) => {
    // Ensure the correct departure port is submitted if it was read-only (i.e., not the first departure)
    if (hasPreviousDeparture && lastDestinationPort) {
      data.departurePort = lastDestinationPort;
    }
    console.log("Submitting Departure Report Data (Post-Zod, Pre-API):", data); // Log data before sending

    // --- Manual Validation ---
    const bls = vesselData?.bls;
    if (typeof bls === 'number' && data.cargoQuantity > bls) {
      setError('cargoQuantity', {
        type: 'manual',
        message: `Cargo quantity (${data.cargoQuantity}) cannot exceed vessel BLS (${bls}).`
      });
      console.error("Manual validation failed: Cargo quantity exceeds BLS.");
      return; // Stop submission
    }
    // --- End Manual Validation ---


    // --- TODO: Get actual vesselId and submittedBy ---
    // These might come from props, context, or auth state
    const vesselId = vesselData?.id ?? 0; // Use actual vessel ID if available
    const submittedBy = vesselData?.current_captain ?? 'unknown_captain'; // Use actual captain if available
    // --- End TODO ---

    try {
      const createdReport = await api.submitReport(
        vesselId,
        submittedBy,
        'departure', // Explicitly set report type
        data // Pass the validated form data
      );
      console.log('Departure Report submitted successfully:', createdReport);
      // Optionally call the original onSubmit prop or handle success (e.g., show message, navigate)
      onSubmit(data); // Still calling original prop for now
    } catch (error) {
      console.error('Failed to submit Departure Report:', error);
      // TODO: Show user-friendly error message
    }
  };

  // --- Render ---
  // getInputClassName and renderError helpers are removed as FormField handles this.
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Departure Report</h2>
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>

        {/* General Information Section */}
        <div className="mb-6">
           <h3 className="font-bold border-b pb-2 mb-4">General Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Read-only fields - Keep simple structure for now */}
            <div><label className="block text-sm font-medium mb-1">M/V (Vessel)</label><input type="text" className={FORM_STYLES.READONLY_INPUT} value={vesselData ? vesselData.name : "N/A"} readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div>
            <div><label className="block text-sm font-medium mb-1">Flag</label><input type="text" className={FORM_STYLES.READONLY_INPUT} value={vesselData ? vesselData.flag : "N/A"} readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div>
            <div><label className="block text-sm font-medium mb-1">Captain</label><input type="text" className={FORM_STYLES.READONLY_INPUT} value={vesselData ? vesselData.current_captain : "N/A"} readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div>
            <div><label className="block text-sm font-medium mb-1">Voyage #</label><input type="text" className={FORM_STYLES.READONLY_INPUT} value="04/2025" readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div> {/* Voyage # is not part of vesselData */}
            <div><label className="block text-sm font-medium mb-1">BLS Quantity</label><input type="text" className={FORM_STYLES.READONLY_INPUT} value={vesselData ? vesselData.bls : "N/A"} readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div>

            {/* Editable fields using FormField */}
            <FormField name="date" label="Date" type="date" register={register} errors={errors} isRequired />
            <FormField name="timeZone" label="Zone +/-" type="text" register={register} errors={errors} control={control} validationPattern={TIMEZONE_FILTER} placeholder="e.g. +03 or -10" maxLength={3} isRequired />
            <FormField name="cargoType" label="Cargo Type" type="text" register={register} errors={errors} control={control} validationPattern={TEXT_WITH_COMMON_PUNCTUATION} placeholder="e.g. CONTAINERS" isRequired />
            <FormField name="cargoQuantity" label="Cargo Quantity (MT)" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} placeholder="e.g. 32500" isRequired />
            <FormField name="fwdDraft" label="FWD Draft (M)" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired />
            <FormField name="aftDraft" label="AFT Draft (M)" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired />
            {/* Departure Port - Conditional Rendering based on hasPreviousDeparture */}
            {!hasPreviousDeparture ? (
              // First ever departure for this vessel - editable field
              <FormField
                name="departurePort"
                label="Departure Port"
                type="text"
                register={register}
                errors={errors}
                control={control}
                validationPattern={TEXT_WITH_COMMON_PUNCTUATION}
                placeholder="Enter departure port"
                isRequired
                inputClassName={FORM_STYLES.EDITABLE_INPUT}
              />
            ) : (
              // Subsequent departure - read-only field with last destination
              <div>
                <label htmlFor="departurePortDisplay" className="block text-sm font-medium mb-1">Departure Port <span className="text-red-500">*</span></label>
                <input
                  id="departurePortDisplay" // Added id for label association
                  type="text"
                  className={FORM_STYLES.READONLY_INPUT}
                  value={lastDestinationPort || "N/A"} // Use lastDestinationPort prop
                  readOnly
                />
                {/* Hidden input to register the value with react-hook-form */}
                <input
                  type="hidden"
                  {...register('departurePort')}
                  value={lastDestinationPort || ""} // Ensure value is registered
                />
                <p className="text-xs text-gray-500 mt-1">From previous voyage (read-only)</p>
                 {/* Display validation error if needed */}
                 {errors.departurePort && <p className="text-xs text-red-500 mt-1">{errors.departurePort.message}</p>}
              </div>
            )}
            <FormField name="destinationPort" label="Destination Port" type="text" register={register} errors={errors} control={control} validationPattern={TEXT_WITH_COMMON_PUNCTUATION} placeholder="e.g. SINGAPORE" isRequired />
          </div>
        </div>

        {/* Voyage Information Section */}
        <div className="mb-6">
           <h3 className="font-bold border-b pb-2 mb-4">Voyage Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField name="etaDate" label="ETA Date" type="date" register={register} errors={errors} isRequired />
            <FormField name="etaTime" label="ETA Time (HH:MM)" type="time" register={register} errors={errors} isRequired />
            <div className="md:col-span-2">
              <FormField name="cargoStatus" label="Cargo Status" type="radio" register={register} errors={errors} options={cargoStatusOptions} isRequired wrapperClassName="mb-0" />
            </div>
          </div>
        </div>

        {/* Navigation Data Section */}
        <div className="mb-6">
           <h3 className="font-bold border-b pb-2 mb-4">Navigation Data</h3>
           {/* FASP */}
           <div className="bg-blue-50 p-4 rounded mb-4">
             <h4 className="font-bold mb-2">FASP (First At Sea Position)</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField name="faspDate" label="Date" type="date" register={register} errors={errors} isRequired wrapperClassName="mb-0" />
               <FormField name="faspTime" label="Time" type="time" register={register} errors={errors} isRequired wrapperClassName="mb-0" />
               {/* FASP Latitude - Keep custom structure for combined input+select */}
               <div className="mb-4"> {/* Add wrapper div */}
                 <label className="block text-sm font-medium mb-1">Latitude <span className="text-red-500">*</span></label>
                 <div className="flex">
                    <FormField
                        name="faspLatitude"
                        label="" // Hide label as it's above
                        type="text"
                        inputMode="decimal"
                        register={register}
                        errors={errors}
                        control={control}
                        validationPattern={POSITIVE_DECIMAL_ONLY}
                        placeholder="e.g. 51.9244"
                        isRequired // Although label is hidden, keep for logic
                        wrapperClassName="flex-grow mb-0" // Remove default margin
                        inputClassName={`${FORM_STYLES.EDITABLE_INPUT.replace('rounded', 'rounded-l')} ${errors.faspLatitude ? FORM_STYLES.ERROR_BORDER : FORM_STYLES.NORMAL_BORDER}`} // Custom class for rounded corners
                    />
                   <FormField
                        name="faspLatitudeDir"
                        label="" // Hide label
                        type="select"
                        register={register}
                        errors={errors}
                        options={latDirOptions}
                        isRequired
                        wrapperClassName="mb-0" // Remove default margin
                        inputClassName={`p-2 border bg-white border-l-0 rounded-r ${errors.faspLatitudeDir ? FORM_STYLES.ERROR_BORDER : FORM_STYLES.NORMAL_BORDER}`} // Custom class
                    />
                 </div>
                 {/* Combined error display might be needed if FormField doesn't handle it well */}
                 {(errors.faspLatitude || errors.faspLatitudeDir) && <p className="text-xs text-red-500 mt-1">{errors.faspLatitude?.message || errors.faspLatitudeDir?.message}</p>}
               </div>
               {/* FASP Longitude - Keep custom structure */}
               <div className="mb-4"> {/* Add wrapper div */}
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
                        placeholder="e.g. 4.4777"
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
               {/* FASP Course */}
               <FormField name="faspCourse" label="Course" type="text" inputMode="numeric" register={register} errors={errors} control={control} validationPattern={INTEGER_ONLY} isRequired wrapperClassName="mb-0" />
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
           {/* Voyage Distance */}
           <div className="bg-gray-50 p-4 rounded mb-4">
             <h4 className="font-bold mb-2">Voyage Distance</h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> {/* Adjusted grid columns */}
               <FormField name="voyageDistance" label="Voyage Distance (NM)" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired wrapperClassName="mb-0" />
               {/* Total Distance Traveled - Calculated Read Only */}
               <div>
                 <label className="block text-sm font-medium mb-1">Total Distance Traveled (NM)</label>
                 {/* TODO: Pass calculated value via props */}
                 <input type="text" value={watch('totalDistanceTraveled') ?? ''} className={FORM_STYLES.READONLY_INPUT} readOnly />
                 <p className="text-xs text-gray-500 mt-1">Calculated (includes harbour)</p>
               </div>
               {/* Distance To Go - Calculated Read Only */}
               <div>
                 <label className="block text-sm font-medium mb-1">Distance To Go (NM)</label>
                 {/* TODO: Pass calculated value via props (or use local calculation if appropriate for Departure) */}
                 {/* Using local calculation for now, might need adjustment based on prop passing */}
                 <input type="text" value={watch('distanceToGo') ?? distanceToGo} className={FORM_STYLES.READONLY_INPUT} readOnly />
                 <p className="text-xs text-gray-500 mt-1">Calculated remaining sea distance</p>
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
           <FormField name="captainRemarks" label="Captain Remarks" type="textarea" register={register} errors={errors} placeholder="Optional remarks..." />
        </div>

        {/* --- Bunker Section --- */}
        <div className="mb-6">
          <h3 className="font-bold border-b pb-2 mb-4">Bunker Data</h3>
          {/* PRS RPM */}
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
            {/* Steaming Consumption (Read Only) - Replaced with Component */}
            <SteamingConsumptionDisplay
              lsifo={watch('steamingLSIFO')} // Pass watched values
              lsmgo={watch('steamingLSMGO')}
              cylOil={watch('steamingCYLOIL')}
              meOil={watch('steamingMEOIL')}
              aeOil={watch('steamingAEOIL')}
              volOil={watch('steamingVOLOIL')}
            />
            {/* Bunker ROB - Conditional Rendering */}
            {isFirstDeparture === true && (
              <div className="bg-yellow-50 p-4 rounded border border-yellow-300">
                <h4 className="font-semibold mb-2 text-yellow-800">Initial Bunker ROB (First Departure Only)</h4>
                <p className="text-xs text-yellow-700 mb-3">Enter the current Remaining On Board quantities. This is only required for the very first departure report.</p>
                <div className="space-y-2">
                  <FormField name="initialRobLSIFO" label="LSIFO" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired labelClassName="text-sm" wrapperClassName="mb-0" />
                  <FormField name="initialRobLSMGO" label="LSMGO" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired labelClassName="text-sm" wrapperClassName="mb-0" />
                  <FormField name="initialRobCYLOIL" label="CYL OIL" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired labelClassName="text-sm" wrapperClassName="mb-0" />
                  <FormField name="initialRobMEOIL" label="M/E OIL" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired labelClassName="text-sm" wrapperClassName="mb-0" />
                  <FormField name="initialRobAEOIL" label="A/E OIL" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired labelClassName="text-sm" wrapperClassName="mb-0" />
                  <FormField name="initialRobVOLOIL" label="VOL OIL" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired labelClassName="text-sm" wrapperClassName="mb-0" />
                </div>
              </div>
            )}
            {isFirstDeparture === false && (
              <BunkerRobDisplay
                lsifo={watch('robLSIFO')} // Pass watched values (these should be fetched/calculated later)
                lsmgo={watch('robLSMGO')}
                cylOil={watch('robCYLOIL')}
                meOil={watch('robMEOIL')}
                aeOil={watch('robAEOIL')}
                volOil={watch('robVOLOIL')}
              />
            )}
            {isFirstDeparture === null && (
               <div className="bg-gray-100 p-4 rounded animate-pulse">
                 <h4 className="font-semibold mb-2">Bunker ROB</h4>
                 <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                 <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                 {/* Add more placeholders if needed */}
               </div>
            )}
          </div>
           <FormField name="bunkerChiefEngineerRemarks" label="Chief Engineer Remarks (Bunker)" type="textarea" register={register} errors={errors} placeholder="Optional remarks..." />
        </div>

        {/* --- Engine/Machinery Section --- Replaced with component */}
        <EngineMachinerySection<ProcessedDepartureFormData>
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
            disabled={isSubmitting} // Disable cancel while submitting
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Departure Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DepartureReportForm;
