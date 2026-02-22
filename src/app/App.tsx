import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ThemeProvider } from './context/ThemeContext';
import { AIAssistantProvider } from './context/AIAssistantContext';
import { I18nProvider } from './context/I18nContext';

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AIAssistantProvider>
          <RouterProvider router={router} />
        </AIAssistantProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
