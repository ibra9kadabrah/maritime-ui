import React, { useState, FormEvent, ChangeEvent } from 'react';
import {
  DepartureReportFormData,
  defaultDepartureValues,
  departureValidationRules,
  VALIDATION_PATTERNS,
  FORM_STYLES // Import FORM_STYLES
} from './types/departureFormTypes';

// Define the shape of validation errors
interface FormErrors {
  [key: string]: string;
}

interface DepartureReportFormProps {
  onSubmit: (formData: any) => void; // Keep 'any' for now, or define a processed type
  onCancel: () => void;
}

const DepartureReportForm: React.FC<DepartureReportFormProps> = ({ onSubmit, onCancel }) => {
  // Initialize form state with default values (all strings)
  const [formData, setFormData] = useState<DepartureReportFormData>(defaultDepartureValues);

  // State for validation errors
  const [errors, setErrors] = useState<FormErrors>({});

  // State to track if form is submitting
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes with real-time filtering for specific fields
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let isValidInput = true;

    // Only apply filtering for text inputs (not selects, textareas, etc.)
    if (e.target.tagName === 'INPUT' && e.target.getAttribute('type') !== 'date' && e.target.getAttribute('type') !== 'time') {
      // --- Real-time Input Filtering ---
      // Text-only fields
      if (['departurePort', 'destinationPort', 'cargoType'].includes(name)) {
        const textRegex = VALIDATION_PATTERNS.TEXT_ONLY;
        if (value && !textRegex.test(value)) {
          isValidInput = false;
        }
      }

      // Integer-only fields
      else if (['faspCourse', 'windForce', 'seaState', 'swellHeight', 'prsRpm'].includes(name)) {
        const integerRegex = VALIDATION_PATTERNS.INTEGER_ONLY;
        if (value && !integerRegex.test(value)) {
          isValidInput = false;
        }
      }

      // Decimal number fields
      else if (['cargoQuantity', 'fwdDraft', 'aftDraft', 'faspLatitude', 'faspLongitude', 'harbourDistance', 'voyageDistance', 'meLSIFO', 'meLSMGO', 'meCYLOIL', 'meMEOIL', 'meAEOIL', 'boilerLSIFO', 'boilerLSMGO', 'auxLSIFO', 'auxLSMGO', 'harbourLSIFO', 'harbourLSMGO', 'supplyLSIFO', 'supplyLSMGO', 'supplyCYLOIL', 'supplyMEOIL', 'supplyAEOIL', 'supplyVOLOIL', 'engineLoadFOPressure', 'engineLoadLubOilPressure', 'engineLoadFWInletTemp', 'engineLoadLOInletTemp', 'engineLoadScavAirTemp', 'engineLoadTCRPM1', 'engineLoadTCRPM2', 'engineLoadTCExhTempIn', 'engineLoadTCExhTempOut', 'engineLoadThrustBearingTemp', 'engineLoadDailyRunHour', 'engineUnit1ExhaustTemp', 'engineUnit1UnderPistonAir', 'engineUnit1PCOOutlet', 'engineUnit1JCFWOutletTemp', 'engineUnit2ExhaustTemp', 'engineUnit2UnderPistonAir', 'engineUnit2PCOOutlet', 'engineUnit2JCFWOutletTemp', 'engineUnit3ExhaustTemp', 'engineUnit3UnderPistonAir', 'engineUnit3PCOOutlet', 'engineUnit3JCFWOutletTemp', 'engineUnit4ExhaustTemp', 'engineUnit4UnderPistonAir', 'engineUnit4PCOOutlet', 'engineUnit4JCFWOutletTemp', 'engineUnit5ExhaustTemp', 'engineUnit5UnderPistonAir', 'engineUnit5PCOOutlet', 'engineUnit5JCFWOutletTemp', 'engineUnit6ExhaustTemp', 'engineUnit6UnderPistonAir', 'engineUnit6PCOOutlet', 'engineUnit6JCFWOutletTemp', 'engineUnit7ExhaustTemp', 'engineUnit7UnderPistonAir', 'engineUnit7PCOOutlet', 'engineUnit7JCFWOutletTemp', 'engineUnit8ExhaustTemp', 'engineUnit8UnderPistonAir', 'engineUnit8PCOOutlet', 'engineUnit8JCFWOutletTemp', 'auxEngineDG1Load', 'auxEngineDG1KW', 'auxEngineDG1FOPress', 'auxEngineDG1LubOilPress', 'auxEngineDG1WaterTemp', 'auxEngineDG1DailyRunHour', 'auxEngineDG2Load', 'auxEngineDG2KW', 'auxEngineDG2FOPress', 'auxEngineDG2LubOilPress', 'auxEngineDG2WaterTemp', 'auxEngineDG2DailyRunHour', 'auxEngineDG3Load', 'auxEngineDG3KW', 'auxEngineDG3FOPress', 'auxEngineDG3LubOilPress', 'auxEngineDG3WaterTemp', 'auxEngineDG3DailyRunHour', 'auxEngineV1Load', 'auxEngineV1KW', 'auxEngineV1FOPress', 'auxEngineV1LubOilPress', 'auxEngineV1WaterTemp', 'auxEngineV1DailyRunHour'].includes(name)) {
        isValidInput = !value || VALIDATION_PATTERNS.NUMBER_ONLY.test(value);
      }

      // Time zone field
      else if (name === 'timeZone') {
        const timeZoneRegex = /^[+-]?\d{0,2}$/;
        if (value && !timeZoneRegex.test(value)) {
          isValidInput = false;
        }
      }
    }

    // Only update state if the input is valid or if it's not a filtered field
    if (isValidInput) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      // Clear error when user corrects the field by typing valid input
      if (errors[name]) {
         const currentError = validateField(name as keyof DepartureReportFormData, value);
         // Only clear the error if the current input is now valid according to rules
         if (!currentError) {
             setErrors(prev => ({
               ...prev,
               [name]: ''
             }));
         }
      }
    }
  };


  // Handle radio button changes
  const handleRadioChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error if exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate a single field based on rules
  const validateField = (name: keyof DepartureReportFormData, value: string): string => {
    const rules = departureValidationRules[name];
    if (!rules) return ''; // No rules for this field

    // Check required
    // Treat radio buttons slightly differently for required check
    if (name === 'cargoStatus') {
        if (rules.required && !value) { // Check if a value ('loaded' or 'ballast') is selected
            return rules.errorMessage;
        }
    } else if (rules.required && (!value || value.trim() === '')) {
        return rules.errorMessage;
    }


    // Skip other checks if not required and empty
    if (!value || value.trim() === '') {
      return '';
    }

    // Check pattern
    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.errorMessage;
    }

    // Check min/max for numeric fields
    if (rules.min !== undefined || rules.max !== undefined) {
      const numValue = parseFloat(value); // value is string here
      if (!isNaN(numValue)) { // Check if it's a valid number
        if (rules.min !== undefined && numValue < rules.min) {
          return rules.errorMessage;
        }
        if (rules.max !== undefined && numValue > rules.max) {
          return rules.errorMessage;
        }
      } else {
        // If pattern expected a number but parseFloat failed, it's an error
         if (rules.pattern === VALIDATION_PATTERNS.NUMBER_ONLY || rules.pattern === VALIDATION_PATTERNS.INTEGER_ONLY) {
             return rules.errorMessage; // Or a more specific "Must be a valid number"
         }
      }
    }


    // Check custom validation
    if (rules.custom && !rules.custom(value)) {
      return rules.errorMessage;
    }

    return '';
  };


  // Validate entire form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Check each field with its validation rules
    (Object.keys(departureValidationRules) as Array<keyof DepartureReportFormData>).forEach((key) => {
      // Ensure formData has the key before validating, especially for optional fields
      const value = formData[key] ?? ''; // Use empty string if undefined
      const error = validateField(key, value);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Calculate distance to go (handle potential NaN)
  const calculateDistanceToGo = () => {
    const voyDist = parseFloat(formData.voyageDistance);
    const harbDist = parseFloat(formData.harbourDistance);
    return (!isNaN(voyDist) && !isNaN(harbDist)) ? (voyDist - harbDist).toFixed(1) : '';
  };
  const distanceToGo = calculateDistanceToGo();

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (validateForm()) {
      const finalData: any = {};
      (Object.keys(defaultDepartureValues) as Array<keyof DepartureReportFormData>).forEach(key => {
          const value = formData[key] ?? '';
          const rules = departureValidationRules[key];
          if (rules?.pattern === VALIDATION_PATTERNS.NUMBER_ONLY || rules?.pattern === VALIDATION_PATTERNS.LATITUDE || rules?.pattern === VALIDATION_PATTERNS.LONGITUDE) {
              finalData[key] = parseFloat(value) || 0;
          } else if (rules?.pattern === VALIDATION_PATTERNS.INTEGER_ONLY) {
              finalData[key] = parseInt(value) || 0;
          } else {
              finalData[key] = value;
          }
          if (finalData[key] === '' && rules && !rules.required) {
              delete finalData[key];
          }
      });
      onSubmit(finalData);
    } else {
      console.log("Form validation failed", errors);
      setIsSubmitting(false);
      const firstErrorEl = document.querySelector('.border-red-500');
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // --- Styling Helpers ---
  const getInputClassName = (fieldName: keyof DepartureReportFormData | string, isReadOnly: boolean = false) => {
    const fieldKey = fieldName as keyof DepartureReportFormData;
    const baseClass = isReadOnly ? FORM_STYLES.READONLY_INPUT : FORM_STYLES.EDITABLE_INPUT;
    const borderClass = errors[fieldKey] ? FORM_STYLES.ERROR_BORDER : FORM_STYLES.NORMAL_BORDER;
    // Ensure the base border color is replaced correctly, handle potential undefined fieldName for readOnly pseudo-keys
    const cleanBaseClass = baseClass.replace(/border-gray-300/g, '');
    return `${cleanBaseClass} ${borderClass}`;
  };

  const renderError = (fieldName: keyof DepartureReportFormData) => {
    return errors[fieldName] ? <p className="text-xs text-red-500 mt-1">{errors[fieldName]}</p> : null;
  };

  // --- Render ---
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Departure Report</h2>
      <form onSubmit={handleSubmit} noValidate>

        {/* General Information Section */}
        <div className="mb-6">
           <h3 className="font-bold border-b pb-2 mb-4">General Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Read-only fields */}
            <div><label className="block text-sm font-medium mb-1">M/V (Vessel)</label><input type="text" className={getInputClassName('vessel' as any, true)} value="NORTHERN STAR" readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div>
            <div><label className="block text-sm font-medium mb-1">Flag</label><input type="text" className={getInputClassName('flag' as any, true)} value="PANAMA" readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div>
            <div><label className="block text-sm font-medium mb-1">Captain</label><input type="text" className={getInputClassName('captain' as any, true)} value="JOHN SMITH" readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div>
            <div><label className="block text-sm font-medium mb-1">Voyage #</label><input type="text" className={getInputClassName('voyage' as any, true)} value="04/2025" readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div>
            <div><label className="block text-sm font-medium mb-1">BLS Quantity</label><input type="text" className={getInputClassName('blsQuantity' as any, true)} value="32500" readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div>
            {/* Editable fields */}
            <div><label className="block text-sm font-medium mb-1">Date <span className="text-red-500">*</span></label><input type="date" name="date" value={formData.date} onChange={handleChange} className={getInputClassName('date')} />{renderError('date')}</div>
            <div><label className="block text-sm font-medium mb-1">Zone +/- <span className="text-red-500">*</span></label><input type="text" name="timeZone" value={formData.timeZone} onChange={handleChange} className={getInputClassName('timeZone')} placeholder="e.g. +3 or -5" />{renderError('timeZone')}</div>
            <div><label className="block text-sm font-medium mb-1">Cargo Type <span className="text-red-500">*</span></label><input type="text" name="cargoType" value={formData.cargoType} onChange={handleChange} className={getInputClassName('cargoType')} placeholder="e.g. CONTAINERS" />{renderError('cargoType')}</div>
            <div><label className="block text-sm font-medium mb-1">Cargo Quantity (MT) <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="cargoQuantity" value={formData.cargoQuantity} onChange={handleChange} className={getInputClassName('cargoQuantity')} placeholder="e.g. 32500" />{renderError('cargoQuantity')}</div>
            <div><label className="block text-sm font-medium mb-1">FWD Draft (M) <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="fwdDraft" value={formData.fwdDraft} onChange={handleChange} className={getInputClassName('fwdDraft')} />{renderError('fwdDraft')}</div>
            <div><label className="block text-sm font-medium mb-1">AFT Draft (M) <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="aftDraft" value={formData.aftDraft} onChange={handleChange} className={getInputClassName('aftDraft')} />{renderError('aftDraft')}</div>
            <div><label className="block text-sm font-medium mb-1">Departure Port <span className="text-red-500">*</span></label><input type="text" name="departurePort" value={formData.departurePort} onChange={handleChange} className={getInputClassName('departurePort')} placeholder="e.g. ROTTERDAM" />{renderError('departurePort')}</div>
            <div><label className="block text-sm font-medium mb-1">Destination Port <span className="text-red-500">*</span></label><input type="text" name="destinationPort" value={formData.destinationPort} onChange={handleChange} className={getInputClassName('destinationPort')} placeholder="e.g. SINGAPORE" />{renderError('destinationPort')}</div>
          </div>
        </div>

        {/* Voyage Information Section */}
        <div className="mb-6">
           <h3 className="font-bold border-b pb-2 mb-4">Voyage Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">ETA Date <span className="text-red-500">*</span></label><input type="date" name="etaDate" value={formData.etaDate} onChange={handleChange} className={getInputClassName('etaDate')} />{renderError('etaDate')}</div>
            <div><label className="block text-sm font-medium mb-1">ETA Time (HH) <span className="text-red-500">*</span></label><input type="time" name="etaTime" value={formData.etaTime} onChange={handleChange} className={getInputClassName('etaTime')} />{renderError('etaTime')}</div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Cargo Status <span className="text-red-500">*</span></label>
              <div className="flex space-x-4 mt-2">
                <label className="inline-flex items-center"><input type="radio" name="cargoStatus" value="loaded" checked={formData.cargoStatus === 'loaded'} onChange={handleRadioChange} className="mr-2" /> <span>Loaded</span></label>
                <label className="inline-flex items-center"><input type="radio" name="cargoStatus" value="ballast" checked={formData.cargoStatus === 'ballast'} onChange={handleRadioChange} className="mr-2" /> <span>Ballast</span></label>
              </div>
              {renderError('cargoStatus')}
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
               <div><label className="block text-sm font-medium mb-1">Date <span className="text-red-500">*</span></label><input type="date" name="faspDate" value={formData.faspDate} onChange={handleChange} className={getInputClassName('faspDate')} />{renderError('faspDate')}</div>
               <div><label className="block text-sm font-medium mb-1">Time <span className="text-red-500">*</span></label><input type="time" name="faspTime" value={formData.faspTime} onChange={handleChange} className={getInputClassName('faspTime')} />{renderError('faspTime')}</div>
               <div>
                 <label className="block text-sm font-medium mb-1">Latitude <span className="text-red-500">*</span></label>
                 <div className="flex"><input type="text" inputMode="decimal" name="faspLatitude" value={formData.faspLatitude} onChange={handleChange} className={getInputClassName('faspLatitude', false).replace('rounded', 'rounded-l')} placeholder="e.g. 51.9244" /><select name="faspLatitudeDir" value={formData.faspLatitudeDir} onChange={handleChange} className={`p-2 border bg-white border-l-0 rounded-r ${errors.faspLatitudeDir ? FORM_STYLES.ERROR_BORDER : FORM_STYLES.NORMAL_BORDER}`}><option value="N">N</option><option value="S">S</option></select></div>{renderError('faspLatitude') || renderError('faspLatitudeDir')}
               </div>
               <div>
                 <label className="block text-sm font-medium mb-1">Longitude <span className="text-red-500">*</span></label>
                 <div className="flex"><input type="text" inputMode="decimal" name="faspLongitude" value={formData.faspLongitude} onChange={handleChange} className={getInputClassName('faspLongitude', false).replace('rounded', 'rounded-l')} placeholder="e.g. 4.4777" /><select name="faspLongitudeDir" value={formData.faspLongitudeDir} onChange={handleChange} className={`p-2 border bg-white border-l-0 rounded-r ${errors.faspLongitudeDir ? FORM_STYLES.ERROR_BORDER : FORM_STYLES.NORMAL_BORDER}`}><option value="E">E</option><option value="W">W</option></select></div>{renderError('faspLongitude') || renderError('faspLongitudeDir')}
               </div>
               <div><label className="block text-sm font-medium mb-1">Course <span className="text-red-500">*</span></label><input type="text" inputMode="numeric" name="faspCourse" value={formData.faspCourse} onChange={handleChange} className={getInputClassName('faspCourse')} />{renderError('faspCourse')}</div>
             </div>
           </div>
           {/* Harbour Steaming */}
           <div className="bg-gray-50 p-4 rounded mb-4">
             <h4 className="font-bold mb-2">Harbour Steaming</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div><label className="block text-sm font-medium mb-1">Harbour Distance (NM) <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="harbourDistance" value={formData.harbourDistance} onChange={handleChange} className={getInputClassName('harbourDistance')} />{renderError('harbourDistance')}</div>
               <div><label className="block text-sm font-medium mb-1">Harbour Time (HH:MM) <span className="text-red-500">*</span></label><input type="time" name="harbourTime" value={formData.harbourTime} onChange={handleChange} className={getInputClassName('harbourTime')} />{renderError('harbourTime')}</div>
             </div>
           </div>
           {/* Voyage Distance */}
           <div className="bg-gray-50 p-4 rounded mb-4">
             <h4 className="font-bold mb-2">Voyage Distance</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div><label className="block text-sm font-medium mb-1">Voyage Distance (NM) <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="voyageDistance" value={formData.voyageDistance} onChange={handleChange} className={getInputClassName('voyageDistance')} />{renderError('voyageDistance')}</div>
               <div><label className="block text-sm font-medium mb-1">Distance To Go (NM)</label><input type="text" className={getInputClassName('distanceToGo' as any, true)} value={distanceToGo} readOnly /><p className="text-xs text-gray-500 mt-1">Calculated</p></div>
             </div>
           </div>
           {/* Weather Data */}
            <div className="bg-gray-50 p-4 rounded mb-4">
             <h4 className="font-bold mb-2">Weather Data</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div><label className="block text-sm font-medium mb-1">Wind Direction <span className="text-red-500">*</span></label><select name="windDirection" value={formData.windDirection} onChange={handleChange} className={getInputClassName('windDirection')}><option value="">Select</option><option value="N">N</option><option value="NE">NE</option><option value="E">E</option><option value="SE">SE</option><option value="S">S</option><option value="SW">SW</option><option value="W">W</option><option value="NW">NW</option></select>{renderError('windDirection')}</div>
               <div><label className="block text-sm font-medium mb-1">Wind Force (0-12) <span className="text-red-500">*</span></label><input type="text" inputMode="numeric" name="windForce" value={formData.windForce} onChange={handleChange} className={getInputClassName('windForce')} />{renderError('windForce')}</div>
               <div><label className="block text-sm font-medium mb-1">Sea Direction <span className="text-red-500">*</span></label><select name="seaDirection" value={formData.seaDirection} onChange={handleChange} className={getInputClassName('seaDirection')}><option value="">Select</option><option value="N">N</option><option value="NE">NE</option><option value="E">E</option><option value="SE">SE</option><option value="S">S</option><option value="SW">SW</option><option value="W">W</option><option value="NW">NW</option></select>{renderError('seaDirection')}</div>
               <div><label className="block text-sm font-medium mb-1">Sea State (0-9) <span className="text-red-500">*</span></label><input type="text" inputMode="numeric" name="seaState" value={formData.seaState} onChange={handleChange} className={getInputClassName('seaState')} />{renderError('seaState')}</div>
               <div><label className="block text-sm font-medium mb-1">Swell Direction <span className="text-red-500">*</span></label><select name="swellDirection" value={formData.swellDirection} onChange={handleChange} className={getInputClassName('swellDirection')}><option value="">Select</option><option value="N">N</option><option value="NE">NE</option><option value="E">E</option><option value="SE">SE</option><option value="S">S</option><option value="SW">SW</option><option value="W">W</option><option value="NW">NW</option></select>{renderError('swellDirection')}</div>
               <div><label className="block text-sm font-medium mb-1">Swell Height (0-9) <span className="text-red-500">*</span></label><input type="text" inputMode="numeric" name="swellHeight" value={formData.swellHeight} onChange={handleChange} className={getInputClassName('swellHeight')} />{renderError('swellHeight')}</div>
             </div>
           </div>
           {/* Captain Remarks */}
           <div><label className="block text-sm font-medium mb-1">Captain Remarks</label><textarea name="captainRemarks" value={formData.captainRemarks} onChange={handleChange} className={`${getInputClassName('captainRemarks')} h-24`} placeholder="Optional remarks..."></textarea>{renderError('captainRemarks')}</div>
        </div>

        {/* --- Bunker Section --- */}
        <div className="mb-6">
          <h3 className="font-bold border-b pb-2 mb-4">Bunker Data</h3>
          <div className="mb-4"><label className="block text-sm font-medium mb-1">PRS RPM <span className="text-red-500">*</span></label><input type="text" inputMode="numeric" name="prsRpm" value={formData.prsRpm} onChange={handleChange} className={getInputClassName('prsRpm')} />{renderError('prsRpm')}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
            <div className="bg-gray-50 p-4 rounded"><h4 className="font-semibold mb-2">Main Engine Consumption</h4><div className="space-y-2"><div><label className="text-sm">LSIFO <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="meLSIFO" value={formData.meLSIFO} onChange={handleChange} className={getInputClassName('meLSIFO')} />{renderError('meLSIFO')}</div><div><label className="text-sm">LSMGO <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="meLSMGO" value={formData.meLSMGO} onChange={handleChange} className={getInputClassName('meLSMGO')} />{renderError('meLSMGO')}</div><div><label className="text-sm">CYL OIL <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="meCYLOIL" value={formData.meCYLOIL} onChange={handleChange} className={getInputClassName('meCYLOIL')} />{renderError('meCYLOIL')}</div><div><label className="text-sm">M/E OIL <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="meMEOIL" value={formData.meMEOIL} onChange={handleChange} className={getInputClassName('meMEOIL')} />{renderError('meMEOIL')}</div><div><label className="text-sm">A/E OIL <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="meAEOIL" value={formData.meAEOIL} onChange={handleChange} className={getInputClassName('meAEOIL')} />{renderError('meAEOIL')}</div></div></div>
            <div className="bg-gray-50 p-4 rounded"><h4 className="font-semibold mb-2">Boiler Consumption</h4><div className="space-y-2"><div><label className="text-sm">LSIFO <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="boilerLSIFO" value={formData.boilerLSIFO} onChange={handleChange} className={getInputClassName('boilerLSIFO')} />{renderError('boilerLSIFO')}</div><div><label className="text-sm">LSMGO <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="boilerLSMGO" value={formData.boilerLSMGO} onChange={handleChange} className={getInputClassName('boilerLSMGO')} />{renderError('boilerLSMGO')}</div></div></div>
            <div className="bg-gray-50 p-4 rounded"><h4 className="font-semibold mb-2">Aux Consumption</h4><div className="space-y-2"><div><label className="text-sm">LSIFO <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="auxLSIFO" value={formData.auxLSIFO} onChange={handleChange} className={getInputClassName('auxLSIFO')} />{renderError('auxLSIFO')}</div><div><label className="text-sm">LSMGO <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="auxLSMGO" value={formData.auxLSMGO} onChange={handleChange} className={getInputClassName('auxLSMGO')} />{renderError('auxLSMGO')}</div></div></div>
            <div className="bg-gray-50 p-4 rounded"><h4 className="font-semibold mb-2">Harbour Consumption</h4><div className="space-y-2"><div><label className="text-sm">LSIFO <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="harbourLSIFO" value={formData.harbourLSIFO} onChange={handleChange} className={getInputClassName('harbourLSIFO')} />{renderError('harbourLSIFO')}</div><div><label className="text-sm">LSMGO <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="harbourLSMGO" value={formData.harbourLSMGO} onChange={handleChange} className={getInputClassName('harbourLSMGO')} />{renderError('harbourLSMGO')}</div></div></div>
            <div className="bg-gray-50 p-4 rounded"><h4 className="font-semibold mb-2">Bunker Supply (Optional)</h4><div className="space-y-2"><div><label className="text-sm">LSIFO</label><input type="text" inputMode="decimal" name="supplyLSIFO" value={formData.supplyLSIFO} onChange={handleChange} className={getInputClassName('supplyLSIFO')} />{renderError('supplyLSIFO')}</div><div><label className="text-sm">LSMGO</label><input type="text" inputMode="decimal" name="supplyLSMGO" value={formData.supplyLSMGO} onChange={handleChange} className={getInputClassName('supplyLSMGO')} />{renderError('supplyLSMGO')}</div><div><label className="text-sm">CYL OIL</label><input type="text" inputMode="decimal" name="supplyCYLOIL" value={formData.supplyCYLOIL} onChange={handleChange} className={getInputClassName('supplyCYLOIL')} />{renderError('supplyCYLOIL')}</div><div><label className="text-sm">M/E OIL</label><input type="text" inputMode="decimal" name="supplyMEOIL" value={formData.supplyMEOIL} onChange={handleChange} className={getInputClassName('supplyMEOIL')} />{renderError('supplyMEOIL')}</div><div><label className="text-sm">A/E OIL</label><input type="text" inputMode="decimal" name="supplyAEOIL" value={formData.supplyAEOIL} onChange={handleChange} className={getInputClassName('supplyAEOIL')} />{renderError('supplyAEOIL')}</div><div><label className="text-sm">VOL OIL</label><input type="text" inputMode="decimal" name="supplyVOLOIL" value={formData.supplyVOLOIL} onChange={handleChange} className={getInputClassName('supplyVOLOIL')} />{renderError('supplyVOLOIL')}</div></div></div>
            <div className="bg-gray-50 p-4 rounded"><h4 className="font-semibold mb-2">Bunker ROB</h4><p className="text-xs text-gray-500 mb-2">Read only</p><div className="space-y-2"><div><label className="text-sm">LSIFO</label><input type="text" className={getInputClassName('robLSIFO' as any, true)} value={formData.robLSIFO || 'N/A'} readOnly /></div><div><label className="text-sm">LSMGO</label><input type="text" className={getInputClassName('robLSMGO' as any, true)} value={formData.robLSMGO || 'N/A'} readOnly /></div><div><label className="text-sm">CYL OIL</label><input type="text" className={getInputClassName('robCYLOIL' as any, true)} value={formData.robCYLOIL || 'N/A'} readOnly /></div><div><label className="text-sm">M/E OIL</label><input type="text" className={getInputClassName('robMEOIL' as any, true)} value={formData.robMEOIL || 'N/A'} readOnly /></div><div><label className="text-sm">A/E OIL</label><input type="text" className={getInputClassName('robAEOIL' as any, true)} value={formData.robAEOIL || 'N/A'} readOnly /></div><div><label className="text-sm">VOL OIL</label><input type="text" className={getInputClassName('robVOLOIL' as any, true)} value={formData.robVOLOIL || 'N/A'} readOnly /></div></div></div>
          </div>
           <div><label className="block text-sm font-medium mb-1">Chief Engineer Remarks (Bunker)</label><textarea name="bunkerChiefEngineerRemarks" value={formData.bunkerChiefEngineerRemarks} onChange={handleChange} className={`${getInputClassName('bunkerChiefEngineerRemarks')} h-24`} placeholder="Optional remarks..."></textarea>{renderError('bunkerChiefEngineerRemarks')}</div>
        </div>

        {/* --- Engine/Machinery Section --- */}
        <div className="mb-6">
          <h3 className="font-bold border-b pb-2 mb-4">Engine/Machinery Data</h3>
          <div className="bg-gray-50 p-4 rounded mb-4"><h4 className="font-semibold mb-2">Main Engine Parameters</h4><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"><div><label className="text-sm">FO Pressure <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="engineLoadFOPressure" value={formData.engineLoadFOPressure} onChange={handleChange} className={getInputClassName('engineLoadFOPressure')} />{renderError('engineLoadFOPressure')}</div><div><label className="text-sm">Lub Oil Pressure <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="engineLoadLubOilPressure" value={formData.engineLoadLubOilPressure} onChange={handleChange} className={getInputClassName('engineLoadLubOilPressure')} />{renderError('engineLoadLubOilPressure')}</div><div><label className="text-sm">FW Inlet Temp <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="engineLoadFWInletTemp" value={formData.engineLoadFWInletTemp} onChange={handleChange} className={getInputClassName('engineLoadFWInletTemp')} />{renderError('engineLoadFWInletTemp')}</div><div><label className="text-sm">LO Inlet Temp <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="engineLoadLOInletTemp" value={formData.engineLoadLOInletTemp} onChange={handleChange} className={getInputClassName('engineLoadLOInletTemp')} />{renderError('engineLoadLOInletTemp')}</div><div><label className="text-sm">Scavenge Air Temp <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="engineLoadScavAirTemp" value={formData.engineLoadScavAirTemp} onChange={handleChange} className={getInputClassName('engineLoadScavAirTemp')} />{renderError('engineLoadScavAirTemp')}</div><div><label className="text-sm">TC RPM #1 <span className="text-red-500">*</span></label><input type="text" inputMode="numeric" name="engineLoadTCRPM1" value={formData.engineLoadTCRPM1} onChange={handleChange} className={getInputClassName('engineLoadTCRPM1')} />{renderError('engineLoadTCRPM1')}</div><div><label className="text-sm">TC RPM #2</label><input type="text" inputMode="numeric" name="engineLoadTCRPM2" value={formData.engineLoadTCRPM2} onChange={handleChange} className={getInputClassName('engineLoadTCRPM2')} />{renderError('engineLoadTCRPM2')}</div><div><label className="text-sm">TC Exhaust Temp In <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="engineLoadTCExhTempIn" value={formData.engineLoadTCExhTempIn} onChange={handleChange} className={getInputClassName('engineLoadTCExhTempIn')} />{renderError('engineLoadTCExhTempIn')}</div><div><label className="text-sm">TC Exhaust Temp Out <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="engineLoadTCExhTempOut" value={formData.engineLoadTCExhTempOut} onChange={handleChange} className={getInputClassName('engineLoadTCExhTempOut')} />{renderError('engineLoadTCExhTempOut')}</div><div><label className="text-sm">Thrust Bearing Temp <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="engineLoadThrustBearingTemp" value={formData.engineLoadThrustBearingTemp} onChange={handleChange} className={getInputClassName('engineLoadThrustBearingTemp')} />{renderError('engineLoadThrustBearingTemp')}</div><div><label className="text-sm">Daily Run Hour <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="engineLoadDailyRunHour" value={formData.engineLoadDailyRunHour} onChange={handleChange} className={getInputClassName('engineLoadDailyRunHour')} />{renderError('engineLoadDailyRunHour')}</div></div></div>
           <div className="bg-gray-50 p-4 rounded mb-4 overflow-x-auto"><h4 className="font-semibold mb-2">Engine Units</h4><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-100"><tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit #</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exhaust Temp <span className="text-red-500">*</span></th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Under Piston Air <span className="text-red-500">*</span></th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P.C.O Outlet <span className="text-red-500">*</span></th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">J.C.F.W Outlet Temp <span className="text-red-500">*</span></th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{[1, 2, 3, 4, 5, 6, 7, 8].map(unitNum => { const isOptional = unitNum > 6; const exhaustTempName = `engineUnit${unitNum}ExhaustTemp` as keyof DepartureReportFormData; const underPistonAirName = `engineUnit${unitNum}UnderPistonAir` as keyof DepartureReportFormData; const pcoOutletName = `engineUnit${unitNum}PCOOutlet` as keyof DepartureReportFormData; const jcfwOutletTempName = `engineUnit${unitNum}JCFWOutletTemp` as keyof DepartureReportFormData; return (<tr key={unitNum}><td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Unit #{unitNum} {isOptional && '(Optional)'}</td><td className="px-4 py-2"><input type="text" inputMode="decimal" name={exhaustTempName} value={formData[exhaustTempName]} onChange={handleChange} className={getInputClassName(exhaustTempName)} />{renderError(exhaustTempName)}</td><td className="px-4 py-2"><input type="text" inputMode="decimal" name={underPistonAirName} value={formData[underPistonAirName]} onChange={handleChange} className={getInputClassName(underPistonAirName)} />{renderError(underPistonAirName)}</td><td className="px-4 py-2"><input type="text" inputMode="decimal" name={pcoOutletName} value={formData[pcoOutletName]} onChange={handleChange} className={getInputClassName(pcoOutletName)} />{renderError(pcoOutletName)}</td><td className="px-4 py-2"><input type="text" inputMode="decimal" name={jcfwOutletTempName} value={formData[jcfwOutletTempName]} onChange={handleChange} className={getInputClassName(jcfwOutletTempName)} />{renderError(jcfwOutletTempName)}</td></tr>);})}</tbody></table></div>
            <div className="bg-gray-50 p-4 rounded mb-4 overflow-x-auto"><h4 className="font-semibold mb-2">Auxiliary Engines</h4><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-100"><tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">A/E#</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Load <span className="text-red-500">*</span></th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KW <span className="text-red-500">*</span></th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FO Press <span className="text-red-500">*</span></th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lub Oil Press <span className="text-red-500">*</span></th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Water Temp <span className="text-red-500">*</span></th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Run Hour <span className="text-red-500">*</span></th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{['DG1', 'DG2', 'DG3', 'V1'].map(aeId => { const isOptional = aeId !== 'DG1'; const loadName = `auxEngine${aeId}Load` as keyof DepartureReportFormData; const kwName = `auxEngine${aeId}KW` as keyof DepartureReportFormData; const foPressName = `auxEngine${aeId}FOPress` as keyof DepartureReportFormData; const lubOilPressName = `auxEngine${aeId}LubOilPress` as keyof DepartureReportFormData; const waterTempName = `auxEngine${aeId}WaterTemp` as keyof DepartureReportFormData; const dailyRunHourName = `auxEngine${aeId}DailyRunHour` as keyof DepartureReportFormData; return (<tr key={aeId}><td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{aeId} {isOptional && '(Optional)'}</td><td className="px-4 py-2"><input type="text" inputMode="decimal" name={loadName} value={formData[loadName]} onChange={handleChange} className={getInputClassName(loadName)} />{renderError(loadName)}</td><td className="px-4 py-2"><input type="text" inputMode="decimal" name={kwName} value={formData[kwName]} onChange={handleChange} className={getInputClassName(kwName)} />{renderError(kwName)}</td><td className="px-4 py-2"><input type="text" inputMode="decimal" name={foPressName} value={formData[foPressName]} onChange={handleChange} className={getInputClassName(foPressName)} />{renderError(foPressName)}</td><td className="px-4 py-2"><input type="text" inputMode="decimal" name={lubOilPressName} value={formData[lubOilPressName]} onChange={handleChange} className={getInputClassName(lubOilPressName)} />{renderError(lubOilPressName)}</td><td className="px-4 py-2"><input type="text" inputMode="decimal" name={waterTempName} value={formData[waterTempName]} onChange={handleChange} className={getInputClassName(waterTempName)} />{renderError(waterTempName)}</td><td className="px-4 py-2"><input type="text" inputMode="decimal" name={dailyRunHourName} value={formData[dailyRunHourName]} onChange={handleChange} className={getInputClassName(dailyRunHourName)} />{renderError(dailyRunHourName)}</td></tr>);})}</tbody></table></div>
           <div><label className="block text-sm font-medium mb-1">Chief Engineer Remarks (Engine)</label><textarea name="engineChiefEngineerRemarks" value={formData.engineChiefEngineerRemarks} onChange={handleChange} className={`${getInputClassName('engineChiefEngineerRemarks')} h-24`} placeholder="Optional remarks..."></textarea>{renderError('engineChiefEngineerRemarks')}</div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2 mt-8">
          <button
            type="button"
            className="px-4 py-2 border rounded hover:bg-gray-100 transition-colors"
            onClick={onCancel}
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
