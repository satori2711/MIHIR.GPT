import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/sidebar';
import { Chat } from '@/components/chat';
import { WelcomeScreen } from '@/components/welcome-screen';
import { Persona } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Home() {
  const [activePersona, setActivePersona] = useState<Persona | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  const isMobile = useIsMobile();

  // Fetch all personas on initial load
  const { data: personas = [] } = useQuery<Persona[]>({
    queryKey: ['/api/personas'],
  });

  // Check if user has used the app before
  useEffect(() => {
    const storedPersonaId = localStorage.getItem('activePersonaId');
    if (storedPersonaId && personas && personas.length > 0) {
      const persona = personas.find((p: Persona) => p.id === parseInt(storedPersonaId));
      if (persona) {
        setActivePersona(persona);
        setShowWelcomeScreen(false); // Skip welcome screen for returning users
      }
    }
  }, [personas]);

  // Handle persona selection
  const handlePersonaSelect = (persona: Persona) => {
    setActivePersona(persona);
    localStorage.setItem('activePersonaId', persona.id.toString());
    setShowWelcomeScreen(false); // Hide welcome screen after selection
    
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // Toggle sidebar on mobile
  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Reset to welcome screen
  const handleReset = () => {
    setShowWelcomeScreen(true);
    setActivePersona(null);
    localStorage.removeItem('activePersonaId');
  };

  // Show welcome screen if no persona is selected
  if (showWelcomeScreen) {
    return <WelcomeScreen onPersonaSelect={handlePersonaSelect} />;
  }

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
        onReset={handleReset}
      />
    </div>
  );
}
