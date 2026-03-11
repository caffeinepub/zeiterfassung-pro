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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Plus, Receipt, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Expense } from "../backend.d";
import {
  useClients,
  useCreateExpense,
  useDeleteExpense,
  useExpenses,
  useUpdateExpense,
} from "../hooks/useQueries";
import {
  MONTHS,
  dateStringToNs,
  formatCHF,
  formatDate,
  nsToDateString,
} from "../lib/dateUtils";

const today = new Date().toISOString().substring(0, 10);
const emptyForm = { clientId: "", date: today, amount: "", description: "" };

export default function Spesen() {
  const { data: expenses, isLoading } = useExpenses();
  const { data: clients } = useClients();
  const createMut = useCreateExpense();
  const updateMut = useUpdateExpense();
  const deleteMut = useDeleteExpense();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filterClient, setFilterClient] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };
  const openEdit = (e: Expense) => {
    setEditing(e);
    setForm({
      clientId: String(e.clientId),
      date: nsToDateString(e.date),
      amount: String(e.amount),
      description: e.description,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.clientId) {
      toast.error("Bitte Kunde auswählen");
      return;
    }
    if (!form.amount || Number.isNaN(Number(form.amount))) {
      toast.error("Gültiger Betrag erforderlich");
      return;
    }
    try {
      const payload = {
        clientId: Number(form.clientId),
        date: dateStringToNs(form.date),
        amount: Number(form.amount),
        description: form.description,
      };
      if (editing) {
        await updateMut.mutateAsync({ ...editing, ...payload });
        toast.success("Spesen aktualisiert");
      } else {
        await createMut.mutateAsync(payload);
        toast.success("Spesen erfasst");
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
      toast.success("Spesen gelöscht");
    } catch {
      toast.error("Fehler beim Löschen");
    }
    setDeleteId(null);
  };

  const filtered =
    expenses?.filter((e) => {
      const d = new Date(Number(e.date) / 1_000_000);
      if (filterClient !== "all" && e.clientId !== Number(filterClient))
        return false;
      if (filterMonth !== "all" && d.getMonth() + 1 !== Number(filterMonth))
        return false;
      return true;
    }) ?? [];

  const getClientName = (id: number) =>
    clients?.find((c) => c.id === id)?.name ?? `Kunde #${id}`;
  const total = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Spesen</h1>
          <p className="mt-1 text-muted-foreground">
            Auslagen und Spesen pro Kunde
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="gap-2"
          data-ocid="spesen.open_modal_button"
        >
          <Plus className="h-4 w-4" />
          Spesen erfassen
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={filterClient} onValueChange={setFilterClient}>
          <SelectTrigger className="w-48" data-ocid="spesen.select">
            <SelectValue placeholder="Alle Kunden" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kunden</SelectItem>
            {clients?.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Alle Monate" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Monate</SelectItem>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={String(m.value)}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Total:{" "}
          <span className="font-semibold text-foreground">
            {formatCHF(total)}
          </span>
        </p>
      )}

      {isLoading ? (
        <div className="space-y-2" data-ocid="spesen.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-20 text-center"
          data-ocid="spesen.empty_state"
        >
          <Receipt className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-medium">Keine Spesen erfasst</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Füge Auslagen hinzu, die in Rechnung gestellt werden sollen.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <Table data-ocid="spesen.table">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Datum</TableHead>
                <TableHead>Kunde</TableHead>
                <TableHead>Betrag</TableHead>
                <TableHead>Beschreibung</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => (
                <TableRow
                  key={e.id}
                  className="hover:bg-muted/30"
                  data-ocid="spesen.row"
                >
                  <TableCell className="font-medium">
                    {formatDate(e.date)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getClientName(e.clientId)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-primary">
                    {formatCHF(e.amount)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {e.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEdit(e)}
                        data-ocid="spesen.edit_button"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => setDeleteId(e.id)}
                        data-ocid="spesen.delete_button"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-ocid="spesen.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editing ? "Spesen bearbeiten" : "Spesen erfassen"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Kunde *</Label>
              <Select
                value={form.clientId}
                onValueChange={(v) => setForm((p) => ({ ...p, clientId: v }))}
              >
                <SelectTrigger data-ocid="spesen.select">
                  <SelectValue placeholder="Kunde auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-date">Datum</Label>
              <Input
                id="s-date"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                data-ocid="spesen.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-amount">Betrag (CHF)</Label>
              <Input
                id="s-amount"
                type="number"
                step="0.05"
                min={0}
                value={form.amount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, amount: e.target.value }))
                }
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-desc">Beschreibung</Label>
              <Textarea
                id="s-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Fahrtkosten, Parkgebühren, …"
                rows={2}
                data-ocid="spesen.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-ocid="spesen.cancel_button"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleSave}
              disabled={createMut.isPending || updateMut.isPending}
              data-ocid="spesen.submit_button"
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
        <AlertDialogContent data-ocid="spesen.modal">
          <AlertDialogHeader>
            <AlertDialogTitle>Spesen löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="spesen.cancel_button">
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
              data-ocid="spesen.confirm_button"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
