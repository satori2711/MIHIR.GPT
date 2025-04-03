import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Persona } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface WelcomeScreenProps {
  onPersonaSelect: (persona: Persona) => void;
}

export function WelcomeScreen({ onPersonaSelect }: WelcomeScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Persona[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
      
      // Auto-select if there's an exact match or if there's only one suggestion and Enter was pressed
      if (filtered.length === 1 && searchQuery.trim().length > 2 && searchQuery.endsWith('\n')) {
        // Create a local copy to avoid direct state modifications in useEffect
        const matchedPersona = filtered[0];
        const cleanedQuery = searchQuery.replace('\n', '');
        // Use setTimeout to break the synchronous update cycle
        setTimeout(() => {
          setSearchQuery(cleanedQuery);
          handlePersonaSelect(matchedPersona);
        }, 0);
      }
    }
  }, [searchQuery, personas, onPersonaSelect]);

  // Check for exact name match when user presses Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Prevent form submission
      e.preventDefault();
      
      if (suggestions.length === 0 && searchQuery.trim()) {
        // No exact matches, show a toast with suggestions
        toast({
          title: "No exact matches found",
          description: "Please select from the suggestions or try a different name.",
          variant: "default"
        });
        return;
      }
      
      if (suggestions.length === 1) {
        // If only one suggestion, select it
        handlePersonaSelect(suggestions[0]);
        return;
      }
      
      // Check for exact match by name
      const exactMatch = suggestions.find(
        persona => persona.name.toLowerCase() === searchQuery.trim().toLowerCase()
      );
      
      if (exactMatch) {
        handlePersonaSelect(exactMatch);
      } else if (suggestions.length > 0) {
        // If no exact match but we have suggestions, select the first one
        handlePersonaSelect(suggestions[0]);
      }
    }
  };

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
    <div className="flex flex-col items-center justify-center h-full bg-background">
      <div className="p-8 bg-card rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-2 text-primary">
          MihirGPT
        </h1>
        <p className="text-xl text-center mb-6 text-foreground">
          Whom would you like to chat with today?
        </p>
        
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type any historical figure's name..."
            className="w-full p-4 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          
          {suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto">
              {suggestions.map((persona) => (
                <div
                  key={persona.id}
                  className="flex items-center p-3 cursor-pointer hover:bg-muted"
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
                    <div className="font-medium text-foreground">{persona.name}</div>
                    <div className="text-xs text-muted-foreground">{persona.lifespan}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}