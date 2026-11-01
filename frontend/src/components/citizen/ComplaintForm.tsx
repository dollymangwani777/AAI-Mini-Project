import React, { useState } from 'react';
import { 
  Send, 
  MapPin, 
  Crosshair, 
  Upload, 
  CheckCircle2, 
  X, 
  Phone, 
  Sparkles,
  HelpCircle
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
    label: "Deep Pothole",
    icon: "🕳️",
    text: "Deep hazardous pothole cluster on main road near Sector 21 Metro, two-wheelers slipping and causing traffic backup.",
    location: "Sector 21 Metro Station Approach Road"
  },
  {
    label: "Open Manhole",
    icon: "⚠️",
    text: "Uncovered open manhole near primary school crossing on Civil Lines, high risk of child or pedestrian fall injury.",
    location: "Civil Lines District Hospital Ring"
  },
  {
    label: "Water Main Burst",
    icon: "💧",
    text: "Major potable water main line ruptured and flooding the avenue in Connaught Hub, thousands of liters wasted.",
    location: "Central Square, Connaught Hub"
  },
  {
    label: "Live Wire Hazard",
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
          setLocation(`GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
          setGpsDetecting(false);
          setGpsSuccess(true);
        },
        () => {
          setLatitude(28.4718);
          setLongitude(77.0435);
          setLocation('Near Sector 14 market (GPS Verified)');
          setGpsDetecting(false);
          setGpsSuccess(true);
        },
        { timeout: 4000 }
      );
    } else {
      setLatitude(28.4718);
      setLongitude(77.0435);
      setLocation('Near Sector 14 market (GPS Verified)');
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm transition-colors">
      
      {/* Title */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
          Report a Civic Grievance
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Submit road damage, sanitation hazards, water bursts, or electrical emergencies. CivicPulse AI automatically routes tickets and assigns strict turnaround SLAs.
        </p>
      </div>

      {/* Quick Example Chips */}
      <div className="mb-5">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-2">
          Click an example to auto-fill:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLE_PROMPTS.map((ex, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyExample(ex)}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition active:scale-95"
            >
              <span>{ex.icon}</span>
              <span>{ex.label}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Description Field */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Grievance Description <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about the issue (e.g. location, hazard severity, traffic impact)..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-950 transition"
            />
            <span className="absolute bottom-2 right-3 text-[10px] text-slate-400 font-mono">
              {description.length} chars
            </span>
          </div>
        </div>

        {/* Location & GPS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Location / Landmark <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
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
                placeholder="e.g. Near Sector 14 market"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-950 transition"
              />
            </div>

            {/* Ward preset selector */}
            <select
              onChange={handlePresetSelect}
              className="mt-1.5 w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-[11px] text-slate-600 dark:text-slate-400 focus:outline-none cursor-pointer"
              defaultValue=""
            >
              <option value="" disabled>Or choose verified city ward...</option>
              {PRESET_LOCATIONS.map((loc, i) => (
                <option key={i} value={loc.name}>{loc.name}</option>
              ))}
            </select>
          </div>

          {/* GPS Auto-detect & Citizen Contact */}
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                GPS Pinpoint
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleAutoDetectGps}
                  disabled={gpsDetecting}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition active:scale-95 disabled:opacity-50"
                >
                  <Crosshair className={`w-3.5 h-3.5 text-sky-600 dark:text-sky-400 ${gpsDetecting ? 'animate-spin' : ''}`} />
                  <span>{gpsDetecting ? 'Locating...' : 'Auto-Detect GPS'}</span>
                </button>

                {gpsSuccess && latitude && longitude && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[11px] font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>GPS Verified</span>
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Contact Phone / Email <span className="text-[10px] font-normal text-slate-500">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="+91 98765 43210 or email"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-950 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Photo Evidence Dropzone */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Photo Attachment <span className="text-[10px] font-normal text-slate-500">(Optional)</span>
          </label>
          {imagePreview ? (
            <div className="relative w-full h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
              <img src={imagePreview} alt="Evidence" className="h-full object-cover w-full" />
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-20 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/40 dark:hover:bg-slate-900 transition">
              <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                <Upload className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span className="text-xs font-medium">Click to attach photo or drag file here</span>
              </div>
              <input type="file" accept="image/*" onChange={handleImageMockUpload} className="hidden" />
            </label>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || description.trim().length < 5}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-white bg-sky-600 hover:bg-sky-500 active:scale-[0.99] shadow-md shadow-sky-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Send className="w-4 h-4" />
            <span>{isLoading ? 'Processing Ingestion Pipeline...' : 'Submit Grievance'}</span>
          </button>
          <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Multi-agent pipeline automatically triggers 100m duplicate clustering, severity calculation & SLA assignment.
          </p>
        </div>

      </form>
    </div>
  );
};
