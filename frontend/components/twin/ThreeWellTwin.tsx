"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useTheme } from "@/context/ThemeContext";
import { useWellTwin, SensorDataPoint, TwinViewMode } from "@/context/WellTwinContext";
import {
  Play,
  Pause,
  RotateCcw,
  Eye,
  Flame,
  Activity,
  Maximize2,
  CheckCircle2,
  X,
  Layers,
  Thermometer,
  Gauge,
  Droplet,
  Zap,
  Info
} from "lucide-react";

interface ThreeWellTwinProps {
  viewMode?: TwinViewMode;
}

export const ThreeWellTwin: React.FC<ThreeWellTwinProps> = ({ viewMode = "digital" }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const {
    activeParams,
    activeState,
    viewSettings,
    updateViewSettings,
    resetViewSettings,
    optimizationResult,
    sensors,
  } = useWellTwin();

  const [activeSensor, setActiveSensor] = useState<SensorDataPoint | null>(null);
  const [screenCoords, setScreenCoords] = useState<Record<string, { x: number; y: number; visible: boolean }>>({});

  // Refs for OrbitControls and Camera to allow programmatic Reset View
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const isLight = resolvedTheme === "light";

  // In physical mode: hide particles and sensors; show only engineering geometry
  const showParticles = viewMode !== "physical" && viewSettings.showFlow;
  const showSteam     = viewMode !== "physical" && viewSettings.showThermal;
  const showSensors   = viewMode !== "physical" && viewSettings.showSensors;

  // Reset Camera View handler
  const handleResetCamera = useCallback(() => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(16, 5, 20);
      controlsRef.current.target.set(0, -1, 0);
      controlsRef.current.update();
    }
  }, []);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth || 600;
    const height = currentMount.clientHeight || 580;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isLight ? 0xf4f7fb : 0x070b16);
    scene.fog = new THREE.FogExp2(isLight ? 0xf4f7fb : 0x070b16, 0.018);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(16, 5, 20);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    currentMount.appendChild(renderer.domElement);

    // 2. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, -1, 0);
    controls.maxDistance = 55;
    controls.minDistance = 6;
    controls.maxPolarAngle = Math.PI * 0.92; // Prevent going directly under the floor
    controlsRef.current = controls;

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(isLight ? 0xe2e8f0 : 0x1e293b, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.8);
    dirLight1.position.set(15, 25, 12);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf97316, 1.2);
    dirLight2.position.set(-15, -10, -10);
    scene.add(dirLight2);

    // Well Root Assembly
    const wellRoot = new THREE.Group();
    scene.add(wellRoot);

    // ==========================================
    // 4. SURFACE LAYER & FOUNDATION
    // ==========================================
    // Surface ground slab
    const groundGeo = new THREE.CylinderGeometry(8.5, 8.5, 0.4, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0xcbd5e1 : 0x131d34,
      roughness: 0.8,
      metalness: 0.1,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = 5.2;
    groundMesh.receiveShadow = true;
    wellRoot.add(groundMesh);

    // Surface Grid helper
    const gridHelper = new THREE.GridHelper(16, 16, isLight ? 0x94a3b8 : 0x1e2e4f, isLight ? 0xe2e8f0 : 0x0f172a);
    gridHelper.position.y = 5.41;
    wellRoot.add(gridHelper);

    // Wellhead Christmas Tree & Flowline
    const wellheadGroup = new THREE.Group();
    wellheadGroup.position.set(0, 5.4, 0);

    const wellheadBaseGeo = new THREE.CylinderGeometry(0.5, 0.6, 0.8, 24);
    const wellheadMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.85,
      roughness: 0.25,
    });
    const wellheadBase = new THREE.Mesh(wellheadBaseGeo, wellheadMat);
    wellheadBase.position.y = 0.4;
    wellheadGroup.add(wellheadBase);

    // Flowline tee
    const teeGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.4, 16);
    const teeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8, roughness: 0.3 });
    const flowTee = new THREE.Mesh(teeGeo, teeMat);
    flowTee.rotation.z = Math.PI / 2;
    flowTee.position.set(0.6, 0.7, 0);
    wellheadGroup.add(flowTee);

    // Valve wheel
    const valveGeo = new THREE.TorusGeometry(0.25, 0.05, 8, 16);
    const valveMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.5 });
    const valve = new THREE.Mesh(valveGeo, valveMat);
    valve.position.set(1.3, 0.7, 0);
    valve.rotation.y = Math.PI / 2;
    wellheadGroup.add(valve);

    wellRoot.add(wellheadGroup);

    // ==========================================
    // 5. SRP SURFACE PUMPJACK MECHANISM
    // ==========================================
    const pumpjackGroup = new THREE.Group();
    pumpjackGroup.position.set(-2.8, 5.4, 0);
    wellRoot.add(pumpjackGroup);

    // Samson Post (A-frame tower)
    const samsonGeo = new THREE.ConeGeometry(0.8, 3.2, 4);
    const samsonMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0x475569 : 0x253556,
      metalness: 0.7,
      roughness: 0.4,
    });
    const samsonPost = new THREE.Mesh(samsonGeo, samsonMat);
    samsonPost.position.set(0, 1.6, 0);
    samsonPost.rotation.y = Math.PI / 4;
    pumpjackGroup.add(samsonPost);

    // Walking Beam Pivot (at the top of Samson post)
    const walkingBeamPivot = new THREE.Group();
    walkingBeamPivot.position.set(0, 3.2, 0);
    pumpjackGroup.add(walkingBeamPivot);

    // Walking Beam body
    const beamGeo = new THREE.BoxGeometry(4.6, 0.28, 0.24);
    const beamMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.8,
      roughness: 0.25,
    });
    const walkingBeam = new THREE.Mesh(beamGeo, beamMat);
    walkingBeam.position.set(0.8, 0, 0);
    walkingBeamPivot.add(walkingBeam);

    // Horsehead (curved arc at the front over the wellhead)
    const horseheadGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.22, 16, 1, false, -Math.PI / 2.2, Math.PI / 1.1);
    const horseheadMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      metalness: 0.8,
      roughness: 0.3,
    });
    const horsehead = new THREE.Mesh(horseheadGeo, horseheadMat);
    horsehead.position.set(3.1, -0.3, 0);
    horsehead.rotation.z = Math.PI / 2;
    walkingBeamPivot.add(horsehead);

    // Counterweight Crank & Gearbox (at rear)
    const gearboxGeo = new THREE.BoxGeometry(0.9, 0.8, 0.8);
    const gearboxMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
    const gearbox = new THREE.Mesh(gearboxGeo, gearboxMat);
    gearbox.position.set(-1.4, 0.4, 0);
    pumpjackGroup.add(gearbox);

    const crankPivot = new THREE.Group();
    crankPivot.position.set(-1.4, 0.6, 0);
    pumpjackGroup.add(crankPivot);

    const crankArmGeo = new THREE.BoxGeometry(0.2, 0.9, 0.15);
    const crankMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.6 });
    const crankArm = new THREE.Mesh(crankArmGeo, crankMat);
    crankArm.position.y = 0.45;
    crankPivot.add(crankArm);

    // Counterweight mass
    const weightGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.25, 16);
    const weightMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.7 });
    const counterweight = new THREE.Mesh(weightGeo, weightMat);
    counterweight.rotation.x = Math.PI / 2;
    counterweight.position.set(0, 0.8, 0);
    crankPivot.add(counterweight);

    // ==========================================
    // 6. WELLBORE CASING & SUCKER ROD STRING
    // ==========================================
    const wellboreGroup = new THREE.Group();
    wellRoot.add(wellboreGroup);

    // Outer Translucent Steel Casing (1,150m representation from y=5.4 down to y=-4.5)
    const casingHeight = 10.2;
    const casingGeo = new THREE.CylinderGeometry(0.65, 0.65, casingHeight, 32);
    const casingMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0x475569 : 0x334155,
      metalness: 0.8,
      roughness: 0.35,
      transparent: true,
      opacity: isLight ? 0.32 : 0.42,
    });
    const casing = new THREE.Mesh(casingGeo, casingMat);
    casing.position.y = 5.4 - casingHeight / 2;
    wellboreGroup.add(casing);

    // Casing depth rings
    for (let d = 0; d < 6; d++) {
      const ringGeo = new THREE.TorusGeometry(0.67, 0.03, 8, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: isLight ? 0x64748b : 0x475569 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 4.5 - d * 1.6;
      wellboreGroup.add(ring);
    }

    // Inner Tubing
    const tubingGeo = new THREE.CylinderGeometry(0.4, 0.4, casingHeight - 0.4, 24);
    const tubingMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0x0284c7 : 0x0369a1,
      transparent: true,
      opacity: isLight ? 0.22 : 0.3,
      roughness: 0.5,
    });
    const tubing = new THREE.Mesh(tubingGeo, tubingMat);
    tubing.position.y = casing.position.y;
    wellboreGroup.add(tubing);

    // Reciprocating Sucker Rod String Group
    const rodStringGroup = new THREE.Group();
    rodStringGroup.position.set(0, 0, 0);
    wellboreGroup.add(rodStringGroup);

    // Polished rod top
    const rodGeo = new THREE.CylinderGeometry(0.09, 0.09, casingHeight + 2.0, 16);
    const rodMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0x1e293b : 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.1,
    });
    const rodString = new THREE.Mesh(rodGeo, rodMat);
    rodString.position.y = casing.position.y + 0.8;
    rodStringGroup.add(rodString);

    // Downhole Pump Plunger & Traveling Valve (at bottom)
    const plungerGeo = new THREE.CylinderGeometry(0.28, 0.28, 1.6, 24);
    const plungerMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x0284c7,
      emissiveIntensity: 0.25,
    });
    const plunger = new THREE.Mesh(plungerGeo, plungerMat);
    plunger.position.y = -3.8;
    rodStringGroup.add(plunger);

    // Pump Standing Valve (stationary at pump barrel base)
    const standingValveGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.4, 24);
    const standingValveMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 });
    const standingValve = new THREE.Mesh(standingValveGeo, standingValveMat);
    standingValve.position.y = -4.7;
    wellboreGroup.add(standingValve);

    // ==========================================
    // 7. RESERVOIR LAYER & THERMAL STEAM CHAMBER
    // ==========================================
    const reservoirGroup = new THREE.Group();
    reservoirGroup.position.set(0, -6.5, 0);
    wellRoot.add(reservoirGroup);

    // Geological Pay Zone Bounding Block (Semi-transparent block)
    const resGeo = new THREE.BoxGeometry(11.0, 3.8, 11.0);
    const resMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0x334155 : 0x1a1528,
      transparent: true,
      opacity: isLight ? 0.25 : 0.35,
      roughness: 0.8,
    });
    const resBlock = new THREE.Mesh(resGeo, resMat);
    resBlock.position.y = 0;
    reservoirGroup.add(resBlock);

    // Geological pay zone boundary wireframe
    const resWireGeo = new THREE.WireframeGeometry(resGeo);
    const resWireMat = new THREE.LineBasicMaterial({
      color: isLight ? 0x94a3b8 : 0x475569,
      transparent: true,
      opacity: 0.4,
    });
    const resWire = new THREE.LineSegments(resWireGeo, resWireMat);
    reservoirGroup.add(resWire);

    // Heavy Oil Zone (Perforated Sandstone horizon)
    const oilZoneGeo = new THREE.CylinderGeometry(4.8, 4.8, 1.8, 32);
    const oilZoneMat = new THREE.MeshStandardMaterial({
      color: 0x1f140e,
      roughness: 0.9,
      transparent: true,
      opacity: 0.55,
    });
    const oilZone = new THREE.Mesh(oilZoneGeo, oilZoneMat);
    oilZone.position.y = -0.2;
    reservoirGroup.add(oilZone);

    // Steam Thermal Chamber Bulb (grows and glows based on temperature and steam)
    const tempRatio = Math.min(Math.max((activeState.reservoirTempC - 58) / 180, 0), 1);
    const chamberColor = new THREE.Color().lerpColors(
      new THREE.Color(0x3b1d11), // Cold Viscous Heavy Oil
      new THREE.Color(0xf97316), // Heated Steam Chamber
      tempRatio
    );

    const steamChamberGeo = new THREE.SphereGeometry(2.8, 32, 24);
    const steamChamberMat = new THREE.MeshStandardMaterial({
      color: chamberColor,
      transparent: true,
      opacity: viewSettings.showThermal ? 0.52 : 0.15,
      emissive: chamberColor,
      emissiveIntensity: viewSettings.showThermal ? 0.45 : 0.05,
      roughness: 0.25,
    });
    const steamChamber = new THREE.Mesh(steamChamberGeo, steamChamberMat);
    steamChamber.position.y = 0.2;
    steamChamber.scale.set(1.5, 0.9, 1.5);
    reservoirGroup.add(steamChamber);

    // Perforation tunnels (punctured dots at wellbore bottom)
    for (let p = 0; p < 18; p++) {
      const perfGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8);
      const perfMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const perf = new THREE.Mesh(perfGeo, perfMat);
      const angle = (p / 18) * Math.PI * 2;
      perf.rotation.z = Math.PI / 2;
      perf.rotation.y = angle;
      perf.position.set(Math.cos(angle) * 0.7, 0.2 + (p % 4) * 0.3 - 0.6, Math.sin(angle) * 0.7);
      reservoirGroup.add(perf);
    }

    // ==========================================
    // 8. ANIMATED PARTICLES: STEAM & OIL FLOW
    // ==========================================
    // A. Steam Injection Particles (Surface down into Reservoir Perforations)
    const steamParticleCount = 65;
    const steamParticlesGeo = new THREE.BufferGeometry();
    const steamPos = new Float32Array(steamParticleCount * 3);
    const steamSpeeds = new Float32Array(steamParticleCount);

    for (let i = 0; i < steamParticleCount; i++) {
      steamPos[i * 3 + 0] = (Math.random() - 0.5) * 0.45;
      steamPos[i * 3 + 1] = 5.2 - Math.random() * 11.5;
      steamPos[i * 3 + 2] = (Math.random() - 0.5) * 0.45;
      steamSpeeds[i] = 0.04 + Math.random() * 0.03;
    }
    steamParticlesGeo.setAttribute("position", new THREE.BufferAttribute(steamPos, 3));

    const steamParticleMat = new THREE.PointsMaterial({
      color: 0xf97316,
      size: 0.22,
      transparent: true,
      opacity: showSteam ? 0.75 : 0.0,
      blending: THREE.AdditiveBlending,
    });
    const steamParticleSystem = new THREE.Points(steamParticlesGeo, steamParticleMat);
    wellRoot.add(steamParticleSystem);

    // B. Oil Production Flow Particles (Reservoir -> Wellbore -> Surface Flowline)
    const oilParticleCount = 80;
    const oilParticlesGeo = new THREE.BufferGeometry();
    const oilPos = new Float32Array(oilParticleCount * 3);
    const oilSpeeds = new Float32Array(oilParticleCount);

    for (let i = 0; i < oilParticleCount; i++) {
      oilPos[i * 3 + 0] = (Math.random() - 0.5) * 0.25;
      oilPos[i * 3 + 1] = -6.0 + Math.random() * 11.4;
      oilPos[i * 3 + 2] = (Math.random() - 0.5) * 0.25;
      oilSpeeds[i] = 0.035 + Math.random() * 0.04;
    }
    oilParticlesGeo.setAttribute("position", new THREE.BufferAttribute(oilPos, 3));

    const oilParticleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.24,
      transparent: true,
      opacity: showParticles ? 0.85 : 0.0,
      blending: THREE.AdditiveBlending,
    });
    const oilParticleSystem = new THREE.Points(oilParticlesGeo, oilParticleMat);
    wellRoot.add(oilParticleSystem);

    // ==========================================
    // 9. ANIMATION LOOP & KINEMATICS
    // ==========================================
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Update OrbitControls
      controls.update();

      if (viewSettings.isPlaying) {
        // SPM-governed kinematics
        const spm = activeParams.spm || 5.2;
        const omega = (spm * 2 * Math.PI) / 60.0;
        const crankAngle = elapsed * omega;

        // Counterweight rotation
        crankPivot.rotation.z = -crankAngle;

        // Beam rocking angle (sinusoidal)
        const strokeAmp = 0.13 * (activeParams.strokeLengthIn / 120.0);
        const beamAngle = Math.sin(crankAngle) * strokeAmp;
        walkingBeamPivot.rotation.z = beamAngle;

        // Vertical rod reciprocation following horsehead
        const rodVerticalOffset = Math.sin(crankAngle) * (0.65 * (activeParams.strokeLengthIn / 120.0));
        rodStringGroup.position.y = rodVerticalOffset;

        // Animated particles: Steam downward flow
        if (showSteam) {
          const sPos = steamParticleSystem.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < steamParticleCount; i++) {
            sPos[i * 3 + 1] -= steamSpeeds[i];
            if (sPos[i * 3 + 1] < -6.5) {
              sPos[i * 3 + 1] = 5.2;
            }
          }
          steamParticleSystem.geometry.attributes.position.needsUpdate = true;
        }

        // Animated particles: Oil upward production flow
        if (showParticles) {
          const oPos = oilParticleSystem.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < oilParticleCount; i++) {
            oPos[i * 3 + 1] += oilSpeeds[i];
            if (oPos[i * 3 + 1] > 5.4) {
              oPos[i * 3 + 1] = -6.2;
            }
          }
          oilParticleSystem.geometry.attributes.position.needsUpdate = true;
        }
      }

      // Map 3D Sensor Coordinates to 2D Screen Coordinates for interactive HTML overlay pins
      if (showSensors && currentMount) {
        const coords: Record<string, { x: number; y: number; visible: boolean }> = {};
        const rect = currentMount.getBoundingClientRect();

        sensors.forEach((s) => {
          const worldPos = new THREE.Vector3(s.coordinates.x, s.coordinates.y, s.coordinates.z);
          worldPos.project(camera);

          // Check if sensor is in front of camera
          const isVisible = worldPos.z < 1.0;
          const x = (worldPos.x * 0.5 + 0.5) * rect.width;
          const y = (-(worldPos.y * 0.5) + 0.5) * rect.height;

          coords[s.id] = { x, y, visible: isVisible };
        });

        setScreenCoords(coords);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!currentMount) return;
      const newWidth = currentMount.clientWidth;
      const newHeight = currentMount.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      controls.dispose();
    };
  }, [activeParams, activeState, viewSettings, isLight, sensors, viewMode, showParticles, showSteam, showSensors]);

  return (
    <div className="relative w-full h-full min-h-[580px] rounded-xl overflow-hidden border border-[#1a2642] bg-[#070b16] select-none canvas-3d-wrapper">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full min-h-[580px] cursor-grab active:cursor-grabbing" />

      {/* TOP-LEFT: Status & Active Operating State Badge */}
      <div className="absolute top-3 left-3 z-10 space-y-1.5 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0c1426]/90 backdrop-blur-md border border-[#24355a] shadow-lg pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-white tracking-wide">
            {viewMode === "physical" ? "PHYSICAL LAYER" : viewMode === "compare" ? "COMPARE MODE" : "3D DIGITAL TWIN"} • JODHPUR FM
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
            {activeParams.spm.toFixed(1)} SPM
          </span>
        </div>

        {/* Operating State Mode Indicator (Current vs Recommended) */}
        {optimizationResult && (
          <div className="pointer-events-auto">
            <div className="inline-flex rounded-lg p-0.5 bg-[#090e1c]/90 backdrop-blur-md border border-purple-500/40 shadow-md">
              <button
                onClick={() => updateViewSettings({ activeDisplayMode: "CURRENT" })}
                className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition ${
                  viewSettings.activeDisplayMode === "CURRENT"
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Current State
              </button>
              <button
                onClick={() => updateViewSettings({ activeDisplayMode: "RECOMMENDED" })}
                className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition flex items-center gap-1 ${
                  viewSettings.activeDisplayMode === "RECOMMENDED"
                    ? "bg-purple-600 text-white shadow"
                    : "text-purple-300 hover:text-white"
                }`}
              >
                <span>★ Recommended State</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TOP-RIGHT: 3D Interactive Controls Toolbar */}
      <div className="absolute top-3 right-3 z-10 flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-[#0c1426]/90 backdrop-blur-md border border-[#24355a] shadow-lg">
        {/* Play / Pause Animation */}
        <button
          onClick={() => updateViewSettings({ isPlaying: !viewSettings.isPlaying })}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium transition ${
            viewSettings.isPlaying
              ? "bg-emerald-600 text-white hover:bg-emerald-500"
              : "bg-amber-600 text-white hover:bg-amber-500"
          }`}
          title={viewSettings.isPlaying ? "Pause Animation" : "Play Animation"}
        >
          {viewSettings.isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{viewSettings.isPlaying ? "Pause" : "Play"}</span>
        </button>

        {/* Reset Camera View */}
        <button
          onClick={handleResetCamera}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium bg-[#162240] hover:bg-[#1f305a] text-slate-200 transition"
          title="Reset Camera Angle"
        >
          <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
          <span>Reset View</span>
        </button>

        <div className="w-[1px] h-5 bg-[#24355a] my-auto" />

        {/* Show Oil Flow Particles */}
        <button
          onClick={() => updateViewSettings({ showFlow: !viewSettings.showFlow })}
          className={`flex items-center gap-1 px-2 py-1.5 rounded text-xs transition ${
            viewSettings.showFlow
              ? "bg-sky-950 text-sky-300 border border-sky-700"
              : "text-slate-400 hover:text-white bg-[#131c33]"
          }`}
          title="Toggle Oil Flow Particles"
        >
          <Droplet className="w-3.5 h-3.5" />
          <span>Flow</span>
        </button>

        {/* Show Thermal Steam Bulb */}
        <button
          onClick={() => updateViewSettings({ showThermal: !viewSettings.showThermal })}
          className={`flex items-center gap-1 px-2 py-1.5 rounded text-xs transition ${
            viewSettings.showThermal
              ? "bg-orange-950 text-orange-300 border border-orange-700"
              : "text-slate-400 hover:text-white bg-[#131c33]"
          }`}
          title="Toggle Steam Thermal Chamber"
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Thermal</span>
        </button>

        {/* Show Sensors Toggle */}
        <button
          onClick={() => updateViewSettings({ showSensors: !viewSettings.showSensors })}
          className={`flex items-center gap-1 px-2 py-1.5 rounded text-xs transition ${
            viewSettings.showSensors
              ? "bg-indigo-950 text-indigo-300 border border-indigo-700"
              : "text-slate-400 hover:text-white bg-[#131c33]"
          }`}
          title="Toggle Telemetry Sensor Markers"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Sensors</span>
        </button>
      </div>

      {/* 3D SENSOR PINS OVERLAY (Directly attached to 3D world coordinates) */}
      {showSensors &&
        sensors.map((sensor) => {
          const pos = screenCoords[sensor.id];
          if (!pos || !pos.visible) return null;

          const isSelected = activeSensor?.id === sensor.id;

          return (
            <div
              key={sensor.id}
              style={{
                position: "absolute",
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: "translate(-50%, -50%)",
                zIndex: isSelected ? 30 : 20,
              }}
              className="group pointer-events-auto"
            >
              <button
                onClick={() => setActiveSensor(isSelected ? null : sensor)}
                className={`relative flex items-center justify-center w-6 h-6 rounded-full transition-transform transform hover:scale-125 shadow-lg ${
                  isSelected
                    ? "bg-white text-slate-900 ring-4 ring-sky-400 ring-offset-2 ring-offset-slate-900"
                    : sensor.statusColor === "emerald"
                    ? "bg-emerald-500 text-white"
                    : sensor.statusColor === "amber"
                    ? "bg-amber-500 text-white"
                    : sensor.statusColor === "rose"
                    ? "bg-rose-500 text-white"
                    : "bg-sky-500 text-white"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current" />
                <span className="absolute -inset-1 rounded-full animate-ping opacity-35 bg-current" />
              </button>

              {/* Hover Mini-Label */}
              <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden group-hover:block whitespace-nowrap px-2 py-1 rounded bg-[#0b1224]/95 text-[11px] font-mono text-white border border-[#23355c] shadow-lg pointer-events-none">
                <div className="font-bold text-sky-300">{sensor.name}</div>
                <div className="text-[10px] text-slate-300">{sensor.primaryValue}</div>
              </div>
            </div>
          );
        })}

      {/* INTERACTIVE SENSOR DETAIL CARD (Rendered on marker click) */}
      {activeSensor && (
        <div className="absolute bottom-4 left-4 z-30 w-80 p-4 rounded-xl bg-[#0c1426]/95 backdrop-blur-md border border-[#2a3e6b] shadow-2xl space-y-3 pointer-events-auto animate-in fade-in zoom-in-95">
          <div className="flex items-start justify-between border-b border-[#1b2a4d] pb-2">
            <div>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#182645] text-sky-300 border border-[#2b4172]">
                {activeSensor.category} SENSOR NODE
              </span>
              <h3 className="text-sm font-bold text-white mt-1">{activeSensor.name}</h3>
            </div>
            <button
              onClick={() => setActiveSensor(null)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#1a294d] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs font-mono bg-[#070b16] p-2.5 rounded-lg border border-[#192748]">
            <span className="text-slate-400">Live Reading:</span>
            <span className="font-bold text-emerald-400 text-sm">{activeSensor.primaryValue}</span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            {Object.entries(activeSensor.details).map(([key, val]) => (
              <div key={key} className="flex justify-between py-0.5 border-b border-[#121c33] text-slate-300">
                <span className="text-slate-400">{key}:</span>
                <span className="font-semibold text-white">{val}</span>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
            <span>Deterministic Coupling:</span>
            <span className="text-sky-300 font-bold">100% Synced</span>
          </div>
        </div>
      )}

      {/* BOTTOM-RIGHT: Camera navigation guide */}
      <div className="absolute bottom-3 right-3 z-10 px-2.5 py-1.5 rounded-lg bg-[#0c1426]/80 backdrop-blur-md border border-[#24355a] text-[10px] font-mono text-slate-400 pointer-events-none space-y-0.5">
        <div className="text-slate-200 font-semibold flex items-center gap-1">
          <Layers className="w-3 h-3 text-sky-400" />
          <span>Left-Drag: Rotate • Scroll: Zoom • Right-Drag: Pan</span>
        </div>
        <div className="text-[9px] text-slate-400">
          Chamber Temp: {activeState.reservoirTempC}°C • Viscosity: {activeState.estimatedViscosityCp} cP
        </div>
      </div>
    </div>
  );
};
