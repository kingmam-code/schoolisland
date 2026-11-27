import React, { useEffect, useRef, useState } from 'react';
import {
  BRIDGES,
  COLLECTIBLES,
  LAND_POLYGON,
  LANDMARKS,
  RAILWAY_POINTS,
  ROADS,
  SCHOOLS,
  TRANSPORT_META,
  WORLD_H,
  WORLD_W,
  isPointInLand,
} from '../data/suaoWorld';
import { Collectible, School, TransportMode } from '../types';

interface WorldCanvasProps {
  playerX: number;
  playerY: number;
  transport: TransportMode;
  discoveredSchools: string[];
  stampedSchools: string[];
  collectedItems: string[];
  focusRequest: { x: number; y: number; seq: number } | null;
  onMove: (x: number, y: number) => void;
  onArriveSchool: (school: School) => void;
  onCollectItem: (item: Collectible) => void;
  onNearbySchoolChange: (school: School | null) => void;
}

interface FloatingNote {
  id: number;
  x: number;
  y: number;
  text: string;
  createdAt: number;
}

function getPointOnPolyline(pts: [number, number][], t: number): { x: number; y: number; angle: number } {
  const segLens: number[] = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const dx = pts[i + 1][0] - pts[i][0];
    const dy = pts[i + 1][1] - pts[i][1];
    const len = Math.hypot(dx, dy);
    segLens.push(len);
    total += len;
  }
  let dist = (t % 1) * total;
  for (let i = 0; i < segLens.length; i++) {
    if (dist <= segLens[i] || i === segLens.length - 1) {
      const ratio = segLens[i] > 0 ? dist / segLens[i] : 0;
      const x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * ratio;
      const y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * ratio;
      const angle = Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]);
      return { x, y, angle };
    }
    dist -= segLens[i];
  }
  return { x: pts[0][0], y: pts[0][1], angle: 0 };
}

export const WorldCanvas: React.FC<WorldCanvasProps> = ({
  playerX,
  playerY,
  transport,
  discoveredSchools,
  stampedSchools,
  collectedItems,
  focusRequest,
  onMove,
  onArriveSchool,
  onCollectItem,
  onNearbySchoolChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const posRef = useRef({ x: playerX, y: playerY, facing: 1, walkPhase: 0 });
  const targetRef = useRef<{ x: number; y: number; school?: School } | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const camRef = useRef({ x: playerX, y: playerY, zoom: 1 });
  const notesRef = useRef<FloatingNote[]>([]);
  const lastNearbyIdRef = useRef<string | null>(null);
  const rippleRef = useRef<{ x: number; y: number; at: number } | null>(null);

  const [zoom, setZoom] = useState(1);
  const [waterHintAt, setWaterHintAt] = useState(0);

  // Sync external fast-travel or profile change
  useEffect(() => {
    posRef.current.x = playerX;
    posRef.current.y = playerY;
    targetRef.current = null;
  }, [playerX, playerY]);

  useEffect(() => {
    if (focusRequest) {
      targetRef.current = null;
      posRef.current.x = focusRequest.x;
      posRef.current.y = focusRequest.y;
    }
  }, [focusRequest]);

  useEffect(() => {
    camRef.current.zoom = zoom;
  }, [zoom]);

  // Keep latest callbacks in refs for animation loop
  const propsRef = useRef({
    transport,
    discoveredSchools,
    stampedSchools,
    collectedItems,
    onMove,
    onArriveSchool,
    onCollectItem,
    onNearbySchoolChange,
  });
  propsRef.current = {
    transport,
    discoveredSchools,
    stampedSchools,
    collectedItems,
    onMove,
    onArriveSchool,
    onCollectItem,
    onNearbySchoolChange,
  };

  // Keyboard listeners
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(k)) {
        keysRef.current.add(k);
        targetRef.current = null;
        if (k.startsWith('arrow')) e.preventDefault();
      } else if (k === 'enter' || k === ' ') {
        const nearby = SCHOOLS.find(
          (s) => Math.hypot(s.x - posRef.current.x, s.y - posRef.current.y) < 76
        );
        if (nearby) {
          e.preventDefault();
          propsRef.current.onArriveSchool(nearby);
        }
      }
    };
    const up = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  // Main render & movement loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animId = 0;
    let lastTime = performance.now();
    let syncTimer = 0;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const canWalk = (nx: number, ny: number, mode: TransportMode) => {
      if (nx < 35 || nx > WORLD_W - 35 || ny < 35 || ny > WORLD_H - 35) return false;
      if (mode === 'sailboat') return true;
      return isPointInLand(nx, ny);
    };

    const step = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const {
        transport: curTransport,
        discoveredSchools: disc,
        stampedSchools: stamped,
        collectedItems: colItems,
      } = propsRef.current;

      const speed = TRANSPORT_META[curTransport].speed;
      let vx = 0;
      let vy = 0;

      const keys = keysRef.current;
      if (keys.has('arrowleft') || keys.has('a')) vx -= 1;
      if (keys.has('arrowright') || keys.has('d')) vx += 1;
      if (keys.has('arrowup') || keys.has('w')) vy -= 1;
      if (keys.has('arrowdown') || keys.has('s')) vy += 1;

      if (vx !== 0 || vy !== 0) {
        const len = Math.hypot(vx, vy);
        vx /= len;
        vy /= len;
      } else if (targetRef.current) {
        const dx = targetRef.current.x - posRef.current.x;
        const dy = targetRef.current.y - posRef.current.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 10) {
          const arrivedSchool = targetRef.current.school;
          targetRef.current = null;
          if (arrivedSchool) {
            propsRef.current.onArriveSchool(arrivedSchool);
          }
        } else {
          vx = dx / dist;
          vy = dy / dist;
        }
      }

      if (vx !== 0 || vy !== 0) {
        if (Math.abs(vx) > 0.05) posRef.current.facing = vx > 0 ? 1 : -1;
        const stepX = vx * speed * dt;
        const stepY = vy * speed * dt;
        const nx = posRef.current.x + stepX;
        const ny = posRef.current.y + stepY;

        let moved = false;
        if (canWalk(nx, ny, curTransport)) {
          posRef.current.x = nx;
          posRef.current.y = ny;
          moved = true;
        } else if (canWalk(nx, posRef.current.y, curTransport)) {
          posRef.current.x = nx;
          moved = true;
        } else if (canWalk(posRef.current.x, ny, curTransport)) {
          posRef.current.y = ny;
          moved = true;
        } else {
          if (targetRef.current) {
            targetRef.current = null;
            setWaterHintAt(now);
          }
        }

        if (moved) {
          posRef.current.walkPhase += dt * (curTransport === 'walk' ? 11 : 7);
        }
      }

      // Periodic sync of position back to React state
      syncTimer += dt;
      if (syncTimer > 0.45) {
        syncTimer = 0;
        propsRef.current.onMove(Math.round(posRef.current.x), Math.round(posRef.current.y));
      }

      // Check collectible pickups
      for (const item of COLLECTIBLES) {
        if (!colItems.includes(item.id)) {
          const d = Math.hypot(item.x - posRef.current.x, item.y - posRef.current.y);
          if (d < 42) {
            notesRef.current.push({
              id: now + Math.random(),
              x: item.x,
              y: item.y - 20,
              text: `+1 ${item.name}`,
              createdAt: now,
            });
            propsRef.current.onCollectItem(item);
          }
        }
      }

      // Check nearby school
      let nearest: School | null = null;
      let nearestDist = Infinity;
      for (const s of SCHOOLS) {
        const d = Math.hypot(s.x - posRef.current.x, s.y - posRef.current.y);
        if (d < 76 && d < nearestDist) {
          nearest = s;
          nearestDist = d;
        }
      }
      const nextId = nearest ? nearest.id : null;
      if (nextId !== lastNearbyIdRef.current) {
        lastNearbyIdRef.current = nextId;
        propsRef.current.onNearbySchoolChange(nearest);
      }

      // Smooth camera tracking
      const lerp = reducedMotion ? 1 : 1 - Math.exp(-8 * dt);
      camRef.current.x += (posRef.current.x - camRef.current.x) * lerp;
      camRef.current.y += (posRef.current.y - camRef.current.y) * lerp;

      // ---------- RENDERING ----------
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas.width / dpr;
      const ch = canvas.height / dpr;
      const z = camRef.current.zoom;

      // Clamp camera inside world
      const halfW = cw / (2 * z);
      const halfH = ch / (2 * z);
      const camX = Math.max(Math.min(camRef.current.x, WORLD_W - halfW), Math.min(halfW, WORLD_W / 2));
      const camY = Math.max(Math.min(camRef.current.y, WORLD_H - halfH), Math.min(halfH, WORLD_H / 2));

      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Pacific Ocean background
      const seaGrad = ctx.createLinearGradient(0, 0, cw, ch);
      seaGrad.addColorStop(0, '#1B6E9C');
      seaGrad.addColorStop(1, '#124F75');
      ctx.fillStyle = seaGrad;
      ctx.fillRect(0, 0, cw, ch);

      ctx.save();
      ctx.translate(cw / 2, ch / 2);
      ctx.scale(z, z);
      ctx.translate(-camX, -camY);

      // Ocean animated wave lines
      const tSec = reducedMotion ? 0 : now / 1000;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 2;
      for (let wy = 100; wy < WORLD_H; wy += 110) {
        for (let wx = 1280; wx < WORLD_W - 60; wx += 180) {
          const offset = Math.sin(tSec * 1.4 + wy * 0.02 + wx * 0.01) * 10;
          ctx.beginPath();
          ctx.moveTo(wx + offset, wy);
          ctx.quadraticCurveTo(wx + 24 + offset, wy - 7, wx + 48 + offset, wy);
          ctx.stroke();
        }
      }

      // 2. Coastal shallow water glow around landmass
      ctx.save();
      ctx.beginPath();
      LAND_POLYGON.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      ctx.closePath();
      ctx.lineJoin = 'round';
      ctx.lineWidth = 42;
      ctx.strokeStyle = 'rgba(130, 217, 232, 0.28)';
      ctx.stroke();
      ctx.lineWidth = 18;
      ctx.strokeStyle = '#F2E3BC'; // sandy shore
      ctx.stroke();

      // Main landmass fill
      const landGrad = ctx.createLinearGradient(120, 100, 1500, 1300);
      landGrad.addColorStop(0, '#88C97E');
      landGrad.addColorStop(0.55, '#9BD484');
      landGrad.addColorStop(1, '#7DBB74');
      ctx.fillStyle = landGrad;
      ctx.fill();
      ctx.restore();

      // 3. Regional Terrain Patches (Xinma rice paddies, Western mountains, Wetland)
      // Western foothills
      const drawHill = (hx: number, hy: number, r: number, col: string) => {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.ellipse(hx, hy, r * 1.3, r * 0.85, -0.2, 0, Math.PI * 2);
        ctx.fill();
      };
      drawHill(210, 320, 110, 'rgba(67, 138, 78, 0.45)');
      drawHill(250, 620, 140, 'rgba(67, 138, 78, 0.45)');
      drawHill(280, 990, 150, 'rgba(56, 120, 68, 0.5)');
      drawHill(680, 1170, 135, 'rgba(56, 120, 68, 0.45)');

      // Xinma rice paddy grid
      ctx.fillStyle = 'rgba(167, 219, 114, 0.55)';
      ctx.strokeStyle = 'rgba(90, 150, 62, 0.35)';
      ctx.lineWidth = 2;
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
          const rx = 590 + col * 92;
          const ry = 120 + row * 42;
          ctx.fillRect(rx, ry, 76, 30);
          ctx.strokeRect(rx, ry, 76, 30);
        }
      }

      // Wuwei Wetland reeds & pond
      ctx.fillStyle = '#4FB0C6';
      ctx.beginPath();
      ctx.ellipse(1380, 315, 58, 26, 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Cold Spring Park bubbling pool
      ctx.fillStyle = '#63C5DA';
      ctx.beginPath();
      ctx.ellipse(915, 685, 42, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
      for (let b = 0; b < 5; b++) {
        const by = 688 - (((tSec * 18 + b * 7) % 18));
        const bx = 895 + b * 10;
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.beginPath();
        ctx.arc(bx, by, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Bridges over Harbor
      BRIDGES.forEach((b) => {
        ctx.save();
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 24;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(b.x1, b.y1);
        ctx.lineTo(b.x2, b.y2);
        ctx.stroke();

        // Red arch highlight for Nanfang'ao Cross-Harbor Bridge
        if (b.name.includes('蘇澳港灣')) {
          ctx.strokeStyle = '#DC2626';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(b.x1 - 4, b.y1);
          ctx.quadraticCurveTo((b.x1 + b.x2) / 2 + 26, (b.y1 + b.y2) / 2, b.x2 - 4, b.y2);
          ctx.stroke();
        }
        ctx.restore();
      });

      // 5. Roads
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ROADS.forEach((road) => {
        ctx.strokeStyle = '#C9B99A';
        ctx.lineWidth = 22;
        ctx.beginPath();
        road.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
        ctx.stroke();

        ctx.strokeStyle = '#F3EAD8';
        ctx.lineWidth = 15;
        ctx.stroke();

        ctx.save();
        ctx.setLineDash([12, 12]);
        ctx.strokeStyle = 'rgba(160, 140, 108, 0.55)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      });

      // 6. Railway Track & Animated Little Train
      ctx.save();
      ctx.strokeStyle = '#52525B';
      ctx.lineWidth = 7;
      ctx.beginPath();
      RAILWAY_POINTS.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      ctx.stroke();
      ctx.setLineDash([6, 8]);
      ctx.strokeStyle = '#E4E4E7';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();

      const trainProgress = (tSec * 0.04) % 1;
      const trainPose = getPointOnPolyline(RAILWAY_POINTS, trainProgress);
      ctx.save();
      ctx.translate(trainPose.x, trainPose.y);
      ctx.rotate(trainPose.angle);
      ctx.fillStyle = '#E11D48';
      ctx.fillRect(-16, -7, 32, 14);
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(6, -5, 7, 10);
      ctx.restore();

      // 7. Decorative Mountain Trees (Western Hills + Valley)
      const treeSpots: [number, number][] = [
        [230, 260], [275, 310], [190, 380], [220, 560], [285, 620], [195, 690],
        [240, 910], [310, 980], [210, 1050], [380, 1140], [640, 1180], [720, 1150],
        [1080, 1190], [1160, 1130], [1140, 410], [620, 440],
      ];
      treeSpots.forEach(([tx, ty]) => {
        ctx.fillStyle = '#5B3E28';
        ctx.fillRect(tx - 3, ty - 4, 6, 10);
        ctx.fillStyle = '#2F6F4E';
        ctx.beginPath();
        ctx.moveTo(tx, ty - 28);
        ctx.lineTo(tx - 15, ty - 4);
        ctx.lineTo(tx + 15, ty - 4);
        ctx.closePath();
        ctx.fill();
      });

      // 8. Landmarks labels
      ctx.textAlign = 'center';
      LANDMARKS.forEach((lm) => {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
        ctx.font = '600 12px "Noto Sans TC", sans-serif';
        ctx.fillText(lm.name, lm.x, lm.y - 24);
      });

      // 9. Collectibles
      COLLECTIBLES.forEach((item, idx) => {
        if (colItems.includes(item.id)) return;
        const bob = reducedMotion ? 0 : Math.sin(tSec * 3 + idx) * 4;
        const ix = item.x;
        const iy = item.y + bob;

        // Soft glow
        ctx.fillStyle = 'rgba(253, 224, 71, 0.35)';
        ctx.beginPath();
        ctx.arc(ix, iy, 17, 0, Math.PI * 2);
        ctx.fill();

        // Crisp collectible badge
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(ix, iy, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#B45309';
        ctx.font = '700 12px "Noto Sans TC", sans-serif';
        ctx.textBaseline = 'middle';
        const glyph =
          item.type === 'bubble'
            ? '泡'
            : item.type === 'mackerel'
              ? '魚'
              : item.type === 'clog'
                ? '屐'
                : item.type === 'feather'
                  ? '羽'
                  : '貝';
        ctx.fillText(glyph, ix, iy + 0.5);
      });

      // 10. Schools (2.5D Campus Buildings + Stamped Growth)
      SCHOOLS.forEach((school) => {
        const isStamped = stamped.includes(school.id);
        const isDiscovered = disc.includes(school.id);
        const dist = Math.hypot(school.x - posRef.current.x, school.y - posRef.current.y);
        const isNear = dist < 76;

        // Courtyard pad
        ctx.fillStyle = isStamped ? '#ECFDF5' : '#F8FAFC';
        ctx.strokeStyle = isNear ? '#D95338' : isStamped ? '#059669' : '#94A3B8';
        ctx.lineWidth = isNear ? 3.5 : 2;
        ctx.beginPath();
        ctx.roundRect(school.x - 36, school.y - 26, 72, 52, 10);
        ctx.fill();
        ctx.stroke();

        // Campus growth: trees & flowers appear around stamped schools
        if (isStamped) {
          const offsets = [
            [-46, -12],
            [46, -12],
            [-42, 20],
            [42, 20],
          ];
          offsets.forEach(([ox, oy], oi) => {
            ctx.fillStyle = oi % 2 === 0 ? '#10B981' : '#34D399';
            ctx.beginPath();
            ctx.arc(school.x + ox, school.y + oy, 7.5, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        // School Building (2.5D box + pitched roof)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(school.x - 24, school.y - 12, 48, 24);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(school.x - 24, school.y - 12, 48, 24);

        // Windows
        ctx.fillStyle = '#BAE6FD';
        for (let wx = -18; wx <= 10; wx += 14) {
          ctx.fillRect(school.x + wx, school.y - 6, 8, 8);
        }

        // Roof
        ctx.fillStyle = school.roofColor;
        ctx.beginPath();
        ctx.moveTo(school.x - 28, school.y - 12);
        ctx.lineTo(school.x, school.y - 28);
        ctx.lineTo(school.x + 28, school.y - 12);
        ctx.closePath();
        ctx.fill();

        // Flag if stamped
        if (isStamped) {
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(school.x + 24, school.y - 12);
          ctx.lineTo(school.x + 24, school.y - 36);
          ctx.stroke();

          ctx.fillStyle = '#F59E0B';
          ctx.beginPath();
          ctx.moveTo(school.x + 24, school.y - 36);
          ctx.lineTo(school.x + 40, school.y - 31);
          ctx.lineTo(school.x + 24, school.y - 26);
          ctx.closePath();
          ctx.fill();
        }

        // School name plaque
        ctx.font = '700 13px "Noto Sans TC", sans-serif';
        const label = school.shortName;
        const tw = ctx.measureText(label).width;
        ctx.fillStyle = isStamped ? '#065F46' : isDiscovered ? '#0F172A' : '#334155';
        ctx.beginPath();
        ctx.roundRect(school.x - tw / 2 - 10, school.y + 30, tw + 20, 22, 6);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, school.x, school.y + 41);
      });

      // 11. Tap-to-move destination marker
      if (targetRef.current) {
        const tx = targetRef.current.x;
        const ty = targetRef.current.y;
        const pulse = reducedMotion ? 1 : 0.75 + 0.25 * Math.sin(tSec * 6);
        ctx.strokeStyle = '#D95338';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(tx, ty, 12 * pulse, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (rippleRef.current && now - rippleRef.current.at < 450) {
        const p = (now - rippleRef.current.at) / 450;
        ctx.strokeStyle = `rgba(217, 83, 56, ${1 - p})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(rippleRef.current.x, rippleRef.current.y, 8 + p * 22, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 12. Player Character Avatar
      const px = posRef.current.x;
      const py = posRef.current.y;
      const bounce =
        vx !== 0 || vy !== 0 ? Math.abs(Math.sin(posRef.current.walkPhase)) * 4 : 0;

      ctx.save();
      ctx.translate(px, py);

      // Shadow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
      ctx.beginPath();
      ctx.ellipse(0, 14, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Transport vehicle under character
      if (curTransport === 'sailboat') {
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#0284C7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-22, 4);
        ctx.lineTo(22, 4);
        ctx.lineTo(14, 15);
        ctx.lineTo(-14, 15);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Sail
        ctx.fillStyle = '#38BDF8';
        ctx.beginPath();
        ctx.moveTo(0, -28);
        ctx.lineTo(18, 2);
        ctx.lineTo(0, 2);
        ctx.closePath();
        ctx.fill();
      } else if (curTransport === 'bike') {
        ctx.strokeStyle = '#0284C7';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(-11, 10, 6, 0, Math.PI * 2);
        ctx.arc(11, 10, 6, 0, Math.PI * 2);
        ctx.stroke();
      } else if (curTransport === 'clog') {
        ctx.fillStyle = '#B45309';
        ctx.beginPath();
        ctx.roundRect(-15, 8, 30, 7, 3);
        ctx.fill();
      }

      // Explorer body & head
      ctx.translate(0, -bounce);
      ctx.fillStyle = '#D95338'; // Explorer jacket
      ctx.beginPath();
      ctx.roundRect(-9, -6, 18, 16, 6);
      ctx.fill();

      // Head
      ctx.fillStyle = '#FDE68A';
      ctx.beginPath();
      ctx.arc(0, -14, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#78350F';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Explorer Cap
      ctx.fillStyle = '#0284C7';
      ctx.beginPath();
      ctx.arc(0, -17, 10.5, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(posRef.current.facing > 0 ? 0 : -13, -18, 13, 3.5);

      // Eyes
      const eyeOffset = posRef.current.facing > 0 ? 3 : -3;
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.arc(eyeOffset - 2, -13, 1.5, 0, Math.PI * 2);
      ctx.arc(eyeOffset + 3, -13, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 13. Floating Pickup Text Notes
      notesRef.current = notesRef.current.filter((n) => now - n.createdAt < 1400);
      notesRef.current.forEach((n) => {
        const p = (now - n.createdAt) / 1400;
        ctx.fillStyle = `rgba(180, 83, 9, ${1 - p})`;
        ctx.font = '700 14px "Noto Sans TC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(n.text, n.x, n.y - p * 26);
      });

      ctx.restore();

      // 14. Clean Minimap (Bottom Right)
      const mmW = 148;
      const mmH = 102;
      const mmX = cw - mmW - 14;
      const mmY = ch - mmH - 14;
      if (cw > 540) {
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
        ctx.beginPath();
        ctx.roundRect(mmX, mmY, mmW, mmH, 10);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();

        const sx = mmW / WORLD_W;
        const sy = mmH / WORLD_H;

        ctx.fillStyle = 'rgba(136, 201, 126, 0.55)';
        ctx.beginPath();
        LAND_POLYGON.forEach(([lx, ly], i) =>
          i === 0 ? ctx.moveTo(mmX + lx * sx, mmY + ly * sy) : ctx.lineTo(mmX + lx * sx, mmY + ly * sy)
        );
        ctx.closePath();
        ctx.fill();

        SCHOOLS.forEach((s) => {
          ctx.fillStyle = stamped.includes(s.id) ? '#34D399' : '#F8FAFC';
          ctx.beginPath();
          ctx.arc(mmX + s.x * sx, mmY + s.y * sy, 3, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.fillStyle = '#FB7185';
        ctx.beginPath();
        ctx.arc(mmX + posRef.current.x * sx, mmY + posRef.current.y * sy, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const cw = rect.width;
    const ch = rect.height;
    const z = camRef.current.zoom;
    const halfW = cw / (2 * z);
    const halfH = ch / (2 * z);
    const camX = Math.max(Math.min(camRef.current.x, WORLD_W - halfW), Math.min(halfW, WORLD_W / 2));
    const camY = Math.max(Math.min(camRef.current.y, WORLD_H - halfH), Math.min(halfH, WORLD_H / 2));

    const worldX = camX + (clickX - cw / 2) / z;
    const worldY = camY + (clickY - ch / 2) / z;

    // Check if user clicked directly on a school
    const clickedSchool = SCHOOLS.find((s) => Math.hypot(s.x - worldX, s.y - worldY) < 48);
    if (clickedSchool) {
      const dist = Math.hypot(clickedSchool.x - posRef.current.x, clickedSchool.y - posRef.current.y);
      if (dist < 76) {
        onArriveSchool(clickedSchool);
        return;
      }
      targetRef.current = { x: clickedSchool.x, y: clickedSchool.y + 18, school: clickedSchool };
      rippleRef.current = { x: clickedSchool.x, y: clickedSchool.y + 18, at: performance.now() };
      return;
    }

    targetRef.current = { x: worldX, y: worldY };
    rippleRef.current = { x: worldX, y: worldY, at: performance.now() };
  };

  const showWaterHint = performance.now() - waterHintAt < 2500 && transport !== 'sailboat';

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-[#124F75] select-none">
      <canvas
        ref={canvasRef}
        onPointerDown={handleCanvasPointerDown}
        tabIndex={0}
        aria-label="蘇澳鎮中小學學習島互動地圖，可用方向鍵或點擊地面移動探索十一所學校"
        className="block w-full h-full cursor-crosshair focus:outline-none"
      />

      {/* Zoom Controls (Top Right inside map) */}
      <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 border border-slate-200 rounded-lg p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.75, +(z - 0.15).toFixed(2)))}
          className="w-9 h-9 flex items-center justify-center text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          aria-label="縮小地圖"
        >
          －
        </button>
        <span className="px-1.5 text-xs font-medium text-slate-600 tabular-nums whitespace-nowrap">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(1.45, +(z + 0.15).toFixed(2)))}
          className="w-9 h-9 flex items-center justify-center text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          aria-label="放大地圖"
        >
          ＋
        </button>
      </div>

      {/* Subtle shoreline notice when walking into sea without sailboat */}
      {showWaterHint && (
        <div
          role="status"
          className="absolute top-16 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-xs font-medium px-4 py-2 rounded-lg shadow-sm pointer-events-none whitespace-nowrap"
        >
          前面是太平洋海域！解鎖「岳明小帆船」後即可出海航行
        </div>
      )}
    </div>
  );
};
