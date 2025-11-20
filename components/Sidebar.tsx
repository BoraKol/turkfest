import React, { useState } from 'react';
import { Search, MapPin, Calendar, ExternalLink, Music, Tent, Info } from 'lucide-react';
import { Province, EventItem, GeminiResponseState } from '../types';
import { PROVINCES } from '../constants';
import clsx from 'clsx';

interface SidebarProps {
  selectedProvince: Province | null;
  onSelectProvince: (province: Province) => void;
  data: GeminiResponseState;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedProvince, onSelectProvince, data }) => {
  const [filter, setFilter] = useState('');
  const [showAIResponse, setShowAIResponse] = useState(false);

  const filteredProvinces = PROVINCES.filter(p => 
    p.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white shadow-xl z-20 w-full md:w-[400px] border-r border-gray-200">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <Tent className="w-6 h-6" />
          <h1 className="text-xl font-bold tracking-tight">TurkFest Explorer</h1>
        </div>
        <p className="text-red-100 text-sm opacity-90">
          Find festivals & events across Turkey
        </p>
      </div>

      {/* Province Selector */}
      <div className="p-4 border-b border-gray-100 bg-gray-50 shrink-0">
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
          Select Province
        </label>
        <div className="relative">
          <select 
            className="w-full appearance-none bg-white border border-gray-300 hover:border-red-400 rounded-lg py-3 px-4 pr-10 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all cursor-pointer"
            value={selectedProvince?.id || ''}
            onChange={(e) => {
              const prov = PROVINCES.find(p => p.id === Number(e.target.value));
              if (prov) onSelectProvince(prov);
            }}
          >
            <option value="" disabled>Choose a location...</option>
            {PROVINCES.sort((a,b) => a.name.localeCompare(b.name)).map((province) => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-gray-50/50">
        {!selectedProvince ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-4">
            <MapPin className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">Start Exploring</p>
            <p className="text-sm max-w-[200px]">Select a province from the dropdown to discover local events and culture.</p>
          </div>
        ) : (
          <>
            {/* Loading State */}
            {data.loading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500 font-medium animate-pulse">Consulting Gemini & Maps...</p>
              </div>
            )}

            {/* Error State */}
            {data.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <strong>Error:</strong> {data.error}
              </div>
            )}

            {/* Results */}
            {!data.loading && !data.error && (
              <div className="space-y-6">
                
                {/* Toggle AI Text */}
                <div className="flex justify-between items-center">
                   <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Found {data.events.length} Places
                   </h2>
                   <button 
                    onClick={() => setShowAIResponse(!showAIResponse)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                   >
                     <Info size={14} />
                     {showAIResponse ? 'Hide AI Summary' : 'Show AI Summary'}
                   </button>
                </div>

                {showAIResponse && (
                   <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-gray-700 leading-relaxed whitespace-pre-wrap shadow-sm">
                    {data.text}
                   </div>
                )}

                {/* Event Cards */}
                {data.events.length === 0 ? (
                   <div className="text-center py-8 text-gray-500 text-sm bg-white rounded-xl border border-dashed border-gray-300">
                      No map locations found specifically.<br/>Check the summary above.
                   </div>
                ) : (
                  <div className="grid gap-4">
                    {data.events.map((event, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                               {event.coordinates ? (
                                 <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">MAPS</span>
                               ) : (
                                 <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">INFO</span>
                               )}
                            </div>
                            <h3 className="font-bold text-gray-900 leading-snug group-hover:text-red-600 transition-colors">
                              {event.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              Located in {selectedProvince.name}. Click to view on Google Maps.
                            </p>
                          </div>
                          <div className="bg-red-50 p-2 rounded-lg text-red-600 shrink-0">
                            <Music size={20} />
                          </div>
                        </div>
                        
                        {event.uri && (
                          <a 
                            href={event.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 flex items-center justify-center w-full gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg text-xs font-semibold border border-gray-200 transition-colors"
                          >
                            View on Google Maps <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-3 bg-gray-100 border-t border-gray-200 text-center text-[10px] text-gray-400 shrink-0">
        Powered by Gemini 2.5 Flash & Google Maps
      </div>
    </div>
  );
};

export default Sidebar;
