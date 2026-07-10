import { format } from "date-fns";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LocationCard } from "@/components/location/LocationCard";
import { LocationForestHero } from "@/components/location/LocationForestHero";
import { BottomNav } from "@/components/navigation/BottomNav";
import { buildLocationOverview } from "@/lib/domain/locationOverview";
import { listLocations } from "@/lib/server/locations";

type PageProps = {
  params: Promise<{ familyId: string }>;
};

export default async function LocationsPage({ params }: PageProps) {
  const { familyId } = await params;
  const locations = await listLocations(familyId);
  const overview = buildLocationOverview(locations, new Date());

  return (
    <>
      <main className="forest-locations-page">
        <header className="forest-locations-topbar" aria-label="位置地图顶部栏">
          <span className="forest-locations-brand">HOME FOOD MAP</span>
          <span className="forest-locations-context">位置地图</span>
        </header>

        <LocationForestHero
          familyId={familyId}
          locationCount={locations.length}
          foodCount={overview.totalFoods}
          priorityCount={overview.priorityCount}
        />

        <section className="forest-locations-band" aria-label="位置巡检与目录">
          <div className="forest-locations-content">
            <aside id="inspection-route" className="forest-inspection-route" data-ud-check="inspection-route">
              <h2>今天先巡这些位置</h2>
              <p className="forest-section-lead">按到期风险排列，只走最需要处理的路线。</p>

              {overview.routeItems.length > 0 ? (
                <ol className="forest-route-list">
                  {overview.routeItems.map((item, index) => (
                    <li key={item.locationId}>
                      <Link href={`/f/${familyId}/locations/${item.locationId}`} className="forest-route-link">
                        <span className="forest-route-index" aria-hidden>
                          {index + 1}
                        </span>
                        <span className="forest-route-copy">
                          <strong>{item.locationName}</strong>
                          <span>
                            {item.foodName} · {format(item.expiresAt, "yyyy-MM-dd")}
                          </span>
                        </span>
                        <span className="forest-route-risk">{item.riskLabel}</span>
                        <ArrowUpRight aria-hidden className="forest-route-arrow" />
                      </Link>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="forest-route-empty">还没有需要巡看的食物，先从房间目录里添加库存。</p>
              )}
            </aside>

            <section id="location-directory" className="forest-location-directory" data-ud-check="location-directory">
              <h2>森林房间目录</h2>
              <p className="forest-section-lead">每个真实储物位置都在这里，点开即可查看和整理库存。</p>

              {locations.length > 0 ? (
                <div className="forest-location-list">
                  {locations.map((location) => (
                    <LocationCard
                      key={location.id}
                      familyId={familyId}
                      location={location}
                    />
                  ))}
                </div>
              ) : (
                <div className="forest-location-empty">
                  <p>还没有储物位置</p>
                  <span>从冰箱、厨房吊柜或零食抽屉开始建立家里的森林地图。</span>
                  <Link href={`/f/${familyId}/locations/new`}>创建第一个位置</Link>
                </div>
              )}
            </section>
          </div>
        </section>
      </main>
      <BottomNav familyId={familyId} />
    </>
  );
}
