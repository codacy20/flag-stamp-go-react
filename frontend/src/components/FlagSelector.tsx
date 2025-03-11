import { useState, useEffect } from 'react';
import './FlagSelector.css';

interface FlagSelectorProps {
  onSelectFlag: (flagUrl: string) => void;
}

interface Flag {
  code: string;
  name: string;
  url: string;
}

const FlagSelector: React.FC<FlagSelectorProps> = ({ onSelectFlag }) => {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [selectedFlag, setSelectedFlag] = useState<string | null>(null);
  const [availableCountries, setAvailableCountries] = useState<{code: string, name: string}[]>([]);
  
  useEffect(() => {
    // Countries from the image (37 participating countries)
    const allCountries = [
      { code: 'AL', name: 'Albania' },
      { code: 'AM', name: 'Armenia' },
      { code: 'AU', name: 'Australia' },
      { code: 'AT', name: 'Austria' },
      { code: 'AZ', name: 'Azerbaijan' },
      { code: 'BE', name: 'Belgium' },
      { code: 'HR', name: 'Croatia' },
      { code: 'CY', name: 'Cyprus' },
      { code: 'CZ', name: 'Czechia' },
      { code: 'DK', name: 'Denmark' },
      { code: 'EE', name: 'Estonia' },
      { code: 'FI', name: 'Finland' },
      { code: 'FR', name: 'France' },
      { code: 'GE', name: 'Georgia' },
      { code: 'DE', name: 'Germany' },
      { code: 'GR', name: 'Greece' },
      { code: 'IS', name: 'Iceland' },
      { code: 'IE', name: 'Ireland' },
      { code: 'IL', name: 'Israel' },
      { code: 'IT', name: 'Italy' },
      { code: 'LV', name: 'Latvia' },
      { code: 'LT', name: 'Lithuania' },
      { code: 'LU', name: 'Luxembourg' },
      { code: 'MT', name: 'Malta' },
      { code: 'ME', name: 'Montenegro' },
      { code: 'NL', name: 'Netherlands' },
      { code: 'NO', name: 'Norway' },
      { code: 'PL', name: 'Poland' },
      { code: 'PT', name: 'Portugal' },
      { code: 'SM', name: 'San Marino' },
      { code: 'RS', name: 'Serbia' },
      { code: 'SI', name: 'Slovenia' },
      { code: 'ES', name: 'Spain' },
      { code: 'SE', name: 'Sweden' },
      { code: 'CH', name: 'Switzerland' },
      { code: 'UA', name: 'Ukraine' },
      { code: 'GB', name: 'United Kingdom' }
    ];
    
    // Sort countries alphabetically
    setAvailableCountries(allCountries.sort((a, b) => a.name.localeCompare(b.name)));
    
    // Select 10 sample countries for initial display
    const sampleCountries = [
      { code: 'FR', name: 'France' },
      { code: 'DE', name: 'Germany' },
      { code: 'IT', name: 'Italy' },
      { code: 'ES', name: 'Spain' },
      { code: 'GB', name: 'United Kingdom' },
      { code: 'SE', name: 'Sweden' },
      { code: 'UA', name: 'Ukraine' },
      { code: 'CH', name: 'Switzerland' },
      { code: 'NO', name: 'Norway' },
      { code: 'NL', name: 'Netherlands' }
    ];
    
    // Create flag URLs for the initial sample
    const flagList = sampleCountries.map(country => ({
      code: country.code,
      name: country.name,
      url: `https://flagsapi.com/${country.code}/flat/64.png`
    }));
    
    setFlags(flagList);
  }, []);
  
  const handleFlagSelect = (flagUrl: string) => {
    setSelectedFlag(flagUrl);
    onSelectFlag(flagUrl);
  };
  
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value;
    if (!countryCode) return;
    
    const country = availableCountries.find(c => c.code === countryCode);
    if (!country) return;
    
    const newFlag = {
      code: country.code,
      name: country.name,
      url: `https://flagsapi.com/${country.code}/flat/64.png`
    };
    
    // Check if flag already exists in the list
    if (!flags.some(f => f.code === newFlag.code)) {
      setFlags(prev => [...prev, newFlag]);
    }
    
    // Select the flag
    handleFlagSelect(newFlag.url);
  };
  
  return (
    <div className="flag-selector-container">
      <h3 className="section-title">Select a flag to add</h3>
      
      <select 
        className="flag-dropdown"
        onChange={handleCountryChange}
        value=""
      >
        <option value="">-- Select a country --</option>
        {availableCountries.map(country => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </select>
      
      <div className="flag-grid">
        {flags.map((flag) => (
          <div 
            key={flag.code} 
            className={`flag-item ${selectedFlag === flag.url ? 'selected' : ''}`}
            onClick={() => handleFlagSelect(flag.url)}
            title={flag.name}
          >
            <img src={flag.url} alt={`Flag of ${flag.name}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlagSelector; 