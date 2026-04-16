import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: { message?: string };
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, name, options, error, placeholder, disabled, ...rest }, ref) => (
    <div>
      {label && (
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={name}>
          {label}
        </label>
      )}
      <select
        name={name}
        id={name}
        ref={ref}
        disabled={disabled}
        className={`border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'text-gray-500 bg-slate-50 cursor-not-allowed' : ''}`}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error?.message && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  )
);

Select.displayName = 'Select';
export default Select;
