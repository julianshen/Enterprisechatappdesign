import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ThemeProvider } from './context/ThemeContext';
import { AIAssistantProvider } from './context/AIAssistantContext';

export default function App() {
  return (
    <ThemeProvider>
      <AIAssistantProvider>
        <RouterProvider router={router} />
      </AIAssistantProvider>
    </ThemeProvider>
  );
}
