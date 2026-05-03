"use client";

import { useState } from "react";
import { BarChart3, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saveSiteSetting } from "./actions";

export function SettingsForm({
  initialGa4Id,
  initialMonetagZoneId,
}: {
  initialGa4Id: string | null;
  initialMonetagZoneId: string | null;
}) {
  const [ga4Id, setGa4Id] = useState(initialGa4Id ?? "");
  const [monetagZoneId, setMonetagZoneId] = useState(initialMonetagZoneId ?? "");
  const [ga4Saving, setGa4Saving] = useState(false);
  const [monetagSaving, setMonetagSaving] = useState(false);
  const [ga4Msg, setGa4Msg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [monetagMsg, setMonetagMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function saveGa4() {
    setGa4Saving(true);
    setGa4Msg(null);
    const trimmed = ga4Id.trim();
    const result = await saveSiteSetting("ga4_measurement_id", trimmed);
    setGa4Msg({ type: result.success ? "success" : "error", text: result.success ? (trimmed ? "GA4 ID 已保存" : "GA4 ID 已清除") : (result.error ?? "保存失败") });
    setGa4Saving(false);
  }

  async function saveMonetag() {
    setMonetagSaving(true);
    setMonetagMsg(null);
    const trimmed = monetagZoneId.trim();
    const result = await saveSiteSetting("monetag_zone_id", trimmed);
    setMonetagMsg({ type: result.success ? "success" : "error", text: result.success ? (trimmed ? "Monetag zone ID 已保存" : "Monetag 已禁用") : (result.error ?? "保存失败") });
    setMonetagSaving(false);
  }

  return (
    <div className="space-y-6">
      {/* GA4 */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-400" />
            Google Analytics 4
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ga4-id">Measurement ID</Label>
            <Input
              id="ga4-id"
              placeholder="G-XXXXXXXXXX"
              value={ga4Id}
              onChange={(e) => setGa4Id(e.target.value)}
              className="font-mono max-w-sm"
            />
            <p className="text-xs text-muted-foreground">
              格式为 G- 开头，留空则禁用 GA4。
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={saveGa4} disabled={ga4Saving} className="bg-violet-500 hover:bg-violet-600">
              {ga4Saving ? "保存中..." : "保存"}
            </Button>
            {ga4Msg && (
              <span className={ga4Msg.type === "success" ? "text-green-400 text-sm" : "text-red-400 text-sm"}>
                {ga4Msg.text}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monetag */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-400" />
            Monetag 广告
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="monetag-zone">Zone ID</Label>
            <Input
              id="monetag-zone"
              placeholder="235847"
              value={monetagZoneId}
              onChange={(e) => setMonetagZoneId(e.target.value)}
              className="font-mono max-w-sm"
            />
            <p className="text-xs text-muted-foreground">
              填入 Monetag zone ID，留空则禁用广告。保存后前台自动注入脚本。
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={saveMonetag} disabled={monetagSaving} className="bg-amber-500 hover:bg-amber-600">
              {monetagSaving ? "保存中..." : "保存"}
            </Button>
            {monetagMsg && (
              <span className={monetagMsg.type === "success" ? "text-green-400 text-sm" : "text-red-400 text-sm"}>
                {monetagMsg.text}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
