import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit2, Plus, Trash2, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Client } from "../backend.d";
import {
  useClients,
  useCreateClient,
  useDeleteClient,
  useUpdateClient,
} from "../hooks/useQueries";
import { formatCHF } from "../lib/dateUtils";

const emptyForm = { name: "", address: "", rate: 120, contact: "" };

export default function Kunden() {
  const { data: clients, isLoading } = useClients();
  const createMut = useCreateClient();
  const updateMut = useUpdateClient();
  const deleteMut = useDeleteClient();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (c: Client) => {
    setEditing(c);
    setForm({
      name: c.name,
      address: c.address,
      rate: c.rate,
      contact: c.contact,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name ist erforderlich");
      return;
    }
    try {
      if (editing) {
        await updateMut.mutateAsync({ ...editing, ...form });
        toast.success("Kunde aktualisiert");
      } else {
        await createMut.mutateAsync(form);
        toast.success("Kunde angelegt");
      }
      setOpen(false);
    } catch {
      toast.error("Fehler beim Speichern");
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteMut.mutateAsync(deleteId);
      toast.success("Kunde gelöscht");
    } catch {
      toast.error("Fehler beim Löschen");
    }
    setDeleteId(null);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Kunden</h1>
          <p className="mt-1 text-muted-foreground">
            Kundenstammdaten und Stundensätze
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="gap-2"
          data-ocid="kunden.open_modal_button"
        >
          <Plus className="h-4 w-4" />
          Kunde anlegen
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="kunden.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : !clients || clients.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-20 text-center"
          data-ocid="kunden.empty_state"
        >
          <User className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-medium">Noch keine Kunden</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Lege deinen ersten Kunden an.
          </p>
          <Button className="mt-4" onClick={openCreate}>
            Ersten Kunden anlegen
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((c, i) => (
            <Card
              key={c.id}
              className="shadow-card"
              data-ocid={`kunden.item.${i + 1}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold">{c.name}</h3>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {c.address}
                    </p>
                    {c.contact && (
                      <p className="truncate text-sm text-muted-foreground">
                        {c.contact}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 shrink-0 text-right">
                    <p className="font-display font-bold text-primary">
                      {formatCHF(c.rate)}/h
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => openEdit(c)}
                    data-ocid="kunden.edit_button"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Bearbeiten
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteId(c.id)}
                    data-ocid="kunden.delete_button"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-ocid="kunden.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editing ? "Kunde bearbeiten" : "Neuer Kunde"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="k-name">Name *</Label>
              <Input
                id="k-name"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Muster AG"
                data-ocid="kunden.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="k-address">Adresse</Label>
              <Input
                id="k-address"
                value={form.address}
                onChange={(e) =>
                  setForm((p) => ({ ...p, address: e.target.value }))
                }
                placeholder="Musterstrasse 1, 8001 Zürich"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="k-contact">Kontaktperson</Label>
              <Input
                id="k-contact"
                value={form.contact}
                onChange={(e) =>
                  setForm((p) => ({ ...p, contact: e.target.value }))
                }
                placeholder="Max Muster"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="k-rate">Stundensatz (CHF/h)</Label>
              <Input
                id="k-rate"
                type="number"
                value={form.rate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, rate: Number(e.target.value) }))
                }
                min={0}
                step={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-ocid="kunden.cancel_button"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleSave}
              disabled={createMut.isPending || updateMut.isPending}
              data-ocid="kunden.save_button"
            >
              {createMut.isPending || updateMut.isPending
                ? "Wird gespeichert…"
                : "Speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent data-ocid="kunden.modal">
          <AlertDialogHeader>
            <AlertDialogTitle>Kunde löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Alle
              zugehörigen Daten bleiben erhalten.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="kunden.cancel_button">
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="kunden.confirm_button"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
