import React from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
  autoComplete?: string;
  'aria-describedby'?: string;
  children?: React.ReactNode;
}

export function FormField({
  id,
  label,
  type = 'text',
  required = false,
  value,
  onChange,
  placeholder,
  error,
  className = '',
  autoComplete,
  'aria-describedby': ariaDescribedBy,
  children,
}: FormFieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  const helpId = ariaDescribedBy;
  
  const describedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-white/80"
      >
        {label}
        {required && (
          <span className="text-red-400 ml-1" aria-label="required">*</span>
        )}
      </label>
      
      <div className="relative">
        <input
          id={id}
          name={id}
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`input-field w-full ${error ? 'border-red-400' : ''}`}
          autoComplete={autoComplete}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
        />
        {children}
      </div>
      
      {error && (
        <div 
          id={errorId}
          className="error-text"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
    </div>
  );
}

interface FormButtonProps {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  'aria-describedby'?: string;
}

export function FormButton({
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  loadingText = 'Loading...',
  children,
  onClick,
  className = '',
  'aria-describedby': ariaDescribedBy,
}: FormButtonProps) {
  const baseClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClass} w-full flex items-center justify-center space-x-2 ${className}`}
      aria-describedby={ariaDescribedBy}
    >
      {loading ? (
        <>
          <div className="loading-spinner h-4 w-4" aria-hidden="true"></div>
          <span className="sr-only">Please wait</span>
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

interface FormErrorProps {
  error?: string;
  id?: string;
}

export function FormError({ error, id }: FormErrorProps) {
  if (!error) return null;
  
  return (
    <div 
      id={id}
      className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg"
      role="alert"
      aria-live="polite"
    >
      {error}
    </div>
  );
}

interface FormSuccessProps {
  message?: string;
  id?: string;
}

export function FormSuccess({ message, id }: FormSuccessProps) {
  if (!message) return null;
  
  return (
    <div 
      id={id}
      className="bg-green-500/20 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg"
      role="alert"
      aria-live="polite"
    >
      {message}
    </div>
  );
}

interface AccessibleFormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
  'aria-labelledby'?: string;
  noValidate?: boolean;
}

export function AccessibleForm({
  children,
  onSubmit,
  className = '',
  'aria-labelledby': ariaLabelledBy,
  noValidate = true,
}: AccessibleFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className={`space-y-6 ${className}`}
      aria-labelledby={ariaLabelledBy}
      noValidate={noValidate}
    >
      {children}
    </form>
  );
}
