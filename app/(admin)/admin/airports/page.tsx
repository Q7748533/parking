"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, RefreshCw } from "lucide-react";
import { DataTable } from "./data-table";
import { AirportDialog } from "./airport-dialog";
import { getAirports, deleteAirport, Airport } from "./actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AirportsPage() {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAirport, setEditingAirport] = useState<Airport | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingAirport, setDeletingAirport] = useState<Airport | null>(null);

  const loadAirports = async () => {
    setIsLoading(true);
    setError(null);
    const result = await getAirports();
    if (result.success && result.data) {
      setAirports(result.data);
    } else {
      setError(result.error || "Failed to load airports");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadAirports();
  }, []);

  const handleEdit = (airport: Airport) => {
    setEditingAirport(airport);
    setIsDialogOpen(true);
  };

  const handleDelete = (airport: Airport) => {
    setDeletingAirport(airport);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingAirport) return;

    const result = await deleteAirport(deletingAirport.id);
    if (result.success) {
      await loadAirports();
      setIsDeleteDialogOpen(false);
      setDeletingAirport(null);
    } else {
      alert(result.error);
    }
  };

  const handleAddNew = () => {
    setEditingAirport(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">机场管理</h1>
          <p className="text-muted-foreground mt-1">
            管理机场位置及其详细信息
          </p>
        </div>
        <Button
          onClick={handleAddNew}
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          添加机场
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={loadAirports}>
            <RefreshCw className="mr-2 h-4 w-4" />
            重试
          </Button>
        </div>
      ) : (
        <DataTable
          data={airports}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <AirportDialog
        airport={editingAirport}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={loadAirports}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除 {deletingAirport?.name} ({deletingAirport?.code}) 吗？该机场下所有关联的停车场也将被删除。此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
