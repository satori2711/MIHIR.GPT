import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Persona } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { nanoid } from 'nanoid';

interface WelcomeScreenProps {
  onPersonaSelect: (persona: Persona) => void;
}

export function WelcomeScreen({ onPersonaSelect }: WelcomeScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Persona[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const nextPersonaIdRef = useRef(1000); // Start custom personas at a high ID to avoid conflicts

  // We still fetch personas for reference, but won't be limited to them
  const { data: personas = [] } = useQuery<Persona[]>({
    queryKey: ['/api/personas'],
  });

  // Generate a higher ID for new custom personas
  useEffect(() => {
    if (personas && personas.length > 0) {
      const maxId = Math.max(...personas.map(p => p.id), 0);
      nextPersonaIdRef.current = Math.max(maxId + 1000, nextPersonaIdRef.current); // Set a safe starting point
    }
  }, [personas]);

  // Check for input when user presses Enter and create custom persona if needed
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const name = searchQuery.trim();
      
      if (!name) return;
      
      // Check for exact match in existing personas
      const exactMatch = personas.find(
        persona => persona.name.toLowerCase() === name.toLowerCase()
      );
      
      if (exactMatch) {
        // If exact match exists, use that persona
        handlePersonaSelect(exactMatch);
      } else {
        // Otherwise create a custom persona with the entered name
        createCustomPersona(name);
      }
    }
  };

  // Create a custom persona with the given name
  const createCustomPersona = (name: string) => {
    const customPersona: Persona = {
      id: nextPersonaIdRef.current++,
      name: name,
      lifespan: "", // No lifespan for custom personas
      category: "Custom",
      description: `Custom personality: ${name}`,
      imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      context: "", // No predefined context for custom personas
      isCustom: true
    };
    
    handlePersonaSelect(customPersona);
    toast({
      title: "Custom Personality Created",
      description: `You are now chatting with ${name}.`,
    });
  };

  // Handle persona selection
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
          Type any name to chat with that personality
        </p>
        
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter any name (e.g., Einstein, Shakespeare, Cleopatra)..."
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