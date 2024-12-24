import React from 'react';
import { Palette as PaletteIcon } from 'lucide-react';
import { generatePalette } from './utils/colorUtils';
import { savePalette } from './utils/storageUtils';
import { ColorCard } from './components/ColorCard';
import { PaletteControls } from './components/PaletteControls';
import { Palette, Color, ColorHarmony, PaletteTheme } from './types/colors';

function App() {
  const [palette, setPalette] = React.useState<Palette>(() => ({
    colors: generatePalette(),
    id: crypto.randomUUID(),
  }));
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [harmony, setHarmony] = React.useState<ColorHarmony | undefined>();
  const [theme, setTheme] = React.useState<PaletteTheme | undefined>();

  const generateNewPalette = () => {
    setIsGenerating(true);
    setPalette({
      colors: generatePalette(5, harmony, theme),
      id: crypto.randomUUID(),
    });
    setTimeout(() => setIsGenerating(false), 500);
  };

  const handleKeyPress = React.useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space') {
      generateNewPalette();
    }
  }, [harmony, theme]);

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const handleLockToggle = (toggledColor: Color) => {
    setPalette(prev => ({
      ...prev,
      colors: prev.colors.map(color => 
        color.hex === toggledColor.hex 
          ? { ...color, locked: !color.locked }
          : color
      )
    }));
  };

  const handleColorChange = (changedColor: Color) => {
    setPalette(prev => ({
      ...prev,
      colors: prev.colors.map(color => 
        color.hex === changedColor.hex ? changedColor : color
      )
    }));
  };

  const handleSave = () => {
    savePalette(palette);
  };

  const handleExport = () => {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(palette, null, 2)
    )}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `palette-${palette.id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <PaletteIcon className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Color Palette Generator</h1>
          </div>
          
          <PaletteControls
            onGenerate={generateNewPalette}
            onHarmonyChange={setHarmony}
            onThemeChange={setTheme}
            onSave={handleSave}
            onExport={handleExport}
            isGenerating={isGenerating}
          />
        </header>

        <div className="mb-4 text-sm text-gray-600">
          Press spacebar to generate a new palette
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {palette.colors.map((color, index) => (
            <ColorCard
              key={`${palette.id}-${index}`}
              color={color}
              onLockToggle={handleLockToggle}
              onColorChange={handleColorChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;