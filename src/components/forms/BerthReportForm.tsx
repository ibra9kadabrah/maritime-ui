import React, { useState, FormEvent, ChangeEvent } from 'react';
import {
  BerthReportFormData,
  defaultBerthValues,
  berthValidationRules,
  VALIDATION_PATTERNS,
  FORM_STYLES
  // ValidationRules generic type is defined but not directly used here
} from './types/berthFormTypes'; // Updated Import

// Define the shape of validation errors
interface FormErrors {
  [key: string]: string;
}

interface BerthReportFormProps {
  onSubmit: (formData: any) => void; // Keep 'any' for now
  onCancel: () => void;
}

const BerthReportForm: React.FC<BerthReportFormProps> = ({ onSubmit, onCancel }) => {
  // Use Berth types and defaults
  const [formData, setFormData] = useState<BerthReportFormData>(defaultBerthValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TODO: Fetch or determine actual cargo status from voyage data
  const [cargoStatus, setCargoStatus] = useState<'loaded' | 'ballast'>('loaded'); // Keep simulation for now

  // --- Validation and Handler Functions (Adapted from Arrival/Departure) ---

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let isValidInput = true;

    // --- Real-time Input Filtering (Adapted for Berth) ---
    if (e.target.tagName === 'INPUT' && e.target.getAttribute('type') !== 'date' && e.target.getAttribute('type') !== 'time') {
      // Integer-only fields for Berth Report
      if (['windForce', 'seaState', 'swellHeight', 'engineLoadTCRPM1', 'engineLoadTCRPM2'].includes(name)) { // Removed prsRpm if not needed
         const integerRegex = VALIDATION_PATTERNS.INTEGER_ONLY;
         if (value && !integerRegex.test(value)) {
           isValidInput = false;
         }
      }
      // Decimal number fields for Berth Report
      else if ([
        'fwdDraft', 'aftDraft', 'faspLatitude', 'faspLongitude', // Berth position fields
        // Cargo Ops fields
        'cargoUnloadedMT', 'cargoLoadedMT',
        // Bunker fields (Simplified)
        'boilerLSIFO', 'boilerLSMGO', 'auxLSIFO', 'auxLSMGO', 'harbourLSIFO', 'harbourLSMGO',
        'supplyLSIFO', 'supplyLSMGO', 'supplyCYLOIL', 'supplyMEOIL', 'supplyAEOIL', 'supplyVOLOIL',
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
      // Text only fields (Example: berthNumber might allow alphanumeric)
      // else if (['berthNumber'].includes(name)) {
      //   // Add specific regex if needed, otherwise allow any text
      // }
    }

    // Only update state if the input is valid
    if (isValidInput) {
      setFormData(prev => ({ ...prev, [name]: value }));
      // Clear error when user corrects the field
      if (errors[name]) {
        const currentError = validateField(name as keyof BerthReportFormData, value);
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

  // Validate a single field based on Berth rules
  const validateField = (name: keyof BerthReportFormData, value: string): string => {
    const rules = berthValidationRules[name];
    if (!rules) return '';

    if (rules.required && (!value || value.trim() === '')) {
      return rules.errorMessage;
    }
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

  // Validate the entire form based on Berth rules
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;
    (Object.keys(berthValidationRules) as Array<keyof BerthReportFormData>).forEach((key) => {
      const value = formData[key] ?? '';
      const error = validateField(key, value);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });
    // TODO: Add conditional validation for Cargo Ops based on cargoStatus
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
      (Object.keys(defaultBerthValues) as Array<keyof BerthReportFormData>).forEach(key => {
        const value = formData[key] ?? '';
        const rules = berthValidationRules[key];
        if (formData.hasOwnProperty(key)) {
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
        }
      });
      console.log('Berth report processed data:', finalData);
      onSubmit(finalData);
    } else {
      console.log("Berth Form validation failed", errors);
      setIsSubmitting(false);
      const firstErrorEl = document.querySelector('.border-red-500');
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // --- Styling Helpers ---
  const getInputClassName = (fieldName: keyof BerthReportFormData, isReadOnly: boolean = false) => {
    const baseClass = isReadOnly ? FORM_STYLES.READONLY_INPUT : FORM_STYLES.EDITABLE_INPUT;
    const borderClass = errors[fieldName] ? FORM_STYLES.ERROR_BORDER : FORM_STYLES.NORMAL_BORDER;
    const cleanBaseClass = baseClass.replace(/border-gray-300/g, '');
    return `${cleanBaseClass} ${borderClass}`;
  };

  const renderError = (fieldName: keyof BerthReportFormData) => {
    return errors[fieldName] ? <p className="text-xs text-red-500 mt-1">{errors[fieldName]}</p> : null;
  };


  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Berth Report</h2>
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
            <div><label className="block text-sm font-medium mb-1">Port</label><input type="text" className={getInputClassName('port' as any, true)} value="SINGAPORE" readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div>

            {/* Editable fields */}
            <div><label className="block text-sm font-medium mb-1">Date <span className="text-red-500">*</span></label><input type="date" name="date" value={formData.date} onChange={handleChange} className={getInputClassName('date')} />{renderError('date')}</div>
            <div><label className="block text-sm font-medium mb-1">Zone +/- <span className="text-red-500">*</span></label><input type="text" name="timeZone" value={formData.timeZone} onChange={handleChange} className={getInputClassName('timeZone')} placeholder="e.g. +3 or -10" />{renderError('timeZone')}</div>
            <div><label className="block text-sm font-medium mb-1">Berth Number <span className="text-red-500">*</span></label><input type="text" name="berthNumber" value={formData.berthNumber} onChange={handleChange} className={getInputClassName('berthNumber')} placeholder="e.g. B12" />{renderError('berthNumber')}</div>
            <div><label className="block text-sm font-medium mb-1">FWD Draft (M) <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="fwdDraft" value={formData.fwdDraft} onChange={handleChange} className={getInputClassName('fwdDraft')} />{renderError('fwdDraft')}</div>
            <div><label className="block text-sm font-medium mb-1">AFT Draft (M) <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="aftDraft" value={formData.aftDraft} onChange={handleChange} className={getInputClassName('aftDraft')} />{renderError('aftDraft')}</div>
          </div>
        </div>

        {/* Navigation Data Section (Berth Specific) - Connected */}
        <div className="mb-6">
           <h3 className="font-bold border-b pb-2 mb-4">Navigation Data</h3>
           {/* Berth Position */}
           <div className="bg-blue-50 p-4 rounded mb-4">
             <h4 className="font-bold mb-2">Berth Position & Time</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div><label className="block text-sm font-medium mb-1">Date <span className="text-red-500">*</span></label><input type="date" name="faspDate" value={formData.faspDate} onChange={handleChange} className={getInputClassName('faspDate')} />{renderError('faspDate')}</div>
               <div><label className="block text-sm font-medium mb-1">Time <span className="text-red-500">*</span></label><input type="time" name="faspTime" value={formData.faspTime} onChange={handleChange} className={getInputClassName('faspTime')} />{renderError('faspTime')}</div>
               <div>
                 <label className="block text-sm font-medium mb-1">Latitude <span className="text-red-500">*</span></label>
                 <div className="flex"><input type="text" inputMode="decimal" name="faspLatitude" value={formData.faspLatitude} onChange={handleChange} className={getInputClassName('faspLatitude').replace('rounded', 'rounded-l')} placeholder="e.g. 1.290" /><select name="faspLatitudeDir" value={formData.faspLatitudeDir} onChange={handleChange} className={`p-2 border bg-white border-l-0 rounded-r ${errors.faspLatitudeDir ? FORM_STYLES.ERROR_BORDER : FORM_STYLES.NORMAL_BORDER}`}><option value="N">N</option><option value="S">S</option></select></div>{renderError('faspLatitude')}
               </div>
               <div>
                 <label className="block text-sm font-medium mb-1">Longitude <span className="text-red-500">*</span></label>
                 <div className="flex"><input type="text" inputMode="decimal" name="faspLongitude" value={formData.faspLongitude} onChange={handleChange} className={getInputClassName('faspLongitude').replace('rounded', 'rounded-l')} placeholder="e.g. 103.851" /><select name="faspLongitudeDir" value={formData.faspLongitudeDir} onChange={handleChange} className={`p-2 border bg-white border-l-0 rounded-r ${errors.faspLongitudeDir ? FORM_STYLES.ERROR_BORDER : FORM_STYLES.NORMAL_BORDER}`}><option value="E">E</option><option value="W">W</option></select></div>{renderError('faspLongitude')}
               </div>
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
           <div><label className="block text-sm font-medium mb-1">Captain Remarks (Navigation/Weather)</label><textarea name="captainRemarks" value={formData.captainRemarks} onChange={handleChange} className={`${getInputClassName('captainRemarks')} h-24`} placeholder="Optional remarks..."></textarea>{renderError('captainRemarks')}</div>
        </div>

        {/* Cargo Operations Section - Connected */}
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
                  <div><label className="block text-sm font-medium mb-1">Cargo Unloaded (MT)</label><input type="text" inputMode="decimal" name="cargoUnloadedMT" value={formData.cargoUnloadedMT} onChange={handleChange} className={getInputClassName('cargoUnloadedMT')} />{renderError('cargoUnloadedMT')}</div>
                  <div><label className="block text-sm font-medium mb-1">Remaining Cargo (MT)</label><input type="text" className={getInputClassName('remainingCargo' as any, true)} readOnly /><p className="text-xs text-gray-500 mt-1">Calculated</p></div>
                  <div><label className="block text-sm font-medium mb-1">Unloading Start</label><div className="grid grid-cols-2 gap-2"><input type="date" name="unloadingStartDate" value={formData.unloadingStartDate} onChange={handleChange} className={getInputClassName('unloadingStartDate')} /> <input type="time" name="unloadingStartTime" value={formData.unloadingStartTime} onChange={handleChange} className={getInputClassName('unloadingStartTime')} /></div>{renderError('unloadingStartDate')}{renderError('unloadingStartTime')}</div>
                  <div><label className="block text-sm font-medium mb-1">Unloading End</label><div className="grid grid-cols-2 gap-2"><input type="date" name="unloadingEndDate" value={formData.unloadingEndDate} onChange={handleChange} className={getInputClassName('unloadingEndDate')} /> <input type="time" name="unloadingEndTime" value={formData.unloadingEndTime} onChange={handleChange} className={getInputClassName('unloadingEndTime')} /></div>{renderError('unloadingEndDate')}{renderError('unloadingEndTime')}</div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-4 rounded border">
                <h5 className="font-medium mb-3">Cargo Loading</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Cargo Type</label><input type="text" className={getInputClassName('cargoType' as any, true)} value="CONTAINERS" readOnly /><p className="text-xs text-gray-500 mt-1">Read only</p></div> {/* Assuming type comes from voyage */}
                  <div><label className="block text-sm font-medium mb-1">Cargo Loaded (MT)</label><input type="text" inputMode="decimal" name="cargoLoadedMT" value={formData.cargoLoadedMT} onChange={handleChange} className={getInputClassName('cargoLoadedMT')} />{renderError('cargoLoadedMT')}</div>
                  <div><label className="block text-sm font-medium mb-1">Loading Start</label><div className="grid grid-cols-2 gap-2"><input type="date" name="loadingStartDate" value={formData.loadingStartDate} onChange={handleChange} className={getInputClassName('loadingStartDate')} /> <input type="time" name="loadingStartTime" value={formData.loadingStartTime} onChange={handleChange} className={getInputClassName('loadingStartTime')} /></div>{renderError('loadingStartDate')}{renderError('loadingStartTime')}</div>
                  <div><label className="block text-sm font-medium mb-1">Loading End</label><div className="grid grid-cols-2 gap-2"><input type="date" name="loadingEndDate" value={formData.loadingEndDate} onChange={handleChange} className={getInputClassName('loadingEndDate')} /> <input type="time" name="loadingEndTime" value={formData.loadingEndTime} onChange={handleChange} className={getInputClassName('loadingEndTime')} /></div>{renderError('loadingEndDate')}{renderError('loadingEndTime')}</div>
                </div>
              </div>
            )}
          </div>
          <div><label className="block text-sm font-medium mb-1">Cargo Operations Remarks</label><textarea name="cargoOpsRemarks" value={formData.cargoOpsRemarks} onChange={handleChange} className={`${getInputClassName('cargoOpsRemarks')} h-24`} placeholder="Optional remarks..."></textarea>{renderError('cargoOpsRemarks')}</div>
        </div>

        {/* --- Bunker Section --- Connected (Simplified) */}
        <div className="mb-6">
          <h3 className="font-bold border-b pb-2 mb-4">Bunker Data</h3>
          {/* PRS RPM removed */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
            {/* ME Consumption removed */}
            <div className="bg-gray-50 p-4 rounded"><h4 className="font-semibold mb-2">Boiler Consumption</h4><div className="space-y-2"><div><label className="text-sm">LSIFO <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="boilerLSIFO" value={formData.boilerLSIFO} onChange={handleChange} className={getInputClassName('boilerLSIFO')} />{renderError('boilerLSIFO')}</div><div><label className="text-sm">LSMGO <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="boilerLSMGO" value={formData.boilerLSMGO} onChange={handleChange} className={getInputClassName('boilerLSMGO')} />{renderError('boilerLSMGO')}</div></div></div>
            <div className="bg-gray-50 p-4 rounded"><h4 className="font-semibold mb-2">Aux Consumption</h4><div className="space-y-2"><div><label className="text-sm">LSIFO <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="auxLSIFO" value={formData.auxLSIFO} onChange={handleChange} className={getInputClassName('auxLSIFO')} />{renderError('auxLSIFO')}</div><div><label className="text-sm">LSMGO <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="auxLSMGO" value={formData.auxLSMGO} onChange={handleChange} className={getInputClassName('auxLSMGO')} />{renderError('auxLSMGO')}</div></div></div>
            <div className="bg-gray-50 p-4 rounded"><h4 className="font-semibold mb-2">Harbour Consumption</h4><div className="space-y-2"><div><label className="text-sm">LSIFO <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="harbourLSIFO" value={formData.harbourLSIFO} onChange={handleChange} className={getInputClassName('harbourLSIFO')} />{renderError('harbourLSIFO')}</div><div><label className="text-sm">LSMGO <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="harbourLSMGO" value={formData.harbourLSMGO} onChange={handleChange} className={getInputClassName('harbourLSMGO')} />{renderError('harbourLSMGO')}</div></div></div>
            <div className="bg-gray-50 p-4 rounded"><h4 className="font-semibold mb-2">Bunker Supply (Optional)</h4><div className="space-y-2"><div><label className="text-sm">LSIFO</label><input type="text" inputMode="decimal" name="supplyLSIFO" value={formData.supplyLSIFO} onChange={handleChange} className={getInputClassName('supplyLSIFO')} />{renderError('supplyLSIFO')}</div><div><label className="text-sm">LSMGO</label><input type="text" inputMode="decimal" name="supplyLSMGO" value={formData.supplyLSMGO} onChange={handleChange} className={getInputClassName('supplyLSMGO')} />{renderError('supplyLSMGO')}</div><div><label className="text-sm">CYL OIL</label><input type="text" inputMode="decimal" name="supplyCYLOIL" value={formData.supplyCYLOIL} onChange={handleChange} className={getInputClassName('supplyCYLOIL')} />{renderError('supplyCYLOIL')}</div><div><label className="text-sm">M/E OIL</label><input type="text" inputMode="decimal" name="supplyMEOIL" value={formData.supplyMEOIL} onChange={handleChange} className={getInputClassName('supplyMEOIL')} />{renderError('supplyMEOIL')}</div><div><label className="text-sm">A/E OIL</label><input type="text" inputMode="decimal" name="supplyAEOIL" value={formData.supplyAEOIL} onChange={handleChange} className={getInputClassName('supplyAEOIL')} />{renderError('supplyAEOIL')}</div><div><label className="text-sm">VOL OIL</label><input type="text" inputMode="decimal" name="supplyVOLOIL" value={formData.supplyVOLOIL} onChange={handleChange} className={getInputClassName('supplyVOLOIL')} />{renderError('supplyVOLOIL')}</div></div></div>
            <div className="bg-gray-50 p-4 rounded"><h4 className="font-semibold mb-2">Bunker ROB</h4><p className="text-xs text-gray-500 mb-2">Read only</p><div className="space-y-2"><div><label className="text-sm">LSIFO</label><input type="text" className={getInputClassName('robLSIFO' as any, true)} value={'N/A'} readOnly /></div><div><label className="text-sm">LSMGO</label><input type="text" className={getInputClassName('robLSMGO' as any, true)} value={'N/A'} readOnly /></div><div><label className="text-sm">CYL OIL</label><input type="text" className={getInputClassName('robCYLOIL' as any, true)} value={'N/A'} readOnly /></div><div><label className="text-sm">M/E OIL</label><input type="text" className={getInputClassName('robMEOIL' as any, true)} value={'N/A'} readOnly /></div><div><label className="text-sm">A/E OIL</label><input type="text" className={getInputClassName('robAEOIL' as any, true)} value={'N/A'} readOnly /></div><div><label className="text-sm">VOL OIL</label><input type="text" className={getInputClassName('robVOLOIL' as any, true)} value={'N/A'} readOnly /></div></div></div>
          </div>
           <div><label className="block text-sm font-medium mb-1">Chief Engineer Remarks (Bunker)</label><textarea name="bunkerChiefEngineerRemarks" value={formData.bunkerChiefEngineerRemarks} onChange={handleChange} className={`${getInputClassName('bunkerChiefEngineerRemarks')} h-24`} placeholder="Optional remarks..."></textarea>{renderError('bunkerChiefEngineerRemarks')}</div>
        </div>

        {/* --- Engine/Machinery Section --- Connected */}
        <div className="mb-6">
          <h3 className="font-bold border-b pb-2 mb-4">Engine/Machinery Data</h3>
          <div className="bg-gray-50 p-4 rounded mb-4"><h4 className="font-semibold mb-2">Main Engine Parameters</h4><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"><div><label className="text-sm">FO Pressure <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="engineLoadFOPressure" value={formData.engineLoadFOPressure} onChange={handleChange} className={getInputClassName('engineLoadFOPressure')} />{renderError('engineLoadFOPressure')}</div><div><label className="text-sm">Lub Oil Pressure <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="engineLoadLubOilPressure" value={formData.engineLoadLubOilPressure} onChange={handleChange} className={getInputClassName('engineLoadLubOilPressure')} />{renderError('engineLoadLubOilPressure')}</div><div><label className="text-sm">FW Inlet Temp <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="engineLoadFWInletTemp" value={formData.engineLoadFWInletTemp} onChange={handleChange} className={getInputClassName('engineLoadFWInletTemp')} />{renderError('engineLoadFWInletTemp')}</div><div><label className="text-sm">LO Inlet Temp <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="engineLoadLOInletTemp" value={formData.engineLoadLOInletTemp} onChange={handleChange} className={getInputClassName('engineLoadLOInletTemp')} />{renderError('engineLoadLOInletTemp')}</div><div><label className="text-sm">Scavenge Air Temp <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="engineLoadScavAirTemp" value={formData.engineLoadScavAirTemp} onChange={handleChange} className={getInputClassName('engineLoadScavAirTemp')} />{renderError('engineLoadScavAirTemp')}</div><div><label className="text-sm">TC RPM #1 <span className="text-red-500">*</span></label><input type="text" inputMode="numeric" name="engineLoadTCRPM1" value={formData.engineLoadTCRPM1} onChange={handleChange} className={getInputClassName('engineLoadTCRPM1')} />{renderError('engineLoadTCRPM1')}</div><div><label className="text-sm">TC RPM #2</label><input type="text" inputMode="numeric" name="engineLoadTCRPM2" value={formData.engineLoadTCRPM2} onChange={handleChange} className={getInputClassName('engineLoadTCRPM2')} />{renderError('engineLoadTCRPM2')}</div><div><label className="text-sm">TC Exhaust Temp In <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="engineLoadTCExhTempIn" value={formData.engineLoadTCExhTempIn} onChange={handleChange} className={getInputClassName('engineLoadTCExhTempIn')} />{renderError('engineLoadTCExhTempIn')}</div><div><label className="text-sm">TC Exhaust Temp Out <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="engineLoadTCExhTempOut" value={formData.engineLoadTCExhTempOut} onChange={handleChange} className={getInputClassName('engineLoadTCExhTempOut')} />{renderError('engineLoadTCExhTempOut')}</div><div><label className="text-sm">Thrust Bearing Temp <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="engineLoadThrustBearingTemp" value={formData.engineLoadThrustBearingTemp} onChange={handleChange} className={getInputClassName('engineLoadThrustBearingTemp')} />{renderError('engineLoadThrustBearingTemp')}</div><div><label className="text-sm">Daily Run Hour <span className="text-red-500">*</span></label><input type="text" inputMode="decimal" name="engineLoadDailyRunHour" value={formData.engineLoadDailyRunHour} onChange={handleChange} className={getInputClassName('engineLoadDailyRunHour')} />{renderError('engineLoadDailyRunHour')}</div></div></div>
           <div className="bg-gray-50 p-4 rounded mb-4 overflow-x-auto"><h4 className="font-semibold mb-2">Engine Units</h4><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-100"><tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit #</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exhaust Temp <span className="text-red-500">*</span></th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Under Piston Air <span className="text-red-500">*</span></th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P.C.O Outlet <span className="text-red-500">*</span></th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">J.C.F.W Outlet Temp <span className="text-red-500">*</span></th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{[1, 2, 3, 4, 5, 6, 7, 8].map(unitNum => { const isOptional = unitNum > 6; const exhaustTempName = `engineUnit${unitNum}ExhaustTemp` as keyof BerthReportFormData; const underPistonAirName = `engineUnit${unitNum}UnderPistonAir` as keyof BerthReportFormData; const pcoOutletName = `engineUnit${unitNum}PCOOutlet` as keyof BerthReportFormData; const jcfwOutletTempName = `engineUnit${unitNum}JCFWOutletTemp` as keyof BerthReportFormData; return (<tr key={unitNum}><td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Unit #{unitNum} {isOptional && '(Optional)'}</td><td className="px-4 py-2"><input type="text" inputMode="decimal" name={exhaustTempName} value={formData[exhaustTempName]} onChange={handleChange} className={getInputClassName(exhaustTempName)} />{renderError(exhaustTempName)}</td><td className="px-4 py-2"><input type="text" inputMode="decimal" name={underPistonAirName} value={formData[underPistonAirName]} onChange={handleChange} className={getInputClassName(underPistonAirName)} />{renderError(underPistonAirName)}</td><td className="px-4 py-2"><input type="text" inputMode="decimal" name={pcoOutletName} value={formData[pcoOutletName]} onChange={handleChange} className={getInputClassName(pcoOutletName)} />{renderError(pcoOutletName)}</td><td className="px-4 py-2"><input type="text" inputMode="decimal" name={jcfwOutletTempName} value={formData[jcfwOutletTempName]} onChange={handleChange} className={getInputClassName(jcfwOutletTempName)} />{renderError(jcfwOutletTempName)}</td></tr>);})}</tbody></table></div>
            <div className="bg-gray-50 p-4 rounded mb-4 overflow-x-auto"><h4 className="font-semibold mb-2">Auxiliary Engines</h4><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-100"><tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">A/E#</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Load <span className="text-red-500">*</span></th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KW <span className="text-red-500">*</span></th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FO Press <span className="text-red-500">*</span></th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lub Oil Press <span className="text-red-500">*</span></th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Water Temp <span className="text-red-500">*</span></th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Run Hour <span className="text-red-500">*</span></th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{['DG1', 'DG2', 'DG3', 'V1'].map(aeId => { const isOptional = aeId !== 'DG1'; const loadName = `auxEngine${aeId}Load` as keyof BerthReportFormData; const kwName = `auxEngine${aeId}KW` as keyof BerthReportFormData; const foPressName = `auxEngine${aeId}FOPress` as keyof BerthReportFormData; const lubOilPressName = `auxEngine${aeId}LubOilPress` as keyof BerthReportFormData; const waterTempName = `auxEngine${aeId}WaterTemp` as keyof BerthReportFormData; const dailyRunHourName = `auxEngine${aeId}DailyRunHour` as keyof BerthReportFormData; return (<tr key={aeId}><td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{aeId} {isOptional && '(Optional)'}</td><td className="px-4 py-2"><input type="text" inputMode="decimal" name={loadName} value={formData[loadName]} onChange={handleChange} className={getInputClassName(loadName)} />{renderError(loadName)}</td><td className="px-4 py-2"><input type="text" inputMode="decimal" name={kwName} value={formData[kwName]} onChange={handleChange} className={getInputClassName(kwName)} />{renderError(kwName)}</td><td className="px-4 py-2"><input type="text" inputMode="decimal" name={foPressName} value={formData[foPressName]} onChange={handleChange} className={getInputClassName(foPressName)} />{renderError(foPressName)}</td><td className="px-4 py-2"><input type="text" inputMode="decimal" name={lubOilPressName} value={formData[lubOilPressName]} onChange={handleChange} className={getInputClassName(lubOilPressName)} />{renderError(lubOilPressName)}</td><td className="px-4 py-2"><input type="text" inputMode="decimal" name={waterTempName} value={formData[waterTempName]} onChange={handleChange} className={getInputClassName(waterTempName)} />{renderError(waterTempName)}</td><td className="px-4 py-2"><input type="text" inputMode="decimal" name={dailyRunHourName} value={formData[dailyRunHourName]} onChange={handleChange} className={getInputClassName(dailyRunHourName)} />{renderError(dailyRunHourName)}</td></tr>);})}</tbody></table></div>
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
          {isSubmitting ? 'Submitting...' : 'Submit Berth Report'}
        </button>
      </div>
      </form>
    </div>
  );
};

export default BerthReportForm;
