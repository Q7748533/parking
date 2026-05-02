"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, RefreshCw } from "lucide-react";
import { DataTable } from "./data-table";
import { ParkingDialog } from "./parking-dialog";
import { getParkingProviders, deleteParkingProvider, ParkingProvider } from "./actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ParkingPage() {
  const [providers, setProviders] = useState<ParkingProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ParkingProvider | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingProvider, setDeletingProvider] = useState<ParkingProvider | null>(null);

  const loadProviders = async () => {
    setIsLoading(true);
    setError(null);
    const result = await getParkingProviders(page, pageSize);
    if (result.success && result.data) {
      setProviders(result.data);
      setTotal(result.total || 0);
    } else {
      setError(result.error || "Failed to load parking providers");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadProviders();
  }, [page]);

  const totalPages = Math.ceil(total / pageSize);

  const handleEdit = (provider: ParkingProvider) => {
    setEditingProvider(provider);
    setIsDialogOpen(true);
  };

  const handleDelete = (provider: ParkingProvider) => {
    setDeletingProvider(provider);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingProvider) return;
    
    const result = await deleteParkingProvider(deletingProvider.id);
    if (result.success) {
      setProviders(providers.filter((p) => p.id !== deletingProvider.id));
      setIsDeleteDialogOpen(false);
      setDeletingProvider(null);
    }
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setEditingProvider(null);
    loadProviders();
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Parking Providers</h1>
          <p className="text-muted-foreground mt-1">
            Manage parking providers for airports
          </p>
        </div>
        <Button onClick={() => { setEditingProvider(null); setIsDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Provider
        </Button>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={loadProviders}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      ) : (
        <DataTable
          data={providers}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm">
            <span className="text-muted-foreground">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      )}

      <ParkingDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        provider={editingProvider}
        onSuccess={handleSuccess}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Parking Provider</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deletingProvider?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
