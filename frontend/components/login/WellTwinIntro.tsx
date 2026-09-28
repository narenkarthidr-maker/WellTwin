"use client";

/**
 * WellTwinIntro — WELLTWIN 5-Second Cinematic Initialization Sequence
 *
 * Phases:
 *  0.0–0.2  SURFACE INIT      (camera at surface, SRP visible, logo appears)
 *  0.2–0.4  SUBSURFACE DESCENT (camera animates down through wellbore)
 *  0.4–0.6  CSS THERMAL ACTIVATION (steam particles + thermal bulb expand)
 *  0.6–0.8  SRP + PRODUCTION (pumpjack animates, oil flow particles activate)
 *  0.8–1.0  DIGITAL TWIN SYNC  (data lines illuminate, system glows)
 *  → TRANSITION TO LOGIN
 *
 * Behavior:
 *  - First visit: full 5-second intro
 *  - Repeat visits: 0.8-second quick fade-in, then login
 *  - SKIP INTRO button in bottom-right
 *  - Respects prefers-reduced-motion
 *  - WebGL fallback: static gradient, immediate login
 *  - Always dark/cinematic during intro, regardless of app theme
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

interface WellTwinIntroProps {
  onComplete: () => void;
}

const INTRO_DURATION_MS = 5000;
const SHORT_DURATION_MS = 800;
const LOCALSTORAGE_KEY = "welltwinIntroSeen";

const PHASE_DATA = [
  { t: 0.0,  label: "SURFACE INITIALIZATION",       sublabel: "Wellhead & SRP Unit Detected" },
  { t: 0.2,  label: "SUBSURFACE DESCENT",            sublabel: "Scanning 1,150 m Wellbore" },
  { t: 0.4,  label: "CSS THERMAL ACTIVATION",        sublabel: "Steam Injection: 58°C → 145°C" },
  { t: 0.6,  label: "SRP ACTIVATION",                sublabel: "Pump Kinematics & Rod Load Analysis" },
  { t: 0.8,  label: "DIGITAL TWIN SYNCHRONISED",     sublabel: "4-Layer Physics Model Online" },
];

function getPhaseInfo(progress: number) {
  let current = PHASE_DATA[0];
  for (const p of PHASE_DATA) {
    if (progress >= p.t) current = p;
  }
  return current;
}

function canUseWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    return !!gl;
  } catch {
    return false;
  }
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

export const WellTwinIntro: React.FC<WellTwinIntroProps> = ({ onComplete }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [phaseLabel, setPhaseLabel] = useState(PHASE_DATA[0].label);
  const [phaseSub, setPhaseSub] = useState(PHASE_DATA[0].sublabel);
  const [webGLAvailable] = useState(() => canUseWebGL());
  const [reducedMotion] = useState(() => prefersReducedMotion());
  const [isShortVisit] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(LOCALSTORAGE_KEY) === "true";
  });

  const doComplete = useCallback(() => {
    localStorage.setItem(LOCALSTORAGE_KEY, "true");
    onComplete();
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    setFadeOut(true);
    setTimeout(doComplete, 600);
  }, [doComplete]);

  // Immediately exit if reduced motion or WebGL unavailable
  useEffect(() => {
    if (reducedMotion || !webGLAvailable) {
      doComplete();
    }
  }, [reducedMotion, webGLAvailable, doComplete]);

  // Short visit: quick fade then login
  useEffect(() => {
    if (!reducedMotion && webGLAvailable && isShortVisit) {
      const t = setTimeout(() => {
        setFadeOut(true);
        setTimeout(doComplete, 600);
      }, SHORT_DURATION_MS);
      return () => clearTimeout(t);
    }
  }, [isShortVisit, reducedMotion, webGLAvailable, doComplete]);

  // Main 3D intro
  useEffect(() => {
    if (reducedMotion || !webGLAvailable || isShortVisit) return;

    const currentMount = mountRef.current;
    if (!currentMount) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // ── Scene ──────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060a14);
    scene.fog = new THREE.FogExp2(0x060a14, 0.018);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(10.5, 8.0, 22.0);
    camera.lookAt(new THREE.Vector3(-3.5, 3.0, 1.0));

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = false;
    currentMount.appendChild(renderer.domElement);

    // ── Lighting ────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0x1a2642, 0.9);
    scene.add(ambient);
    const keyLight = new THREE.DirectionalLight(0x38bdf8, 1.6);
    keyLight.position.set(16, 22, 12);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xf97316, 1.1);
    rimLight.position.set(-14, -12, -6);
    scene.add(rimLight);
    const thermalPL = new THREE.PointLight(0xf97316, 0.0, 18);
    thermalPL.position.set(-4.2, -5.2, 1.0);
    scene.add(thermalPL);

    const world = new THREE.Group();
    scene.add(world);
    const surfaceY = 4.2;

    // ── Terrain ─────────────────────────────────────────────────
    const terrainGeo = new THREE.PlaneGeometry(36, 24, 24, 18);
    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      posAttr.setZ(i, Math.sin(posAttr.getX(i) * 0.2) * Math.cos(posAttr.getY(i) * 0.25) * 0.35);
    }
    terrainGeo.computeVertexNormals();
    const terrain = new THREE.Mesh(terrainGeo, new THREE.MeshStandardMaterial({ color: 0x0c1527, roughness: 0.85, metalness: 0.15 }));
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.set(0, surfaceY, -2);
    world.add(terrain);
    const grid = new THREE.GridHelper(32, 24, 0x1f2f54, 0x101b33);
    grid.position.set(0, surfaceY + 0.02, -2);
    world.add(grid);

    // ── Wellhead ─────────────────────────────────────────────────
    const wellheadGrp = new THREE.Group();
    wellheadGrp.position.set(-3.8, surfaceY, 1.0);
    const whMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, metalness: 0.85, roughness: 0.2 });
    const whBase = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.8, 16), whMat);
    whBase.position.y = 0.4;
    wellheadGrp.add(whBase);
    const flowTee = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.0, 12), whMat);
    flowTee.rotation.z = Math.PI / 2;
    flowTee.position.set(0.4, 0.6, 0);
    wellheadGrp.add(flowTee);
    world.add(wellheadGrp);

    // ── SRP Pumpjack ─────────────────────────────────────────────
    const pumpGrp = new THREE.Group();
    pumpGrp.position.set(-6.0, surfaceY, 1.0);
    world.add(pumpGrp);
    const samsonMat = new THREE.MeshStandardMaterial({ color: 0x223254, metalness: 0.7, roughness: 0.4 });
    const samson = new THREE.Mesh(new THREE.ConeGeometry(0.65, 2.6, 4), samsonMat);
    samson.position.set(0, 1.3, 0);
    samson.rotation.y = Math.PI / 4;
    pumpGrp.add(samson);
    const beamPivot = new THREE.Group();
    beamPivot.position.set(0, 2.6, 0);
    pumpGrp.add(beamPivot);
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.3 });
    const beam = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.2, 0.18), beamMat);
    beam.position.set(0.6, 0, 0);
    beamPivot.add(beam);
    const horsehead = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.55, 0.16, 14, 1, false, -Math.PI / 2.2, Math.PI / 1.1),
      beamMat
    );
    horsehead.position.set(2.4, -0.22, 0);
    horsehead.rotation.z = Math.PI / 2;
    beamPivot.add(horsehead);
    const crankPivot = new THREE.Group();
    crankPivot.position.set(-1.1, 0.5, 0);
    pumpGrp.add(crankPivot);
    const crankMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.6 });
    const crankArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.7, 0.12), crankMat);
    crankArm.position.y = 0.35;
    crankPivot.add(crankArm);
    const cw = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.18, 14), crankMat);
    cw.rotation.x = Math.PI / 2;
    cw.position.set(0, 0.65, 0);
    crankPivot.add(cw);

    // ── Wellbore Curve ───────────────────────────────────────────
    const wellCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.8, surfaceY, 1.0),
      new THREE.Vector3(-3.9, 1.5, 1.0),
      new THREE.Vector3(-4.0, -1.5, 1.0),
      new THREE.Vector3(-4.1, -4.0, 1.0),
      new THREE.Vector3(-4.2, -6.8, 1.0),
    ]);
    const casingMat = new THREE.MeshStandardMaterial({ color: 0x223554, metalness: 0.85, roughness: 0.3, transparent: true, opacity: 0.45 });
    world.add(new THREE.Mesh(new THREE.TubeGeometry(wellCurve, 40, 0.32, 16, false), casingMat));
    const rodMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.0, metalness: 0.9 });
    world.add(new THREE.Mesh(new THREE.TubeGeometry(wellCurve, 40, 0.08, 10, false), rodMat));
    for (let c = 0; c < 7; c++) {
      const pt = wellCurve.getPoint(c / 6);
      const collar = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.03, 8, 20), new THREE.MeshBasicMaterial({ color: 0x3b5278 }));
      collar.rotation.x = Math.PI / 2;
      collar.position.copy(pt);
      world.add(collar);
    }

    // ── Reservoir ────────────────────────────────────────────────
    const resGrp = new THREE.Group();
    resGrp.position.set(-2.5, -5.5, 0);
    world.add(resGrp);
    const caprockMesh = new THREE.Mesh(new THREE.BoxGeometry(22, 1.4, 16), new THREE.MeshStandardMaterial({ color: 0x101a2e, transparent: true, opacity: 0.28, roughness: 0.85 }));
    caprockMesh.position.set(0, 1.6, 0);
    resGrp.add(caprockMesh);
    const payZoneGeo = new THREE.BoxGeometry(24, 3.2, 18);
    const payZoneMat = new THREE.MeshStandardMaterial({ color: 0x1a1208, transparent: true, opacity: 0.38, roughness: 0.75 });
    const payZone = new THREE.Mesh(payZoneGeo, payZoneMat);
    payZone.position.set(0, -0.6, 0);
    resGrp.add(payZone);
    payZone.add(new THREE.LineSegments(new THREE.WireframeGeometry(payZoneGeo), new THREE.LineBasicMaterial({ color: 0x2e3d5c, transparent: true, opacity: 0.25 })));

    // Thermal bulb
    const thermalGrp = new THREE.Group();
    thermalGrp.position.set(-1.7, 0.3, 1.0);
    resGrp.add(thermalGrp);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 0.0, transparent: true, opacity: 0.0, roughness: 0.25 });
    const coreBulb = new THREE.Mesh(new THREE.SphereGeometry(2.2, 28, 20), coreMat);
    coreBulb.scale.set(1.5, 0.85, 1.3);
    thermalGrp.add(coreBulb);
    const haloMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, emissive: 0x7c3aed, emissiveIntensity: 0.0, transparent: true, opacity: 0.0, roughness: 0.6 });
    const haloBulb = new THREE.Mesh(new THREE.SphereGeometry(3.6, 24, 18), haloMat);
    haloBulb.scale.set(1.4, 0.8, 1.25);
    thermalGrp.add(haloBulb);

    // Permeable horizon discs
    for (let d = -1; d <= 1; d++) {
      const discMat = new THREE.MeshBasicMaterial({ color: 0x24355a, side: THREE.DoubleSide, transparent: true, opacity: 0.0 });
      const disc = new THREE.Mesh(new THREE.RingGeometry(0.8, 5.2, 32), discMat);
      disc.rotation.x = Math.PI / 2;
      disc.position.set(-1.7, d * 0.8, 1.0);
      resGrp.add(disc);
    }

    // ── Steam Particles ──────────────────────────────────────────
    const steamCount = 55;
    const steamGeo = new THREE.BufferGeometry();
    const sPos = new Float32Array(steamCount * 3);
    const sVel = new Float32Array(steamCount * 3);
    for (let i = 0; i < steamCount; i++) {
      sPos[i * 3] = -4.2 + (Math.random() - 0.5) * 0.5;
      sPos[i * 3 + 1] = -5.0 + (Math.random() - 0.5) * 1.0;
      sPos[i * 3 + 2] = 1.0 + (Math.random() - 0.5) * 0.5;
      sVel[i * 3] = (Math.random() - 0.3) * 0.012;
      sVel[i * 3 + 1] = (Math.random() - 0.5) * 0.008;
      sVel[i * 3 + 2] = (Math.random() - 0.5) * 0.012;
    }
    steamGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
    const steamMat = new THREE.PointsMaterial({ color: 0xf97316, size: 0.26, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending });
    world.add(new THREE.Points(steamGeo, steamMat));

    // ── Oil Flow Particles ───────────────────────────────────────
    const oilCount = 70;
    const oilGeo = new THREE.BufferGeometry();
    const oilPosArr = new Float32Array(oilCount * 3);
    const oilProg = new Float32Array(oilCount);
    for (let i = 0; i < oilCount; i++) {
      oilProg[i] = Math.random();
      const pt = wellCurve.getPoint(oilProg[i]);
      oilPosArr[i * 3] = pt.x + (Math.random() - 0.5) * 0.15;
      oilPosArr[i * 3 + 1] = pt.y;
      oilPosArr[i * 3 + 2] = pt.z + (Math.random() - 0.5) * 0.15;
    }
    oilGeo.setAttribute("position", new THREE.BufferAttribute(oilPosArr, 3));
    const oilMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.28, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending });
    world.add(new THREE.Points(oilGeo, oilMat));

    // ── Digital Twin Data Lines ──────────────────────────────────
    const syncLineMat = new THREE.LineBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.0 });
    const syncLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-4.2, -6.8, 1.0),
        new THREE.Vector3(-4.0, -1.5, 1.0),
        new THREE.Vector3(-3.8, surfaceY, 1.0),
        new THREE.Vector3(-6.0, surfaceY, 1.0),
      ]),
      syncLineMat
    );
    world.add(syncLine);

    const glowMeshes = [
      new THREE.Vector3(-4.2, -6.8, 1.0),
      new THREE.Vector3(-4.0, -1.5, 1.0),
      new THREE.Vector3(-3.8, surfaceY, 1.0),
    ].map(pos => {
      const mat = new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.0 });
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), mat);
      m.position.copy(pos);
      world.add(m);
      return mat;
    });

    // ── Camera keyframes ─────────────────────────────────────────
    const camFrames = [
      { p: 0.00, pos: new THREE.Vector3(10.5, 8.0,  22.0), look: new THREE.Vector3(-3.5,  3.0, 1.0) },
      { p: 0.20, pos: new THREE.Vector3(8.0,  4.5,  18.0), look: new THREE.Vector3(-4.0,  1.0, 1.0) },
      { p: 0.40, pos: new THREE.Vector3(6.0, -1.0,  15.0), look: new THREE.Vector3(-4.0, -3.0, 1.0) },
      { p: 0.55, pos: new THREE.Vector3(5.0, -4.0,  13.0), look: new THREE.Vector3(-3.0, -5.5, 1.0) },
      { p: 0.70, pos: new THREE.Vector3(8.0,  0.5,  16.0), look: new THREE.Vector3(-2.0, -1.5, 0.0) },
      { p: 0.85, pos: new THREE.Vector3(10.5, 3.8,  22.0), look: new THREE.Vector3(-1.2, -1.2, 0.0) },
      { p: 1.00, pos: new THREE.Vector3(10.5, 3.8,  22.0), look: new THREE.Vector3(-1.2, -1.2, 0.0) },
    ];

    const lerpCam = (prog: number) => {
      let i = 0;
      for (let k = 1; k < camFrames.length; k++) {
        if (prog <= camFrames[k].p) { i = k - 1; break; }
        i = k - 1;
      }
      const a = camFrames[i];
      const b = camFrames[Math.min(i + 1, camFrames.length - 1)];
      const range = b.p - a.p;
      const t = range === 0 ? 1 : Math.min(1, (prog - a.p) / range);
      const et = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      return { pos: a.pos.clone().lerp(b.pos, et), look: a.look.clone().lerp(b.look, et) };
    };

    // ── Animate ──────────────────────────────────────────────────
    const startTime = performance.now();
    let animId: number;
    let completed = false;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = performance.now() - startTime;
      const rawProg = Math.min(1.0, elapsed / INTRO_DURATION_MS);

      // Update HUD state
      setProgress(rawProg);
      const phInfo = getPhaseInfo(rawProg);
      setPhaseLabel(phInfo.label);
      setPhaseSub(phInfo.sublabel);

      // Camera
      const cf = lerpCam(rawProg);
      camera.position.copy(cf.pos);
      camera.lookAt(cf.look);

      // SRP kinematics — slow until phase 3, then normal speed
      const srpSpeed = rawProg < 0.6 ? 0.3 : 1.2;
      const crankA = (elapsed / 1000) * srpSpeed;
      crankPivot.rotation.z = -crankA;
      beamPivot.rotation.z = Math.sin(crankA) * 0.09;

      // Phase 1: rod glow
      rodMat.emissiveIntensity = Math.min(1, rawProg / 0.2) * 0.65;

      // Phase 2: thermal activation (0.4–0.6)
      const thermalT = Math.max(0, Math.min(1, (rawProg - 0.4) / 0.2));
      coreMat.opacity = thermalT * 0.48;
      coreMat.emissiveIntensity = thermalT * 0.5;
      haloMat.opacity = thermalT * 0.2;
      haloMat.emissiveIntensity = thermalT * 0.15;
      steamMat.opacity = thermalT * 0.75;
      thermalPL.intensity = thermalT * 2.6;
      const pulse = 1 + Math.sin(elapsed * 0.003) * 0.03 * thermalT;
      coreBulb.scale.set(1.5 * pulse, 0.85 * pulse, 1.3 * pulse);
      // Pay zone warms
      payZoneMat.color.setRGB(0x1a / 255 + thermalT * 0.14, 0x12 / 255 + thermalT * 0.06, 0x08 / 255);

      if (thermalT > 0.1) {
        const sp = steamGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < steamCount; i++) {
          sp[i * 3] += sVel[i * 3]; sp[i * 3 + 1] += sVel[i * 3 + 1]; sp[i * 3 + 2] += sVel[i * 3 + 2];
          const dx = sp[i * 3] + 4.2, dy = sp[i * 3 + 1] + 5.0, dz = sp[i * 3 + 2] - 1.0;
          if (dx * dx + dy * dy + dz * dz > 3.2 * 3.2) {
            sp[i * 3] = -4.2 + (Math.random() - 0.5) * 0.4;
            sp[i * 3 + 1] = -5.0 + (Math.random() - 0.5) * 0.8;
            sp[i * 3 + 2] = 1.0 + (Math.random() - 0.5) * 0.4;
          }
        }
        steamGeo.attributes.position.needsUpdate = true;
      }

      // Phase 3: oil flow (0.6–0.8)
      const oilT = Math.max(0, Math.min(1, (rawProg - 0.6) / 0.2));
      oilMat.opacity = oilT * 0.85;
      if (oilT > 0.05) {
        const op = oilGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < oilCount; i++) {
          oilProg[i] -= 0.0035 * oilT;
          if (oilProg[i] < 0.02) oilProg[i] = 0.98;
          const pt = wellCurve.getPoint(oilProg[i]);
          op[i * 3] = pt.x + Math.sin(elapsed * 0.002 + i) * 0.06;
          op[i * 3 + 1] = pt.y;
          op[i * 3 + 2] = pt.z + Math.cos(elapsed * 0.002 + i) * 0.06;
        }
        oilGeo.attributes.position.needsUpdate = true;
      }

      // Phase 4: digital twin sync (0.8–1.0)
      const syncT = Math.max(0, Math.min(1, (rawProg - 0.8) / 0.2));
      syncLineMat.opacity = syncT * 0.7;
      glowMeshes.forEach(mat => { mat.opacity = syncT * 0.85; });
      ambient.intensity = 0.9 + syncT * 0.5;
      keyLight.intensity = 1.6 + syncT * 0.8;

      // Completion
      if (rawProg >= 1.0 && !completed) {
        completed = true;
        setFadeOut(true);
        setTimeout(doComplete, 650);
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      width = window.innerWidth; height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (currentMount && renderer.domElement.parentNode === currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [reducedMotion, webGLAvailable, isShortVisit, doComplete]);

  if (!webGLAvailable || reducedMotion) return null;

  // Short visit: bare dark fade
  if (isShortVisit) {
    return (
      <div
        className="fixed inset-0 z-[200] bg-[#060a14] pointer-events-none"
        style={{ opacity: fadeOut ? 0 : 1, transition: "opacity 0.6s ease-out" }}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-[200] overflow-hidden select-none"
      style={{
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.65s ease-out",
        pointerEvents: fadeOut ? "none" : "all",
      }}
    >
      {/* Three.js canvas */}
      <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 38%, rgba(4,8,18,0.74) 100%)" }}
      />

      {/* TOP CENTER: Logo */}
      <div
        className="absolute top-0 left-0 right-0 flex flex-col items-center pt-9 pointer-events-none"
        style={{ opacity: Math.min(1, progress * 6), transition: "opacity 0.4s" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-sky-600 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-orange-500/30">
            WT
          </div>
          <div>
            <div className="font-extrabold tracking-widest text-white text-2xl font-mono">WELLTWIN</div>
            <div className="text-[11px] text-sky-400 font-mono tracking-widest">WELL-TO-SURFACE INTELLIGENCE</div>
          </div>
        </div>
        {/* Thin separator under logo */}
        <div className="mt-3 w-48 h-[1px] bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />
      </div>

      {/* LEFT SIDE: Init HUD */}
      <div
        className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ opacity: Math.min(1, progress * 5) }}
      >
        <div className="font-mono space-y-1">
          <div className="text-[9px] font-bold tracking-widest text-sky-500/80 uppercase mb-2">
            DIGITAL TWIN INITIALIZATION
          </div>
          {/* Progress bar */}
          <div className="w-36 h-[2px] bg-white/10 rounded-full overflow-hidden mb-1">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-purple-500 rounded-full"
              style={{ width: `${progress * 100}%`, transition: "width 0.15s linear" }}
            />
          </div>
          <div className="text-[9px] text-white/40 text-right w-36 mb-3">{Math.round(progress * 100)}%</div>

          {[
            { label: "RESERVOIR LAYER",   done: progress >= 0.05,  active: progress >= 0.01 && progress < 0.4  },
            { label: "WELLBORE",          done: progress >= 0.4,   active: progress >= 0.2  && progress < 0.6  },
            { label: "CSS THERMAL",       done: progress >= 0.6,   active: progress >= 0.4  && progress < 0.7  },
            { label: "SRP PUMP",          done: progress >= 0.7,   active: progress >= 0.6  && progress < 0.85 },
            { label: "SURFACE",           done: progress >= 0.85,  active: progress >= 0.7  && progress < 0.95 },
            { label: "TWIN SYNC",         done: progress >= 0.95,  active: progress >= 0.8                     },
          ].map(({ label, done, active }) => (
            <div key={label} className="flex items-center gap-1.5 text-[10px]">
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-300"
                style={{
                  backgroundColor: done ? "#10b981" : active ? "#f59e0b" : "#1e293b",
                  boxShadow: active ? "0 0 6px #f59e0b" : done ? "0 0 4px #10b981" : "none",
                }}
              />
              <span
                className="transition-colors duration-300"
                style={{ color: done ? "#10b981" : active ? "#fbbf24" : "#1e3a5f" }}
              >
                {label}
              </span>
              {done && <span className="text-emerald-400 text-[9px]">✓</span>}
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM CENTER: Phase label */}
      <div
        className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-12 pointer-events-none text-center"
        style={{ opacity: Math.min(1, progress * 5) }}
      >
        <div className="text-[11px] font-mono font-bold tracking-[0.2em] text-sky-400 uppercase">{phaseLabel}</div>
        <div className="text-[10px] font-mono text-slate-500 mt-0.5">{phaseSub}</div>
      </div>

      {/* RIGHT SIDE: Synthetic Telemetry */}
      <div
        className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none space-y-1.5"
        style={{ opacity: Math.max(0, Math.min(1, (progress - 0.58) / 0.15)), transition: "opacity 0.3s" }}
      >
        {[
          { label: "SANDFACE TEMP", value: "82.4 °C",  color: "#f97316" },
          { label: "RESERVOIR PRESS", value: "32 bar",    color: "#38bdf8" },
          { label: "DEAD OIL VISC",  value: "8,500 cP", color: "#fbbf24" },
          { label: "PUMP SPEED",      value: "5.2 SPM",  color: "#818cf8" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#0a1122]/85 backdrop-blur-sm border border-white/[0.06] text-[10px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: color }} />
            <span className="text-slate-500">{label}:</span>
            <span className="text-white font-bold">{value}</span>
            <span className="text-slate-700 text-[8px] ml-1">SYNTHETIC</span>
          </div>
        ))}
      </div>

      {/* BOTTOM RIGHT: Skip + disclaimer */}
      <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
        <div className="text-[9px] font-mono text-slate-700">DEMO / SYNTHETIC DATA — NOT REAL FIELD TELEMETRY</div>
        <button
          onClick={handleSkip}
          aria-label="Skip intro animation"
          className="px-3 py-1.5 rounded text-[11px] font-mono text-slate-500 hover:text-slate-200 border border-white/10 hover:border-sky-500/40 bg-[#0c1326]/80 backdrop-blur-sm transition-colors duration-200"
        >
          SKIP INTRO →
        </button>
      </div>
    </div>
  );
};
