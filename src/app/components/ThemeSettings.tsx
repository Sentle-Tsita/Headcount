import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Palette } from 'lucide-react';

export function ThemeSettings() {
  const { currentTheme, themes, setTheme } = useTheme();

  const themeOptions = [
    { name: 'default', label: 'Default', color: '#4f46e5' },
    { name: 'ocean', label: 'Ocean', color: '#0891b2' },
    { name: 'sunset', label: 'Sunset', color: '#dc2626' },
    { name: 'forest', label: 'Forest', color: '#059669' },
    { name: 'royal', label: 'Royal', color: '#7c3aed' },
    { name: 'dark', label: 'Dark', color: '#1f2937' },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Palette className="w-4 h-4" />
          Theme
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose Theme</DialogTitle>
          <DialogDescription>
            Select a color theme for your dashboard
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {themeOptions.map((theme) => (
            <button
              key={theme.name}
              onClick={() => setTheme(theme.name)}
              className={`p-4 rounded-lg border-2 transition-all ${
                currentTheme === theme.name
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full"
                  style={{ backgroundColor: theme.color }}
                />
                <div className="text-left">
                  <p className="font-medium">{theme.label}</p>
                  {currentTheme === theme.name && (
                    <p className="text-xs text-indigo-600">Active</p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
