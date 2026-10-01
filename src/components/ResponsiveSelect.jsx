import React from 'react';
import Select from 'react-select';

export default function ResponsiveSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Select option...',
  isSearchable = false,
  isDisabled = false,
  className = '',
  style = {},
  isClearable = false,
  menuPlacement = 'auto',
  compact = false,
  hasLeftIcon = false,
  ...props
}) {
  // Normalize array of options (strings, numbers, or objects {value, label})
  const formattedOptions = options.map((opt) => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: opt, label: String(opt) };
    }
    return opt;
  });

  // Find matching option object for current value
  const selectedOption = formattedOptions.find(
    (opt) => String(opt.value) === String(value)
  ) || null;

  // Custom styles for React-Select tailored for Admin Panel & Mobile responsiveness
  const customStyles = {
    container: (provided) => ({
      ...provided,
      width: '100%',
      maxWidth: '100%',
      minWidth: 0,
      boxSizing: 'border-box',
      background: 'transparent',
      border: 'none',
      padding: 0,
      ...style,
    }),
    control: (provided, state) => ({
      ...provided,
      minHeight: compact ? '32px' : '38px',
      height: compact ? '32px' : '38px',
      borderRadius: '8px',
      borderColor: state.isFocused ? '#ff4d6d' : '#cbd5e1',
      backgroundColor: '#ffffff',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(255, 77, 109, 0.18)' : 'none',
      '&:hover': {
        borderColor: '#ff4d6d',
      },
      fontSize: compact ? '12px' : '13px',
      fontWeight: '500',
      color: '#1e293b',
      boxSizing: 'border-box',
      cursor: 'pointer',
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: compact ? '30px' : '36px',
      paddingLeft: hasLeftIcon ? '34px' : '8px',
      paddingRight: '4px',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
    }),
    input: (provided) => ({
      ...provided,
      margin: '0px',
      padding: '0px',
      color: '#1e293b',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (provided, state) => ({
      ...provided,
      padding: '4px 8px',
      color: state.isFocused ? '#ff4d6d' : '#64748b',
      '&:hover': {
        color: '#ff4d6d',
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#1e293b',
      fontSize: compact ? '12px' : '13px',
      fontWeight: '600',
      maxWidth: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      margin: 0,
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#94a3b8',
      fontSize: compact ? '12px' : '13px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      margin: 0,
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 999999, // Floating on document.body root above all modals/cards!
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '10px',
      boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.22), 0 8px 10px -6px rgba(0, 0, 0, 0.12)',
      border: '1.5px solid #e2e8f0',
      overflow: 'hidden',
      zIndex: 999999,
      maxWidth: 'calc(100vw - 32px)',
      backgroundColor: '#ffffff',
    }),
    menuList: (provided) => ({
      ...provided,
      padding: '6px',
      maxHeight: '240px',
    }),
    option: (provided, state) => ({
      ...provided,
      borderRadius: '6px',
      fontSize: compact ? '12px' : '13px',
      fontWeight: state.isSelected ? '700' : '500',
      backgroundColor: state.isSelected
        ? '#ff4d6d'
        : state.isFocused
        ? '#fff1f2'
        : '#ffffff',
      color: state.isSelected ? '#ffffff' : state.isFocused ? '#ff4d6d' : '#334155',
      cursor: 'pointer',
      padding: '8px 12px',
      margin: '2px 0',
      wordBreak: 'break-word',
      whiteSpace: 'normal',
      '&:active': {
        backgroundColor: '#e02850',
        color: '#ffffff',
      },
    }),
  };

  return (
    <Select
      options={formattedOptions}
      value={selectedOption}
      onChange={(selected) => onChange(selected ? selected.value : '')}
      placeholder={placeholder}
      isSearchable={isSearchable}
      isDisabled={isDisabled}
      isClearable={isClearable}
      menuPlacement={menuPlacement}
      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
      menuPosition="fixed"
      styles={customStyles}
      className={`admin-responsive-select ${className}`}
      classNamePrefix="admin-react-select"
      {...props}
    />
  );
}
