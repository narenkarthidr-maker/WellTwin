"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface DigitalTwinBackgroundProps {
  theme: "dark" | "light";
}

interface TelemetryPoint {
  id: string;
  label: string;
  value: string;
  color: string;
  pos: THREE.Vector3;
}

export const DigitalTwinBackground: React.FC<DigitalTwinBackgroundProps> = ({ theme }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const isLight = theme === "light";
  const [screenCoords, setScreenCoords] = useState<Record<string, { x: number; y: number; visible: boolean }>>({});

  // 4 Subtle Telemetry Nodes in 3D space
  const telemetryPoints: TelemetryPoint[] = [
    {
      id: "node_srp",
      label: "SRP UNIT",
      value: "5.2 SPM",
      color: "#38bdf8",
      pos: new THREE.Vector3(-6.2, 5.2, 1.2),
    },
    {
      id: "node_wellhead",
      label: "WELLHEAD",
      value: "14.2 bar",
      color: "#0284c7",
      pos: new THREE.Vector3(-3.8, 4.6, 1.0),
    },
    {
      id: "node_thermal",
      label: "SANDFACE",
      value: "82.4°C",
      color: "#f97316",
      pos: new THREE.Vector3(-4.2, -4.8, 1.0),
    },
    {
      id: "node_viscosity",
      label: "VISCOSITY",
      value: "1,250 cP",
      color: "#fbbf24",
      pos: new THREE.Vector3(-1.8, -5.8, 0.5),
    },
  ];

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Window dimensions
    let width = window.innerWidth;
    let height = window.innerHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const bgColor = new THREE.Color(isLight ? 0xf1f5f9 : 0x060a14);
    scene.background = bgColor;
    scene.fog = new THREE.FogExp2(isLight ? 0xf1f5f9 : 0x060a14, 0.024);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    // 3/4 perspective viewing surface, wellbore, and reservoir
    const baseCameraPos = new THREE.Vector3(10.5, 3.8, 22.0);
    camera.position.copy(baseCameraPos);
    const lookTarget = new THREE.Vector3(-1.2, -1.2, 0);
    camera.lookAt(lookTarget);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = false;
    currentMount.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(
      isLight ? 0xe2e8f0 : 0x1a2642,
      isLight ? 1.6 : 0.95
    );
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, isLight ? 1.2 : 1.6);
    keyLight.position.set(16, 22, 12);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf97316, isLight ? 0.8 : 1.1);
    rimLight.position.set(-14, -12, -6);
    scene.add(rimLight);

    // Soft thermal point light deep in reservoir
    const thermalPointLight = new THREE.PointLight(0xf97316, isLight ? 1.4 : 2.6, 14);
    thermalPointLight.position.set(-4.2, -5.2, 1.0);
    scene.add(thermalPointLight);

    // Root Group
    const world = new THREE.Group();
    scene.add(world);

    // ==========================================
    // 3. SURFACE TERRAIN & STRUCTURES (Upper 20-30%)
    // ==========================================
    const surfaceY = 4.2;

    // Ground plane with subtle contour wireframe
    const terrainGeo = new THREE.PlaneGeometry(36, 24, 24, 18);
    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      // Gentle elevation undulation
      const vz = Math.sin(vx * 0.2) * Math.cos(vy * 0.25) * 0.35;
      posAttr.setZ(i, vz);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0xe2e8f0 : 0x0c1527,
      roughness: 0.85,
      metalness: 0.15,
      wireframe: false,
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.set(0, surfaceY, -2);
    world.add(terrain);

    // Subtle surface grid lines
    const gridHelper = new THREE.GridHelper(32, 24, isLight ? 0x94a3b8 : 0x1f2f54, isLight ? 0xcbd5e1 : 0x101b33);
    gridHelper.position.set(0, surfaceY + 0.02, -2);
    world.add(gridHelper);

    // Surface Wellhead Christmas Tree (at x=-3.8, z=1.0)
    const wellheadGroup = new THREE.Group();
    wellheadGroup.position.set(-3.8, surfaceY, 1.0);

    const wellheadBaseGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.8, 16);
    const wellheadMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0x0284c7 : 0x0369a1,
      metalness: 0.85,
      roughness: 0.2,
    });
    const wellheadBase = new THREE.Mesh(wellheadBaseGeo, wellheadMat);
    wellheadBase.position.y = 0.4;
    wellheadGroup.add(wellheadBase);

    // Flowline tee
    const flowTeeGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.0, 12);
    const flowTee = new THREE.Mesh(flowTeeGeo, wellheadMat);
    flowTee.rotation.z = Math.PI / 2;
    flowTee.position.set(0.4, 0.6, 0);
    wellheadGroup.add(flowTee);

    world.add(wellheadGroup);

    // Small SRP Pumpjack Assembly (at x=-6.0, z=1.0)
    const pumpjackGroup = new THREE.Group();
    pumpjackGroup.position.set(-6.0, surfaceY, 1.0);
    world.add(pumpjackGroup);

    // Samson Post A-frame
    const samsonGeo = new THREE.ConeGeometry(0.65, 2.6, 4);
    const samsonMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0x475569 : 0x223254,
      metalness: 0.7,
      roughness: 0.4,
    });
    const samsonPost = new THREE.Mesh(samsonGeo, samsonMat);
    samsonPost.position.set(0, 1.3, 0);
    samsonPost.rotation.y = Math.PI / 4;
    pumpjackGroup.add(samsonPost);

    // Walking Beam & Horsehead
    const walkingBeamPivot = new THREE.Group();
    walkingBeamPivot.position.set(0, 2.6, 0);
    pumpjackGroup.add(walkingBeamPivot);

    const beamGeo = new THREE.BoxGeometry(3.6, 0.2, 0.18);
    const beamMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.8,
      roughness: 0.3,
    });
    const walkingBeam = new THREE.Mesh(beamGeo, beamMat);
    walkingBeam.position.set(0.6, 0, 0);
    walkingBeamPivot.add(walkingBeam);

    const horseheadGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.16, 14, 1, false, -Math.PI / 2.2, Math.PI / 1.1);
    const horsehead = new THREE.Mesh(horseheadGeo, beamMat);
    horsehead.position.set(2.4, -0.22, 0);
    horsehead.rotation.z = Math.PI / 2;
    walkingBeamPivot.add(horsehead);

    // Counterweight Crank
    const crankPivot = new THREE.Group();
    crankPivot.position.set(-1.1, 0.5, 0);
    pumpjackGroup.add(crankPivot);

    const crankArmGeo = new THREE.BoxGeometry(0.14, 0.7, 0.12);
    const crankArmMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.6 });
    const crankArm = new THREE.Mesh(crankArmGeo, crankArmMat);
    crankArm.position.y = 0.35;
    crankPivot.add(crankArm);

    const counterweightGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.18, 14);
    const counterweight = new THREE.Mesh(counterweightGeo, crankArmMat);
    counterweight.rotation.x = Math.PI / 2;
    counterweight.position.set(0, 0.65, 0);
    crankPivot.add(counterweight);

    // Faint industrial pinpoint lights
    const pinLightPositions = [
      new THREE.Vector3(-3.4, surfaceY + 1.2, 1.0),
      new THREE.Vector3(-6.5, surfaceY + 0.6, 0.6),
      new THREE.Vector3(7.2, surfaceY + 0.4, -1.8),
    ];
    pinLightPositions.forEach((pos, idx) => {
      const pinGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const pinMat = new THREE.MeshBasicMaterial({
        color: idx === 1 ? 0xf59e0b : 0x38bdf8,
      });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.copy(pos);
      world.add(pin);
    });

    // ==========================================
    // 4. 3D SUBSURFACE WELLBORES (Left & Right Periphery)
    // ==========================================
    // Main Wellbore (Left side: x=-3.8 at surface down to x=-4.2 at reservoir y=-6.8)
    const wellCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.8, surfaceY, 1.0),
      new THREE.Vector3(-3.9, 1.5, 1.0),
      new THREE.Vector3(-4.0, -1.5, 1.0),
      new THREE.Vector3(-4.1, -4.0, 1.0),
      new THREE.Vector3(-4.2, -6.8, 1.0),
    ]);

    const casingGeo = new THREE.TubeGeometry(wellCurve, 40, 0.32, 16, false);
    const casingMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0x64748b : 0x223554,
      metalness: 0.85,
      roughness: 0.3,
      transparent: true,
      opacity: isLight ? 0.35 : 0.45,
    });
    const mainCasing = new THREE.Mesh(casingGeo, casingMat);
    world.add(mainCasing);

    // Central Sucker Rod String (Luminous blue emissive core)
    const rodGeo = new THREE.TubeGeometry(wellCurve, 40, 0.08, 10, false);
    const rodMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.65,
      metalness: 0.9,
    });
    const rodString = new THREE.Mesh(rodGeo, rodMat);
    world.add(rodString);

    // Casing depth collar rings
    for (let c = 0; c < 7; c++) {
      const t = c / 6;
      const pt = wellCurve.getPoint(t);
      const collarGeo = new THREE.TorusGeometry(0.34, 0.03, 8, 20);
      const collarMat = new THREE.MeshBasicMaterial({ color: isLight ? 0x94a3b8 : 0x3b5278 });
      const collar = new THREE.Mesh(collarGeo, collarMat);
      collar.rotation.x = Math.PI / 2;
      collar.position.copy(pt);
      world.add(collar);
    }

    // Secondary Observational Wellbore (Right periphery: x=6.5 down to y=-6.0)
    const obsCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(6.5, surfaceY, -1.5),
      new THREE.Vector3(6.2, 0.5, -1.8),
      new THREE.Vector3(5.8, -3.0, -2.0),
      new THREE.Vector3(5.5, -6.2, -2.0),
    ]);
    const obsCasingGeo = new THREE.TubeGeometry(obsCurve, 30, 0.22, 12, false);
    const obsCasingMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0x94a3b8 : 0x1d2d48,
      metalness: 0.8,
      roughness: 0.4,
      transparent: true,
      opacity: isLight ? 0.25 : 0.3,
    });
    const obsCasing = new THREE.Mesh(obsCasingGeo, obsCasingMat);
    world.add(obsCasing);

    // ==========================================
    // 5. 3D VOLUMETRIC SUBSURFACE RESERVOIR & THERMAL ZONE
    // ==========================================
    const reservoirGroup = new THREE.Group();
    reservoirGroup.position.set(-2.5, -5.5, 0);
    world.add(reservoirGroup);

    // Geological Formations (Stratigraphic pay zones)
    // A. Overburden Caprock Layer
    const caprockGeo = new THREE.BoxGeometry(22, 1.4, 16);
    const caprockMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0xcbd5e1 : 0x101a2e,
      transparent: true,
      opacity: isLight ? 0.22 : 0.28,
      roughness: 0.85,
    });
    const caprock = new THREE.Mesh(caprockGeo, caprockMat);
    caprock.position.set(0, 1.6, 0);
    reservoirGroup.add(caprock);

    // B. Jodhpur Heavy-Oil Pay Zone (Volumetric semi-transparent reservoir)
    const payZoneGeo = new THREE.BoxGeometry(24, 3.2, 18);
    const payZoneMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0x334155 : 0x1a1208, // Dark amber / bitumen brown
      transparent: true,
      opacity: isLight ? 0.25 : 0.38,
      roughness: 0.75,
    });
    const payZone = new THREE.Mesh(payZoneGeo, payZoneMat);
    payZone.position.set(0, -0.6, 0);
    reservoirGroup.add(payZone);

    // Reservoir bounding contour wireframe
    const resWireGeo = new THREE.WireframeGeometry(payZoneGeo);
    const resWireMat = new THREE.LineBasicMaterial({
      color: isLight ? 0x94a3b8 : 0x2e3d5c,
      transparent: true,
      opacity: isLight ? 0.3 : 0.25,
    });
    const resWire = new THREE.LineSegments(resWireGeo, resWireMat);
    payZone.add(resWire);

    // C. Steam Thermal Chamber Bulb (Around main well perforations at x=-4.2, y=-5.2 in world space)
    // Relative to reservoirGroup (-2.5, -5.5, 0) -> position is (-1.7, 0.3, 1.0)
    const thermalBulbGroup = new THREE.Group();
    thermalBulbGroup.position.set(-1.7, 0.3, 1.0);
    reservoirGroup.add(thermalBulbGroup);

    // Inner Core Steam Chamber (Glowing golden/orange)
    const coreBulbGeo = new THREE.SphereGeometry(2.2, 28, 20);
    const coreBulbMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xea580c,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: isLight ? 0.42 : 0.48,
      roughness: 0.25,
    });
    const coreBulb = new THREE.Mesh(coreBulbGeo, coreBulbMat);
    coreBulb.scale.set(1.5, 0.85, 1.3);
    thermalBulbGroup.add(coreBulb);

    // Outer Thermal Diffusion Halo (Warm gradient transition)
    const haloGeo = new THREE.SphereGeometry(3.6, 24, 18);
    const haloMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6, // Purple-amber transition
      emissive: 0x7c3aed,
      emissiveIntensity: 0.15,
      transparent: true,
      opacity: isLight ? 0.15 : 0.2,
      roughness: 0.6,
    });
    const haloBulb = new THREE.Mesh(haloGeo, haloMat);
    haloBulb.scale.set(1.4, 0.8, 1.25);
    thermalBulbGroup.add(haloBulb);

    // Geological permeable horizon discs (simulating porous sandstone flow planes)
    for (let d = -1; d <= 1; d++) {
      const discGeo = new THREE.RingGeometry(0.8, 5.2, 32);
      const discMat = new THREE.MeshBasicMaterial({
        color: isLight ? 0x94a3b8 : 0x24355a,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isLight ? 0.25 : 0.18,
      });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.rotation.x = Math.PI / 2;
      disc.position.set(-1.7, d * 0.8, 1.0);
      reservoirGroup.add(disc);
    }

    // ==========================================
    // 6. ANIMATED PARTICLE SYSTEMS
    // ==========================================
    // A. Steam Thermal Particles: Wellbore -> Thermal Reservoir Zone
    const steamCount = 55;
    const steamGeo = new THREE.BufferGeometry();
    const steamPos = new Float32Array(steamCount * 3);
    const steamVel = new Float32Array(steamCount * 3);

    for (let i = 0; i < steamCount; i++) {
      // Spawn near injection point (-4.2, -5.0, 1.0)
      steamPos[i * 3 + 0] = -4.2 + (Math.random() - 0.5) * 0.5;
      steamPos[i * 3 + 1] = -5.0 + (Math.random() - 0.5) * 1.0;
      steamPos[i * 3 + 2] = 1.0 + (Math.random() - 0.5) * 0.5;

      // Radial drift outward into reservoir
      steamVel[i * 3 + 0] = (Math.random() - 0.3) * 0.012;
      steamVel[i * 3 + 1] = (Math.random() - 0.5) * 0.008;
      steamVel[i * 3 + 2] = (Math.random() - 0.5) * 0.012;
    }
    steamGeo.setAttribute("position", new THREE.BufferAttribute(steamPos, 3));

    const steamMat = new THREE.PointsMaterial({
      color: 0xf97316,
      size: 0.26,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const steamParticles = new THREE.Points(steamGeo, steamMat);
    world.add(steamParticles);

    // B. Oil Production Flow Particles: Reservoir -> Wellbore -> Surface
    const oilCount = 70;
    const oilGeo = new THREE.BufferGeometry();
    const oilPos = new Float32Array(oilCount * 3);
    const oilProgress = new Float32Array(oilCount);

    for (let i = 0; i < oilCount; i++) {
      oilProgress[i] = Math.random();
      const pt = wellCurve.getPoint(oilProgress[i]);
      oilPos[i * 3 + 0] = pt.x + (Math.random() - 0.5) * 0.15;
      oilPos[i * 3 + 1] = pt.y;
      oilPos[i * 3 + 2] = pt.z + (Math.random() - 0.5) * 0.15;
    }
    oilGeo.setAttribute("position", new THREE.BufferAttribute(oilPos, 3));

    const oilMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.28,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const oilParticles = new THREE.Points(oilGeo, oilMat);
    world.add(oilParticles);

    // ==========================================
    // 7. MOUSE PARALLAX & ANIMATION LOOP
    // ==========================================
    let mouseX = 0;
    let mouseY = 0;
    let targetCameraX = baseCameraPos.x;
    let targetCameraY = baseCameraPos.y;

    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseX = normX;
      mouseY = normY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Subtle breathing drift + mouse parallax (smooth, non-distracting)
      const driftX = Math.sin(elapsed * 0.25) * 0.35;
      const driftY = Math.cos(elapsed * 0.3) * 0.25;

      targetCameraX = baseCameraPos.x + mouseX * 1.4 + driftX;
      targetCameraY = baseCameraPos.y + mouseY * 0.9 + driftY;

      camera.position.x += (targetCameraX - camera.position.x) * 0.035;
      camera.position.y += (targetCameraY - camera.position.y) * 0.035;
      camera.lookAt(lookTarget);

      // SRP Mechanical Kinematics (Slow, realistic, calm)
      const omega = 1.2; // ~5.2 SPM
      const crankAngle = elapsed * omega;
      crankPivot.rotation.z = -crankAngle;

      // Walking beam rocking motion
      const beamRock = Math.sin(crankAngle) * 0.09;
      walkingBeamPivot.rotation.z = beamRock;

      // Thermal Bulb gentle volumetric breathing
      const pulse = 1.0 + Math.sin(elapsed * 1.5) * 0.03;
      coreBulb.scale.set(1.5 * pulse, 0.85 * pulse, 1.3 * pulse);
      coreBulbMat.emissiveIntensity = 0.45 + Math.sin(elapsed * 1.5) * 0.08;

      // Animate Steam Injection Particles (Drifting outward)
      const sPos = steamGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < steamCount; i++) {
        sPos[i * 3 + 0] += steamVel[i * 3 + 0];
        sPos[i * 3 + 1] += steamVel[i * 3 + 1];
        sPos[i * 3 + 2] += steamVel[i * 3 + 2];

        // Reset if drifted too far from injection wellbore
        const dx = sPos[i * 3 + 0] - (-4.2);
        const dy = sPos[i * 3 + 1] - (-5.0);
        const dz = sPos[i * 3 + 2] - 1.0;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist > 3.2) {
          sPos[i * 3 + 0] = -4.2 + (Math.random() - 0.5) * 0.4;
          sPos[i * 3 + 1] = -5.0 + (Math.random() - 0.5) * 0.8;
          sPos[i * 3 + 2] = 1.0 + (Math.random() - 0.5) * 0.4;
        }
      }
      steamGeo.attributes.position.needsUpdate = true;

      // Animate Oil Production Flow (Ascending along curve)
      const oPos = oilGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < oilCount; i++) {
        oilProgress[i] -= 0.0035; // Flow upward from reservoir (t=1) to surface (t=0)
        if (oilProgress[i] < 0.02) {
          oilProgress[i] = 0.98;
        }
        const pt = wellCurve.getPoint(oilProgress[i]);
        oPos[i * 3 + 0] = pt.x + Math.sin(elapsed * 2 + i) * 0.06;
        oPos[i * 3 + 1] = pt.y;
        oPos[i * 3 + 2] = pt.z + Math.cos(elapsed * 2 + i) * 0.06;
      }
      oilGeo.attributes.position.needsUpdate = true;

      // Project 3D Telemetry Nodes to 2D Screen
      if (currentMount) {
        const coords: Record<string, { x: number; y: number; visible: boolean }> = {};
        telemetryPoints.forEach((node) => {
          const wp = node.pos.clone();
          wp.project(camera);
          const isVis = wp.z < 1.0;
          const sx = (wp.x * 0.5 + 0.5) * width;
          const sy = (-(wp.y * 0.5) + 0.5) * height;
          coords[node.id] = { x: sx, y: sy, visible: isVis };
        });
        setScreenCoords(coords);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Window Resize Handler
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isLight]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Subtle Central Contrast Shield (Ensures login card is always crisp and readable) */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isLight
            ? "bg-radial-gradient from-transparent via-slate-100/35 to-slate-200/60"
            : "bg-radial-gradient from-transparent via-[#060a14]/40 to-[#060a14]/85"
        }`}
      />

      {/* Floating 3D Telemetry Nodes (Subtle, professional, low contrast) */}
      {telemetryPoints.map((node) => {
        const coord = screenCoords[node.id];
        if (!coord || !coord.visible) return null;

        return (
          <div
            key={node.id}
            style={{
              position: "absolute",
              left: `${coord.x}px`,
              top: `${coord.y}px`,
              transform: "translate(-50%, -50%)",
            }}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0a1122]/70 backdrop-blur-sm border border-[#1e2f52]/60 text-[10px] font-mono pointer-events-none transition-opacity duration-300 shadow-sm opacity-65"
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: node.color }}
            />
            <span className="text-slate-400 font-semibold">{node.label}:</span>
            <span className="text-white font-bold">{node.value}</span>
          </div>
        );
      })}

      {/* Discreet Engineering Footnote */}
      <div className="absolute bottom-3 left-4 text-[10px] font-mono text-slate-500/80 pointer-events-none space-y-0.5">
        <div className="text-sky-400/90 font-semibold tracking-wide">
          WELLTWIN 3D SUBSURFACE TWIN • JODHPUR PAY ZONE
        </div>
        <div>Coupled Thermal Reservoir & SRP Dynamics Model</div>
      </div>
    </div>
  );
};
