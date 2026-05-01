"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAirport, updateAirport, AirportFormData, Airport } from "./actions";

interface AirportDialogProps {
  airport?: Airport | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AirportDialog({
  airport,
  open,
  onOpenChange,
  onSuccess,
}: AirportDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AirportFormData>({
    code: airport?.code || "",
    name: airport?.name || "",
    city: airport?.city || "",
    state: airport?.state || "",
  });

  const isEditing = !!airport;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = isEditing
        ? await updateAirport(airport.id, formData)
        : await createAirport(formData);

      if (result.success) {
        onSuccess();
        onOpenChange(false);
        if (!isEditing) {
          setFormData({ code: "", name: "", city: "", state: "" });
        }
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert("发生错误");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "编辑机场" : "添加机场"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "在下面更新机场详细信息。"
              : "填写新机场的详细信息。"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                代码
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                className="col-span-3"
                placeholder="例如：JFK"
                required
                maxLength={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                名称
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-3"
                placeholder="例如：John F. Kennedy International Airport"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="city" className="text-right">
                城市
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="col-span-3"
                placeholder="例如：New York"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="state" className="text-right">
                州
              </Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                className="col-span-3"
                placeholder="例如：NY"
                required
                maxLength={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "保存中..." : isEditing ? "保存更改" : "添加机场"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
