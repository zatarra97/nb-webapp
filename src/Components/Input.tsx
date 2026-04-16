import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: { message?: string };
  info?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, type = 'text', name, error, value, info, disabled, ...rest }, ref) => {
    const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
      if (type === 'number') e.currentTarget.blur();
    };

    return (
      <div>
        {label && (
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={name}>
            <div className="flex items-center gap-2">
              {label}
              {info && (
                <div className="relative group">
                  <i className="fa-solid fa-circle-info text-gray-400 hover:text-gray-600 text-sm cursor-help"></i>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-sm rounded shadow-lg z-50">
                    {info}
                  </div>
                </div>
              )}
            </div>
          </label>
        )}
        <input
          type={type}
          name={name}
          id={name}
          ref={ref}
          value={value === null ? '' : value}
          onWheel={handleWheel}
          disabled={disabled}
          className={`appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${disabled ? 'text-gray-500 bg-slate-50 cursor-not-allowed' : ''}`}
          {...rest}
        />
        {error?.message && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
