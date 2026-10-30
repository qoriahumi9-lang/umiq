import React from 'react';
import { X, ZoomIn, Info } from 'lucide-react';

interface AuthenticMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthenticMenuModal: React.FC<AuthenticMenuModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 no-print overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col my-auto text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-800/80">
          <div className="flex items-center gap-2">
            <ZoomIn className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-extrabold text-base text-amber-400">
                Papan Menu Asli Warung Nasi Ampera
              </h3>
              <p className="text-xs text-slate-400">
                Referensi foto papan menu fisik restoran
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Content */}
        <div className="p-4 sm:p-6 bg-slate-950 flex flex-col items-center justify-center overflow-auto max-h-[75vh]">
          <img
            src="/assets/aistudio/image_965e8363.png"
            alt="Papan Menu Warung Nasi Ampera Masakan Sunda Rasa Juara"
            className="max-h-[70vh] w-auto object-contain rounded-xl shadow-2xl border border-slate-800"
          />
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Semua harga & menu di aplikasi kasir ini telah disesuaikan 100% dengan papan resmi ini.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
