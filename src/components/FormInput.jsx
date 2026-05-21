import React from 'react';

const FormInput = ({ label, icon: Icon, register, name, type = "text", placeholder, error, step, validation }) => {
  return (
    <div className="relative">
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-500" />
          </div>
        )}
        <input 
          type={type} 
          step={step}
          {...register(name, validation)}
          className={`block w-full ${Icon ? 'pl-10' : 'px-3'} pr-3 py-2.5 bg-surface border ${error ? 'border-red-500 focus:ring-red-500/50' : 'border-white/10 focus:ring-primary-500/50 focus:border-primary-500'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all`} 
          placeholder={placeholder} 
        />
      </div>
      {error && <span className="text-red-400 text-xs mt-1 block">{error.message}</span>}
    </div>
  );
};

export default FormInput;
