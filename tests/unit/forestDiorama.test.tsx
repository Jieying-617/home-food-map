import { forwardRef, useImperativeHandle } from "react";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ForestDiorama } from "@/components/location/ForestDiorama";
import {
  cabinPosition,
  forestCanopyLayerCounts,
  forestCabinStyleFeatures,
  forestSceneFeatures,
  forestTreeClusterCounts,
  highestTreeRootY,
  islandSurfaceY,
  maximumTreeGroundRadius,
  maximumStorageGroundOffset,
  minimumTreeStorageClearance,
} from "@/components/location/ForestDioramaScene";

const resetView = vi.fn();

vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children, gl }: { children: React.ReactNode; gl: { alpha?: boolean } }) => (
    <div data-testid="forest-webgl-canvas" data-alpha={String(gl.alpha)}>
      {children}
    </div>
  ),
}));

vi.mock("@react-three/drei", () => ({
  OrbitControls: forwardRef(function MockOrbitControls(
    props: { enablePan?: boolean; minDistance?: number; maxDistance?: number },
    ref,
  ) {
    useImperativeHandle(ref, () => ({ reset: resetView }));
    return (
      <div
        data-testid="forest-orbit-controls"
        data-enable-pan={String(props.enablePan)}
        data-min-distance={String(props.minDistance)}
        data-max-distance={String(props.maxDistance)}
      />
    );
  }),
}));

vi.mock("@/components/location/ForestDioramaScene", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/components/location/ForestDioramaScene")>();
  return {
    ...actual,
    ForestDioramaScene: () => <div data-testid="storybook-forest-scene" />,
  };
});

describe("ForestDiorama", () => {
  it("provides a transparent orbitable scene with a recoverable camera", () => {
    render(<ForestDiorama />);

    expect(screen.getByRole("region", { name: "可旋转的3D森林储物模型" })).toBeVisible();
    expect(screen.getByTestId("forest-webgl-canvas")).toHaveAttribute("data-alpha", "true");
    expect(screen.getByTestId("forest-orbit-controls")).toHaveAttribute("data-enable-pan", "false");
    expect(screen.getByTestId("forest-orbit-controls")).toHaveAttribute("data-min-distance", "6");
    expect(screen.getByTestId("forest-orbit-controls")).toHaveAttribute("data-max-distance", "16");
    expect(screen.getByTestId("storybook-forest-scene")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "重置3D视角" }));
    expect(resetView).toHaveBeenCalledTimes(1);
  });

  it("contains the complete storybook forest feature set", () => {
    expect(forestSceneFeatures).toEqual([
      "moss-island",
      "timber-cottage",
      "storage-furniture",
      "mushrooms",
      "flowers",
      "orange-cat",
      "tuxedo-cat",
      "contact-shadow",
    ]);
  });

  it("matches the low cedar cabin reference instead of a medieval tower house", () => {
    expect(forestCabinStyleFeatures).toEqual([
      "single-storey",
      "charcoal-gable",
      "cedar-siding",
      "glass-entry",
      "front-porch",
      "porch-rails",
      "warm-sconces",
    ]);
  });

  it("uses project-bound hand-painted materials for the main surfaces", () => {
    const texturePaths = [
      "public/textures/forest-diorama/storybook-wood.webp",
      "public/textures/forest-diorama/storybook-moss.webp",
      "public/textures/forest-diorama/storybook-roof.webp",
    ];

    for (const texturePath of texturePaths) {
      expect(existsSync(path.resolve(process.cwd(), texturePath))).toBe(true);
    }

    const sceneSource = readFileSync(
      path.resolve(process.cwd(), "src/components/location/ForestDioramaScene.tsx"),
      "utf8",
    );
    expect(sceneSource).toContain("useTexture");
    expect(sceneSource).toContain("storybook-wood.webp");
    expect(sceneSource).toContain("storybook-moss.webp");
    expect(sceneSource).toContain("storybook-roof.webp");
  });

  it("uses detailed GLB silhouettes for the cottage and forest canopy", () => {
    const modelPaths = [
      "public/models/forest-diorama/storybook-cottage.glb",
      "public/models/forest-diorama/storybook-pine.glb",
      "public/models/forest-diorama/storybook-broadleaf.glb",
      "public/models/forest-diorama/storybook-broadleaf-irregular.glb",
      "public/models/forest-diorama/storybook-flowering-bush.glb",
    ];

    for (const modelPath of modelPaths) {
      expect(existsSync(path.resolve(process.cwd(), modelPath))).toBe(true);
    }

    const sceneSource = readFileSync(
      path.resolve(process.cwd(), "src/components/location/ForestDioramaScene.tsx"),
      "utf8",
    );
    expect(sceneSource).toContain("useGLTF");
    expect(sceneSource).toContain("storybook-cottage.glb");
    expect(sceneSource).toContain("storybook-pine.glb");
    expect(sceneSource).toContain("storybook-broadleaf.glb");
    expect(sceneSource).toContain("storybook-broadleaf-irregular.glb");
    expect(sceneSource).toContain("storybook-flowering-bush.glb");
  });

  it("builds a layered canopy instead of a single row of trees", () => {
    expect(forestCanopyLayerCounts.back).toBeGreaterThanOrEqual(6);
    expect(forestCanopyLayerCounts.middle).toBeGreaterThanOrEqual(4);
    expect(forestCanopyLayerCounts.foreground).toBeGreaterThanOrEqual(3);
    expect(Object.keys(forestTreeClusterCounts)).toHaveLength(3);
    expect(Object.values(forestTreeClusterCounts).every((count) => count >= 3)).toBe(true);
  });

  it("keeps every tree trunk outside cabinet collision zones", () => {
    expect(minimumTreeStorageClearance).toBeGreaterThanOrEqual(0.35);
  });

  it("grounds every tree on the moss island instead of floating beyond the edge", () => {
    expect(maximumTreeGroundRadius).toBeLessThanOrEqual(4.05);
    expect(highestTreeRootY).toBeLessThanOrEqual(islandSurfaceY);
  });

  it("grounds every cabinet and keeps the cabin on the rear center axis", () => {
    expect(maximumStorageGroundOffset).toBe(0);
    expect(Math.abs(cabinPosition[0])).toBeLessThanOrEqual(0.25);
    expect(cabinPosition[2]).toBeLessThanOrEqual(-1.7);
  });
});
