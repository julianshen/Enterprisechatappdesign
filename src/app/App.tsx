import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ThemeProvider } from './context/ThemeContext';
import { AIAssistantProvider } from './context/AIAssistantContext';
import { I18nProvider } from './context/I18nContext';
import { FloatingChatProvider } from './context/FloatingChatContext';
import { Toaster } from '@/components/ui';

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AIAssistantProvider>
          <FloatingChatProvider>
            <RouterProvider router={router} />
            <Toaster position="bottom-left" richColors />
          </FloatingChatProvider>
        </AIAssistantProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
