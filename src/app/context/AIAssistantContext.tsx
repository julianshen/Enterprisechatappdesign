import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type PanelType = 'copilot' | 'helpdesk' | null;

interface AIAssistantContextType {
  isOpen: boolean;
  activePanel: PanelType;
  toggleCopilot: () => void;
  toggleHelpDesk: () => void;
  openCopilot: () => void;
  openHelpDesk: () => void;
  close: () => void;
  // Legacy compat
  toggle: () => void;
  open: () => void;
}

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined);

export function AIAssistantProvider({ children }: { children: ReactNode }) {
  const [activePanel, setActivePanel] = useState<PanelType>(null);

  const toggleCopilot = useCallback(() => setActivePanel(prev => prev === 'copilot' ? null : 'copilot'), []);
  const toggleHelpDesk = useCallback(() => setActivePanel(prev => prev === 'helpdesk' ? null : 'helpdesk'), []);
  const openCopilot = useCallback(() => setActivePanel('copilot'), []);
  const openHelpDesk = useCallback(() => setActivePanel('helpdesk'), []);
  const close = useCallback(() => setActivePanel(null), []);

  const isOpen = activePanel !== null;
  const toggle = toggleCopilot; // Legacy compat
  const open = openCopilot;    // Legacy compat

  return (
    <AIAssistantContext.Provider value={{
      isOpen, activePanel,
      toggleCopilot, toggleHelpDesk,
      openCopilot, openHelpDesk,
      close, toggle, open,
    }}>
      {children}
    </AIAssistantContext.Provider>
  );
}

export function useAIAssistant() {
  const context = useContext(AIAssistantContext);
  if (!context) {
    throw new Error('useAIAssistant must be used within AIAssistantProvider');
  }
  return context;
}
