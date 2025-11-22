import React, { useCallback } from 'react';
import { Upload, Music } from 'lucide-react';

interface AudioUploaderProps {
  onFileSelected: (file: File) => void;
  isLoading: boolean;
}

const AudioUploader: React.FC<AudioUploaderProps> = ({ onFileSelected, isLoading }) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/')) {
        onFileSelected(file);
      } else {
        alert("Please upload an audio file");
      }
    }
  }, [isLoading, onFileSelected]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLoading) return;
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0]);
    }
  }, [isLoading, onFileSelected]);

  return (
    <div 
      className={`
        border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300
        ${isLoading ? 'opacity-50 cursor-not-allowed border-slate-600' : 'border-slate-600 hover:border-blue-500 hover:bg-slate-800/50 cursor-pointer'}
      `}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <input
        type="file"
        accept="audio/*"
        onChange={handleChange}
        className="hidden"
        id="audio-upload"
        disabled={isLoading}
      />
      <label htmlFor="audio-upload" className="cursor-pointer flex flex-col items-center gap-4">
        <div className="p-4 bg-slate-800 rounded-full text-blue-400">
          {isLoading ? <Music className="w-8 h-8 animate-bounce" /> : <Upload className="w-8 h-8" />}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-200">
            {isLoading ? 'Analyzing Track...' : 'Drop your track here'}
          </h3>
          <p className="text-slate-400 mt-2 text-sm">
            Supports MP3, WAV, AAC (Max 10MB recommended)
          </p>
        </div>
        {!isLoading && (
          <span className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            Select File
          </span>
        )}
      </label>
    </div>
  );
};

export default AudioUploader;
