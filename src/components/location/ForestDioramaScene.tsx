"use client";

import { useMemo } from "react";
import { ContactShadows, RoundedBox, useGLTF, useTexture } from "@react-three/drei";
import { Mesh, MeshStandardMaterial, RepeatWrapping, SRGBColorSpace, type Group, type Texture } from "three";

export const forestSceneFeatures = [
  "moss-island",
  "timber-cottage",
  "storage-furniture",
  "mushrooms",
  "flowers",
  "orange-cat",
  "tuxedo-cat",
  "contact-shadow",
] as const;

export const forestCabinStyleFeatures = [
  "single-storey",
  "charcoal-gable",
  "cedar-siding",
  "glass-entry",
  "front-porch",
  "porch-rails",
  "warm-sconces",
] as const;

type Point3 = [number, number, number];
type CanopyLayer = "back" | "middle" | "foreground";
type TreeCluster = "rear-left" | "rear-right" | "right-grove";

export const islandSurfaceY = 0.32;
export const cabinPosition: Point3 = [0, islandSurfaceY, -1.8];

const pineTrees: Array<{
  position: Point3;
  scale: number;
  color: string;
  layer: CanopyLayer;
  cluster: TreeCluster;
}> = [
  { position: [-3.3, 0.32, -2.1], scale: 1.15, color: "#a6c6a3", layer: "back", cluster: "rear-left" },
  { position: [-2.55, 0.32, -3], scale: 1.42, color: "#91b79a", layer: "back", cluster: "rear-left" },
  { position: [-1.65, 0.32, -3.55], scale: 1.3, color: "#9abf9f", layer: "back", cluster: "rear-left" },
  { position: [-3.7, 0.32, -1.2], scale: 0.98, color: "#b5d0a8", layer: "middle", cluster: "rear-left" },
  { position: [-3.65, 0.32, -1.65], scale: 0.84, color: "#c4daae", layer: "middle", cluster: "rear-left" },
  { position: [0.9, 0.32, -3.8], scale: 1.55, color: "#88af94", layer: "back", cluster: "rear-right" },
  { position: [1.9, 0.32, -3.45], scale: 1.38, color: "#94b99a", layer: "back", cluster: "rear-right" },
  { position: [2.9, 0.32, -2.75], scale: 1.25, color: "#a2c5a1", layer: "back", cluster: "rear-right" },
  { position: [3.55, 0.32, -1.9], scale: 0.95, color: "#b4d0a8", layer: "middle", cluster: "rear-right" },
  { position: [2.05, 0.32, -2.7], scale: 0.88, color: "#c1d7ae", layer: "middle", cluster: "rear-right" },
];

const broadleafTrees: Array<{
  position: Point3;
  scale: number;
  crownWidth: number;
  heightScale: number;
  sink: number;
  variant: "dense" | "irregular";
  color: string;
  layer: CanopyLayer;
  cluster: TreeCluster;
}> = [
  { position: [3.18, 0.32, -1.55], scale: 0.82, crownWidth: 0.45, heightScale: 0.37, sink: 0.45, variant: "dense", color: "#b9dcb1", layer: "foreground", cluster: "right-grove" },
  { position: [3.8, 0.32, -1.25], scale: 0.74, crownWidth: 0.48, heightScale: 0.34, sink: 0.65, variant: "irregular", color: "#c9e4b6", layer: "foreground", cluster: "right-grove" },
  { position: [3.08, 0.32, -0.72], scale: 0.76, crownWidth: 0.46, heightScale: 0.4, sink: 0.35, variant: "irregular", color: "#d8ebba", layer: "foreground", cluster: "right-grove" },
  { position: [3.82, 0.32, -0.48], scale: 0.66, crownWidth: 0.5, heightScale: 0.36, sink: 0.55, variant: "dense", color: "#e5f1bd", layer: "foreground", cluster: "right-grove" },
  { position: [3.28, 0.32, 0.05], scale: 0.62, crownWidth: 0.48, heightScale: 0.41, sink: 0.3, variant: "irregular", color: "#edf4c5", layer: "foreground", cluster: "right-grove" },
  { position: [4.02, 0.32, 0.18], scale: 0.54, crownWidth: 0.44, heightScale: 0.37, sink: 0.4, variant: "dense", color: "#f0f5c9", layer: "foreground", cluster: "right-grove" },
];

const storagePositions = {
  fridge: [-2.55, islandSurfaceY, -1.05] as Point3,
  cupboard: [-2.65, islandSurfaceY, 1.55] as Point3,
  shelf: [3.45, islandSurfaceY, 1.95] as Point3,
  drawers: [-3.45, islandSurfaceY, 2.25] as Point3,
};

export const maximumStorageGroundOffset = Math.max(
  ...Object.values(storagePositions).map((position) => Math.abs(position[1] - islandSurfaceY)),
);

export const forestCanopyLayerCounts = [...pineTrees, ...broadleafTrees].reduce<Record<CanopyLayer, number>>(
  (counts, tree) => ({ ...counts, [tree.layer]: counts[tree.layer] + 1 }),
  { back: 0, middle: 0, foreground: 0 },
);

export const forestTreeClusterCounts = [...pineTrees, ...broadleafTrees].reduce<Record<TreeCluster, number>>(
  (counts, tree) => ({ ...counts, [tree.cluster]: counts[tree.cluster] + 1 }),
  { "rear-left": 0, "rear-right": 0, "right-grove": 0 },
);

export const maximumTreeGroundRadius = Math.max(
  ...[...pineTrees, ...broadleafTrees].map((tree) => Math.hypot(tree.position[0], tree.position[2])),
);
export const highestTreeRootY = Math.max(
  ...pineTrees.map((tree) => tree.position[1] - 0.235 * tree.scale * 0.37),
  ...broadleafTrees.map((tree) => tree.position[1] + (-tree.sink - 0.243) * tree.scale * tree.heightScale),
);

const storageExclusionZones = [
  { position: [storagePositions.fridge[0], storagePositions.fridge[2]] as const, radius: 0.8 },
  { position: [storagePositions.cupboard[0], storagePositions.cupboard[2]] as const, radius: 0.85 },
  { position: [storagePositions.shelf[0], storagePositions.shelf[2]] as const, radius: 0.9 },
  { position: [storagePositions.drawers[0], storagePositions.drawers[2]] as const, radius: 0.85 },
];

export const minimumTreeStorageClearance = Math.min(
  ...[...pineTrees, ...broadleafTrees].flatMap((tree) =>
    storageExclusionZones.map(
      (zone) => Math.hypot(tree.position[0] - zone.position[0], tree.position[2] - zone.position[1]) - zone.radius,
    ),
  ),
);

const mushrooms: Array<{ position: Point3; scale: number }> = [
  { position: [-3.65, 0.28, 1.65], scale: 0.72 },
  { position: [-2.95, 0.28, 2.75], scale: 0.5 },
  { position: [-2.45, 0.28, -1.75], scale: 0.48 },
  { position: [-0.8, 0.28, 3.35], scale: 0.62 },
  { position: [0.85, 0.28, 3.45], scale: 0.44 },
  { position: [2.4, 0.28, 2.7], scale: 0.76 },
  { position: [3.55, 0.28, 1.05], scale: 0.54 },
  { position: [2.95, 0.28, -1.65], scale: 0.47 },
];

const flowers: Array<{ position: Point3; color: string; scale?: number }> = [
  { position: [-3.1, 0.3, 0.8], color: "#f2645a" },
  { position: [-2.25, 0.3, -1.15], color: "#ffd24f" },
  { position: [-1.65, 0.3, 2.7], color: "#7b73d6" },
  { position: [-0.5, 0.3, -2.55], color: "#f48bab" },
  { position: [0.65, 0.3, 2.85], color: "#55a9ef" },
  { position: [1.75, 0.3, -2.2], color: "#f2645a" },
  { position: [2.55, 0.3, 1.9], color: "#ffd24f" },
  { position: [3.45, 0.3, -0.35], color: "#8c78dc" },
];

const shrubs: Array<{ position: Point3; color: string; scale: number }> = [
  { position: [-3.55, 0.34, 0.2], color: "#3f7d43", scale: 0.72 },
  { position: [-2.9, 0.34, -2.15], color: "#527f3e", scale: 0.62 },
  { position: [-1.45, 0.34, -2.9], color: "#3a7348", scale: 0.78 },
  { position: [0.05, 0.34, 3.2], color: "#608940", scale: 0.58 },
  { position: [1.5, 0.34, 2.85], color: "#487c42", scale: 0.66 },
  { position: [2.65, 0.34, -2.25], color: "#3e7147", scale: 0.73 },
  { position: [3.62, 0.34, 0.32], color: "#5a8744", scale: 0.55 },
];

const pathStones: Point3[] = [
  [-2.65, 0.43, 2.75],
  [-2.05, 0.43, 2.35],
  [-1.35, 0.43, 2.12],
  [-0.62, 0.43, 1.95],
  [0.15, 0.43, 1.62],
  [0.5, 0.43, 1.05],
  [0.7, 0.43, 0.38],
  [0.72, 0.43, -0.28],
];

function configureMeshShadows(model: Group) {
  model.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    object.castShadow = true;
    object.receiveShadow = true;
  });
  return model;
}

function PineTree({ position, scale, color }: { position: Point3; scale: number; color: string }) {
  const { scene } = useGLTF("/models/forest-diorama/storybook-pine.glb");
  const pine = useMemo(() => {
    const model = configureMeshShadows(scene.clone(true) as Group);
    model.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      const nextMaterials = materials.map((source) => {
        const material = source.clone();
        if (material instanceof MeshStandardMaterial) {
          material.roughness = 0.96;
          material.metalness = 0;
          if (material.name.includes("Leaves")) material.color.set(color);
        }
        return material;
      });
      object.material = Array.isArray(object.material) ? nextMaterials : nextMaterials[0];
    });
    return model;
  }, [color, scene]);

  return (
    <group position={position} rotation={[0, position[0] * 0.31, 0]} scale={scale * 0.37}>
      <primitive object={pine} dispose={null} />
    </group>
  );
}

function FloweringBush({ position, scale }: { position: Point3; scale: number }) {
  const { scene } = useGLTF("/models/forest-diorama/storybook-flowering-bush.glb");
  const bush = useMemo(() => configureMeshShadows(scene.clone(true) as Group), [scene]);

  return (
    <group position={position} rotation={[0, position[2] * 0.45, 0]} scale={scale * 0.56}>
      <primitive object={bush} dispose={null} />
    </group>
  );
}

function BroadleafTree({
  position,
  scale,
  crownWidth,
  heightScale,
  sink,
  variant,
  color,
}: {
  position: Point3;
  scale: number;
  crownWidth: number;
  heightScale: number;
  sink: number;
  variant: "dense" | "irregular";
  color: string;
}) {
  const modelPath = variant === "dense"
    ? "/models/forest-diorama/storybook-broadleaf.glb"
    : "/models/forest-diorama/storybook-broadleaf-irregular.glb";
  const { scene } = useGLTF(modelPath);
  const tree = useMemo(() => {
    const model = configureMeshShadows(scene.clone(true) as Group);
    model.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      const nextMaterials = materials.map((source) => {
        const material = source.clone();
        if (material instanceof MeshStandardMaterial) {
          material.roughness = 0.98;
          material.metalness = 0;
          if (material.name.includes("Leaves")) material.color.set(color);
        }
        return material;
      });
      object.material = Array.isArray(object.material) ? nextMaterials : nextMaterials[0];
    });
    return model;
  }, [color, scene]);

  return (
    <group
      position={position}
      rotation={[0, position[0] * -0.24, 0]}
      scale={[scale * crownWidth, scale * heightScale, scale * crownWidth]}
    >
      <primitive object={tree} position={[0, -sink, 0]} dispose={null} />
    </group>
  );
}

function Mushroom({ position, scale }: { position: Point3; scale: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.13, 0.18, 0.5, 10]} />
        <meshStandardMaterial color="#f3dfbf" roughness={0.92} />
      </mesh>
      <mesh castShadow position={[0, 0.55, 0]} scale={[1, 0.42, 1]}>
        <sphereGeometry args={[0.42, 18, 12]} />
        <meshStandardMaterial color="#df493e" roughness={0.82} />
      </mesh>
      {[
        [-0.16, 0.69, 0.12],
        [0.12, 0.7, 0.2],
        [0.18, 0.68, -0.12],
      ].map((dot, index) => (
        <mesh key={index} position={dot as Point3} scale={[1, 0.45, 1]}>
          <sphereGeometry args={[0.055, 10, 8]} />
          <meshStandardMaterial color="#fff0d6" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function FlowerCluster({ position, color, scale = 1 }: { position: Point3; color: string; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.025, 0.035, 0.44, 6]} />
        <meshStandardMaterial color="#477e3d" roughness={1} />
      </mesh>
      {[0, 1, 2, 3, 4].map((petal) => {
        const angle = (Math.PI * 2 * petal) / 5;
        return (
          <mesh key={petal} castShadow position={[Math.cos(angle) * 0.12, 0.48, Math.sin(angle) * 0.12]} scale={[1, 0.45, 1]}>
            <sphereGeometry args={[0.095, 10, 8]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
        );
      })}
      <mesh position={[0, 0.49, 0]}>
        <sphereGeometry args={[0.075, 10, 8]} />
        <meshStandardMaterial color="#f8c64c" roughness={0.85} />
      </mesh>
    </group>
  );
}

function Shrub({ position, color, scale }: { position: Point3; color: string; scale: number }) {
  return (
    <group position={position} scale={scale}>
      {[
        [-0.24, 0.25, 0],
        [0.2, 0.28, 0.08],
        [0, 0.45, -0.08],
      ].map((part, index) => (
        <mesh key={index} castShadow position={part as Point3} scale={[1, 0.82, 1]}>
          <sphereGeometry args={[0.42, 14, 10]} />
          <meshStandardMaterial color={index === 2 ? "#65944b" : color} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function StorybookCat({ position, color, chest, rotation = 0 }: { position: Point3; color: string; chest: string; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={0.72}>
      <mesh castShadow position={[0, 0.48, 0]} scale={[0.72, 1, 0.82]}>
        <capsuleGeometry args={[0.28, 0.42, 8, 14]} />
        <meshStandardMaterial color={color} roughness={0.88} />
      </mesh>
      <mesh castShadow position={[0, 1.02, 0.05]}>
        <sphereGeometry args={[0.34, 18, 14]} />
        <meshStandardMaterial color={color} roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.62, 0.25]} scale={[0.52, 0.7, 0.24]}>
        <sphereGeometry args={[0.26, 14, 10]} />
        <meshStandardMaterial color={chest} roughness={0.9} />
      </mesh>
      {[-0.19, 0.19].map((x) => (
        <mesh key={x} castShadow position={[x, 1.34, 0.03]} rotation={[0, 0, x > 0 ? -0.18 : 0.18]}>
          <coneGeometry args={[0.13, 0.32, 5]} />
          <meshStandardMaterial color={color} roughness={0.88} />
        </mesh>
      ))}
      {[-0.18, 0.18].map((x) => (
        <mesh key={x} castShadow position={[x, 0.14, 0.15]}>
          <capsuleGeometry args={[0.09, 0.22, 5, 8]} />
          <meshStandardMaterial color={x > 0 ? chest : color} roughness={0.9} />
        </mesh>
      ))}
      <mesh castShadow position={[-0.32, 0.56, -0.15]} rotation={[Math.PI / 2, 0.15, -0.55]}>
        <torusGeometry args={[0.32, 0.065, 8, 20, Math.PI * 1.55]} />
        <meshStandardMaterial color={color} roughness={0.88} />
      </mesh>
      <mesh position={[-0.12, 1.05, 0.35]}>
        <sphereGeometry args={[0.035, 8, 6]} />
        <meshStandardMaterial color="#1b201c" />
      </mesh>
      <mesh position={[0.12, 1.05, 0.35]}>
        <sphereGeometry args={[0.035, 8, 6]} />
        <meshStandardMaterial color="#1b201c" />
      </mesh>
    </group>
  );
}

function TimberCottage({ woodTexture, roofTexture }: { woodTexture: Texture; roofTexture: Texture }) {
  const { scene } = useGLTF("/models/forest-diorama/storybook-cottage.glb");
  const cottage = useMemo(() => {
    const model = configureMeshShadows(scene.clone(true) as Group);
    model.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      const nextMaterials = materials.map((source) => {
        const material = source.clone();
        if (!(material instanceof MeshStandardMaterial)) return material;

        material.roughness = 0.94;
        material.metalness = 0;
        material.needsUpdate = true;
        return material;
      });
      object.material = Array.isArray(object.material) ? nextMaterials : nextMaterials[0];
    });
    return model;
  }, [scene]);

  return (
    <group position={cabinPosition} rotation={[0, 0.62, 0]}>
      <primitive object={cottage} position={[0, 1.155, 0]} scale={0.003} dispose={null} />

      <mesh castShadow receiveShadow position={[0, 1.02, 1.79]}>
        <boxGeometry args={[2.24, 1.58, 0.08]} />
        <meshStandardMaterial color="#d4a273" map={woodTexture} bumpMap={woodTexture} bumpScale={0.028} roughness={0.94} />
      </mesh>
      {[0.38, 0.6, 0.82, 1.04, 1.26, 1.48, 1.7].map((y) => (
        <mesh key={y} position={[0, y, 1.845]}>
          <boxGeometry args={[2.25, 0.026, 0.025]} />
          <meshStandardMaterial color="#6e452f" roughness={0.98} />
        </mesh>
      ))}

      <mesh position={[0, 1.06, 1.86]} castShadow>
        <boxGeometry args={[0.92, 1.48, 0.08]} />
        <meshStandardMaterial color="#263b37" emissive="#ba743d" emissiveIntensity={0.28} roughness={0.38} metalness={0.12} />
      </mesh>
      {[-0.49, 0.49].map((x) => (
        <mesh key={x} position={[x, 1.06, 1.91]}>
          <boxGeometry args={[0.075, 1.62, 0.075]} />
          <meshStandardMaterial color="#202724" roughness={0.72} />
        </mesh>
      ))}
      {[0.28, 1.82].map((y) => (
        <mesh key={y} position={[0, y, 1.91]}>
          <boxGeometry args={[1.05, 0.075, 0.075]} />
          <meshStandardMaterial color="#202724" roughness={0.72} />
        </mesh>
      ))}

      {[-0.8, 0.8].map((x) => (
        <group key={x} position={[x, 1.35, 1.92]}>
          <mesh castShadow>
            <boxGeometry args={[0.16, 0.24, 0.13]} />
            <meshStandardMaterial color="#2b312e" emissive="#ffb252" emissiveIntensity={1.7} roughness={0.58} />
          </mesh>
          <pointLight position={[0, -0.03, 0.22]} color="#ffb55a" intensity={1.2} distance={2.2} decay={2} />
        </group>
      ))}

      <mesh castShadow receiveShadow position={[0, 0.18, 2.3]}>
        <boxGeometry args={[2.55, 0.18, 1.02]} />
        <meshStandardMaterial color="#bd8256" map={woodTexture} bumpMap={woodTexture} bumpScale={0.025} roughness={0.96} />
      </mesh>
      {[-1.12, 1.12].flatMap((x) => [1.92, 2.7].map((z) => (
        <mesh key={`${x}-${z}`} castShadow position={[x, 0.55, z]}>
          <boxGeometry args={[0.1, 0.78, 0.1]} />
          <meshStandardMaterial color="#74472f" roughness={0.96} />
        </mesh>
      )))}
      {[-1.12, 1.12].map((x) => (
        <group key={x}>
          {[0.48, 0.72].map((y) => (
            <mesh key={y} position={[x, y, 2.32]}>
              <boxGeometry args={[0.08, 0.075, 0.72]} />
              <meshStandardMaterial color="#815138" roughness={0.95} />
            </mesh>
          ))}
        </group>
      ))}
      {[-0.82, 0.82].map((x) => (
        <group key={x}>
          {[0.48, 0.72].map((y) => (
            <mesh key={y} position={[x, y, 2.71]}>
              <boxGeometry args={[0.58, 0.075, 0.08]} />
              <meshStandardMaterial color="#815138" roughness={0.95} />
            </mesh>
          ))}
        </group>
      ))}

      {[
        { position: [0, 0.1, 2.92] as Point3, size: [1.02, 0.16, 0.38] as Point3 },
        { position: [0, 0, 3.2] as Point3, size: [1.18, 0.14, 0.38] as Point3 },
        { position: [0, -0.09, 3.48] as Point3, size: [1.34, 0.12, 0.38] as Point3 },
      ].map((step, index) => (
        <mesh key={index} castShadow receiveShadow position={step.position}>
          <boxGeometry args={step.size} />
          <meshStandardMaterial color="#a86c46" map={woodTexture} roughness={0.96} />
        </mesh>
      ))}

      {[-1, 1].map((direction) => (
        <mesh
          key={direction}
          castShadow
          position={[direction * 0.6, 1.92, 1.85]}
          rotation={[0, 0, direction * -0.61]}
        >
          <boxGeometry args={[1.55, 0.11, 0.11]} />
          <meshStandardMaterial color="#c07a48" map={roofTexture} roughness={0.94} />
        </mesh>
      ))}
    </group>
  );
}

function StorageFurniture({ woodTexture }: { woodTexture: Texture }) {
  return (
    <group>
      <group position={storagePositions.fridge} scale={0.78}>
        <RoundedBox args={[0.9, 1.65, 0.72]} radius={0.13} smoothness={4} castShadow position={[0, 0.83, 0]}>
          <meshStandardMaterial color="#8eb6a5" roughness={0.78} />
        </RoundedBox>
        <mesh position={[0.27, 0.82, 0.4]}>
          <capsuleGeometry args={[0.035, 0.35, 4, 8]} />
          <meshStandardMaterial color="#5b665f" metalness={0.2} roughness={0.55} />
        </mesh>
      </group>
      <group position={storagePositions.cupboard} scale={0.78}>
        <RoundedBox args={[1.25, 1.35, 0.68]} radius={0.06} smoothness={3} castShadow position={[0, 0.68, 0]}>
          <meshStandardMaterial color="#ebc39d" map={woodTexture} bumpMap={woodTexture} bumpScale={0.025} roughness={0.93} />
        </RoundedBox>
        {[-0.31, 0.31].map((x) => (
          <mesh key={x} position={[x, 0.77, 0.38]} castShadow>
            <boxGeometry args={[0.55, 0.92, 0.08]} />
            <meshStandardMaterial color="#b06a39" roughness={0.92} />
          </mesh>
        ))}
      </group>
      <group position={storagePositions.shelf} scale={0.78}>
        {[-0.54, 0.54].map((x) => (
          <mesh key={x} castShadow position={[x, 0.78, 0]}>
            <boxGeometry args={[0.12, 1.55, 0.72]} />
            <meshStandardMaterial color="#e5bc95" map={woodTexture} roughness={0.95} />
          </mesh>
        ))}
        {[0.12, 0.68, 1.24].map((y) => (
          <mesh key={y} castShadow position={[0, y, 0]}>
            <boxGeometry args={[1.18, 0.11, 0.72]} />
            <meshStandardMaterial color="#aa6739" roughness={0.95} />
          </mesh>
        ))}
      </group>
      <group position={storagePositions.drawers} scale={0.78}>
        <RoundedBox args={[1.25, 1.3, 0.82]} radius={0.07} smoothness={3} castShadow position={[0, 0.65, 0]}>
          <meshStandardMaterial color="#ebc39d" map={woodTexture} bumpMap={woodTexture} bumpScale={0.025} roughness={0.93} />
        </RoundedBox>
        {[0.36, 0.72, 1.08].map((y) => (
          <group key={y} position={[0, y, 0.45]}>
            <mesh castShadow>
              <boxGeometry args={[1.02, 0.25, 0.08]} />
              <meshStandardMaterial color="#bc7040" roughness={0.92} />
            </mesh>
            <mesh position={[0, 0, 0.08]}>
              <sphereGeometry args={[0.055, 8, 6]} />
              <meshStandardMaterial color="#e0a549" roughness={0.58} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

function MossIsland({ mossTexture }: { mossTexture: Texture }) {
  const rocks = Array.from({ length: 18 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 18;
    const radius = index % 2 === 0 ? 4.25 : 4.05;
    return {
      position: [Math.cos(angle) * radius, -0.42, Math.sin(angle) * radius] as Point3,
      scale: [0.68 + (index % 3) * 0.08, 0.7 + (index % 2) * 0.13, 0.72] as Point3,
    };
  });

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, -0.48, 0]} rotation={[0, Math.PI / 12, 0]}>
        <cylinderGeometry args={[4.38, 4.02, 1.18, 12]} />
        <meshStandardMaterial color="#705d48" roughness={1} />
      </mesh>
      <mesh receiveShadow position={[0, 0.16, 0]} rotation={[0, Math.PI / 12, 0]}>
        <cylinderGeometry args={[4.47, 4.3, 0.32, 12]} />
        <meshStandardMaterial color="#d0d79d" map={mossTexture} bumpMap={mossTexture} bumpScale={0.055} roughness={0.98} />
      </mesh>
      {rocks.map((rock, index) => (
        <mesh key={index} castShadow receiveShadow position={rock.position} scale={rock.scale}>
          <dodecahedronGeometry args={[0.64, 0]} />
          <meshStandardMaterial color={index % 3 === 0 ? "#82786a" : "#6f6a60"} roughness={1} />
        </mesh>
      ))}
      {pathStones.map((position, index) => (
        <mesh key={index} receiveShadow castShadow position={position} rotation={[0, index * 0.37, 0]} scale={[1.15, 0.22, 0.82]}>
          <cylinderGeometry args={[0.32, 0.34, 0.12, 8]} />
          <meshStandardMaterial color={index % 2 ? "#cbb78d" : "#dcc99f"} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

export function ForestDioramaScene() {
  const [woodTexture, mossTexture, roofTexture] = useTexture([
    "/textures/forest-diorama/storybook-wood.webp",
    "/textures/forest-diorama/storybook-moss.webp",
    "/textures/forest-diorama/storybook-roof.webp",
  ]);

  for (const texture of [woodTexture, mossTexture, roofTexture]) {
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
  }
  woodTexture.repeat.set(1.4, 1.4);
  mossTexture.repeat.set(2.2, 2.2);
  roofTexture.repeat.set(1.35, 1.35);

  return (
    <>
      <ambientLight intensity={0.86} />
      <hemisphereLight args={["#e5f7e8", "#6b4c3a", 1.38]} />
      <directionalLight
        castShadow
        position={[6, 10, 7]}
        intensity={2.55}
        color="#fff2d3"
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={24}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
      />
      <pointLight position={[0.7, 2.2, 0.7]} color="#ffb347" intensity={5} distance={5.5} decay={2} />

      <group position={[0, -0.05, 0]} rotation={[0, -0.2, 0]} scale={0.88}>
        <MossIsland mossTexture={mossTexture} />
        <TimberCottage woodTexture={woodTexture} roofTexture={roofTexture} />
        <StorageFurniture woodTexture={woodTexture} />
        {pineTrees.map((tree) => (
          <PineTree key={tree.position.join("-")} position={tree.position} scale={tree.scale} color={tree.color} />
        ))}
        {broadleafTrees.map((tree) => (
          <BroadleafTree key={tree.position.join("-")} {...tree} />
        ))}
        {mushrooms.map((mushroom) => (
          <Mushroom key={mushroom.position.join("-")} {...mushroom} />
        ))}
        {flowers.map((flower) => (
          <FlowerCluster key={flower.position.join("-")} {...flower} />
        ))}
        {shrubs.slice(0, 4).map((shrub) => (
          <FloweringBush key={`flowering-${shrub.position.join("-")}`} position={shrub.position} scale={shrub.scale} />
        ))}
        {shrubs.slice(4).map((shrub) => (
          <Shrub key={shrub.position.join("-")} {...shrub} />
        ))}
        <StorybookCat position={[-0.95, 0.45, 1.15]} color="#d9772a" chest="#f5d6a4" rotation={0.35} />
        <StorybookCat position={[1.72, 0.45, 1.72]} color="#1e2925" chest="#f1eee4" rotation={-0.8} />
      </group>

      <ContactShadows
        position={[0, -0.96, 0]}
        opacity={0.24}
        scale={13}
        blur={2.8}
        far={4.5}
        color="#6e5a48"
        frames={1}
      />
    </>
  );
}
