import React from 'react';
import { UseFormRegister, FieldError, Control, Controller, Path, FieldValues, FieldErrors, RegisterOptions } from 'react-hook-form'; // Import RegisterOptions
// Removed lodash-es import
import { FORM_STYLES } from '../forms/types/departureFormTypes'; // Assuming common styles might live here or be moved

// Define a generic type for form data.
// T extends FieldValues from react-hook-form
interface FormFieldProps<T extends FieldValues> extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  name: Path<T>;
  label: string;
  register: UseFormRegister<T>;
  // Use the standard FieldErrors<T> type from react-hook-form
  errors: FieldErrors<T>;
  control?: Control<T>; // Optional: Needed for Controller-based inputs
  type?: 'text' | 'number' | 'date' | 'time' | 'textarea' | 'select' | 'radio' | 'email' | 'password';
  options?: { value: string | number; label: string }[]; // For select/radio
  isReadOnly?: boolean;
  isRequired?: boolean;
  validationPattern?: RegExp; // For controlled inputs with specific filtering
  inputMode?: 'numeric' | 'decimal' | 'text' | 'tel' | 'email' | 'url'; // Hint for mobile keyboards
  renderError?: (fieldName: Path<T>) => React.ReactNode; // Optional custom error rendering
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  wrapperClassName?: string;
  rules?: RegisterOptions<T>; // Add rules prop
  // Allow any other standard input props like placeholder, maxLength, etc.
}

// Use FieldValues constraint directly here
const FormField = <T extends FieldValues>({
  name,
  label,
  register,
  errors,
  control,
  type = 'text',
  options,
  isReadOnly = false,
  isRequired = false, // Infer required from schema if possible, but explicit prop is useful
  validationPattern,
  inputMode,
  renderError: customRenderError,
  labelClassName = "block text-sm font-medium mb-1",
  inputClassName: customInputClassName, // Allow overriding default input class logic
  errorClassName = "text-xs text-red-500 mt-1",
  wrapperClassName = "mb-4", // Default wrapper margin, adjust as needed
  rules, // Destructure rules prop
  ...props // Spread remaining props (placeholder, maxLength, etc.) to the input/select/textarea
}: FormFieldProps<T>) => {

  // Access error directly using bracket notation
  // Note: This assumes simple paths. For nested paths, a helper might be needed.
  const error = errors[name] as FieldError | undefined;

  // Determine base input class based on read-only status
  const baseClass = isReadOnly ? FORM_STYLES.READONLY_INPUT : FORM_STYLES.EDITABLE_INPUT;
  // Apply error styling if an error exists
  const errorBorderClass = error ? FORM_STYLES.ERROR_BORDER : FORM_STYLES.NORMAL_BORDER; // Assuming NORMAL_BORDER exists or is default
  // Combine base, error, and potentially custom classes
  // Prioritize customInputClassName if provided
  const finalInputClassName = customInputClassName ?? `${baseClass.replace(/border-\w+-\d+/, '')} ${errorBorderClass}`; // Remove default border before adding error/normal border

  const labelContent = (
    <>
      {label}
      {isRequired && <span className="text-red-500"> *</span>}
    </>
  );

  const errorDisplay = customRenderError
    ? customRenderError(name)
    : error ? <p className={errorClassName}>{error.message}</p> : null;

  const renderInput = () => {
    // Use Controller if control prop is provided and type requires it (e.g., complex validation)
    // Or if a specific validationPattern needs live filtering
    if (control && (validationPattern || ['number', 'decimal'].includes(inputMode || ''))) {
      return (
        <Controller
          name={name}
          control={control}
          rules={rules} // Pass rules to Controller as well
          render={({ field }) => {
            const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value;
              if (validationPattern) {
                // Apply regex filtering if pattern provided
                if (value === '' || validationPattern.test(value)) {
                  // Handle potential number conversion for numeric/decimal inputs
                  if (inputMode === 'numeric' || inputMode === 'decimal') {
                     field.onChange(value === '' ? undefined : value); // Pass undefined for empty to allow Zod coercion/validation
                  } else {
                     field.onChange(value);
                  }
                }
              } else {
                 // Handle potential number conversion without regex
                 if (inputMode === 'numeric' || inputMode === 'decimal') {
                    field.onChange(value === '' ? undefined : value);
                 } else {
                    field.onChange(value);
                 }
              }
            };

            // Ensure value is a string for the input, handle undefined/NaN for controlled number inputs
            const displayValue = (field.value === undefined || (typeof field.value === 'number' && isNaN(field.value))) ? '' : String(field.value);

            return (
              <input
                {...props} // Spread other props like placeholder, maxLength
                {...field} // Spread field props (value, onChange, onBlur, ref)
                id={name}
                type={type === 'number' ? 'text' : type} // Use text type for controlled number inputs
                inputMode={inputMode}
                className={finalInputClassName}
                readOnly={isReadOnly}
                aria-invalid={error ? "true" : "false"}
                value={displayValue} // Use controlled display value
                onChange={handleChange} // Use custom handler
              />
            );
          }}
        />
      );
    }

    // Standard registration for simpler types
    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...props}
            {...register(name, rules)} // Pass rules to register
            id={name}
            className={`${finalInputClassName} h-24`} // Default height, can be overridden by props.className
            readOnly={isReadOnly}
            aria-invalid={error ? "true" : "false"}
          />
        );
      case 'select':
        return (
          <select
            {...props}
            {...register(name, rules)} // Pass rules to register
            id={name}
            className={finalInputClassName}
            disabled={isReadOnly} // Use disabled for select read-only state
            aria-invalid={error ? "true" : "false"}
          >
            {props.placeholder && <option value="">{props.placeholder}</option>}
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'radio': // Requires options
        return (
          <div className="flex space-x-4 mt-2">
            {options?.map((option) => (
              <label key={option.value} className="inline-flex items-center">
                <input
                  {...props}
                  {...register(name, rules)} // Pass rules to register
                  type="radio"
                  id={`${name}-${option.value}`}
                  value={option.value}
                  className="mr-2" // Basic styling, customize as needed
                  disabled={isReadOnly}
                  aria-invalid={error ? "true" : "false"}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        );
      // Default to input type text, number, date, time etc.
      default:
        return (
          <input
            {...props}
            {...register(name, rules)} // Pass rules to register
            id={name}
            type={type}
            inputMode={inputMode}
            className={finalInputClassName}
            readOnly={isReadOnly}
            aria-invalid={error ? "true" : "false"}
          />
        );
    }
  };

  return (
    <div className={wrapperClassName}>
      <label htmlFor={name} className={labelClassName}>
        {labelContent}
      </label>
      {renderInput()}
      {isReadOnly && type !== 'radio' && <p className="text-xs text-gray-500 mt-1">Read only</p>} {/* Add read-only note */}
      {errorDisplay}
    </div>
  );
};

export default FormField;
