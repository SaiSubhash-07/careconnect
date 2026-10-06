import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Radio,
  Share2,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Phone,
  Crosshair
} from 'lucide-react';
import { speakText } from '../../utils/speech';

export const LiveTrackingMap = ({ height = 'h-[380px]', showControls = true, interactive = true }) => {
  const {
    senior,
    liveLocation,
    fetchCurrentGPS,
    emergency,
    broadcastLiveLocation,
    updateSeniorCoordinates,
    language
  } = useApp();

  const [zoom, setZoom] = useState(15);
  const [mapType, setMapType] = useState('street'); // 'street' | 'satellite' | 'radar'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedPin, setSelectedPin] = useState('senior');

  // Home coordinates for geofence calculation
  const homeLat = senior.gpsCoords?.lat || 12.9716;
  const homeLng = senior.gpsCoords?.lng || 77.5946;

  // Calculate distance from home (approximate km)
  const dLat = (liveLocation.lat - homeLat) * 111;
  const dLng = (liveLocation.lng - homeLng) * 111 * Math.cos(homeLat * (Math.PI / 180));
  const distanceFromHomeMeters = Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 1000);
  const isInsideGeofence = distanceFromHomeMeters <= 500;

  // Responder Positions relative to Senior for visualization
  const responderLocations = [
    {
      id: 'nurse-sunita',
      name: 'Nurse Sunita Devi',
      role: 'Registered Caregiver',
      avatar: '👩‍⚕️',
      color: 'bg-emerald-500',
      borderColor: 'border-emerald-300',
      textColor: 'text-emerald-300',
      eta: emergency.assignedHelper?.id === 'cg-1' ? emergency.etaMinutes || 4 : 4,
      distance: '0.8 km',
      dx: 95,
      dy: -65,
      phone: '+91 98111 22334',
      status: emergency.isActive ? 'En Route to Senior' : 'On Standby Nearby'
    },
    {
      id: 'volunteer-amit',
      name: 'Amit Patel',
      role: 'Community First Responder',
      avatar: '🤝',
      color: 'bg-blue-500',
      borderColor: 'border-blue-300',
      textColor: 'text-blue-300',
      eta: emergency.assignedHelper?.id === 'vol-1' ? emergency.etaMinutes || 7 : 7,
      distance: '1.2 km',
      dx: -110,
      dy: 70,
      phone: '+91 98222 33445',
      status: emergency.isActive ? 'En Route to Senior' : 'Patrolling Area'
    },
    {
      id: 'ambulance-108',
      name: '108 Govt. Ambulance Unit',
      role: 'Critical Life Support EMS',
      avatar: '🚑',
      color: 'bg-rose-600',
      borderColor: 'border-rose-300',
      textColor: 'text-rose-300',
      eta: emergency.stage === 'escalated_ambulance' ? emergency.etaMinutes || 5 : 5,
      distance: '1.8 km',
      dx: 140,
      dy: 100,
      phone: '108',
      status: emergency.stage === 'escalated_ambulance' ? '🚨 EMERGENCY DISPATCH ACTIVE' : 'Stationed at Central Base'
    }
  ];

  // Quick Preset Simulator Locations for Testing
  const quickLocations = [
    { label: 'Home (MG Road)', lat: 12.9716, lng: 77.5946, address: 'Flat 402, Green Meadows, MG Road' },
    { label: 'Indiranagar Park', lat: 12.9784, lng: 77.6408, address: '100ft Road Park, Indiranagar' },
    { label: 'City Hospital', lat: 12.9650, lng: 77.5850, address: 'City Hospital Emergency Block' },
    { label: 'Balcony Walk', lat: 12.9718, lng: 77.5948, address: 'Green Meadows Balcony / Garden' }
  ];

  const handleMouseDown = (e) => {
    if (!interactive) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCopyShareLink = () => {
    const shareUrl = `https://careconnect.live/track/${senior.id}?lat=${liveLocation.lat}&lng=${liveLocation.lng}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
      speakText('Live tracking link copied to clipboard.', language);
    }
  };

  // Precise Slippy Map Math for Dynamic Multi-Tile Rendering (Zero Repetition)
  const n = Math.pow(2, zoom);
  const exactTileX = ((liveLocation.lng + 180) / 360) * n;
  const latRad = (liveLocation.lat * Math.PI) / 180;
  const exactTileY = (1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2 * n;

  const baseX = Math.floor(exactTileX);
  const baseY = Math.floor(exactTileY);

  const subX = (exactTileX - baseX) * 256;
  const subY = (exactTileY - baseY) * 256;

  // 7x7 Multi-Tile Spatial Grid (covers ~1800px x 1800px with unique geographic coordinates)
  const tileGrid = [];
  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      tileGrid.push({ dx, dy, tileX: baseX + dx, tileY: baseY + dy });
    }
  }

  const getTileUrl = (tileX, tileY) => {
    // Wrap X seamlessly around the globe
    const normalizedX = ((tileX % n) + n) % n;
    if (tileY < 0 || tileY >= n) return null;

    if (mapType === 'satellite') {
      // High-resolution real satellite hybrid with street & landmark overlays
      return `https://mt1.google.com/vt/lyrs=y&x=${normalizedX}&y=${tileY}&z=${zoom}`;
    }
    if (mapType === 'radar') {
      // Real CartoDB Dark Matter Tactical Map
      return `https://basemaps.cartocdn.com/dark_all/${zoom}/${normalizedX}/${tileY}.png`;
    }
    // Default Street: Real OpenStreetMap
    return `https://tile.openstreetmap.org/${zoom}/${normalizedX}/${tileY}.png`;
  };

  return (
    <div
      className={`relative w-full ${isFullscreen ? 'fixed inset-0 z-50 h-screen rounded-none' : `${height} rounded-3xl`} overflow-hidden border border-slate-700 bg-slate-950 select-none shadow-2xl transition-all duration-300`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* 1. Map Canvas Background */}
      <div
        className="absolute inset-0 transition-transform duration-75 cursor-grab active:cursor-grabbing"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
          transformOrigin: 'center center'
        }}
      >
        {/* Dynamic Multi-Tile Slippy Map Layer (Real Non-Repeating Geographic Imagery) */}
        <div className="absolute top-1/2 left-1/2 pointer-events-none">
          {tileGrid.map(({ dx, dy, tileX, tileY }) => {
            const url = getTileUrl(tileX, tileY);
            if (!url) return null;

            return (
              <img
                key={`${mapType}-${zoom}-${tileX}-${tileY}`}
                src={url}
                alt=""
                className="absolute pointer-events-none select-none"
                style={{
                  width: '256px',
                  height: '256px',
                  left: `${dx * 256 - subX}px`,
                  top: `${dy * 256 - subY}px`,
                  maxWidth: 'none',
                  maxHeight: 'none',
                  filter:
                    mapType === 'satellite'
                      ? 'contrast(1.05) brightness(0.98)'
                      : mapType === 'street'
                      ? 'contrast(1.05) brightness(0.95)'
                      : 'brightness(0.9)'
                }}
                loading="eager"
                onError={(e) => {
                  if (mapType === 'satellite') {
                    // Fallback to Esri World Imagery if Google hybrid tile fails
                    const normalizedX = ((tileX % n) + n) % n;
                    e.target.src = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${tileY}/${normalizedX}`;
                  }
                }}
              />
            );
          })}
        </div>

        {/* Map Center Coordinate Anchor Container */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">

          {/* 500m Geofence Safe Zone Circle */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full border-2 border-dashed ${
              isInsideGeofence
                ? 'border-emerald-500/50 bg-emerald-500/10'
                : 'border-rose-500/60 bg-rose-500/10 animate-pulse'
            }`}
          >
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900/90 text-[10px] font-bold text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
              500m Safe Zone Boundary
            </div>
          </div>

          {/* Concentric Radar Wave Rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-indigo-400/20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-indigo-400/15" />

          {/* Polyline Route from Nurse Sunita to Senior */}
          <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] overflow-visible pointer-events-none">
            <line
              x1="300"
              y1="300"
              x2={300 + 95}
              y2={300 - 65}
              stroke="#10b981"
              strokeWidth="3"
              strokeDasharray="6 4"
              className="animate-pulse"
            />
            {/* Polyline Route from Volunteer Amit to Senior */}
            <line
              x1="300"
              y1="300"
              x2={300 - 110}
              y2={300 + 70}
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeDasharray="5 5"
              className="opacity-80"
            />
            {/* Polyline Route from Ambulance to Senior (Active during emergency) */}
            {emergency.stage === 'escalated_ambulance' && (
              <line
                x1="300"
                y1="300"
                x2={300 + 140}
                y2={300 + 100}
                stroke="#f43f5e"
                strokeWidth="4"
                strokeDasharray="8 4"
                className="animate-pulse"
              />
            )}
          </svg>

          {/* SENIOR CITIZEN PRIMARY BEACON (CENTER) */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto cursor-pointer"
            onClick={() => setSelectedPin('senior')}
          >
            <div className="relative flex flex-col items-center">
              {/* Pulsing Outer Rings */}
              <div className="absolute -inset-4 rounded-full bg-rose-500/30 animate-ping" />
              <div className="absolute -inset-2 rounded-full bg-indigo-500/40 animate-pulse" />

              {/* Pin Card Avatar */}
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-rose-600 via-red-600 to-indigo-600 text-white flex items-center justify-center text-2xl shadow-2xl border-3 border-white ring-4 ring-rose-500/40">
                {senior.avatar || '👴'}
              </div>

              {/* Live Label Badge */}
              <div className="mt-2 bg-slate-900/95 backdrop-blur-md px-3 py-1 rounded-full border border-rose-500/60 shadow-lg text-center whitespace-nowrap">
                <div className="text-xs font-black text-white flex items-center gap-1.5 justify-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{senior.name}</span>
                  <span className="text-[10px] bg-rose-950 text-rose-300 px-1.5 rounded-sm font-mono font-bold">{senior.bloodGroup}</span>
                </div>
                <div className="text-[10px] font-mono text-emerald-300 mt-0.5">
                  {liveLocation.lat.toFixed(4)}°, {liveLocation.lng.toFixed(4)}° • ±{liveLocation.accuracy}m
                </div>
              </div>
            </div>
          </div>

          {/* RESPONDER MARKERS */}
          {responderLocations.map((resp) => {
            const isAssigned = emergency.assignedHelper?.name?.includes(resp.name);
            return (
              <div
                key={resp.id}
                className="absolute z-20 pointer-events-auto cursor-pointer transition-transform hover:scale-110"
                style={{
                  top: `calc(50% + ${resp.dy}px)`,
                  left: `calc(50% + ${resp.dx}px)`,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={() => setSelectedPin(resp.id)}
              >
                <div className="relative flex flex-col items-center">
                  {isAssigned && (
                    <div className="absolute -inset-2 rounded-full bg-emerald-400/40 animate-ping" />
                  )}
                  <div className={`w-11 h-11 rounded-full ${resp.color} text-white flex items-center justify-center text-lg shadow-xl border-2 border-white ring-2 ${resp.borderColor}`}>
                    {resp.avatar}
                  </div>
                  <div className="mt-1 bg-slate-900/90 backdrop-blur px-2 py-0.5 rounded-full border border-slate-700 shadow whitespace-nowrap text-center">
                    <span className="text-[10px] font-bold text-white block">
                      {resp.name}
                    </span>
                    <span className={`text-[9px] font-bold ${resp.textColor}`}>
                      ETA: ~{resp.eta}m • {resp.distance}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* 2. Top Navigation & Telemetry HUD */}
      {showControls && (
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-40 gap-2">
          {/* Geofence & GPS Status Banner */}
          <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-700/80 shadow-lg pointer-events-auto flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${isInsideGeofence ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500 animate-ping'}`} />
            <div>
              <div className="text-xs font-black text-white flex items-center gap-1.5">
                <span>{isInsideGeofence ? '🛡️ Safe Zone Active' : '⚠️ Geofence Breach Warning'}</span>
                <span className="text-[10px] font-mono text-slate-400">({distanceFromHomeMeters}m from residence)</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium truncate max-w-[200px] sm:max-w-xs">
                📍 {liveLocation.address}
              </div>
            </div>
          </div>

          {/* Action Controls Group */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Map Layer Switcher */}
            <div className="flex rounded-xl bg-slate-900/90 backdrop-blur p-0.5 border border-slate-700">
              <button
                onClick={() => setMapType('street')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  mapType === 'street' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Street View"
              >
                Street
              </button>
              <button
                onClick={() => setMapType('satellite')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  mapType === 'satellite' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Satellite Hybrid"
              >
                Satellite
              </button>
              <button
                onClick={() => setMapType('radar')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  mapType === 'radar' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Tactical Radar"
              >
                Radar
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition shadow"
              title={isFullscreen ? 'Exit Fullscreen' : 'Open Fullscreen Map'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* 3. Floating Quick Broadcast & Telemetry Footer */}
      {showControls && (
        <div className="absolute bottom-3 left-3 right-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pointer-events-none z-40">

          {/* Live Broadcast Action Bar */}
          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-700 pointer-events-auto flex flex-wrap items-center gap-2 shadow-lg">
            <button
              onClick={broadcastLiveLocation}
              className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-sm transition active:scale-95 animate-pulse"
              title="Broadcast live coordinates to family, caregivers & 108 ambulance"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Send Live Location Now</span>
            </button>

            <button
              onClick={handleCopyShareLink}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-slate-700"
              title="Copy shareable GPS tracking link"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>{copiedLink ? 'Link Copied! ✓' : 'Share GPS Link'}</span>
            </button>

            <button
              onClick={fetchCurrentGPS}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Fetch Fresh GPS Position"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Map View & Preset Simulator Controls */}
          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700 pointer-events-auto flex items-center gap-2 shadow-lg self-end">
            {/* Zoom Buttons */}
            <div className="flex items-center gap-1 border-r border-slate-700 pr-2">
              <button
                onClick={() => setZoom(z => Math.min(z + 1, 18))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(z => Math.max(z - 1, 12))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPanOffset({ x: 0, y: 0 })}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 transition"
                title="Recenter on Senior"
              >
                <Crosshair className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Landmark Jump Chips for Evaluator Demonstration */}
            <div className="hidden md:flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Test Move:</span>
              {quickLocations.slice(0, 3).map((loc) => (
                <button
                  key={loc.label}
                  onClick={() => {
                    updateSeniorCoordinates(loc.lat, loc.lng, loc.address);
                    setPanOffset({ x: 0, y: 0 });
                    speakText(`Senior moved to ${loc.label}.`, language);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-[10px] font-semibold transition border border-slate-700 cursor-pointer"
                >
                  {loc.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 4. Selected Pin Details Drawer (Bottom Left Floating) */}
      {selectedPin && selectedPin !== 'senior' && (
        <div className="absolute bottom-16 left-3 z-50 bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border border-slate-700 shadow-2xl max-w-xs text-xs animate-fadeIn">
          {(() => {
            const resp = responderLocations.find(r => r.id === selectedPin);
            if (!resp) return null;
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{resp.avatar}</span>
                    <div>
                      <h5 className="font-black text-white">{resp.name}</h5>
                      <span className="text-[10px] text-slate-400">{resp.role}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPin(null)}
                    className="text-slate-400 hover:text-white text-xs px-1"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Distance</span>
                    <span className="font-bold text-emerald-400">{resp.distance}</span>
                  </div>
                  <div className="bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">ETA</span>
                    <span className="font-bold text-indigo-300">~{resp.eta} mins</span>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-slate-300 bg-slate-800/50 px-2 py-1 rounded-lg">
                  Status: {resp.status}
                </div>
                <a
                  href={`tel:${resp.phone}`}
                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition text-xs"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call {resp.name.split(' ')[0]}</span>
                </a>
              </div>
            );
          })()}
        </div>
      )}

    </div>
  );
};
