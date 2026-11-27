import React, { useEffect, useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { StudentProgress } from '../types';

interface ProfileModalProps {
  profiles: StudentProgress[];
  activeId: string;
  onSelectProfile: (id: string) => void;
  onCreateProfile: (name: string) => void;
  onResetCurrent: () => void;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profiles,
  activeId,
  onSelectProfile,
  onCreateProfile,
  onResetCurrent,
  onClose,
}) => {
  const [newName, setNewName] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    onCreateProfile(trimmed);
    setNewName('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <div className="text-xs text-slate-500">教室共用平板離線存檔</div>
            <h2 id="profile-modal-title" className="text-lg font-bold text-slate-900 font-display">
              切換探索學生
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

        <div className="p-6 space-y-5">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="輸入學生姓名或座號"
              maxLength={16}
              className="flex-1 min-h-[42px] px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-sky-600"
            />
            <button
              type="submit"
              className="min-h-[42px] px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              新增
            </button>
          </form>

          <div className="space-y-2 max-h-56 overflow-y-auto">
            {profiles.map((p) => {
              const active = p.id === activeId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onSelectProfile(p.id);
                    onClose();
                  }}
                  className={`w-full min-h-[48px] px-4 py-2.5 rounded-lg border text-left flex items-center justify-between gap-3 transition-colors ${
                    active
                      ? 'border-sky-600 bg-sky-50 text-slate-900'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold">{p.name}</div>
                    <div className="text-xs text-slate-500 tabular-nums">
                      校章 {p.stampedSchools.length} 枚 · 紀念物 {p.collectedItems.length} 個
                    </div>
                  </div>
                  {active && (
                    <span className="text-xs font-semibold text-sky-700 whitespace-nowrap">
                      目前使用
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="text-xs font-medium text-rose-600 hover:text-rose-700 underline"
              >
                清除目前學生進度
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600">確定重設？</span>
                <button
                  type="button"
                  onClick={() => {
                    onResetCurrent();
                    setConfirmReset(false);
                    onClose();
                  }}
                  className="px-2.5 py-1 text-xs font-semibold bg-rose-600 text-white rounded"
                >
                  確定
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded"
                >
                  取消
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="min-h-[38px] px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
