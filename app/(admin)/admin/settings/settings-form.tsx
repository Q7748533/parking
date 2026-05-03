"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saveSiteSetting } from "./actions";

export function SettingsForm({ initialGa4Id }: { initialGa4Id: string | null }) {
  const [ga4Id, setGa4Id] = useState(initialGa4Id ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const trimmed = ga4Id.trim();
    const result = await saveSiteSetting("ga4_measurement_id", trimmed);
    if (result.success) {
      setMessage({ type: "success", text: trimmed ? "GA4 ID 已保存" : "GA4 ID 已清除" });
    } else {
      setMessage({ type: "error", text: result.error ?? "保存失败" });
    }
    setSaving(false);
  }

  return (
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
            格式为 G- 开头，留空则禁用 GA4。保存后前台页面自动生效。
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving} className="bg-violet-500 hover:bg-violet-600">
            {saving ? "保存中..." : "保存"}
          </Button>
          {message && (
            <span className={message.type === "success" ? "text-green-400 text-sm" : "text-red-400 text-sm"}>
              {message.text}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
