import React, { useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { COLLECTIBLES, SCHOOLS, TRANSPORT_META } from '../data/suaoWorld';
import { StudentProgress, TransportMode } from '../types';
import { getUnlockedTransports } from '../utils/storage';

interface PassportModalProps {
  profile: StudentProgress;
  onSelectTransport: (mode: TransportMode) => void;
  onJumpToSchool: (schoolId: string) => void;
  onClose: () => void;
}

export const PassportModal: React.FC<PassportModalProps> = ({
  profile,
  onSelectTransport,
  onJumpToSchool,
  onClose,
}) => {
  const unlocked = getUnlockedTransports(profile);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="passport-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl max-h-[88vh] flex flex-col bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <div className="text-xs text-slate-500 font-medium">
              {profile.name} · 已集得 {profile.stampedSchools.length}/{SCHOOLS.length} 枚校章 · 紀念物{' '}
              {profile.collectedItems.length}/{COLLECTIBLES.length}
            </div>
            <h2 id="passport-title" className="text-xl font-bold text-slate-900 font-display mt-0.5">
              蘇澳小鎮探索護照
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70"
            aria-label="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-7">
          {/* Transport Progression */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">01. 移動載具解鎖進度</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(TRANSPORT_META) as TransportMode[]).map((mode) => {
                const meta = TRANSPORT_META[mode];
                const isUnlocked = unlocked.includes(mode);
                const isActive = profile.transport === mode;
                return (
                  <div
                    key={mode}
                    className={`p-3.5 rounded-lg border flex items-center justify-between gap-3 ${
                      isActive
                        ? 'border-sky-600 bg-sky-50/60'
                        : isUnlocked
                          ? 'border-slate-200 bg-white'
                          : 'border-slate-200 bg-slate-50 opacity-75'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">{meta.label}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{meta.unlockHint}</div>
                    </div>
                    {isUnlocked ? (
                      <button
                        type="button"
                        onClick={() => onSelectTransport(mode)}
                        className={`min-h-[36px] px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                          isActive
                            ? 'bg-sky-700 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        {isActive ? '使用中' : '切換'}
                      </button>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 whitespace-nowrap shrink-0">
                        尚未解鎖
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* School Stamps */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">02. 全鎮十一所國中小校章</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {SCHOOLS.map((school) => {
                const stamped = profile.stampedSchools.includes(school.id);
                return (
                  <button
                    key={school.id}
                    type="button"
                    onClick={() => {
                      onJumpToSchool(school.id);
                      onClose();
                    }}
                    className={`text-left p-3.5 rounded-lg border transition-colors ${
                      stamped
                        ? 'border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-500">{school.zoneLabel}</span>
                      {stamped && <Check className="w-4 h-4 text-emerald-700 shrink-0" />}
                    </div>
                    <div className="mt-1 text-sm font-bold text-slate-900">{school.shortName}</div>
                    <div className="mt-0.5 text-xs text-slate-600">
                      {stamped ? school.stampTitle : '點擊前往探索'}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Collectibles */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">03. 蘇澳在地紀念物圖鑑</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {COLLECTIBLES.map((item) => {
                const got = profile.collectedItems.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-lg border ${
                      got ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="text-sm font-semibold text-slate-900">
                      {got ? item.name : '尚未拾獲的在地紀念物'}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      {got ? item.fact : '在蘇澳地圖各區道路或海邊走走，就能找到隱藏紀念物！'}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
