import { 
  personas, type Persona, type InsertPersona,
  messages, type Message, type InsertMessage,
  chatSessions, type ChatSession, type InsertChatSession
} from "@shared/schema";

// Interface defining storage methods
export interface IStorage {
  // Persona methods
  getPersonas(): Promise<Persona[]>;
  getPersonaById(id: number): Promise<Persona | undefined>;
  getPersonasByCategory(category: string): Promise<Persona[]>;
  searchPersonas(query: string): Promise<Persona[]>;
  
  // Message methods
  getMessagesBySessionId(sessionId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Chat session methods
  getChatSessionById(sessionId: string): Promise<ChatSession | undefined>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  updateChatSessionPersona(sessionId: string, personaId: number): Promise<ChatSession>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private personas: Map<number, Persona>;
  private messages: Map<number, Message>;
  private chatSessions: Map<string, ChatSession>;
  private personaCurrentId: number;
  private messageCurrentId: number;
  private chatSessionCurrentId: number;

  constructor() {
    this.personas = new Map();
    this.messages = new Map();
    this.chatSessions = new Map();
    this.personaCurrentId = 1;
    this.messageCurrentId = 1;
    this.chatSessionCurrentId = 1;
    
    // Initialize with historical personas
    this.initializePersonas();
  }

  // Persona methods
  async getPersonas(): Promise<Persona[]> {
    return Array.from(this.personas.values());
  }

  async getPersonaById(id: number): Promise<Persona | undefined> {
    return this.personas.get(id);
  }

  async getPersonasByCategory(category: string): Promise<Persona[]> {
    return Array.from(this.personas.values()).filter(
      persona => persona.category.toLowerCase() === category.toLowerCase()
    );
  }

  async searchPersonas(query: string): Promise<Persona[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.personas.values()).filter(
      persona => 
        persona.name.toLowerCase().includes(lowerQuery) ||
        persona.description.toLowerCase().includes(lowerQuery) ||
        persona.category.toLowerCase().includes(lowerQuery)
    );
  }

  // Message methods
  async getMessagesBySessionId(sessionId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.sessionId === sessionId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageCurrentId++;
    const message: Message = { 
      ...insertMessage, 
      id, 
      timestamp: new Date() 
    };
    this.messages.set(id, message);
    return message;
  }

  // Chat session methods
  async getChatSessionById(sessionId: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(sessionId);
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = this.chatSessionCurrentId++;
    const session: ChatSession = { 
      ...insertSession, 
      id, 
      createdAt: new Date() 
    };
    this.chatSessions.set(session.sessionId, session);
    return session;
  }

  async updateChatSessionPersona(sessionId: string, personaId: number): Promise<ChatSession> {
    const session = this.chatSessions.get(sessionId);
    if (!session) {
      throw new Error(`Chat session with ID ${sessionId} not found`);
    }
    
    const updatedSession: ChatSession = {
      ...session,
      currentPersonaId: personaId
    };
    
    this.chatSessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  // Initialize with historical personas
  private initializePersonas() {
    const historicalPersonas: InsertPersona[] = [
      {
        name: "Nelson Mandela",
        lifespan: "1918-2013",
        category: "Leaders",
        description: "South African anti-apartheid revolutionary, political leader, and philanthropist",
        imageUrl: "https://images.unsplash.com/photo-1601163584558-c7f1e67f4590?w=150&h=150&fit=crop&crop=faces",
        context: "First black president of South Africa, human rights advocate and Nobel Peace Prize winner. Known for his role in ending apartheid and promoting reconciliation."
      },
      {
        name: "Albert Einstein",
        lifespan: "1879-1955",
        category: "Scientists",
        description: "Theoretical physicist who developed the theory of relativity",
        imageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces",
        context: "One of the most influential scientists of the 20th century. Developed the theory of relativity and contributed to the development of quantum mechanics."
      },
      {
        name: "Marie Curie",
        lifespan: "1867-1934",
        category: "Scientists",
        description: "Physicist and chemist who conducted pioneering research on radioactivity",
        imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces",
        context: "First woman to win a Nobel Prize and the only person to win Nobel Prizes in multiple scientific fields. Discovered the elements polonium and radium."
      },
      {
        name: "William Shakespeare",
        lifespan: "1564-1616",
        category: "Artists",
        description: "English poet, playwright, and actor, widely regarded as the greatest writer in the English language",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces",
        context: "Created approximately 39 plays and 154 sonnets. His works include Romeo and Juliet, Hamlet, Macbeth, and A Midsummer Night's Dream."
      },
      {
        name: "Cleopatra",
        lifespan: "69-30 BC",
        category: "Leaders",
        description: "Last active ruler of the Ptolemaic Kingdom of Egypt",
        imageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&h=150&fit=crop&crop=faces",
        context: "Known for her relationships with Julius Caesar and Mark Antony. Skilled diplomat, fluent in many languages, and educated in mathematics, astronomy, and philosophy."
      },
      {
        name: "Leonardo da Vinci",
        lifespan: "1452-1519",
        category: "Artists",
        description: "Italian polymath: painter, sculptor, architect, scientist, mathematician, engineer, and inventor",
        imageUrl: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=150&h=150&fit=crop&crop=faces",
        context: "Created iconic works of art like the Mona Lisa and The Last Supper. Made discoveries in anatomy, civil engineering, optics, and hydrodynamics."
      },
      {
        name: "Joan of Arc",
        lifespan: "1412-1431",
        category: "Leaders",
        description: "French heroine and military leader who played a key role in the Hundred Years' War",
        imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces",
        context: "Led the French army to victory at Orléans, claiming divine guidance. Captured and burned at the stake, later canonized as a Roman Catholic saint."
      },
      {
        name: "Mahatma Gandhi",
        lifespan: "1869-1948",
        category: "Leaders",
        description: "Indian lawyer, anti-colonial nationalist and political ethicist who led India to independence",
        imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=faces",
        context: "Employed nonviolent civil disobedience to lead India to independence from British rule. Inspired movements for civil rights around the world."
      },
      {
        name: "Socrates",
        lifespan: "470-399 BC",
        category: "Philosophers",
        description: "Classical Greek philosopher credited as the founder of Western philosophy",
        imageUrl: "https://images.unsplash.com/photo-1531045535792-96e9320d70c0?w=150&h=150&fit=crop&crop=faces",
        context: "Developed the Socratic method of questioning and critical thinking. His teachings are known primarily through accounts by his students Plato and Xenophon."
      },
      {
        name: "Queen Elizabeth I",
        lifespan: "1533-1603",
        category: "Leaders",
        description: "Queen of England and Ireland from 1558 until her death in 1603",
        imageUrl: "https://images.unsplash.com/photo-1557296387-5358ad7997bb?w=150&h=150&fit=crop&crop=faces",
        context: "Daughter of Henry VIII and Anne Boleyn. Her reign (known as the Elizabethan era) is known for cultural flourishing, including the works of Shakespeare."
      },
      {
        name: "Nikola Tesla",
        lifespan: "1856-1943",
        category: "Scientists",
        description: "Serbian-American inventor, electrical engineer, and futurist",
        imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=faces",
        context: "Best known for his contributions to the design of the modern alternating current (AC) electricity supply system and wireless power transmission."
      },
      {
        name: "Frida Kahlo",
        lifespan: "1907-1954",
        category: "Artists",
        description: "Mexican painter known for her many portraits, self-portraits, and works inspired by Mexico",
        imageUrl: "https://images.unsplash.com/photo-1557053908-4793c484549c?w=150&h=150&fit=crop&crop=faces",
        context: "Her work is celebrated for its raw emotional quality and vibrant colors. Her artistic style was influenced by indigenous Mexican culture and European influences."
      },
      {
        name: "Confucius",
        lifespan: "551-479 BC",
        category: "Philosophers",
        description: "Chinese philosopher and politician of the Spring and Autumn period",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces",
        context: "His teachings, emphasized personal and governmental morality, correctness of social relationships, justice, and sincerity."
      },
      {
        name: "Ada Lovelace",
        lifespan: "1815-1852",
        category: "Scientists",
        description: "English mathematician and writer, known for her work on Charles Babbage's Analytical Engine",
        imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop&crop=faces",
        context: "Often regarded as the first computer programmer for her work on Babbage's proposed mechanical general-purpose computer. Daughter of poet Lord Byron."
      },
      {
        name: "Malcolm X",
        lifespan: "1925-1965",
        category: "Leaders",
        description: "American Muslim minister and human rights activist",
        imageUrl: "https://images.unsplash.com/photo-1567784177951-6fa58317e16b?w=150&h=150&fit=crop&crop=faces",
        context: "Prominent figure in the civil rights movement, advocated for Black empowerment and the promotion of Islam within the Black community."
      },
      {
        name: "Aristotle",
        lifespan: "384-322 BC",
        category: "Philosophers",
        description: "Greek philosopher and polymath during the Classical period in Ancient Greece",
        imageUrl: "https://images.unsplash.com/photo-1589391886645-d51c72dc6846?w=150&h=150&fit=crop&crop=faces",
        context: "Studied under Plato and tutored Alexander the Great. Founded the Lyceum and the Peripatetic school of philosophy. His writings cover physics, biology, metaphysics, ethics, and more."
      },
      {
        name: "Amelia Earhart",
        lifespan: "1897-1937",
        category: "Leaders",
        description: "American aviation pioneer and author",
        imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces",
        context: "First female aviator to fly solo across the Atlantic Ocean. Set many other records and authored books about her flying experiences."
      },
      {
        name: "Ludwig van Beethoven",
        lifespan: "1770-1827",
        category: "Artists",
        description: "German composer and pianist; a crucial figure in the transition between the Classical and Romantic eras",
        imageUrl: "https://images.unsplash.com/photo-1593104547489-5cfb3839a3b5?w=150&h=150&fit=crop&crop=faces",
        context: "Composed many of his most admired works after he became deaf. His works include nine symphonies, 32 piano sonatas, and 16 string quartets."
      },
      {
        name: "Eleanor Roosevelt",
        lifespan: "1884-1962",
        category: "Leaders",
        description: "American political figure, diplomat and activist",
        imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=faces",
        context: "First Lady of the United States during her husband Franklin D. Roosevelt's presidency. Served as United States Delegate to the United Nations General Assembly."
      },
      {
        name: "Charles Darwin",
        lifespan: "1809-1882",
        category: "Scientists",
        description: "English naturalist, geologist and biologist, best known for his contributions to the science of evolution",
        imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=faces",
        context: "His book 'On the Origin of Species' established that all species of life have descended from common ancestors through a process he called natural selection."
      }
    ];
    
    // Insert personas into storage
    historicalPersonas.forEach(persona => {
      const id = this.personaCurrentId++;
      this.personas.set(id, { ...persona, id });
    });
  }
}

// Export singleton instance
export const storage = new MemStorage();
