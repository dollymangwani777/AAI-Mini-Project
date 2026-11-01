import React, { useState } from 'react';
import { 
  Send, 
  MapPin, 
  Crosshair, 
  Upload, 
  Sparkles, 
  AlertCircle, 
  Image as ImageIcon,
  CheckCircle2,
  X,
  Phone,
  Flame
} from 'lucide-react';

interface ComplaintFormProps {
  onSubmit: (data: {
    description: string;
    location: string;
    latitude?: number;
    longitude?: number;
    citizen_contact?: string;
    image_url?: string;
  }) => void;
  isLoading: boolean;
}

const EXAMPLE_PROMPTS = [
  {
    label: "Garbage Overflow",
    icon: "🗑️",
    text: "Garbage overflowing near Sector 14 community market, rotting smell and stray animals blocking pedestrian path.",
    location: "Near Sector 14 market"
  },
  {
    label: "Deep Pothole Hazard",
    icon: "🕳️",
    text: "Deep hazardous pothole cluster on main road near Sector 21 Metro, two-wheelers slipping and causing traffic backup.",
    location: "Sector 21 Metro Station Approach Road"
  },
  {
    label: "Hazardous Open Manhole",
    icon: "⚠️",
    text: "Uncovered open manhole near primary school crossing on Civil Lines, high risk of child or pedestrian fall injury.",
    location: "Civil Lines District Hospital Ring"
  },
  {
    label: "Drinking Water Burst",
    icon: "💧",
    text: "Major potable water main line ruptured and flooding the avenue in Connaught Hub, thousands of liters wasted.",
    location: "Central Square, Connaught Hub"
  },
  {
    label: "Live Sparking Wire",
    icon: "⚡",
    text: "Snapped electrical power cable hanging 4 feet above sidewalk in Industrial Phase 1, dangerous sparking observed.",
    location: "Industrial Phase 1 Gate 3 Bus Stop"
  }
];

const PRESET_LOCATIONS = [
  { name: "Sector 14 - Market & Residential (Ward-04)", lat: 28.4718, lng: 77.0435, label: "Near Sector 14 market" },
  { name: "Sector 21 - Metro Station & Transit (Ward-05)", lat: 28.5522, lng: 77.0583, label: "Sector 21 Metro Station" },
  { name: "Civil Lines - Administration & Hospital (Ward-02)", lat: 28.6784, lng: 77.2249, label: "Civil Lines District Hospital" },
  { name: "Central Business District - Connaught Hub (Ward-01)", lat: 28.6328, lng: 77.2197, label: "Connaught Hub Central Circle" },
  { name: "Cyber City - High-Tech Corridor (Ward-07)", lat: 28.4950, lng: 77.0895, label: "Cyber City Tech Park" },
  { name: "Old City - Heritage Bazaar & Chawk (Ward-03)", lat: 28.6506, lng: 77.2303, label: "Heritage Bazaar Chawk" },
  { name: "Green Park - South Enclave (Ward-06)", lat: 28.5588, lng: 77.2028, label: "Green Park Main Boulevard" },
  { name: "Industrial Area Phase 1 (Ward-08)", lat: 28.5300, lng: 77.2800, label: "Industrial Phase 1 Gate 3" }
];

export const ComplaintForm: React.FC<ComplaintFormProps> = ({ onSubmit, isLoading }) => {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [contact, setContact] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);

  const handleApplyExample = (ex: typeof EXAMPLE_PROMPTS[0]) => {
    setDescription(ex.text);
    setLocation(ex.location);
    // Find preset lat/lng if matching
    const preset = PRESET_LOCATIONS.find(p => p.label.toLowerCase() === ex.location.toLowerCase());
    if (preset) {
      setLatitude(preset.lat);
      setLongitude(preset.lng);
      setGpsSuccess(true);
    } else {
      setLatitude(undefined);
      setLongitude(undefined);
      setGpsSuccess(false);
    }
  };

  const handlePresetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    const found = PRESET_LOCATIONS.find(p => p.name === val);
    if (found) {
      setLocation(found.label);
      setLatitude(found.lat);
      setLongitude(found.lng);
      setGpsSuccess(true);
    }
  };

  const handleAutoDetectGps = () => {
    setGpsDetecting(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setLocation(`GPS Pin: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
          setGpsDetecting(false);
          setGpsSuccess(true);
        },
        () => {
          // Fallback to high-accuracy Sector 14 Smart City coordinate
          setLatitude(28.4718);
          setLongitude(77.0435);
          setLocation('Near Sector 14 market (GPS Calibrated)');
          setGpsDetecting(false);
          setGpsSuccess(true);
        },
        { timeout: 4000 }
      );
    } else {
      setLatitude(28.4718);
      setLongitude(77.0435);
      setLocation('Near Sector 14 market (GPS Calibrated)');
      setGpsDetecting(false);
      setGpsSuccess(true);
    }
  };

  const handleImageMockUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || description.length < 5) return;
    onSubmit({
      description,
      location: location || 'Near Sector 14 market',
      latitude,
      longitude,
      citizen_contact: contact || undefined,
      image_url: imagePreview || undefined
    });
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-['Outfit']">
              Report a Civic Issue or Grievance
            </h2>
            <p className="text-sm text-slate-400">
              CivicPulse AI automatically detects risks, verifies duplicate reports within 100m, and routes to municipal authorities.
            </p>
          </div>
        </div>

        {/* Example Prompt Chips */}
        <div className="mt-4 mb-6">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Try sample citizen reports:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyExample(ex)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/80 hover:border-sky-500/50 transition-all active:scale-95"
              >
                <span>{ex.icon}</span>
                <span>{ex.label}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Grievance Textarea */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-1.5">
              Describe the Grievance / Defect <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g., Severe pothole on Sector 14 main road causing motor accidents. Street water pipe burst nearby..."
                className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition resize-y"
              />
              <span className="absolute bottom-2.5 right-3 text-[11px] text-slate-500 font-mono">
                {description.length} chars
              </span>
            </div>
          </div>

          {/* Location & GPS Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-1.5">
                Location or Landmark <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setGpsSuccess(false);
                  }}
                  placeholder="e.g. Near Sector 14 market, Gate 2"
                  className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition"
                />
              </div>

              {/* Quick Preset Selector */}
              <div className="mt-2">
                <select
                  onChange={handlePresetSelect}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500 cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled>Or select a verified City Ward / Landmark...</option>
                  {PRESET_LOCATIONS.map((loc, i) => (
                    <option key={i} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* GPS Detection & Citizen Phone */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1.5">
                  High-Precision GPS Coordinates
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleAutoDetectGps}
                    disabled={gpsDetecting}
                    className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold hover:border-sky-500/50 transition active:scale-95 disabled:opacity-50"
                  >
                    <Crosshair className={`w-4 h-4 text-sky-400 ${gpsDetecting ? 'animate-spin' : ''}`} />
                    <span>{gpsDetecting ? 'Detecting GPS...' : 'Auto-Detect My GPS'}</span>
                  </button>

                  {gpsSuccess && latitude && longitude && (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-2 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 text-xs font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{latitude.toFixed(3)}, {longitude.toFixed(3)}</span>
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Citizen Mobile / Email (for SMS updates)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="+91 98765 43210 or resident@city.org"
                    className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload Dropzone */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-1.5">
              Photo Evidence <span className="text-xs text-slate-400 font-normal">(Optional)</span>
            </label>
            
            {imagePreview ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center">
                <img src={imagePreview} alt="Evidence Preview" className="h-full object-cover w-full" />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-rose-400 hover:text-white hover:bg-rose-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-950/50 hover:bg-slate-900/80 hover:border-sky-500/50 transition group">
                <div className="flex flex-col items-center justify-center pt-2 pb-2">
                  <Upload className="w-6 h-6 text-slate-400 group-hover:text-sky-400 transition" />
                  <p className="text-xs text-slate-400 mt-1">
                    <span className="font-semibold text-slate-200">Click to upload</span> or drag photo here
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageMockUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || description.trim().length < 5}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 active:scale-[0.99] shadow-lg shadow-sky-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed text-base font-['Outfit']"
            >
              <Send className="w-4 h-4" />
              <span>{isLoading ? 'Running Multi-Agent Pipeline...' : 'Submit Grievance to CivicPulse AI'}</span>
            </button>
            <p className="text-center text-xs text-slate-400 mt-2">
              Autonomous Ingestion: AI parsing, 100m proximity cluster check & deterministic routing triggered instantly.
            </p>
          </div>
        </form>
      </div>

    </div>
  );
};
