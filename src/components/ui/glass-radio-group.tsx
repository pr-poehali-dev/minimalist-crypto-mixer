import React from 'react';
import styled from 'styled-components';

interface GlassRadioGroupProps {
  options: { id: string; label: string }[];
  name: string;
  selectedValue: string;
  onChange: (value: string) => void;
}

const GlassRadioGroup = ({ options, name, selectedValue, onChange }: GlassRadioGroupProps) => {
  const selectedIndex = options.findIndex(opt => opt.id === selectedValue);

  return (
    <StyledWrapper optionsCount={options.length} selectedIndex={selectedIndex}>
      <div className="glass-radio-group">
        {options.map((option, index) => (
          <React.Fragment key={option.id}>
            <input
              type="radio"
              name={name}
              id={`glass-${option.id}`}
              checked={selectedValue === option.id}
              onChange={() => onChange(option.id)}
            />
            <label htmlFor={`glass-${option.id}`}>{option.label}</label>
          </React.Fragment>
        ))}
        <div className="glass-glider" />
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div<{ optionsCount: number; selectedIndex: number }>`
  .glass-radio-group {
    --bg: rgba(255, 255, 255, 0.08);
    --text: #6b7280;

    display: flex;
    position: relative;
    background: var(--bg);
    border-radius: 1rem;
    backdrop-filter: blur(12px);
    box-shadow:
      inset 1px 1px 4px rgba(255, 255, 255, 0.2),
      inset -1px -1px 6px rgba(0, 0, 0, 0.1),
      0 4px 12px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    width: fit-content;
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  .glass-radio-group input {
    display: none;
  }

  .glass-radio-group label {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 100px;
    font-size: 15px;
    padding: 0.85rem 1.8rem;
    cursor: pointer;
    font-weight: 600;
    letter-spacing: 0.3px;
    color: var(--text);
    position: relative;
    z-index: 2;
    transition: color 0.3s ease-in-out;
  }

  .glass-radio-group label:hover {
    color: #111827;
  }

  .glass-radio-group input:checked + label {
    color: #fff;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .glass-glider {
    position: absolute;
    top: 0;
    bottom: 0;
    width: calc(100% / ${props => props.optionsCount});
    border-radius: 1rem;
    z-index: 1;
    transition:
      transform 0.5s cubic-bezier(0.37, 1.95, 0.66, 0.56),
      background 0.4s ease-in-out,
      box-shadow 0.4s ease-in-out;
    transform: translateX(${props => props.selectedIndex * 100}%);
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(37, 99, 235, 0.9));
    box-shadow:
      0 0 20px rgba(59, 130, 246, 0.4),
      0 0 12px rgba(255, 255, 255, 0.3) inset,
      0 4px 16px rgba(59, 130, 246, 0.3);
  }
`;

export default GlassRadioGroup;
