import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface UploadZoneProps {
  label: string;
  description: string;
  image: string | null;
  onImageUpload: (file: File, base64: string) => void;
  onClear: () => void;
  accept?: string;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  label,
  description,
  image,
  onImageUpload,
  onClear,
  accept = "image/*"
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    inputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      
      {!image ? (
        <div 
          onClick={triggerUpload}
          className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors group h-64 bg-white"
        >
          <div className="bg-indigo-100 p-3 rounded-full mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6 text-indigo-600" />
          </div>
          <p className="text-slate-900 font-medium text-center">{description}</p>
          <p className="text-slate-500 text-xs mt-2">Supports JPG, PNG</p>
          <input 
            ref={inputRef}
            type="file" 
            accept={accept} 
            className="hidden" 
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="relative h-64 w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
          <img 
            src={image} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="absolute top-2 right-2 bg-white/90 hover:bg-red-50 text-slate-600 hover:text-red-600 p-2 rounded-full shadow-lg transition-all"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
            <ImageIcon className="w-3 h-3 inline mr-1" />
            Ready
          </div>
        </div>
      )}
    </div>
  );
};