import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Province, EventItem } from '../types';
import { DEFAULT_ZOOM } from '../constants';

// Fix for default Leaflet marker icons in bundlers
const createCustomIcon = () => {
  const svgString = renderToStaticMarkup(
    <div className="relative flex items-center justify-center w-8 h-8">
      <MapPin className="w-8 h-8 text-red-600 fill-red-100 drop-shadow-md" />
      <div className="absolute -bottom-1 w-2 h-2 bg-red-600 rounded-full animate-ping opacity-75"></div>
    </div>
  );
  
  return new L.DivIcon({
    html: svgString,
    className: 'custom-marker-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const customIcon = createCustomIcon();

// Component to handle map movements
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, {
      duration: 1.5,
      easeLinearity: 0.25
    });
  }, [center, zoom, map]);
  return null;
};

interface MapComponentProps {
  selectedProvince: Province | null;
  events: EventItem[];
}

const MapComponent: React.FC<MapComponentProps> = ({ selectedProvince, events }) => {
  // Default center (Turkey)
  const center: [number, number] = selectedProvince 
    ? [selectedProvince.lat, selectedProvince.lng] 
    : [39.0, 35.0];
    
  const zoom = selectedProvince ? 11 : 6;

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController center={center} zoom={zoom} />

        {/* Marker for selected Province Center if no events have coords */}
        {selectedProvince && events.filter(e => e.coordinates).length === 0 && (
           <Marker position={[selectedProvince.lat, selectedProvince.lng]} icon={customIcon}>
            <Popup>
              <div className="font-semibold text-gray-800">{selectedProvince.name} Center</div>
              <div className="text-xs text-gray-500">Exploring events here...</div>
            </Popup>
           </Marker>
        )}

        {/* Markers for Events with coordinates */}
        {events.map((event, idx) => (
          event.coordinates ? (
            <Marker 
              key={idx} 
              position={[event.coordinates.lat, event.coordinates.lng]} 
              icon={customIcon}
            >
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold text-sm text-indigo-900">{event.title}</h3>
                  {event.address && <p className="text-xs text-gray-600 mt-1">{event.address}</p>}
                  <a 
                    href={event.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline mt-2 flex items-center gap-1"
                  >
                    <Navigation size={12} /> Open in Google Maps
                  </a>
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
