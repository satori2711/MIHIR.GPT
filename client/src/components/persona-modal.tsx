import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Persona } from '@/lib/types';
import { X } from 'lucide-react';

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPersonaSelect: (persona: Persona) => void;
  currentPersonaId?: number;
}

export function PersonaModal({ 
  isOpen, 
  onClose, 
  onPersonaSelect, 
  currentPersonaId 
}: PersonaModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPersonaId, setSelectedPersonaId] = useState<number | undefined>(currentPersonaId);

  // Get all personas from API
  const { data: personas = [], isLoading } = useQuery<Persona[]>({
    queryKey: ['/api/personas'],
    staleTime: 60000 // 1 minute
  });

  // Filter personas based on search
  const filteredPersonas = personas.filter((persona) => 
    searchQuery === '' || 
    persona.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    persona.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePersonaClick = (persona: Persona) => {
    setSelectedPersonaId(persona.id);
  };

  const handleSwitchPersona = () => {
    if (selectedPersonaId) {
      const persona = personas.find((p) => p.id === selectedPersonaId);
      if (persona) {
        onPersonaSelect(persona);
        onClose();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-medium text-lg">Switch Historical Figure</DialogTitle>
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 text-neutral-dark hover:text-primary focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search historical figures..."
            className="w-full px-4 py-2 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="overflow-y-auto max-h-[400px]">
          <div className="grid grid-cols-2 gap-3">
            {isLoading ? (
              <div className="col-span-2 p-4 text-center text-neutral-dark">Loading historical figures...</div>
            ) : filteredPersonas.length === 0 ? (
              <div className="col-span-2 p-4 text-center text-neutral-dark">No historical figures found</div>
            ) : (
              filteredPersonas.map((persona: Persona) => (
                <div
                  key={persona.id}
                  className={`border rounded-lg p-3 hover:border-primary cursor-pointer flex flex-col items-center text-center ${
                    selectedPersonaId === persona.id ? 'border-primary bg-primary-light/10' : 'border-neutral-medium'
                  }`}
                  onClick={() => handlePersonaClick(persona)}
                >
                  <div className={`w-16 h-16 rounded-full bg-neutral-medium overflow-hidden mb-2 ${
                    selectedPersonaId === persona.id ? 'border-2 border-primary' : ''
                  }`}>
                    <img
                      src={persona.imageUrl}
                      alt={persona.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-medium">{persona.name}</h4>
                  <p className="text-xs text-neutral-dark">{persona.lifespan}</p>
                </div>
              ))
            )}
          </div>
        </div>
        
        <DialogFooter className="border-t border-neutral-medium pt-4">
          <Button 
            onClick={handleSwitchPersona}
            disabled={!selectedPersonaId || selectedPersonaId === currentPersonaId}
            className="w-full bg-primary hover:bg-primary-dark text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
          >
            Switch Figure
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
