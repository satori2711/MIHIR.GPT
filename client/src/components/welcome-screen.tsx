import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Persona } from '@/lib/types';

interface WelcomeScreenProps {
  onPersonaSelect: (persona: Persona) => void;
}

export function WelcomeScreen({ onPersonaSelect }: WelcomeScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Persona[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch personas for searching
  const { data: personas = [] } = useQuery<Persona[]>({
    queryKey: ['/api/personas'],
  });

  // Filter personas based on search input
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    if (personas && personas.length > 0) {
      const filtered = personas.filter((persona: Persona) => 
        persona.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filtered);
    }
  }, [searchQuery, personas]);

  // Handle persona selection from search
  const handlePersonaSelect = (persona: Persona) => {
    setSearchQuery('');
    setSuggestions([]);
    onPersonaSelect(persona);
  };

  // Auto-focus the search input on component mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-neutral-lightest">
      <div className="p-8 bg-white rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6 text-primary">Whom would you like to chat with today?</h1>
        
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type a historical figure's name..."
            className="w-full p-4 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          
          {suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-light rounded-lg shadow-lg max-h-80 overflow-y-auto">
              {suggestions.map((persona) => (
                <div
                  key={persona.id}
                  className="flex items-center p-3 cursor-pointer hover:bg-neutral-lightest"
                  onClick={() => handlePersonaSelect(persona)}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border border-primary">
                    <img 
                      src={persona.imageUrl} 
                      alt={persona.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <div className="font-medium">{persona.name}</div>
                    <div className="text-xs text-neutral-dark">{persona.lifespan}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-6 text-sm text-neutral-dark text-center">
          Search for personalities like Albert Einstein, Leonardo da Vinci, Marie Curie, or Nelson Mandela
        </div>
      </div>
      
      <div className="mt-8 max-w-md text-center text-sm text-neutral-dark">
        <p>Our AI allows you to converse with historical figures in their authentic voice and personality.</p>
      </div>
    </div>
  );
}