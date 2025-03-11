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
    // Sample countries for initial display
    const sampleCountries = [
      { code: 'US', name: 'United States' },
      { code: 'GB', name: 'United Kingdom' },
      { code: 'FR', name: 'France' },
      { code: 'DE', name: 'Germany' },
      { code: 'IT', name: 'Italy' },
      { code: 'JP', name: 'Japan' },
      { code: 'CN', name: 'China' },
      { code: 'BR', name: 'Brazil' },
      { code: 'CA', name: 'Canada' },
      { code: 'AU', name: 'Australia' }
    ];
    
    // More countries for the dropdown
    const allCountries = [
      ...sampleCountries,
      { code: 'ES', name: 'Spain' },
      { code: 'MX', name: 'Mexico' },
      { code: 'KR', name: 'South Korea' },
      { code: 'RU', name: 'Russia' },
      { code: 'IN', name: 'India' },
      { code: 'ZA', name: 'South Africa' },
      { code: 'AR', name: 'Argentina' },
      { code: 'SE', name: 'Sweden' },
      { code: 'NO', name: 'Norway' },
      { code: 'NZ', name: 'New Zealand' }
    ];
    
    setAvailableCountries(allCountries.sort((a, b) => a.name.localeCompare(b.name)));
    
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