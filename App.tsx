import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import MapComponent from './components/MapComponent';
import { Province, GeminiResponseState } from './types';
import { fetchEventsInProvince } from './services/geminiService';

const App: React.FC = () => {
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [geminiData, setGeminiData] = useState<GeminiResponseState>({
    text: '',
    events: [],
    loading: false,
    error: null
  });

  const handleSelectProvince = useCallback(async (province: Province) => {
    setSelectedProvince(province);
    setGeminiData(prev => ({ ...prev, loading: true, error: null, events: [], text: '' }));

    try {
      const { text, events } = await fetchEventsInProvince(province.name);
      setGeminiData({
        text,
        events,
        loading: false,
        error: null
      });
    } catch (err) {
      setGeminiData({
        text: '',
        events: [],
        loading: false,
        error: "Failed to retrieve event data. Please check your connection or try again."
      });
    }
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-gray-100 overflow-hidden">
      {/* Map Container - Mobile Order 2 (Bottom), Desktop Order 2 (Right) */}
      {/* Actually better to keep sidebar left on desktop, top/bottom on mobile. 
          Tailwind order utilities can swap visual order. */}
      
      {/* Sidebar Component */}
      <div className="w-full md:w-auto h-[45vh] md:h-full flex-shrink-0 order-2 md:order-1 relative z-10 shadow-2xl">
         <Sidebar 
           selectedProvince={selectedProvince} 
           onSelectProvince={handleSelectProvince}
           data={geminiData}
         />
      </div>

      {/* Map Component */}
      <div className="flex-1 h-[55vh] md:h-full order-1 md:order-2 relative z-0">
         <MapComponent 
            selectedProvince={selectedProvince} 
            events={geminiData.events}
         />
         {/* Overlay info for Mobile if map is active but no selection */}
         {!selectedProvince && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg z-[1000] text-xs font-semibold text-gray-600 md:hidden pointer-events-none">
               Select a province below
            </div>
         )}
      </div>
    </div>
  );
};

export default App;
