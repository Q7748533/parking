import { getSiteSetting } from "./actions";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const [ga4Id, monetagZoneId] = await Promise.all([
    getSiteSetting("ga4_measurement_id"),
    getSiteSetting("monetag_zone_id"),
  ]);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">设置</h1>
        <p className="text-muted-foreground mt-1">网站全局配置</p>
      </div>

      <SettingsForm initialGa4Id={ga4Id} initialMonetagZoneId={monetagZoneId} />
    </div>
  );
}
