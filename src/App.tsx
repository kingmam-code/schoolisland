import React, { useCallback, useMemo, useState } from 'react';
import {
  BookOpen,
  Compass,
  MapPin,
  Navigation,
  PanelRightClose,
  PanelRightOpen,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { PassportModal } from './components/PassportModal';
import { ProfileModal } from './components/ProfileModal';
import { SchoolModal } from './components/SchoolModal';
import { WorldCanvas } from './components/WorldCanvas';
import { COLLECTIBLES, SCHOOLS, TRANSPORT_META, ZONES } from './data/suaoWorld';
import { Collectible, GameState, GradeLevel, School, StudentProgress, TransportMode } from './types';
import { sound } from './utils/sound';
import {
  DEFAULT_SPAWN,
  createDefaultProfile,
  getUnlockedTransports,
  loadActiveProfileId,
  loadProfiles,
  saveActiveProfileId,
  saveProfiles,
} from './utils/storage';

type SchoolFilter = 'all' | 'elementary' | 'junior';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [profiles, setProfiles] = useState<StudentProgress[]>(() => loadProfiles());
  const [activeId, setActiveId] = useState<string>(() => loadActiveProfileId());
  const [muted, setMuted] = useState(false);

  const [filter, setFilter] = useState<SchoolFilter>('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSchool, setActiveSchool] = useState<School | null>(null);
  const [nearbySchool, setNearbySchool] = useState<School | null>(null);
  const [passportOpen, setPassportOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [focusRequest, setFocusRequest] = useState<{ x: number; y: number; seq: number } | null>(null);
  const [pickupBanner, setPickupBanner] = useState<Collectible | null>(null);

  const activeProfile = useMemo(() => {
    return profiles.find((p) => p.id === activeId) || profiles[0];
  }, [profiles, activeId]);

  const updateActiveProfile = useCallback(
    (updater: (prev: StudentProgress) => StudentProgress) => {
      setProfiles((prevList) => {
        const nextList = prevList.map((item) =>
          item.id === activeProfile.id ? { ...updater(item), updatedAt: Date.now() } : item
        );
        saveProfiles(nextList);
        return nextList;
      });
    },
    [activeProfile.id]
  );

  const unlockedTransports = useMemo(
    () => getUnlockedTransports(activeProfile),
    [activeProfile]
  );

  const filteredSchools = useMemo(() => {
    return SCHOOLS.filter((s) => {
      if (filter === 'all') return true;
      if (filter === 'elementary') return s.category === 'elementary' || s.category === 'combined';
      return s.category === 'junior' || s.category === 'combined';
    });
  }, [filter]);

  const handleToggleMute = () => {
    const next = !muted;
    setMuted(next);
    sound.setMuted(next);
  };

  const handleMove = useCallback(
    (x: number, y: number) => {
      updateActiveProfile((p) =>
        p.playerX === x && p.playerY === y ? p : { ...p, playerX: x, playerY: y }
      );
    },
    [updateActiveProfile]
  );

  const handleArriveSchool = useCallback(
    (school: School) => {
      sound.playArrive();
      updateActiveProfile((p) =>
        p.discoveredSchools.includes(school.id)
          ? p
          : { ...p, discoveredSchools: [...p.discoveredSchools, school.id] }
      );
      setActiveSchool(school);
    },
    [updateActiveProfile]
  );

  const handleCollectItem = useCallback(
    (item: Collectible) => {
      sound.playPickup();
      updateActiveProfile((p) =>
        p.collectedItems.includes(item.id)
          ? p
          : { ...p, collectedItems: [...p.collectedItems, item.id] }
      );
      setPickupBanner(item);
      setTimeout(() => {
        setPickupBanner((cur) => (cur?.id === item.id ? null : cur));
      }, 4800);
    },
    [updateActiveProfile]
  );

  const handleCompleteStamp = (schoolId: string, score: number) => {
    updateActiveProfile((p) => {
      const nextStamped = p.stampedSchools.includes(schoolId)
        ? p.stampedSchools
        : [...p.stampedSchools, schoolId];
      const nextScores = {
        ...p.schoolScores,
        [schoolId]: Math.max(p.schoolScores[schoolId] || 0, score),
      };
      return {
        ...p,
        stampedSchools: nextStamped,
        schoolScores: nextScores,
        discoveredSchools: p.discoveredSchools.includes(schoolId)
          ? p.discoveredSchools
          : [...p.discoveredSchools, schoolId],
      };
    });
  };

  const handleFastTravelToSchool = (school: School) => {
    const destX = school.x;
    const destY = school.y + 32;
    updateActiveProfile((p) => ({
      ...p,
      playerX: destX,
      playerY: destY,
      discoveredSchools: p.discoveredSchools.includes(school.id)
        ? p.discoveredSchools
        : [...p.discoveredSchools, school.id],
    }));
    setFocusRequest({ x: destX, y: destY, seq: Date.now() });
    setNearbySchool(school);
    sound.playArrive();
  };

  const handleReturnPlaza = () => {
    updateActiveProfile((p) => ({
      ...p,
      playerX: DEFAULT_SPAWN.x,
      playerY: DEFAULT_SPAWN.y,
    }));
    setFocusRequest({ x: DEFAULT_SPAWN.x, y: DEFAULT_SPAWN.y, seq: Date.now() });
  };

  const handleSelectProfile = (id: string) => {
    setActiveId(id);
    saveActiveProfileId(id);
    const found = profiles.find((p) => p.id === id);
    if (found) {
      setFocusRequest({ x: found.playerX, y: found.playerY, seq: Date.now() });
    }
  };

  const handleCreateProfile = (name: string) => {
    const id = 'stu_' + Date.now().toString(36);
    const created = createDefaultProfile(id, name);
    const next = [...profiles, created];
    setProfiles(next);
    saveProfiles(next);
    setActiveId(id);
    saveActiveProfileId(id);
    setFocusRequest({ x: created.playerX, y: created.playerY, seq: Date.now() });
  };

  const handleResetCurrent = () => {
    const reset = createDefaultProfile(activeProfile.id, activeProfile.name);
    updateActiveProfile(() => reset);
    setFocusRequest({ x: reset.playerX, y: reset.playerY, seq: Date.now() });
  };

  const handleChangeGrade = (level: GradeLevel) => {
    updateActiveProfile((p) => ({ ...p, gradeLevel: level }));
  };

  const handleSelectTransport = (mode: TransportMode) => {
    if (!unlockedTransports.includes(mode)) return;
    updateActiveProfile((p) => ({ ...p, transport: mode }));
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#F7F9FB] text-slate-900">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="h-14 shrink-0 px-4 sm:px-6 bg-white border-b border-slate-200 flex items-center justify-between gap-8 z-30">
        {/* Zone 1: Brand Title */}
        <button
          type="button"
          onClick={() => setGameState('TITLE_MENU')}
          className="text-base sm:text-lg font-bold tracking-tight text-slate-900 font-display whitespace-nowrap shrink-0 hover:text-sky-800 transition-colors"
        >
          蘇澳鎮中小學學習島
        </button>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setGameState('PLAYING')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              gameState === 'PLAYING' ? 'text-slate-900 font-semibold underline underline-offset-4' : ''
            }`}
          >
            全鎮地圖
          </button>
          <button
            type="button"
            onClick={() => setPassportOpen(true)}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            探索護照
          </button>
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            切換學生（{activeProfile.name}）
          </button>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          {gameState === 'TITLE_MENU' ? (
            <button
              type="button"
              onClick={() => setGameState('PLAYING')}
              className="min-h-[38px] px-4 py-1.5 bg-[#D95338] hover:bg-[#C0452C] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              開始探索
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setPassportOpen(true)}
              className="min-h-[38px] px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 tabular-nums"
            >
              護照 {activeProfile.stampedSchools.length}/{SCHOOLS.length}
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      {gameState === 'TITLE_MENU' ? (
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 sm:py-12">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Hero Intro */}
            <div className="lg:col-span-7 space-y-6">
              <div className="text-xs font-semibold text-sky-800 tracking-wide">
                宜蘭縣蘇澳鎮 · 8 所國小與 4 所國中部共學地圖
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-display leading-tight text-balance">
                用雙腳與小帆船，走進蘇澳十一所國中小學
              </h1>
              <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
                從北端的新馬食農平原出發，經過恆溫 22°C 的蘇澳冷泉市鎮、白米木屐山谷、無尾港水鳥濕地與南方澳漁港，一路探索到大南澳朝陽山海灣。點擊地面或使用鍵盤方向鍵移動角色，拜訪每間學校並蓋下專屬紀念章。
              </p>

              {/* Difficulty Preset */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">選擇預設挑戰難度</div>
                    <div className="text-xs text-slate-500">進入學校後仍可隨時切換題庫難度</div>
                  </div>
                  <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleChangeGrade('elementary')}
                      className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                        activeProfile.gradeLevel === 'elementary'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      國小組
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChangeGrade('junior')}
                      className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                        activeProfile.gradeLevel === 'junior'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      國中組
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setGameState('PLAYING')}
                  className="min-h-[46px] px-6 py-3 bg-[#D95338] hover:bg-[#C0452C] text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
                >
                  進入蘇澳學習島
                </button>
                <button
                  type="button"
                  onClick={() => setProfileOpen(true)}
                  className="min-h-[46px] px-5 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
                >
                  切換學生（{activeProfile.name}）
                </button>
              </div>
            </div>

            {/* Zones Overview */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
              <h2 className="text-base font-bold text-slate-900 font-display">
                五大探索區域與玩法提示
              </h2>
              <div className="divide-y divide-slate-100">
                {(Object.keys(ZONES) as (keyof typeof ZONES)[]).map((zid, idx) => (
                  <div key={zid} className="py-3 first:pt-0 last:pb-0">
                    <div className="text-sm font-semibold text-slate-900">
                      0{idx + 1}. {ZONES[zid].name}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                      {ZONES[zid].description}
                    </p>
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 leading-relaxed">
                操作方式：平板直接點擊地圖任意處自動移動；電腦可使用 WASD 或方向鍵，靠近學校按 Enter 進入。
              </div>
            </div>
          </div>
        </main>
      ) : (
        <main className="flex-1 min-h-0 flex relative overflow-hidden">
          {/* Interactive Map Stage */}
          <div className="flex-1 min-w-0 relative h-full">
            <WorldCanvas
              playerX={activeProfile.playerX}
              playerY={activeProfile.playerY}
              transport={activeProfile.transport}
              discoveredSchools={activeProfile.discoveredSchools}
              stampedSchools={activeProfile.stampedSchools}
              collectedItems={activeProfile.collectedItems}
              focusRequest={focusRequest}
              onMove={handleMove}
              onArriveSchool={handleArriveSchool}
              onCollectItem={handleCollectItem}
              onNearbySchoolChange={setNearbySchool}
            />

            {/* Top-Left Compact Transport & Sound Toolbar */}
            <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 max-w-[calc(100%-150px)]">
              <div className="inline-flex items-center p-1 bg-white/95 border border-slate-200 rounded-lg shadow-sm gap-1">
                {(Object.keys(TRANSPORT_META) as TransportMode[]).map((mode) => {
                  const unlocked = unlockedTransports.includes(mode);
                  const active = activeProfile.transport === mode;
                  if (!unlocked && mode !== 'walk') return null;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleSelectTransport(mode)}
                      className={`min-h-[34px] px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-sky-700 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {TRANSPORT_META[mode].label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleToggleMute}
                className="min-h-[42px] min-w-[42px] px-3 bg-white/95 border border-slate-200 rounded-lg shadow-sm flex items-center justify-center text-slate-700 hover:text-slate-900"
                aria-label={muted ? '開啟音效' : '關閉音效'}
                title={muted ? '開啟音效' : '關閉音效'}
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setSidebarOpen((v) => !v)}
                className="min-h-[42px] px-3 bg-white/95 border border-slate-200 rounded-lg shadow-sm flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 lg:hidden"
              >
                {sidebarOpen ? (
                  <>
                    <PanelRightClose className="w-4 h-4" />
                    收合學校
                  </>
                ) : (
                  <>
                    <PanelRightOpen className="w-4 h-4" />
                    學校清單
                  </>
                )}
              </button>
            </div>

            {/* Pickup Toast */}
            {pickupBanner && (
              <div
                role="status"
                className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white border border-amber-300 rounded-xl p-3.5 shadow-md"
              >
                <div className="text-xs font-bold text-amber-800">拾獲蘇澳紀念物：{pickupBanner.name}</div>
                <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">{pickupBanner.fact}</p>
              </div>
            )}

            {/* Nearby School Prompt Bar */}
            {nearbySchool && !activeSchool && (
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-md flex items-center justify-between gap-4 max-w-lg">
                <div className="min-w-0">
                  <div className="text-xs text-slate-500">
                    {nearbySchool.categoryLabel} · {nearbySchool.zoneLabel}
                  </div>
                  <div className="text-sm font-bold text-slate-900 truncate">
                    已抵達 {nearbySchool.shortName}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleArriveSchool(nearbySchool)}
                  className="min-h-[42px] px-4 py-2 bg-[#D95338] hover:bg-[#C0452C] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  進入探索
                </button>
              </div>
            )}
          </div>

          {/* Right School Directory & Fast-Travel Sidebar */}
          {sidebarOpen && (
            <aside className="w-[320px] sm:w-[348px] shrink-0 h-full bg-white border-l border-slate-200 flex flex-col z-20 absolute right-0 top-0 bottom-0 lg:static shadow-lg lg:shadow-none">
              <div className="p-4 border-b border-slate-200 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs text-slate-500 tabular-nums">
                      {activeProfile.name} · 校章 {activeProfile.stampedSchools.length}/{SCHOOLS.length} · 紀念物{' '}
                      {activeProfile.collectedItems.length}/{COLLECTIBLES.length}
                    </div>
                    <h2 className="text-base font-bold text-slate-900 font-display mt-0.5">
                      蘇澳學校與快捷傳送
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                    aria-label="收合清單"
                  >
                    <PanelRightClose className="w-4 h-4" />
                  </button>
                </div>

                {/* Segmented Filter */}
                <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-lg border border-slate-200">
                  {(
                    [
                      ['all', '全部 (11)'],
                      ['elementary', '國小 (8)'],
                      ['junior', '國中 (4)'],
                    ] as [SchoolFilter, string][]
                  ).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFilter(val)}
                      className={`py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                        filter === val
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* School List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {filteredSchools.map((school) => {
                  const stamped = activeProfile.stampedSchools.includes(school.id);
                  const isNear = nearbySchool?.id === school.id;
                  return (
                    <div
                      key={school.id}
                      className={`p-3.5 transition-colors flex items-center justify-between gap-3 ${
                        isNear ? 'bg-sky-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <span>{school.categoryLabel}</span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">{school.zoneLabel}</span>
                        </div>
                        <div className="mt-0.5 text-sm font-bold text-slate-900 truncate">
                          {school.shortName}
                        </div>
                        <div className="mt-0.5 text-xs">
                          {stamped ? (
                            <span className="text-emerald-700 font-semibold">
                              已完成 · {school.stampTitle}
                            </span>
                          ) : (
                            <span className="text-slate-500">{school.address}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleFastTravelToSchool(school)}
                          className="min-h-[36px] px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors inline-flex items-center gap-1 whitespace-nowrap"
                          title="搭鎮內校車傳送到校門口"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          前往
                        </button>
                        {isNear && (
                          <button
                            type="button"
                            onClick={() => handleArriveSchool(school)}
                            className="min-h-[36px] px-2.5 py-1.5 text-xs font-semibold text-white bg-[#D95338] hover:bg-[#C0452C] rounded-md transition-colors whitespace-nowrap"
                          >
                            進入
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer Actions inside Sidebar */}
              <div className="p-3 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleReturnPlaza}
                  className="min-h-[38px] px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200/70 rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  回冷泉廣場
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setProfileOpen(true)}
                    className="min-h-[38px] px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200/70 rounded-lg whitespace-nowrap md:hidden"
                  >
                    學生
                  </button>
                  <button
                    type="button"
                    onClick={() => setPassportOpen(true)}
                    className="min-h-[38px] px-3 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-100/70 rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    護照圖鑑
                  </button>
                </div>
              </div>
            </aside>
          )}

          {/* Collapsed Sidebar Floating Reopen Button on Desktop */}
          {!sidebarOpen && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="hidden lg:inline-flex items-center gap-1.5 absolute top-3 right-36 bg-white/95 border border-slate-200 rounded-lg px-3 min-h-[42px] text-xs font-semibold text-slate-700 shadow-sm hover:text-slate-900"
            >
              <Compass className="w-4 h-4" />
              開啟學校清單
            </button>
          )}
        </main>
      )}

      {/* Modals */}
      {activeSchool && (
        <SchoolModal
          school={activeSchool}
          gradeLevel={activeProfile.gradeLevel}
          alreadyStamped={activeProfile.stampedSchools.includes(activeSchool.id)}
          onChangeGrade={handleChangeGrade}
          onCompleteStamp={handleCompleteStamp}
          onClose={() => setActiveSchool(null)}
        />
      )}

      {passportOpen && (
        <PassportModal
          profile={activeProfile}
          onSelectTransport={handleSelectTransport}
          onJumpToSchool={(id) => {
            const target = SCHOOLS.find((s) => s.id === id);
            if (target) {
              setGameState('PLAYING');
              handleFastTravelToSchool(target);
            }
          }}
          onClose={() => setPassportOpen(false)}
        />
      )}

      {profileOpen && (
        <ProfileModal
          profiles={profiles}
          activeId={activeProfile.id}
          onSelectProfile={handleSelectProfile}
          onCreateProfile={handleCreateProfile}
          onResetCurrent={handleResetCurrent}
          onClose={() => setProfileOpen(false)}
        />
      )}
    </div>
  );
}
