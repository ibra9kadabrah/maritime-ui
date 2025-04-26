import React from 'react';
import { UseFormRegister, FieldErrors, Control, FieldValues, Path, FieldError } from 'react-hook-form'; // Import FieldError
import FormField from '../../ui/FormField';
import { POSITIVE_DECIMAL_ONLY, INTEGER_ONLY } from '../../../utils/validationPatterns';
// Removed specific form type import - will use generics

// Define props required by the component using generics
// T should extend FieldValues and ideally contain all possible engine/machinery fields
interface EngineMachinerySectionProps<T extends FieldValues> {
  register: UseFormRegister<T>;
  // Use FieldErrors<T> directly, matching FormField
  errors: FieldErrors<T>;
  control: Control<T>;
}

const EngineMachinerySection = <T extends FieldValues>({
  register,
  errors,
  control,
}: EngineMachinerySectionProps<T>) => {
  // No need for specific type assertion here, use generic T

  return (
    <div className="mb-6">
      <h3 className="font-bold border-b pb-2 mb-4">Engine/Machinery Data</h3>
      {/* Main Engine Parameters */}
      <div className="bg-gray-50 p-4 rounded mb-4">
        <h4 className="font-semibold mb-2">Main Engine Parameters</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Re-added 'as Path<T>' cast */}
          <FormField name={"engineLoadFOPressure" as Path<T>} label="FO Pressure" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired labelClassName="text-sm" wrapperClassName="mb-0" />
          <FormField name={"engineLoadLubOilPressure" as Path<T>} label="Lub Oil Pressure" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired labelClassName="text-sm" wrapperClassName="mb-0" />
          <FormField name={"engineLoadFWInletTemp" as Path<T>} label="FW Inlet Temp" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired labelClassName="text-sm" wrapperClassName="mb-0" />
          <FormField name={"engineLoadLOInletTemp" as Path<T>} label="LO Inlet Temp" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired labelClassName="text-sm" wrapperClassName="mb-0" />
          <FormField name={"engineLoadScavAirTemp" as Path<T>} label="Scavenge Air Temp" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired labelClassName="text-sm" wrapperClassName="mb-0" />
          <FormField name={"engineLoadTCRPM1" as Path<T>} label="TC RPM #1" type="text" inputMode="numeric" register={register} errors={errors} control={control} validationPattern={INTEGER_ONLY} isRequired labelClassName="text-sm" wrapperClassName="mb-0" />
          <FormField name={"engineLoadTCRPM2" as Path<T>} label="TC RPM #2" type="text" inputMode="numeric" register={register} errors={errors} control={control} validationPattern={INTEGER_ONLY} labelClassName="text-sm" wrapperClassName="mb-0" />
          <FormField name={"engineLoadTCExhTempIn" as Path<T>} label="TC Exhaust Temp In" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired labelClassName="text-sm" wrapperClassName="mb-0" />
          <FormField name={"engineLoadTCExhTempOut" as Path<T>} label="TC Exhaust Temp Out" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired labelClassName="text-sm" wrapperClassName="mb-0" />
          <FormField name={"engineLoadThrustBearingTemp" as Path<T>} label="Thrust Bearing Temp" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired labelClassName="text-sm" wrapperClassName="mb-0" />
          <FormField name={"engineLoadDailyRunHour" as Path<T>} label="Daily Run Hour" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired labelClassName="text-sm" wrapperClassName="mb-0" />
        </div>
      </div>
      {/* Engine Units Table */}
      <div className="bg-gray-50 p-4 rounded mb-4 overflow-x-auto">
        <h4 className="font-semibold mb-2">Engine Units</h4>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit #</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exhaust Temp <span className="text-red-500">*</span></th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Under Piston Air <span className="text-red-500">*</span></th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P.C.O Outlet <span className="text-red-500">*</span></th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">J.C.F.W Outlet Temp <span className="text-red-500">*</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(unitNum => {
              const isOptional = unitNum > 6;
              // Re-added 'as Path<T>' cast
              const exhaustTempName = `engineUnit${unitNum}ExhaustTemp` as Path<T>;
              const underPistonAirName = `engineUnit${unitNum}UnderPistonAir` as Path<T>;
              const pcoOutletName = `engineUnit${unitNum}PCOOutlet` as Path<T>;
              const jcfwOutletTempName = `engineUnit${unitNum}JCFWOutletTemp` as Path<T>;
              return (
                <tr key={unitNum}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Unit #{unitNum} {isOptional && '(Optional)'}</td>
                  <td className="px-4 py-2"><FormField name={exhaustTempName} label="" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired={!isOptional} wrapperClassName="mb-0" labelClassName="hidden" /></td>
                  <td className="px-4 py-2"><FormField name={underPistonAirName} label="" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired={!isOptional} wrapperClassName="mb-0" labelClassName="hidden" /></td>
                  <td className="px-4 py-2"><FormField name={pcoOutletName} label="" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired={!isOptional} wrapperClassName="mb-0" labelClassName="hidden" /></td>
                  <td className="px-4 py-2"><FormField name={jcfwOutletTempName} label="" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired={!isOptional} wrapperClassName="mb-0" labelClassName="hidden" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Auxiliary Engines Table */}
      <div className="bg-gray-50 p-4 rounded mb-4 overflow-x-auto">
        <h4 className="font-semibold mb-2">Auxiliary Engines</h4>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">A/E#</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Load <span className="text-red-500">*</span></th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KW <span className="text-red-500">*</span></th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FO Press <span className="text-red-500">*</span></th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lub Oil Press <span className="text-red-500">*</span></th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Water Temp <span className="text-red-500">*</span></th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Run Hour <span className="text-red-500">*</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {['DG1', 'DG2', 'DG3', 'V1'].map(aeId => {
              const isOptional = aeId !== 'DG1';
              // Re-added 'as Path<T>' cast
              const loadName = `auxEngine${aeId}Load` as Path<T>;
              const kwName = `auxEngine${aeId}KW` as Path<T>;
              const foPressName = `auxEngine${aeId}FOPress` as Path<T>;
              const lubOilPressName = `auxEngine${aeId}LubOilPress` as Path<T>;
              const waterTempName = `auxEngine${aeId}WaterTemp` as Path<T>;
              const dailyRunHourName = `auxEngine${aeId}DailyRunHour` as Path<T>;
              return (
                <tr key={aeId}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{aeId} {isOptional && '(Optional)'}</td>
                  <td className="px-4 py-2"><FormField name={loadName} label="" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired={!isOptional} wrapperClassName="mb-0" labelClassName="hidden" /></td>
                  <td className="px-4 py-2"><FormField name={kwName} label="" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired={!isOptional} wrapperClassName="mb-0" labelClassName="hidden" /></td>
                  <td className="px-4 py-2"><FormField name={foPressName} label="" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired={!isOptional} wrapperClassName="mb-0" labelClassName="hidden" /></td>
                  <td className="px-4 py-2"><FormField name={lubOilPressName} label="" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired={!isOptional} wrapperClassName="mb-0" labelClassName="hidden" /></td>
                  <td className="px-4 py-2"><FormField name={waterTempName} label="" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired={!isOptional} wrapperClassName="mb-0" labelClassName="hidden" /></td>
                  <td className="px-4 py-2"><FormField name={dailyRunHourName} label="" type="text" inputMode="decimal" register={register} errors={errors} control={control} validationPattern={POSITIVE_DECIMAL_ONLY} isRequired={!isOptional} wrapperClassName="mb-0" labelClassName="hidden" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Engine Remarks */}
      {/* Re-added 'as Path<T>' cast */}
      <FormField name={"engineChiefEngineerRemarks" as Path<T>} label="Chief Engineer Remarks (Engine)" type="textarea" register={register} errors={errors} placeholder="Optional remarks..." />
    </div>
  );
};

export default EngineMachinerySection;
