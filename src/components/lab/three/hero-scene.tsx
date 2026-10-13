"use client";

import * as React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme } from "next-themes";
import { useReducedMotion, useElementInView } from "@/lib/lab/hooks";

/**
 * HERO 3D — "System Constellation"
 *
 * An interactive topology of a backend system: five labeled layers
 * (Code → Services → Infrastructure → Data → AI) connected by edges
 * with data packets flowing along them, wrapped in orbital rings and
 * an ambient particle field.
 *
 * Interaction: nodes respond to hover (scale pulse + label highlight),
 * the camera parallaxes with the pointer, and the whole graph drifts.
 * Performance: low-poly geometry, no shadows, no postprocessing,
 * rendering pauses when the canvas leaves the viewport.
 * Reduced motion: renders a static SVG diagram instead.
 */

type NodeDef = {
  id: string;
  label: string;
  position: [number, number, number];
  size: number;
  color: string;
  /** Per-node label placement tweak [dx, dy] applied on top of the default
   *  "centered above the shell" position. Used to keep high nodes' labels
   *  hugging their graphic instead of drifting toward the navbar. */
  labelOffset?: [number, number];
};

const NODES: NodeDef[] = [
  { id: "code",   label: "CODE",   position: [-3.0, 1.6, 0.4],  size: 0.34, color: "#d97757" },
  { id: "svc",    label: "SERVICES", position: [2.6, 1.9, -0.8], size: 0.42, color: "#e8a04e", labelOffset: [0, 0.42] },
  { id: "infra",  label: "INFRA",  position: [-2.3, -0.4, -1.4], size: 0.5,  color: "#d97757" },
  { id: "data",   label: "DATA",   position: [2.3, -1.3, -0.4], size: 0.38, color: "#b85d34" },
  { id: "ai",     label: "AI",     position: [-0.8, -2.2, 0.6], size: 0.46, color: "#e8a04e" },
];

/** Theme-aware palette — additive blends vanish on light backgrounds. */
const PALETTE = {
  dark: {
    line: "#d97757",
    packet: "#f0b06a",
    particle: "#e8a04e",
    label: "rgba(233, 226, 218, 0.92)",
    lineOpacity: 0.3,
    particleOpacity: 0.5,
    additive: true,
    ambient: 0.55,
  },
  light: {
    line: "#a34a17",
    packet: "#c2410c",
    particle: "#b45309",
    label: "rgba(62, 38, 18, 0.9)",
    lineOpacity: 0.4,
    particleOpacity: 0.55,
    additive: false,
    ambient: 0.9,
  },
};

const CONNECTIONS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 0],
  [0, 2],
  [1, 3],
  [2, 4],
];

const V3 = (p: [number, number, number]) => new THREE.Vector3(...p);

/* ------------------------------------------------------------------ */
/* Label sprite (canvas texture)                                       */
/* ------------------------------------------------------------------ */

function makeLabelTexture(text: string, dark: boolean): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "600 44px 'JetBrains Mono', ui-monospace, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Letter-spaced uppercase
  const spaced = text.split("").join("\u200a\u200a");
  ctx.fillStyle = PALETTE[dark ? "dark" : "light"].label;
  ctx.fillText(spaced, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

function NodeLabel({
  def,
  index,
  hovered,
  dark,
}: {
  def: NodeDef;
  index: number;
  hovered: boolean;
  dark: boolean;
}) {
  const texture = React.useMemo(() => makeLabelTexture(def.label, dark), [def.label, dark]);
  const matRef = React.useRef<THREE.SpriteMaterial>(null);
  const spriteRef = React.useRef<THREE.Sprite>(null);
  // Same idle bob as the node mesh (Node uses sin(t*0.6 + index*1.3)) so the
  // label rides with its graphic instead of floating apart.
  const bobOffset = def.labelOffset?.[1] ?? 0.52;
  const bobX = def.labelOffset?.[0] ?? 0;

  useFrame((state) => {
    if (spriteRef.current) {
      const t = state.clock.elapsedTime;
      spriteRef.current.position.set(
        def.position[0] + bobX,
        def.position[1] + Math.sin(t * 0.6 + index * 1.3) * 0.1 + def.size + bobOffset,
        def.position[2]
      );
    }
    if (!matRef.current) return;
    const target = hovered ? 1 : 0.62;
    const cur = matRef.current.opacity;
    matRef.current.opacity = cur + (target - cur) * 0.12;
    // Gentle counter-drift so labels stay legible
    matRef.current.rotation = Math.sin(state.clock.elapsedTime * 0.4) * 0.015;
  });

  if (!texture) return null;
  return (
    <sprite ref={spriteRef} scale={[1.55, 0.39, 1]}>
      <spriteMaterial
        ref={matRef}
        map={texture}
        transparent
        opacity={0.62}
        depthWrite={false}
      />
    </sprite>
  );
}

/* ------------------------------------------------------------------ */
/* Node — core icosahedron + wireframe shell + glow ring               */
/* ------------------------------------------------------------------ */

function Node({
  def,
  index,
  hovered,
  onHover,
  dark,
}: {
  def: NodeDef;
  index: number;
  hovered: boolean;
  onHover: (id: string | null) => void;
  dark: boolean;
}) {
  const core = React.useRef<THREE.Mesh>(null);
  const shell = React.useRef<THREE.Mesh>(null);
  const ring = React.useRef<THREE.Mesh>(null);
  const group = React.useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (core.current) {
      core.current.rotation.y = t * 0.35 + index;
      core.current.rotation.x = Math.sin(t * 0.4 + index) * 0.2;
      const target = def.size * (hovered ? 1.28 : 1);
      const s = core.current.scale.x + (target - core.current.scale.x) * 0.12;
      core.current.scale.setScalar(s);
    }
    if (shell.current) {
      shell.current.rotation.y = -t * 0.18 + index;
      shell.current.rotation.z = t * 0.1;
    }
    if (ring.current) {
      ring.current.rotation.z = t * 0.5;
      const m = ring.current.material as THREE.MeshBasicMaterial;
      m.opacity = hovered ? 0.6 : 0.3 + Math.sin(t * 0.9 + index) * 0.08;
    }
    if (group.current) {
      // Idle float
      group.current.position.y = def.position[1] + Math.sin(t * 0.6 + index * 1.3) * 0.1;
    }
  });

  return (
    <group ref={group} position={def.position}>
      <mesh
        ref={core}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(def.id);
        }}
        onPointerOut={() => onHover(null)}
      >
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={def.color}
          emissive={def.color}
          emissiveIntensity={hovered ? 0.55 : 0.3}
          roughness={0.35}
          metalness={0.75}
          flatShading
        />
      </mesh>

      {/* Wireframe shell */}
      <mesh ref={shell} scale={def.size * 1.7}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial
          color={dark ? def.color : "#a34a17"}
          wireframe
          transparent
          opacity={dark ? 0.16 : 0.28}
        />
      </mesh>

      {/* Glow ring */}
      <mesh ref={ring} rotation={[Math.PI / 2.4, 0.3, 0]}>
        <ringGeometry args={[def.size * 1.75, def.size * 1.92, 48]} />
        <meshBasicMaterial
          color={dark ? def.color : "#a34a17"}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Edges + flowing data packets                                        */
/* ------------------------------------------------------------------ */

function EdgesAndPackets({ hovered, dark }: { hovered: string | null; dark: boolean }) {
  const lines = React.useRef<THREE.LineSegments>(null);
  const packets = React.useRef<THREE.InstancedMesh>(null);
  const dummy = React.useMemo(() => new THREE.Object3D(), []);
  const pal = dark ? PALETTE.dark : PALETTE.light;

  const { lineGeom, edges } = React.useMemo(() => {
    const positions: number[] = [];
    const edgesLocal = CONNECTIONS.map(([a, b]) => ({
      a: V3(NODES[a].position),
      b: V3(NODES[b].position),
      active: NODES[a].id === "code" || NODES[b].id === "code",
    }));
    CONNECTIONS.forEach(([a, b]) => {
      positions.push(...NODES[a].position, ...NODES[b].position);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return { lineGeom: g, edges: edgesLocal };
  }, []);

  const PACKET_COUNT = 36;
  const packetSeeds = React.useMemo(
    () =>
      Array.from({ length: PACKET_COUNT }, (_, i) => ({
        edge: i % edges.length,
        offset: (i * 0.618033) % 1, // golden-ratio scatter
        speed: 0.06 + ((i * 0.37) % 0.08),
        size: 0.03 + ((i * 0.29) % 0.025),
      })),
    [edges.length]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Line opacity breathes; brightens when a connected node is hovered
    if (lines.current) {
      const m = lines.current.material as THREE.LineBasicMaterial;
      const anyActive =
        hovered !== null &&
        CONNECTIONS.some(([a, b]) => NODES[a].id === hovered || NODES[b].id === hovered);
      const target = anyActive ? pal.lineOpacity + 0.25 : pal.lineOpacity + Math.sin(t * 0.8) * 0.06;
      m.opacity += (target - m.opacity) * 0.1;
    }

    // Packets flow along edges
    if (packets.current) {
      packetSeeds.forEach((p, i) => {
        const edge = edges[p.edge];
        const raw = (t * p.speed + p.offset) % 1;
        // ease in/out for organic motion
        const tt = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
        const pos = edge.a.clone().lerp(edge.b, tt);
        const isHot =
          hovered !== null &&
          (NODES[CONNECTIONS[p.edge][0]].id === hovered ||
            NODES[CONNECTIONS[p.edge][1]].id === hovered);
        dummy.position.copy(pos);
        dummy.scale.setScalar(p.size * (isHot ? 1.8 : 1));
        dummy.updateMatrix();
        packets.current!.setMatrixAt(i, dummy.matrix);
      });
      packets.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <lineSegments ref={lines} geometry={lineGeom}>
        <lineBasicMaterial
          key={dark ? "line-dark" : "line-light"}
          color={pal.line}
          transparent
          opacity={pal.lineOpacity}
          blending={pal.additive ? THREE.AdditiveBlending : THREE.NormalBlending}
          depthWrite={false}
        />
      </lineSegments>

      <instancedMesh args={[undefined, undefined, PACKET_COUNT]} ref={packets}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial
          key={dark ? "pkt-dark" : "pkt-light"}
          color={pal.packet}
          transparent
          opacity={0.9}
          blending={pal.additive ? THREE.AdditiveBlending : THREE.NormalBlending}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Ambience — particles, orbital rings, core                           */
/* ------------------------------------------------------------------ */

function Particles({ count = 140, dark }: { count?: number; dark: boolean }) {
  const ref = React.useRef<THREE.Points>(null);
  const pal = dark ? PALETTE.dark : PALETTE.light;
  const positions = React.useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 7 - 2;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.02;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial
        key={dark ? "p-dark" : "p-light"}
        size={0.022}
        color={pal.particle}
        transparent
        opacity={pal.particleOpacity}
        sizeAttenuation
        blending={pal.additive ? THREE.AdditiveBlending : THREE.NormalBlending}
        depthWrite={false}
      />
    </points>
  );
}

function OrbitRings({ dark }: { dark: boolean }) {
  const r1 = React.useRef<THREE.Mesh>(null);
  const r2 = React.useRef<THREE.Mesh>(null);
  const pal = dark ? PALETTE.dark : PALETTE.light;
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (r1.current) r1.current.rotation.z = t * 0.05;
    if (r2.current) r2.current.rotation.z = -t * 0.035;
  });
  return (
    <group position={[0, 0, -2.5]}>
      <mesh ref={r1} rotation={[Math.PI / 2.15, 0.25, 0]}>
        <torusGeometry args={[5.2, 0.005, 6, 128]} />
        <meshBasicMaterial color={pal.line} transparent opacity={pal.additive ? 0.22 : 0.3} />
      </mesh>
      <mesh ref={r2} rotation={[Math.PI / 1.85, -0.35, 0]}>
        <torusGeometry args={[6.4, 0.005, 6, 128]} />
        <meshBasicMaterial color={pal.packet} transparent opacity={pal.additive ? 0.14 : 0.22} />
      </mesh>
    </group>
  );
}

function Core({ dark }: { dark: boolean }) {
  const ref = React.useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.22;
    ref.current.rotation.x = -state.clock.elapsedTime * 0.12;
  });
  return (
    <mesh ref={ref} position={[0, 0, -0.6]} scale={0.55}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial
        color={dark ? "#d97757" : "#a34a17"}
        wireframe
        transparent
        opacity={dark ? 0.35 : 0.4}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Camera rig — pointer parallax + gentle drift                        */
/* ------------------------------------------------------------------ */

function Rig() {
  const { camera, pointer } = useThree();
  const target = React.useRef({ x: 0, y: 0 });
  useFrame(() => {
    target.current.x = pointer.x * 0.7;
    target.current.y = pointer.y * 0.45;
    camera.position.x += (target.current.x - camera.position.x) * 0.04;
    camera.position.y += (target.current.y - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/* ------------------------------------------------------------------ */
/* Scene root                                                          */
/* ------------------------------------------------------------------ */

function SceneContent({ dark }: { dark: boolean }) {
  const [hovered, setHovered] = React.useState<string | null>(null);
  const group = React.useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.07;
    }
  });

  return (
    <group ref={group}>
      {NODES.map((n, i) => (
        <Node
          key={n.id}
          def={n}
          index={i}
          hovered={hovered === n.id}
          onHover={setHovered}
          dark={dark}
        />
      ))}
      {NODES.map((n, i) => (
        <NodeLabel
          key={`${n.id}-label`}
          def={n}
          index={i}
          hovered={hovered === n.id}
          dark={dark}
        />
      ))}
      <EdgesAndPackets hovered={hovered} dark={dark} />
      <Core dark={dark} />
      <OrbitRings dark={dark} />
      <Particles dark={dark} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Exported component — Canvas wrapper with viewport pausing           */
/* ------------------------------------------------------------------ */

export function HeroScene() {
  const reduced = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme !== "light";
  const { ref: wrapRef, inView } = useElementInView<HTMLDivElement>({ threshold: 0 });

  if (reduced) {
    return <StaticDiagram dark={dark} />;
  }

  return (
    <div ref={wrapRef} className="absolute inset-0" aria-hidden>
      <Canvas
        className="absolute inset-0"
        camera={{ position: [0, 0, 9.6], fov: 45 }}
        dpr={[1, 1.75]}
        frameloop={inView ? "always" : "never"}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={dark ? 0.55 : 0.9} />
        <pointLight position={[5, 5, 5]} intensity={dark ? 1.4 : 1.1} color="#e8a04e" />
        <pointLight position={[-5, -3, 2]} intensity={0.7} color="#d97757" />
        <SceneContent dark={dark} />
        <Rig />
      </Canvas>
    </div>
  );
}

/** Static, accessible fallback for reduced-motion users. */
function StaticDiagram({ dark }: { dark: boolean }) {
  const line = dark ? "#d97757" : "#a34a17";
  const label = dark ? "#e8a04e" : "#7c3a12";
  return (
    <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
      <svg viewBox="-50 -50 100 100" className="h-3/4 w-3/4 opacity-50">
        {CONNECTIONS.map(([a, b], i) => (
          <line
            key={i}
            x1={NODES[a].position[0] * 10}
            y1={-NODES[a].position[1] * 10}
            x2={NODES[b].position[0] * 10}
            y2={-NODES[b].position[1] * 10}
            stroke={line}
            strokeWidth={0.3}
            opacity={0.5}
          />
        ))}
        {NODES.map((n, i) => (
          <g key={i}>
            <circle
              cx={n.position[0] * 10}
              cy={-n.position[1] * 10}
              r={n.size * 10}
              fill={n.color}
              opacity={0.7}
            />
            <text
              x={n.position[0] * 10}
              y={-n.position[1] * 10 - n.size * 10 - 3}
              textAnchor="middle"
              fontSize={4}
              fontFamily="ui-monospace, monospace"
              fill={label}
            >
              {n.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
