export type LocationIllustrationType = "cabinet" | "fridge" | "box" | "shelf" | "drawer";

const locationIllustrationSrc: Record<LocationIllustrationType, string> = {
  cabinet: "/illustrations/location-icons/cabinet.png",
  fridge: "/illustrations/location-icons/fridge.png",
  box: "/illustrations/location-icons/box.png",
  shelf: "/illustrations/location-icons/shelf.png",
  drawer: "/illustrations/location-icons/drawer.png",
};

export function getLocationIllustrationSrc(type: LocationIllustrationType) {
  return locationIllustrationSrc[type];
}

type LocationIllustrationProps = {
  type: LocationIllustrationType;
  className?: string;
  alt?: string;
};

export function LocationIllustration({ type, className, alt = "" }: LocationIllustrationProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={getLocationIllustrationSrc(type)}
      alt={alt}
      className={className}
      loading="eager"
      decoding="async"
      draggable={false}
    />
  );
}

function parseLocationTags(tags?: string | null) {
  if (!tags) return [];

  try {
    const parsed = JSON.parse(tags);
    return Array.isArray(parsed) ? parsed.filter((tag): tag is string => typeof tag === "string") : [];
  } catch {
    return tags
      .split(/[，,、\s]+/)
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
}

export function getLocationIllustrationType(location: { name: string; tags?: string | null }): LocationIllustrationType {
  const text = [location.name, ...parseLocationTags(location.tags)].join(" ");
  if (/冰箱|冷藏|冷冻|冷柜/.test(text)) return "fridge";
  if (/箱|囤货|整箱/.test(text)) return "box";
  if (/架|层|置物/.test(text)) return "shelf";
  if (/抽屉/.test(text)) return "drawer";
  return "cabinet";
}
