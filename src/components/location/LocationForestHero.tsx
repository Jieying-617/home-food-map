import Link from "next/link";
import { ForestDiorama } from "@/components/location/ForestDiorama";

type LocationForestHeroProps = {
  familyId: string;
  locationCount: number;
  foodCount: number;
  priorityCount: number;
};

export function LocationForestHero({ familyId, locationCount, foodCount, priorityCount }: LocationForestHeroProps) {
  const metrics = [
    { label: "个储物位置", value: locationCount },
    { label: "件食物在库", value: foodCount },
    { label: "件本周优先", value: priorityCount },
  ];

  return (
    <section className="forest-location-hero" aria-labelledby="forest-location-title">
      <div className="forest-hero-copy" data-ud-check="hero-title">
        <p className="forest-hero-eyebrow">家中储物地图 / FOREST INVENTORY</p>
        <h1 id="forest-location-title">家里的森林储物图</h1>
        <p className="forest-hero-lead">
          当前有 {locationCount} 个位置、{foodCount} 件食物。沿着林间路线，先查看快到期的柜子，再整理安心库存。
        </p>
        <div className="forest-hero-actions">
          <Link href={`/f/${familyId}/locations/new`} className="forest-action-primary">
            添加位置
          </Link>
          <Link href="#inspection-route" className="forest-action-secondary">
            查看今日巡柜路线
          </Link>
        </div>
        <dl className="forest-hero-metrics" aria-label="位置摘要">
          {metrics.map((metric) => (
            <div key={metric.label}>
              <dt>{metric.label}</dt>
              <dd>{metric.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="forest-hero-art" data-ud-check="hero-illustration">
        <ForestDiorama />
      </div>
    </section>
  );
}
