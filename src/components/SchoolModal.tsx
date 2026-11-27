import React, { useEffect, useState } from 'react';
import { CheckCircle2, Compass, X } from 'lucide-react';
import { GradeLevel, School } from '../types';
import { sound } from '../utils/sound';

interface SchoolModalProps {
  school: School;
  gradeLevel: GradeLevel;
  alreadyStamped: boolean;
  onChangeGrade: (level: GradeLevel) => void;
  onCompleteStamp: (schoolId: string, score: number) => void;
  onClose: () => void;
}

export const SchoolModal: React.FC<SchoolModalProps> = ({
  school,
  gradeLevel,
  alreadyStamped,
  onChangeGrade,
  onCompleteStamp,
  onClose,
}) => {
  const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [qIndex, setQIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const questions = school.questions[gradeLevel];
  const currentQ = questions[qIndex];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleGradeSwitch = (level: GradeLevel) => {
    onChangeGrade(level);
    setStep('intro');
    setQIndex(0);
    setSelectedIdx(null);
    setCorrectCount(0);
  };

  const handleSelectOption = (idx: number) => {
    if (selectedIdx !== null) return;
    setSelectedIdx(idx);
    if (idx === currentQ.answerIndex) {
      setCorrectCount((c) => c + 1);
      sound.playCorrect();
    } else {
      sound.playWrong();
    }
  };

  const handleNext = () => {
    if (qIndex + 1 < questions.length) {
      setQIndex((i) => i + 1);
      setSelectedIdx(null);
    } else {
      const passed = correctCount >= 1;
      if (passed) {
        sound.playStamp();
        onCompleteStamp(school.id, correctCount);
      }
      setStep('result');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="school-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-200 bg-slate-50/60">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
              <span>{school.categoryLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{school.zoneLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{school.address}</span>
              {alreadyStamped && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-700 font-semibold">已取得 {school.stampTitle}</span>
                </>
              )}
            </div>
            <h2
              id="school-modal-title"
              className="mt-1 text-xl font-bold text-slate-900 font-display tracking-tight"
            >
              {school.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 transition-colors shrink-0"
            aria-label="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Grade Level Selector */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-slate-600">挑戰題庫難度</span>
            <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => handleGradeSwitch('elementary')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  gradeLevel === 'elementary'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                國小組
              </button>
              <button
                type="button"
                onClick={() => handleGradeSwitch('junior')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  gradeLevel === 'junior'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                國中組
              </button>
            </div>
          </div>

          {step === 'intro' && (
            <div className="space-y-5">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-semibold text-sky-800">
                  {school.npcName} · {school.npcTitle}
                </div>
                <p className="text-sm leading-relaxed text-slate-800">{school.greeting}</p>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-slate-900">學校與在地特色</h3>
                <p className="text-sm leading-relaxed text-slate-600">{school.featureSummary}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  完成 {questions.length} 題探索問答，即可蓋下「{school.stampTitle}」
                </span>
                <button
                  type="button"
                  onClick={() => setStep('quiz')}
                  className="min-h-[44px] px-5 py-2.5 bg-[#D95338] hover:bg-[#C0452C] text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  開始挑戰
                </button>
              </div>
            </div>
          )}

          {step === 'quiz' && currentQ && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 tabular-nums">
                <span>
                  第 {qIndex + 1} / {questions.length} 題
                </span>
                <span>目前答對 {correctCount} 題</span>
              </div>

              <p className="text-base font-semibold text-slate-900 leading-relaxed">
                {currentQ.prompt}
              </p>

              <div className="space-y-2.5">
                {currentQ.options.map((opt, idx) => {
                  const answered = selectedIdx !== null;
                  const isCorrect = idx === currentQ.answerIndex;
                  const isPicked = idx === selectedIdx;

                  let btnStyle =
                    'border-slate-200 bg-white text-slate-800 hover:border-sky-400 hover:bg-sky-50/50';
                  if (answered) {
                    if (isCorrect) {
                      btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
                    } else if (isPicked) {
                      btnStyle = 'border-rose-400 bg-rose-50 text-rose-900';
                    } else {
                      btnStyle = 'border-slate-200 bg-slate-50 text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={answered}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full min-h-[44px] text-left px-4 py-3 rounded-lg border text-sm transition-colors flex items-center justify-between gap-3 ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {answered && isCorrect && (
                        <span className="text-xs font-semibold text-emerald-700 shrink-0">正確</span>
                      )}
                      {answered && isPicked && !isCorrect && (
                        <span className="text-xs font-semibold text-rose-700 shrink-0">再想想</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedIdx !== null && (
                <div className="p-4 rounded-lg bg-sky-50/70 border border-sky-200 space-y-3">
                  <p className="text-sm text-slate-800 leading-relaxed">{currentQ.explanation}</p>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="min-h-[42px] px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      {qIndex + 1 < questions.length ? '下一題' : '查看結果'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'result' && (
            <div className="py-2 space-y-5 text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                {correctCount >= 1 ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : (
                  <Compass className="w-7 h-7 text-amber-600" />
                )}
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  {correctCount >= 1
                    ? `成功取得「${school.stampTitle}」！`
                    : '差一點就過關了'}
                </h3>
                <p className="text-sm text-slate-600 tabular-nums">
                  本次答對 {correctCount} / {questions.length} 題
                  {correctCount >= 1
                    ? '，地圖上的校區已經點亮並長出新綠意！'
                    : '，再試一次，答對 1 題以上就能獲得校章。'}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('quiz');
                    setQIndex(0);
                    setSelectedIdx(null);
                    setCorrectCount(0);
                  }}
                  className="min-h-[44px] px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
                >
                  再練一次
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[44px] px-5 py-2 bg-[#D95338] hover:bg-[#C0452C] text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
                >
                  回到蘇澳地圖
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
