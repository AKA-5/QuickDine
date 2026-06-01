import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { chatWithAssistant } from '../../services/gemini';

export default function ChatAssistant({ restaurants }) {
  const { user } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: "As-salamu alaykum! I'm your QuickDine assistant. Ask me anything about nearby restaurants, dishes, or budget options!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  // Suggestions chips
  const suggestionChips = [
    'What should I eat tonight?',
    'Find something under PKR 1000',
    'Best scenic restaurant?',
    'Where to go for a family dine-in?'
  ];

  // Scroll to bottom when messages list updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || isTyping) return;

    // Reset input
    if (!textToSend) setInput('');

    // Append user message
    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Build conversation history in model format
      // filter out the initial welcome message if needed or map them
      const history = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      // Call Gemini API helper
      const responseText = await chatWithAssistant(
        text,
        user?.tasteProfile || {},
        restaurants || [],
        history
      );

      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (err) {
      console.error('Failed to chat with Gemini:', err);
      setMessages(prev => [
        ...prev, 
        { role: 'model', text: "Sorry, I had trouble processing that request. Please try again." }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (chipText) => {
    handleSendMessage(chipText);
  };

  if (!user || user.role !== 'customer') return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-accent text-white rounded-full h-14 w-14 shadow-2xl hover:scale-105 transition-transform flex items-center justify-center focus:outline-none"
          title="Ask AI Assistant"
        >
          <span className="material-symbols-outlined text-2xl select-none">chat</span>
        </button>
      )}

      {/* Slide-up Chat Panel */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[500px] bg-white border border-border shadow-2xl rounded-lg overflow-hidden flex flex-col justify-between">
          
          {/* Chat Header */}
          <div className="bg-accent p-4 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-2">
              <span className="material-symbols-outlined select-none">smart_toy</span>
              <div>
                <h3 className="font-serif text-sm font-semibold leading-tight">QuickDine AI Guide</h3>
                <p className="text-[10px] text-accent-light uppercase tracking-wider">Powered by Gemini 2.5 Flash</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-accent-light focus:outline-none"
            >
              <span className="material-symbols-outlined text-lg select-none">close</span>
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg">
            {messages.map((m, idx) => {
              const isAI = m.role === 'model';
              return (
                <div 
                  key={idx} 
                  className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[80%] rounded-[12px] p-3 text-xs leading-relaxed text-left ${
                    isAI 
                      ? 'bg-white text-text-primary border border-border/80' 
                      : 'bg-accent text-white'
                  }`}>
                    {m.text}
                  </div>
                </div>
              );
            })}

            {/* Typing Loader */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-text-secondary border border-border/80 rounded-[12px] px-4 py-3 text-xs">
                  <div className="flex items-center space-x-1">
                    <span className="h-1.5 w-1.5 bg-text-secondary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 bg-text-secondary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 bg-text-secondary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips & Input */}
          <div className="border-t border-border bg-white p-3 space-y-3 shrink-0">
            
            {/* suggestion chips */}
            {messages.length === 1 && !isTyping && (
              <div className="flex flex-wrap gap-1.5 justify-start">
                {suggestionChips.map(chip => (
                  <button
                    key={chip}
                    onClick={() => handleSuggestionClick(chip)}
                    className="text-[10px] font-semibold text-text-secondary border border-border rounded-full px-2.5 py-1 hover:bg-bg hover:text-text-primary transition-colors text-left"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* text field input */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about dishes, locations, spice..."
                disabled={isTyping}
                className="flex-1 border border-border rounded-[6px] bg-white px-3 py-2 text-xs focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-50 font-sans"
              />
              
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="bg-accent text-white rounded-[6px] h-8 w-8 flex items-center justify-center hover:bg-[#B03D24] transition-colors disabled:opacity-30 shrink-0"
              >
                <span className="material-symbols-outlined text-sm select-none">send</span>
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}
