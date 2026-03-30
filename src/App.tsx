import './styles/global.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppThemeProvider } from './theme';
import { queryClient } from './lib/queryClient';
import { AppRouter } from './routes/AppRouter';

export default function App() {
  return (
    <AppThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
      </QueryClientProvider>
    </AppThemeProvider>
  );
}
