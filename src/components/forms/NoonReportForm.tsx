import React, { useState, FormEvent, ChangeEvent } from 'react';
import {
  NoonReportFormData,
  defaultNoonValues,
  noonValidationRules,
  VALIDATION_PATTERNS,
  FORM_STYLES
  // ValidationRules generic type is defined but not directly used here
} from './types/noonFormTypes'; // Updated Import

// Define the shape of validation errors
interface FormErrors {
  [key: string]: string;
}

interface NoonReportFormProps {
  onSubmit: (formData: any) => void; // Keep 'any' for now
  onCancel: () => void;
}

const NoonReportForm: React.FC<NoonReportFormProps> = ({ onSubmit, onCancel }) => {
  // Use Noon types and defaults
  const [formData, setFormData] = useState<NoonReportFormData>(defaultNoonValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for passage state selection
  const [passageState, setPassageState] = useState<'noon' | 'sosp' | 'rosp'>('noon');
  // --- Simulation Placeholder ---
  // TODO: Replace this with actual logic based on fetched previous report data
  const [previousReportWasSOSP, setPreviousReportWasSOSP] = useState(false);
  // --- End Simulation Placeholder ---


  // --- Validation and Handler Functions (Adapted for Noon) ---

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let isValidInput = true;

    // --- Real-time Input Filtering (Adapted for Noon) ---
    if (e.target.tagName === 'INPUT' && e.target.getAttribute('type') !== 'date' && e.target.getAttribute('type') !== 'time') {
      // Integer-only fields for Noon Report
      if (['prsRpm', 'windForce', 'seaState', 'swellHeight', 'course', 'engineLoadTCRPM1', 'engineLoadTCRPM2'].includes(name)) {
         const integerRegex = VALIDATION_PATTERNS.INTEGER_ONLY;
         if (value && !integerRegex.test(value)) {
           isValidInput = false;
         }
      }
      // Decimal number fields for Noon Report
      else if ([
        'fwdDraft', 'aftDraft', 'positionLatitude', 'positionLongitude', 'distanceSinceLastReport',
        // SOSP/ROSP optional fields
        'sospRosPLatitude', 'sospRosPLongitude',
        // Bunker fields (No Harbour)
        'meLSIFO', 'meLSMGO', 'meCYLOIL', 'meMEOIL', 'meAEOIL', 'boilerLSIFO', 'boilerLSMGO',
        'auxLSIFO', 'auxLSMGO', 'supplyLSIFO', 'supplyLSMGO',
        'supplyCYLOIL', 'supplyMEOIL', 'supplyAEOIL', 'supplyVOLOIL',
        // Engine fields (Copied)
        'engineLoadFOPressure', 'engineLoadLubOilPressure', 'engineLoadFWInletTemp', 'engineLoadLOInletTemp',
        'engineLoadScavAirTemp', 'engineLoadTCExhTempIn', 'engineLoadTCExhTempOut',
        'engineLoadThrustBearingTemp', 'engineLoadDailyRunHour',
        // Engine Units
        'engineUnit1ExhaustTemp', 'engineUnit1UnderPistonAir', 'engineUnit1PCOOutlet', 'engineUnit1JCFWOutletTemp',
        'engineUnit2ExhaustTemp', 'engineUnit2UnderPistonAir', 'engineUnit2PCOOutlet', 'engineUnit2JCFWOutletTemp',
        'engineUnit3ExhaustTemp', 'engineUnit3UnderPistonAir', 'engineUnit3PCOOutlet', 'engineUnit3JCFWOutletTemp',
        'engineUnit4ExhaustTemp', 'engineUnit4UnderPistonAir', 'engineUnit4PCOOutlet', 'engineUnit4JCFWOutletTemp',
        'engineUnit5ExhaustTemp', 'engineUnit5UnderPistonAir', 'engineUnit5PCOOutlet', 'engineUnit5JCFWOutletTemp',
        'engineUnit6ExhaustTemp', 'engineUnit6UnderPistonAir', 'engineUnit6PCOOutlet', 'engineUnit6JCFWOutletTemp',
        'engineUnit7ExhaustTemp', 'engineUnit7UnderPistonAir', 'engineUnit7PCOOutlet', 'engineUnit7JCFWOutletTemp',
        'engineUnit8ExhaustTemp', 'engineUnit8UnderPistonAir', 'engineUnit8PCOOutlet', 'engineUnit8JCFWOutletTemp',
        // Aux Engines
        'auxEngineDG1Load', 'auxEngineDG1KW', 'auxEngineDG1FOPress', 'auxEngineDG1LubOilPress', 'auxEngineDG1WaterTemp', 'auxEngineDG1DailyRunHour',
        'auxEngineDG2Load', 'auxEngineDG2KW', 'auxEngineDG2FOPress', 'auxEngineDG2LubOilPress', 'auxEngineDG2WaterTemp', 'auxEngineDG2DailyRunHour',
        'auxEngineDG3Load', 'auxEngineDG3KW', 'auxEngineDG3FOPress', 'auxEngineDG3LubOilPress', 'auxEngineDG3WaterTemp', 'auxEngineDG3DailyRunHour',
        'auxEngineV1Load', 'auxEngineV1KW', 'auxEngineV1FOPress', 'auxEngineV1LubOilPress', 'auxEngineV1WaterTemp', 'auxEngineV1DailyRunHour'
      ].includes(name)) {
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

    // Only update state if the input is valid
    if (isValidInput) {
      setFormData(prev => ({ ...prev, [name]: value }));
      // Clear error when user corrects the field
      if (errors[name]) {
        const currentError = validateField(name as keyof NoonReportFormData, value);
        if (!currentError) {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
          });
        }
      }
    }
  };

   // Handle radio button changes specifically for passageState
   const handlePassageStateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newState = e.target.value as 'noon' | 'sosp' | 'rosp';
    setPassageState(newState);
    // Clear potential SOSP/ROSP detail errors when changing state
    const detailKeys: Array<keyof NoonReportFormData> = ['sospRosPDate', 'sospRosPTime', 'sospRosPLatitude', 'sospRosPLongitude'];
    setErrors(prev => {
        const newErrors = { ...prev };
        detailKeys.forEach(key => delete newErrors[key]);
        return newErrors;
    });
  };


  // Validate a single field based on Noon rules
  const validateField = (name: keyof NoonReportFormData, value: string): string => {
    const rules = noonValidationRules[name];
    if (!rules) return '';

    // Handle optional SOSP/ROSP fields only if the state matches
    if (name.startsWith('sospRosP') && passageState === 'noon') {
        return ''; // Don't validate SOSP/ROSP fields if state is Noon
    }

    if (rules.required && (!value || value.trim() === '')) {
      return rules.errorMessage;
    }
    // Skip other checks if not required and empty (and not a SOSP/ROSP field when state is Noon)
    if (!rules.required && (!value || value.trim() === '')) {
      return '';
    }
    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.errorMessage;
    }
    if (rules.min !== undefined || rules.max !== undefined) {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        if (rules.pattern === VALIDATION_PATTERNS.NUMBER_ONLY || rules.pattern === VALIDATION_PATTERNS.INTEGER_ONLY) {
          return rules.errorMessage;
        }
      } else {
        if (rules.min !== undefined && numValue < rules.min) return rules.errorMessage;
        if (rules.max !== undefined && numValue > rules.max) return rules.errorMessage;
      }
    }
    if (rules.custom && !rules.custom(value)) {
      return rules.errorMessage;
    }
    return '';
  };

  // Validate the entire form based on Noon rules
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;
    (Object.keys(noonValidationRules) as Array<keyof NoonReportFormData>).forEach((key) => {
      // Skip SOSP/ROSP detail validation if state is Noon
      if (key.startsWith('sospRosP') && passageState === 'noon') {
          return;
      }
      const value = formData[key] ?? '';
      const error = validateField(key, value);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });
    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (validateForm()) {
      const finalData: any = {};
      // Process data: Convert numbers, remove empty optional fields
      (Object.keys(defaultNoonValues) as Array<keyof NoonReportFormData>).forEach(key => {
        const value = formData[key] ?? '';
        const rules = noonValidationRules[key];

        // Skip SOSP/ROSP details if state is Noon
        if (key.startsWith('sospRosP') && passageState === 'noon') {
            return;
        }

        if (formData.hasOwnProperty(key)) {
            if (rules?.pattern === VALIDATION_PATTERNS.NUMBER_ONLY || rules?.pattern === VALIDATION_PATTERNS.LATITUDE || rules?.pattern === VALIDATION_PATTERNS.LONGITUDE) {
                finalData[key] = parseFloat(value) || 0;
            } else if (rules?.pattern === VALIDATION_PATTERNS.INTEGER_ONLY || rules?.pattern === VALIDATION_PATTERNS.COURSE) { // Include Course here
                finalData[key] = parseInt(value) || 0;
            } else {
                finalData[key] = value;
            }
            if (finalData[key] === '' && rules && !rules.required) {
                delete finalData[key];
            }
        }
      });
      // Add the selected passage state
      finalData.passageState = passageState;

      console.log('Noon report processed data:', finalData);
      onSubmit(finalData);
    } else {
      console.log("Noon Form validation failed", errors);
      setIsSubmitting(false);
      const firstErrorEl = document.querySelector('.border-red-500');
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // --- Styling Helpers ---
  const getInputClassName = (fieldName: keyof NoonReportFormData, isReadOnly: boolean = false) => {
    const baseClass = isReadOnly ? FORM_STYLES.READONLY_INPUT : FORM_STYLES.EDITABLE_INPUT;
    const borderClass = errors[fieldName] ? FORM_STYLES.ERROR_BORDER : FORM_STYLES.NORMAL_BORDER;
    const cleanBaseClass = baseClass.replace(/border-gray-300/g, '');
    return `${cleanBaseClass} ${borderClass}`;
  };

  const renderError = (fieldName: keyof NoonReportFormData) => {
    return errors[fieldName] ? <p className="text-xs text-red-500 mt-1">{errors[fieldName]}</p> : null;
  };


  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Noon Report</h2>
      <form onSubmit={handleSubmit} noValidate>

        {/* General Information Section - Connected */}
        <div className="mb-6">
          <h3 className="font-bold border-b pb-2 mb-4">General Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Read-only fields */}
            <div><label className="block text-sm font-medium mb-1">M/V (Vessel)</label><input type="text" className={getInputClassName('vessel' as any, true)} value="NORTHERN STAR" readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div>
            <div><label className="block text-sm font-medium mb-1">Flag</label><input type="text" className={getInputClassName('flag' as any, true)} value="PANAMA" readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div>
            <div><label className="block text-sm font-medium mb-1">Captain</label><input type="text" className={getInputClassName('captain' as any, true)} value="JOHN SMITH" readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div>
            <div><label className="block text-sm font-medium mb-1">Voyage #</label><input type="text" className={getInputClassName('voyage' as any, true)} value="04/2025" readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div>
            <div><label className="block text-sm font-medium mb-1">BLS Quantity</label><input type="text" className={getInputClassName('blsQuantity' as any, true)} value="32500" readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div>
            <div><label className="block text-sm font-medium mb-1">Cargo Type</label><input type="text" className={getInputClassName('cargoType' as any, true)} value="CONTAINERS" readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div>
            <div><label className="block text-sm font-medium mb-1">Cargo Quantity (MT)</label><input type="text" className={getInputClassName('cargoQuantity' as any, true)} value="32500" readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div>
            <div><label className="block text-sm font-medium mb-1">Departure Port</label><input type="text" className={getInputClassName('departurePort' as any, true)} value="ROTTERDAM" readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div>
            <div><label className="block text-sm font-medium mb-1">Destination Port</label><input type="text" className={getInputClassName('destinationPort' as any, true)} value="SINGAPORE" readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div>

            {/* Editable fields */}
            <div><label className="block text-sm font-medium mb-1">Date <span className="text-red-500">*</span></label><input type="date" name="date" value={formData.date} onChange={handleChange} className={getInputClassName('date')} />{renderError('date')}</div>
            <div><label className="block text-sm font-medium mb-1">Zone +/- <span className="text-red-500">*</span></label><input type="text" name="timeZone" value={formData.timeZone} onChange={handleChange} className={getInputClassName('timeZone')} placeholder="e.g. +3 or -10" />{renderError('timeZone')}</div>
            <div><label className="block text-sm font-medium mb-1">FWD Draft (M) <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="fwdDraft" value={formData.fwdDraft} onChange={handleChange} className={getInputClassName('fwdDraft')} />{renderError('fwdDraft')}</div>
            <div><label className="block text-sm font-medium mb-1">AFT Draft (M) <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="aftDraft" value={formData.aftDraft} onChange={handleChange} className={getInputClassName('aftDraft')} />{renderError('aftDraft')}</div>
          </div>
        </div>

        {/* Navigation Data Section - Connected */}
        <div className="mb-6">
          <h3 className="font-bold border-b pb-2 mb-4">Navigation Data</h3>

          {/* Passage State Selection */}
          <div className="bg-blue-50 p-4 rounded mb-4">
            <h4 className="font-bold mb-2">Passage State</h4>
            <div className="flex space-x-4">
               <label className={`inline-flex items-center ${previousReportWasSOSP ? 'cursor-not-allowed opacity-50' : ''}`}>
                 <input type="radio" name="passageState" value="noon" checked={passageState === 'noon'} onChange={handlePassageStateChange} className="mr-2" disabled={previousReportWasSOSP} /> Noon
               </label>
               <label className="inline-flex items-center">
                 <input type="radio" name="passageState" value="sosp" checked={passageState === 'sosp'} onChange={handlePassageStateChange} className="mr-2" /> SOSP (Stop)
               </label>
               <label className={`inline-flex items-center ${!previousReportWasSOSP ? 'cursor-not-allowed opacity-50' : ''}`}>
                 <input type="radio" name="passageState" value="rosp" checked={passageState === 'rosp'} onChange={handlePassageStateChange} className="mr-2" disabled={!previousReportWasSOSP} /> ROSP (Resume)
               </label>
            </div>
            {/* SOSP/ROSP details were removed as redundant */}
          </div>

          {/* Position Data - Connected */}
          <div className={`p-4 rounded mb-4 ${passageState === 'sosp' ? 'bg-red-50' : passageState === 'rosp' ? 'bg-green-50' : 'bg-gray-50'}`}>
            <h4 className="font-bold mb-2">{passageState === 'sosp' ? 'SOSP Position' : passageState === 'rosp' ? 'ROSP Position' : 'Noon Position'}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{passageState === 'sosp' ? 'SOSP Date' : passageState === 'rosp' ? 'ROSP Date' : 'Date'} <span className="text-red-500">*</span></label>
                <input type="date" name="positionDate" value={formData.positionDate} onChange={handleChange} className={getInputClassName('positionDate')} />{renderError('positionDate')}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{passageState === 'sosp' ? 'SOSP Time' : passageState === 'rosp' ? 'ROSP Time' : 'Time'} <span className="text-red-500">*</span></label>
                <input type="time" name="positionTime" value={formData.positionTime} onChange={handleChange} className={getInputClassName('positionTime')} />{renderError('positionTime')}
              </div>
              <div>
                 <label className="block text-sm font-medium mb-1">{passageState === 'sosp' ? 'SOSP Latitude' : passageState === 'rosp' ? 'ROSP Latitude' : 'Latitude'} <span className="text-red-500">*</span></label>
                <div className="flex">
                  <input type="text" inputMode="decimal" name="positionLatitude" value={formData.positionLatitude} onChange={handleChange} className={getInputClassName('positionLatitude').replace('rounded', 'rounded-l')} placeholder="e.g. 51.9244" />
                  <select name="positionLatitudeDir" value={formData.positionLatitudeDir} onChange={handleChange} className={`p-2 border bg-white border-l-0 rounded-r ${errors.positionLatitudeDir ? FORM_STYLES.ERROR_BORDER : FORM_STYLES.NORMAL_BORDER}`}>
                    <option value="N">N</option><option value="S">S</option>
                  </select>
                </div>
                {renderError('positionLatitude')}
              </div>
              <div>
                 <label className="block text-sm font-medium mb-1">{passageState === 'sosp' ? 'SOSP Longitude' : passageState === 'rosp' ? 'ROSP Longitude' : 'Longitude'} <span className="text-red-500">*</span></label>
                <div className="flex">
                  <input type="text" inputMode="decimal" name="positionLongitude" value={formData.positionLongitude} onChange={handleChange} className={getInputClassName('positionLongitude').replace('rounded', 'rounded-l')} placeholder="e.g. 4.4777" />
                  <select name="positionLongitudeDir" value={formData.positionLongitudeDir} onChange={handleChange} className={`p-2 border bg-white border-l-0 rounded-r ${errors.positionLongitudeDir ? FORM_STYLES.ERROR_BORDER : FORM_STYLES.NORMAL_BORDER}`}>
                    <option value="E">E</option><option value="W">W</option>
                  </select>
                </div>
                {renderError('positionLongitude')}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Course <span className="text-red-500">*</span></label>
                <input type="text" inputMode="numeric" name="course" value={formData.course} onChange={handleChange} className={getInputClassName('course')} />{renderError('course')}
              </div>
            </div>
          </div>

          {/* Distance Data - Connected */}
          <div className="bg-gray-50 p-4 rounded mb-4">
            <h4 className="font-bold mb-2">Distance Data</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Distance Since Last Report (NM) <span className="text-red-500">*</span></label>
                <input type="text" inputMode="decimal" name="distanceSinceLastReport" value={formData.distanceSinceLastReport} onChange={handleChange} className={getInputClassName('distanceSinceLastReport')} />
                {renderError('distanceSinceLastReport')}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Distance To Go (NM)</label>
                <input type="text" className={getInputClassName('distanceToGo' as any, true)} readOnly /* Value calculated */ />
                <p className="text-xs text-gray-500 mt-1">Calculated: Distance to go from previous report - Distance since Last.</p>
              </div>
            </div>
          </div>

          {/* Weather Data - Connected */}
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

          {/* Captain Remarks - Connected */}
          <div>
            <label className="block text-sm font-medium mb-1">Captain Remarks</label>
            <textarea
              name="captainRemarks"
              value={formData.captainRemarks}
              onChange={handleChange}
              className={`${getInputClassName('captainRemarks')} h-24`}
              placeholder="Optional remarks about navigation conditions..."
            ></textarea>
            {renderError('captainRemarks')}
          </div>
        </div>

        {/* --- Bunker Section --- Connected (No Harbour) */}
        <div className="mb-6">
          <h3 className="font-bold border-b pb-2 mb-4">Bunker Data</h3>
          <div className="mb-4"><label className="block text-sm font-medium mb-1">PRS RPM <span className="text-red-500">*</span></label><input type="text" inputMode="numeric" name="prsRpm" value={formData.prsRpm} onChange={handleChange} className={getInputClassName('prsRpm')} />{renderError('prsRpm')}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
            <div className="bg-gray-50 p-4 rounded"><h4 className="font-semibold mb-2">Main Engine Consumption</h4><div className="space-y-2"><div><label className="text-sm">LSIFO <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="meLSIFO" value={formData.meLSIFO} onChange={handleChange} className={getInputClassName('meLSIFO')} />{renderError('meLSIFO')}</div><div><label className="text-sm">LSMGO <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="meLSMGO" value={formData.meLSMGO} onChange={handleChange} className={getInputClassName('meLSMGO')} />{renderError('meLSMGO')}</div><div><label className="text-sm">CYL OIL <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="meCYLOIL" value={formData.meCYLOIL} onChange={handleChange} className={getInputClassName('meCYLOIL')} />{renderError('meCYLOIL')}</div><div><label className="text-sm">M/E OIL <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="meMEOIL" value={formData.meMEOIL} onChange={handleChange} className={getInputClassName('meMEOIL')} />{renderError('meMEOIL')}</div><div><label className="text-sm">A/E OIL <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="meAEOIL" value={formData.meAEOIL} onChange={handleChange} className={getInputClassName('meAEOIL')} />{renderError('meAEOIL')}</div></div></div>
            <div className="bg-gray-50 p-4 rounded"><h4 className="font-semibold mb-2">Boiler Consumption</h4><div className="space-y-2"><div><label className="text-sm">LSIFO <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="boilerLSIFO" value={formData.boilerLSIFO} onChange={handleChange} className={getInputClassName('boilerLSIFO')} />{renderError('boilerLSIFO')}</div><div><label className="text-sm">LSMGO <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="boilerLSMGO" value={formData.boilerLSMGO} onChange={handleChange} className={getInputClassName('boilerLSMGO')} />{renderError('boilerLSMGO')}</div></div></div>
            <div className="bg-gray-50 p-4 rounded"><h4 className="font-semibold mb-2">Aux Consumption</h4><div className="space-y-2"><div><label className="text-sm">LSIFO <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="auxLSIFO" value={formData.auxLSIFO} onChange={handleChange} className={getInputClassName('auxLSIFO')} />{renderError('auxLSIFO')}</div><div><label className="text-sm">LSMGO <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="auxLSMGO" value={formData.auxLSMGO} onChange={handleChange} className={getInputClassName('auxLSMGO')} />{renderError('auxLSMGO')}</div></div></div>
            {/* Harbour Consumption Removed */}
            <div className="bg-gray-50 p-4 rounded"><h4 className="font-semibold mb-2">Bunker Supply (Optional)</h4><div className="space-y-2"><div><label className="text-sm">LSIFO</label><input type="text" inputMode="decimal" name="supplyLSIFO" value={formData.supplyLSIFO} onChange={handleChange} className={getInputClassName('supplyLSIFO')} />{renderError('supplyLSIFO')}</div><div><label className="text-sm">LSMGO</label><input type="text" inputMode="decimal" name="supplyLSMGO" value={formData.supplyLSMGO} onChange={handleChange} className={getInputClassName('supplyLSMGO')} />{renderError('supplyLSMGO')}</div><div><label className="text-sm">CYL OIL</label><input type="text" inputMode="decimal" name="supplyCYLOIL" value={formData.supplyCYLOIL} onChange={handleChange} className={getInputClassName('supplyCYLOIL')} />{renderError('supplyCYLOIL')}</div><div><label className="text-sm">M/E OIL</label><input type="text" inputMode="decimal" name="supplyMEOIL" value={formData.supplyMEOIL} onChange={handleChange} className={getInputClassName('supplyMEOIL')} />{renderError('supplyMEOIL')}</div><div><label className="text-sm">A/E OIL</label><input type="text" inputMode="decimal" name="supplyAEOIL" value={formData.supplyAEOIL} onChange={handleChange} className={getInputClassName('supplyAEOIL')} />{renderError('supplyAEOIL')}</div><div><label className="text-sm">VOL OIL</label><input type="text" inputMode="decimal" name="supplyVOLOIL" value={formData.supplyVOLOIL} onChange={handleChange} className={getInputClassName('supplyVOLOIL')} />{renderError('supplyVOLOIL')}</div></div></div>
            <div className="bg-gray-50 p-4 rounded"><h4 className="font-semibold mb-2">Bunker ROB</h4><p className="text-xs text-gray-500 mb-2">Read only</p><div className="space-y-2"><div><label className="text-sm">LSIFO</label><input type="text" className={getInputClassName('robLSIFO' as any, true)} value={'N/A'} readOnly /></div><div><label className="text-sm">LSMGO</label><input type="text" className={getInputClassName('robLSMGO' as any, true)} value={'N/A'} readOnly /></div><div><label className="text-sm">CYL OIL</label><input type="text" className={getInputClassName('robCYLOIL' as any, true)} value={'N/A'} readOnly /></div><div><label className="text-sm">M/E OIL</label><input type="text" className={getInputClassName('robMEOIL' as any, true)} value={'N/A'} readOnly /></div><div><label className="text-sm">A/E OIL</label><input type="text" className={getInputClassName('robAEOIL' as any, true)} value={'N/A'} readOnly /></div><div><label className="text-sm">VOL OIL</label><input type="text" className={getInputClassName('robVOLOIL' as any, true)} value={'N/A'} readOnly /></div></div></div>
          </div>
           <div><label className="block text-sm font-medium mb-1">Chief Engineer Remarks (Bunker)</label><textarea name="bunkerChiefEngineerRemarks" value={formData.bunkerChiefEngineerRemarks} onChange={handleChange} className={`${getInputClassName('bunkerChiefEngineerRemarks')} h-24`} placeholder="Optional remarks..."></textarea>{renderError('bunkerChiefEngineerRemarks')}</div>
        </div>

        {/* --- Engine/Machinery Section --- Connected */}
        <div className="mb-6">
          <h3 className="font-bold border-b pb-2 mb-4">Engine/Machinery Data</h3>
          <div className="bg-gray-50 p-4 rounded mb-4"><h4 className="font-semibold mb-2">Main Engine Parameters</h4><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"><div><label className="text-sm">FO Pressure <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="engineLoadFOPressure" value={formData.engineLoadFOPressure} onChange={handleChange} className={getInputClassName('engineLoadFOPressure')} />{renderError('engineLoadFOPressure')}</div><div><label className="text-sm">Lub Oil Pressure <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="engineLoadLubOilPressure" value={formData.engineLoadLubOilPressure} onChange={handleChange} className={getInputClassName('engineLoadLubOilPressure')} />{renderError('engineLoadLubOilPressure')}</div><div><label className="text-sm">FW Inlet Temp <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="engineLoadFWInletTemp" value={formData.engineLoadFWInletTemp} onChange={handleChange} className={getInputClassName('engineLoadFWInletTemp')} />{renderError('engineLoadFWInletTemp')}</div><div><label className="text-sm">LO Inlet Temp <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="engineLoadLOInletTemp" value={formData.engineLoadLOInletTemp} onChange={handleChange} className={getInputClassName('engineLoadLOInletTemp')} />{renderError('engineLoadLOInletTemp')}</div><div><label className="text-sm">Scavenge Air Temp <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="engineLoadScavAirTemp" value={formData.engineLoadScavAirTemp} onChange={handleChange} className={getInputClassName('engineLoadScavAirTemp')} />{renderError('engineLoadScavAirTemp')}</div><div><label className="text-sm">TC RPM #1 <span className="text-red-500">*</span></label><input type="text" inputMode="numeric" name="engineLoadTCRPM1" value={formData.engineLoadTCRPM1} onChange={handleChange} className={getInputClassName('engineLoadTCRPM1')} />{renderError('engineLoadTCRPM1')}</div><div><label className="text-sm">TC RPM #2</label><input type="text" inputMode="numeric" name="engineLoadTCRPM2" value={formData.engineLoadTCRPM2} onChange={handleChange} className={getInputClassName('engineLoadTCRPM2')} />{renderError('engineLoadTCRPM2')}</div><div><label className="text-sm">TC Exhaust Temp In <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="engineLoadTCExhTempIn" value={formData.engineLoadTCExhTempIn} onChange={handleChange} className={getInputClassName('engineLoadTCExhTempIn')} />{renderError('engineLoadTCExhTempIn')}</div><div><label className="text-sm">TC Exhaust Temp Out <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="engineLoadTCExhTempOut" value={formData.engineLoadTCExhTempOut} onChange={handleChange} className={getInputClassName('engineLoadTCExhTempOut')} />{renderError('engineLoadTCExhTempOut')}</div><div><label className="text-sm">Thrust Bearing Temp <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="engineLoadThrustBearingTemp" value={formData.engineLoadThrustBearingTemp} onChange={handleChange} className={getInputClassName('engineLoadThrustBearingTemp')} />{renderError('engineLoadThrustBearingTemp')}</div><div><label className="text-sm">Daily Run Hour <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="engineLoadDailyRunHour" value={formData.engineLoadDailyRunHour} onChange={handleChange} className={getInputClassName('engineLoadDailyRunHour')} />{renderError('engineLoadDailyRunHour')}</div></div></div>
           <div className="bg-gray-50 p-4 rounded mb-4 overflow-x-auto"><h4 className="font-semibold mb-2">Engine Units</h4><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-100"><tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit #</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exhaust Temp <span className="text-red-500">*</span></th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Under Piston Air <span className="text-red-500">*</span></th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P.C.O Outlet <span className="text-red-500">*</span></th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">J.C.F.W Outlet Temp <span className="text-red-500">*</span></th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{[1, 2, 3, 4, 5, 6, 7, 8].map(unitNum => { const isOptional = unitNum > 6; const exhaustTempName = `engineUnit${unitNum}ExhaustTemp` as keyof NoonReportFormData; const underPistonAirName = `engineUnit${unitNum}UnderPistonAir` as keyof NoonReportFormData; const pcoOutletName = `engineUnit${unitNum}PCOOutlet` as keyof NoonReportFormData; const jcfwOutletTempName = `engineUnit${unitNum}JCFWOutletTemp` as keyof NoonReportFormData; return (<tr key={unitNum}><td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Unit #{unitNum} {isOptional && '(Optional)'}</td><td className="px-4 py-2"><input type="text" inputMode="decimal" name={exhaustTempName} value={formData[exhaustTempName]} onChange={handleChange} className={getInputClassName(exhaustTempName)} />{renderError(exhaustTempName)}</td><td className="px-4 py-2"><input type="text" inputMode="decimal" name={underPistonAirName} value={formData[underPistonAirName]} onChange={handleChange} className={getInputClassName(underPistonAirName)} />{renderError(underPistonAirName)}</td><td className="px-4 py-2"><input type="text" inputMode="decimal" name={pcoOutletName} value={formData[pcoOutletName]} onChange={handleChange} className={getInputClassName(pcoOutletName)} />{renderError(pcoOutletName)}</td><td className="px-4 py-2"><input type="text" inputMode="decimal" name={jcfwOutletTempName} value={formData[jcfwOutletTempName]} onChange={handleChange} className={getInputClassName(jcfwOutletTempName)} />{renderError(jcfwOutletTempName)}</td></tr>);})}</tbody></table></div>
            <div className="bg-gray-50 p-4 rounded mb-4 overflow-x-auto"><h4 className="font-semibold mb-2">Auxiliary Engines</h4><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-100"><tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">A/E#</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Load <span className="text-red-500">*</span></th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KW <span className="text-red-500">*</span></th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FO Press <span className="text-red-500">*</span></th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lub Oil Press <span className="text-red-500">*</span></th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Water Temp <span className="text-red-500">*</span></th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Run Hour <span className="text-red-500">*</span></th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{['DG1', 'DG2', 'DG3', 'V1'].map(aeId => { const isOptional = aeId !== 'DG1'; const loadName = `auxEngine${aeId}Load` as keyof NoonReportFormData; const kwName = `auxEngine${aeId}KW` as keyof NoonReportFormData; const foPressName = `auxEngine${aeId}FOPress` as keyof NoonReportFormData; const lubOilPressName = `auxEngine${aeId}LubOilPress` as keyof NoonReportFormData; const waterTempName = `auxEngine${aeId}WaterTemp` as keyof NoonReportFormData; const dailyRunHourName = `auxEngine${aeId}DailyRunHour` as keyof NoonReportFormData; return (<tr key={aeId}><td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{aeId} {isOptional && '(Optional)'}</td><td className="px-4 py-2"><input type="text" inputMode="decimal" name={loadName} value={formData[loadName]} onChange={handleChange} className={getInputClassName(loadName)} />{renderError(loadName)}</td><td className="px-4 py-2"><input type="text" inputMode="decimal" name={kwName} value={formData[kwName]} onChange={handleChange} className={getInputClassName(kwName)} />{renderError(kwName)}</td><td className="px-4 py-2"><input type="text" inputMode="decimal" name={foPressName} value={formData[foPressName]} onChange={handleChange} className={getInputClassName(foPressName)} />{renderError(foPressName)}</td><td className="px-4 py-2"><input type="text" inputMode="decimal" name={lubOilPressName} value={formData[lubOilPressName]} onChange={handleChange} className={getInputClassName(lubOilPressName)} />{renderError(lubOilPressName)}</td><td className="px-4 py-2"><input type="text" inputMode="decimal" name={waterTempName} value={formData[waterTempName]} onChange={handleChange} className={getInputClassName(waterTempName)} />{renderError(waterTempName)}</td><td className="px-4 py-2"><input type="text" inputMode="decimal" name={dailyRunHourName} value={formData[dailyRunHourName]} onChange={handleChange} className={getInputClassName(dailyRunHourName)} />{renderError(dailyRunHourName)}</td></tr>);})}</tbody></table></div>
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
          {isSubmitting ? 'Submitting...' : 'Submit Noon Report'}
        </button>
      </div>
      </form>
    </div>
  );
};

export default NoonReportForm;
