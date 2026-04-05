'use client';

import { useRef, useState } from 'react';
import { FiUpload, FiX, FiCamera } from 'react-icons/fi';

interface AvatarPickerProps {
  value: string;
  onChange: (url: string) => void;
}

const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=George',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivy',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Nova',
];

export default function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [customUrl, setCustomUrl] = useState(value);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onChange(dataUrl);
        setCustomUrl(dataUrl);
        setShowPresets(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Avatar</span>
      </label>

      {/* Preview */}
      {value && (
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <img
            src={value}
            alt="Avatar preview"
            className="h-16 w-16 rounded-full border-2 border-slate-200 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://api.dicebear.com/7.x/avataaars/svg?seed=default';
            }}
          />
          <div className="flex-1">
            <p className="text-xs text-slate-500">Current avatar</p>
            <p className="truncate text-sm text-slate-700">{value.length > 50 ? value.substring(0, 47) + '...' : value}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange('');
              setCustomUrl('');
              setShowPresets(false);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            className="rounded-lg p-2 hover:bg-slate-200"
            title="Remove avatar"
          >
            <FiX className="h-5 w-5 text-slate-600" />
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-3">
        {/* Upload from file */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <FiCamera className="h-5 w-5" />
          <span>Upload photo</span>
        </button>

        {/* Choose from presets */}
        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="flex flex-col items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <FiUpload className="h-5 w-5" />
          <span>{showPresets ? 'Hide' : 'Presets'}</span>
        </button>

        {/* Custom URL */}
        <div className="rounded-lg border border-slate-300 bg-white px-3 py-2">
          <label className="flex flex-col items-center gap-1">
            <span className="text-xs font-medium text-slate-700">Custom URL</span>
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              onBlur={() => {
                if (customUrl.trim() && customUrl !== value) {
                  onChange(customUrl.trim());
                }
              }}
              placeholder="Paste URL"
              className="w-full rounded px-2 py-1 text-xs border border-slate-200 outline-none focus:border-forum-primary"
            />
          </label>
        </div>
      </div>

      {/* Preset avatars */}
      {showPresets && (
        <div className="grid grid-cols-4 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          {AVATAR_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                onChange(preset);
                setCustomUrl(preset);
                setShowPresets(false);
              }}
              className={`group relative overflow-hidden rounded-lg transition-all duration-200 aspect-square ${
                value === preset
                  ? 'ring-2 ring-forum-primary ring-offset-2'
                  : 'hover:ring-2 hover:ring-slate-300 hover:ring-offset-2'
              }`}
            >
              <img
                src={preset}
                alt="Avatar preset"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://api.dicebear.com/7.x/avataaars/svg?seed=default';
                }}
              />
              {value === preset && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <span className="text-sm font-bold text-white">✓</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload avatar from file"
      />
    </div>
  );
}
