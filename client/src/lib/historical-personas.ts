import { Persona } from './types';

// Default personas for initial loading (will be replaced by API data)
export const defaultPersonas: Persona[] = [
  {
    id: 1,
    name: "Nelson Mandela",
    lifespan: "1918-2013",
    category: "Leaders",
    description: "South African anti-apartheid revolutionary, political leader, and philanthropist",
    imageUrl: "https://images.unsplash.com/photo-1601163584558-c7f1e67f4590?w=150&h=150&fit=crop&crop=faces",
    context: "First black president of South Africa, human rights advocate and Nobel Peace Prize winner."
  },
  {
    id: 2,
    name: "Albert Einstein",
    lifespan: "1879-1955",
    category: "Scientists",
    description: "Theoretical physicist who developed the theory of relativity",
    imageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces",
    context: "One of the most influential scientists of the 20th century."
  }
];

// Categories for filtering
export const categories: string[] = [
  "All",
  "Leaders",
  "Scientists",
  "Artists",
  "Philosophers"
];
