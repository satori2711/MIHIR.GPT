import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Message as MessageComponent } from './message';
import { PersonaModal } from './persona-modal';
import { Message, Persona, MessageResponse } from '@/lib/types';
import { nanoid } from 'nanoid';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Menu, ChevronRight, Send, Delete, Settings, RefreshCw } from 'lucide-react';

interface ChatProps {
  activePersona: Persona | null;
  onPersonaSelect: (persona: Persona) => void;
  onToggleSidebar: () => void;
  isMobile: boolean;
  onReset?: () => void;
}

export function Chat({ activePersona, onPersonaSelect, onToggleSidebar, isMobile, onReset }: ChatProps) {
  const [messageInput, setMessageInput] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Create or get session
  useEffect(() => {
    const createSession = async () => {
      try {
        const storedSessionId = localStorage.getItem('chatSessionId');
        
        const res = await apiRequest('POST', '/api/sessions', { 
          sessionId: storedSessionId || undefined,
          personaId: activePersona?.id
        });
        
        const data = await res.json();
        setSessionId(data.sessionId);
        localStorage.setItem('chatSessionId', data.sessionId);
      } catch (error) {
        console.error('Failed to create session:', error);
        // Create a local session ID as fallback
        const fallbackId = nanoid();
        setSessionId(fallbackId);
        localStorage.setItem('chatSessionId', fallbackId);
      }
    };

    if (activePersona) {
      createSession();
    }
  }, [activePersona]);

  // Get messages for the current session
  const { 
    data: messages = [], 
    isLoading: isLoadingMessages,
    refetch: refetchMessages
  } = useQuery<Message[]>({
    queryKey: [`/api/sessions/${sessionId}/messages`],
    enabled: !!sessionId
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      setIsTyping(true);
      const res = await apiRequest('POST', `/api/sessions/${sessionId}/messages`, { content });
      return res.json() as Promise<MessageResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/sessions/${sessionId}/messages`] });
      setIsTyping(false);
    },
    onError: (error: any) => {
      console.error('Failed to send message:', error);
      
      // Check for quota exceeded error
      if (error?.response?.status === 402 || 
          (error?.response?.data?.errorType === 'API_QUOTA_EXCEEDED')) {
        toast({
          title: "API Quota Exceeded",
          description: "The OpenAI API key has reached its usage limit. Please try again later or contact support for assistance.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive"
        });
      }
      
      setIsTyping(false);
    }
  });

  // Change persona mutation
  const changePersonaMutation = useMutation({
    mutationFn: async (personaIdOrObject: number | Persona) => {
      // Check if we're dealing with a custom persona or just an ID
      if (typeof personaIdOrObject === 'object') {
        // It's a custom persona object
        const res = await apiRequest('PATCH', `/api/sessions/${sessionId}/persona`, { 
          customPersona: personaIdOrObject 
        });
        return res.json();
      } else {
        // It's just a persona ID
        const res = await apiRequest('PATCH', `/api/sessions/${sessionId}/persona`, { 
          personaId: personaIdOrObject 
        });
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/sessions/${sessionId}/messages`] });
    },
    onError: (error) => {
      console.error('Failed to change persona:', error);
      toast({
        title: "Error",
        description: "Failed to switch persona. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Clear chat mutation (simplified for in-memory implementation)
  const clearChatMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/sessions/${sessionId}/messages`);
      return true;
    },
    onSuccess: () => {
      // Create a new session instead of trying to clear the old one
      const newSessionId = nanoid();
      setSessionId(newSessionId);
      localStorage.setItem('chatSessionId', newSessionId);
      
      queryClient.invalidateQueries({ queryKey: [`/api/sessions/${sessionId}/messages`] });
      
      // Add system message about starting fresh
      if (activePersona) {
        toast({
          title: "Chat Cleared",
          description: `Starting a new conversation with ${activePersona.name}.`,
        });
      }
    },
    onError: (error) => {
      console.error('Failed to clear chat:', error);
      toast({
        title: "Error",
        description: "Failed to clear chat. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Auto-resize textarea
  const handleTextareaInput = () => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  };

  // Handle message submission
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const trimmedMessage = messageInput.trim();
    if (!trimmedMessage || !activePersona || !sessionId || isTyping) return;
    
    try {
      setMessageInput('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
      
      await sendMessageMutation.mutateAsync(trimmedMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle pressing Enter to send (Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle persona switch
  const handlePersonaSelect = async (persona: Persona) => {
    if (!sessionId) return;
    
    try {
      onPersonaSelect(persona);
      // If it's a custom persona, pass the entire object, otherwise just pass the ID
      if (persona.isCustom === "true") {
        await changePersonaMutation.mutateAsync(persona);
      } else {
        await changePersonaMutation.mutateAsync(persona.id);
      }
    } catch (error) {
      console.error('Error switching persona:', error);
    }
  };

  // Handle clearing chat
  const handleClearChat = () => {
    if (!sessionId) return;
    clearChatMutation.mutate();
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Show welcome message if no messages and no active chat
  useEffect(() => {
    if (
      activePersona && 
      sessionId && 
      messages && messages.length === 0 && 
      !isLoadingMessages
    ) {
      const welcomeMessage: Message = {
        id: -1,
        sessionId,
        role: 'system',
        content: `You are now chatting with ${activePersona.name}. Ask anything or try switching personas.`,
        personaId: activePersona.id,
        timestamp: new Date()
      };
      
      // This is just for UI, not saved to storage
      queryClient.setQueryData(
        [`/api/sessions/${sessionId}/messages`], 
        [welcomeMessage]
      );
    }
  }, [activePersona, sessionId, messages, isLoadingMessages, queryClient]);

  return (
    <div className="flex-grow flex flex-col bg-background">
      {/* Chat Header */}
      <div className="border-b border-border bg-card p-4 flex items-center justify-between">
        <div className="flex items-center">
          {isMobile && (
            <button 
              onClick={onToggleSidebar}
              className="md:hidden mr-4 text-muted-foreground focus:outline-none"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          {activePersona ? (
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-muted overflow-hidden mr-3 border border-primary">
                <img 
                  src={activePersona.imageUrl} 
                  alt={activePersona.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <h2 className="font-medium text-foreground">{activePersona.name}</h2>
                <p className="text-xs text-muted-foreground">{activePersona.description}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden mr-3 flex items-center justify-center bg-primary">
                <span className="material-icons text-white">history_edu</span>
              </div>
              <div>
                <h2 className="font-medium text-foreground">Select a Persona</h2>
                <p className="text-xs text-muted-foreground">Choose a historical figure to chat with</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex">
          <button 
            className="text-muted-foreground hover:text-primary p-2 focus:outline-none" 
            title="Change personality"
            onClick={onReset}
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button 
            className="text-muted-foreground hover:text-primary p-2 focus:outline-none" 
            title="Chat settings"
            disabled={!activePersona}
          >
            <Settings className="h-5 w-5" />
          </button>
          <button 
            className="text-muted-foreground hover:text-destructive p-2 focus:outline-none" 
            title="Clear chat"
            onClick={handleClearChat}
            disabled={!activePersona || !messages || !Array.isArray(messages) || messages.length === 0}
          >
            <Delete className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4" id="chatMessages">
        {isLoadingMessages ? (
          <div className="flex justify-center">
            <div className="bg-muted rounded-lg px-4 py-2 text-sm text-foreground max-w-md text-center">
              Loading messages...
            </div>
          </div>
        ) : !activePersona ? (
          <div className="flex justify-center mb-6">
            <div className="bg-muted rounded-lg px-4 py-2 text-sm text-foreground max-w-md text-center">
              Select a historical figure from the sidebar to start chatting
            </div>
          </div>
        ) : messages && Array.isArray(messages) && messages.length === 0 ? (
          <div className="flex justify-center mb-6">
            <div className="bg-muted rounded-lg px-4 py-2 text-sm text-foreground max-w-md text-center">
              You are now chatting with <span className="font-semibold">{activePersona.name}</span>. Ask anything or try switching personas.
            </div>
          </div>
        ) : messages && Array.isArray(messages) && messages.length > 0 ? (
          messages.map((message: Message) => (
            <MessageComponent 
              key={message.id} 
              message={message} 
              personaImageUrl={activePersona?.imageUrl}
              personaName={activePersona?.name}
            />
          ))
        ) : (
          <div className="flex justify-center">
            <div className="bg-muted rounded-lg px-4 py-2 text-sm text-foreground max-w-md text-center">
              Loading conversation...
            </div>
          </div>
        )}
        
        {/* Show typing indicator when AI is generating a response */}
        {isTyping && (
          <div className="flex items-start space-x-2 max-w-3xl">
            <div className="w-8 h-8 rounded-full bg-muted overflow-hidden flex-shrink-0">
              {activePersona && (
                <img 
                  src={activePersona.imageUrl} 
                  alt={activePersona.name} 
                  className="w-full h-full object-cover" 
                />
              )}
            </div>
            <div className="bg-card rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
              <div className="flex items-center space-x-1">
                <div className="w-1 h-1 bg-primary rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Invisible div for scrolling to bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-border bg-card p-4">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          <div className="flex-grow relative">
            <textarea 
              ref={inputRef}
              placeholder={activePersona ? "Type your message..." : "Select a persona to start chatting"}
              className="w-full border border-input rounded-lg pl-3 pr-10 py-3 resize-none bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[50px] max-h-[150px]"
              rows={1}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onInput={handleTextareaInput}
              onKeyDown={handleKeyDown}
              disabled={!activePersona || isTyping}
            />
            <div className="absolute right-2 bottom-2 flex space-x-1">
              <button 
                type="button"
                className="text-muted-foreground hover:text-primary p-1 focus:outline-none" 
                title="Switch persona"
                onClick={() => setIsModalOpen(true)}
                disabled={!activePersona || isTyping}
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
          <button 
            type="submit"
            className={`rounded-full p-3 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 ${
              !messageInput.trim() || !activePersona || isTyping
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
            }`}
            disabled={!messageInput.trim() || !activePersona || isTyping}
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
        <div className="flex justify-between mt-2">
          <div className="text-xs text-muted-foreground">
            {isTyping && (
              <span className="flex items-center">
                <span className="inline-block w-1 h-1 bg-primary rounded-full animate-bounce mr-1"></span>
                <span className="inline-block w-1 h-1 bg-primary rounded-full animate-bounce mr-1" style={{ animationDelay: '0.2s' }}></span>
                <span className="inline-block w-1 h-1 bg-primary rounded-full animate-bounce mr-1" style={{ animationDelay: '0.4s' }}></span>
                Typing a response...
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>

      {/* Persona Switching Modal */}
      <PersonaModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPersonaSelect={handlePersonaSelect}
        currentPersonaId={activePersona?.id}
      />
    </div>
  );
}
