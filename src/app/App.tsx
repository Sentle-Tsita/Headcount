import { createBrowserRouter, RouterProvider, Outlet } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from './components/ui/sonner';
import { routes } from './routes';

const router = createBrowserRouter([
  {
    element: (
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <Outlet />
            <Toaster />
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    ),
    children: routes,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}