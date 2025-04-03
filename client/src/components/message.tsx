import { Message as MessageType } from '@/lib/types';

interface MessageProps {
  message: MessageType;
  personaImageUrl?: string;
  personaName?: string;
}

export function Message({ message, personaImageUrl, personaName }: MessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  // System message styling
  if (isSystem) {
    return (
      <div className="flex justify-center mb-6">
        <div className="bg-muted rounded-lg px-4 py-2 text-sm text-foreground max-w-md text-center">
          {message.content}
        </div>
      </div>
    );
  }

  // Handle quote blocks in the message content
  const formatContent = (content: string) => {
    // Check if content contains a quote (text between quotation marks)
    const parts = content.split(/(".*?")/g);
    
    if (parts.length <= 1) {
      return <p className="text-foreground">{content}</p>;
    }
    
    return (
      <>
        {parts.map((part, index) => {
          // If this part is a quote (starts and ends with quotation marks)
          if (part.match(/^".*?"$/)) {
            return (
              <blockquote 
                key={index} 
                className="pl-3 mt-2 border-l-4 border-primary italic text-foreground font-serif"
              >
                {part}
              </blockquote>
            );
          } 
          // Regular text (if not empty)
          else if (part.trim()) {
            return (
              <p key={index} className="text-foreground mt-2">
                {part}
              </p>
            );
          }
          return null;
        })}
      </>
    );
  };

  // Split content into paragraphs
  const paragraphs = message.content.split(/\n\n|\n/).filter(p => p.trim());

  // User message
  if (isUser) {
    return (
      <div className="flex items-start justify-end space-x-2 max-w-3xl ml-auto">
        <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-none px-4 py-3 shadow-sm">
          <p>{message.content}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-primary/80 flex-shrink-0 flex items-center justify-center">
          <span className="material-icons text-primary-foreground text-sm">person</span>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex items-start space-x-2 max-w-3xl">
      <div className="w-8 h-8 rounded-full bg-muted overflow-hidden flex-shrink-0">
        {personaImageUrl ? (
          <img 
            src={personaImageUrl} 
            alt={personaName || 'Historical figure'} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full bg-primary flex items-center justify-center">
            <span className="material-icons text-primary-foreground text-sm">history_edu</span>
          </div>
        )}
      </div>
      <div className="bg-card rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
        {paragraphs.length > 0 ? (
          paragraphs.map((paragraph, index) => (
            <div key={index} className={index > 0 ? "mt-2" : ""}>
              {formatContent(paragraph)}
            </div>
          ))
        ) : (
          <p className="text-foreground">{message.content}</p>
        )}
      </div>
    </div>
  );
}
