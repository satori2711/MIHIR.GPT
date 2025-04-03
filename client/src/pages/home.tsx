import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/sidebar';
import { Chat } from '@/components/chat';
import { Persona } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Home() {
  const [activePersona, setActivePersona] = useState<Persona | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  // Fetch all personas on initial load
  const { data: personas = [] } = useQuery({
    queryKey: ['/api/personas'],
  });

  // Set default persona if none selected and personas are loaded
  useEffect(() => {
    if (!activePersona && personas.length > 0) {
      // Try to restore from localStorage
      const storedPersonaId = localStorage.getItem('activePersonaId');
      if (storedPersonaId) {
        const persona = personas.find((p: Persona) => p.id === parseInt(storedPersonaId));
        if (persona) {
          setActivePersona(persona);
          return;
        }
      }
      
      // Default to first persona if none stored
      setActivePersona(personas[0]);
    }
  }, [personas, activePersona]);

  // Handle persona selection
  const handlePersonaSelect = (persona: Persona) => {
    setActivePersona(persona);
    localStorage.setItem('activePersonaId', persona.id.toString());
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // Toggle sidebar on mobile
  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen flex-col md:flex-row overflow-hidden">
      <Sidebar 
        activePersonaId={activePersona?.id}
        onPersonaSelect={handlePersonaSelect}
        isMobile={isMobile}
        isOpen={isSidebarOpen || !isMobile}
        onToggle={handleToggleSidebar}
      />
      <Chat 
        activePersona={activePersona}
        onPersonaSelect={handlePersonaSelect}
        onToggleSidebar={handleToggleSidebar}
        isMobile={isMobile}
      />
    </div>
  );
}
