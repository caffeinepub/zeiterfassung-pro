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
import { Clock, Edit2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { TimeEntry } from "../backend.d";
import {
  useClients,
  useCreateTimeEntry,
  useDeleteTimeEntry,
  useTimeEntries,
  useUpdateTimeEntry,
} from "../hooks/useQueries";
import {
  MONTHS,
  dateStringToNs,
  formatCHF,
  formatDate,
  formatDuration,
  nsToDateString,
  nsToTimeString,
  timeStringToNs,
} from "../lib/dateUtils";

const today = new Date().toISOString().substring(0, 10);
const emptyForm = {
  clientId: "",
  date: today,
  start: "08:00",
  end: "09:00",
  description: "",
};

export default function Zeiterfassung() {
  const { data: entries, isLoading } = useTimeEntries();
  const { data: clients } = useClients();
  const createMut = useCreateTimeEntry();
  const updateMut = useUpdateTimeEntry();
  const deleteMut = useDeleteTimeEntry();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TimeEntry | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filterClient, setFilterClient] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>(
    String(new Date().getFullYear()),
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (e: TimeEntry) => {
    setEditing(e);
    setForm({
      clientId: String(e.clientId),
      date: nsToDateString(e.date),
      start: nsToTimeString(e.startTime),
      end: nsToTimeString(e.endTime),
      description: e.description,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.clientId) {
      toast.error("Bitte Kunde auswählen");
      return;
    }
    if (!form.date) {
      toast.error("Datum ist erforderlich");
      return;
    }
    if (form.start >= form.end) {
      toast.error("Endzeit muss nach Startzeit liegen");
      return;
    }
    try {
      const payload = {
        clientId: Number(form.clientId),
        date: dateStringToNs(form.date),
        startTime: timeStringToNs(form.start),
        endTime: timeStringToNs(form.end),
        description: form.description,
      };
      if (editing) {
        await updateMut.mutateAsync({ ...editing, ...payload });
        toast.success("Eintrag aktualisiert");
      } else {
        await createMut.mutateAsync(payload);
        toast.success("Zeit erfasst");
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
      toast.success("Eintrag gelöscht");
    } catch {
      toast.error("Fehler beim Löschen");
    }
    setDeleteId(null);
  };

  const calcDuration = (): number => {
    const [sh, sm] = form.start.split(":").map(Number);
    const [eh, em] = form.end.split(":").map(Number);
    const totalMin = eh * 60 + em - (sh * 60 + sm);
    return Math.ceil(totalMin / 15) * 15;
  };

  const filtered =
    entries?.filter((e) => {
      const d = new Date(Number(e.date) / 1_000_000);
      if (filterClient !== "all" && e.clientId !== Number(filterClient))
        return false;
      if (filterMonth !== "all" && d.getMonth() + 1 !== Number(filterMonth))
        return false;
      if (filterYear && d.getFullYear() !== Number(filterYear)) return false;
      return true;
    }) ?? [];

  const getClientName = (id: number) =>
    clients?.find((c) => c.id === id)?.name ?? `Kunde #${id}`;

  const years = Array.from(
    new Set(
      (entries ?? []).map((e) =>
        new Date(Number(e.date) / 1_000_000).getFullYear(),
      ),
    ),
  ).sort((a, b) => b - a);
  if (!years.includes(new Date().getFullYear()))
    years.unshift(new Date().getFullYear());

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Zeiterfassung</h1>
          <p className="mt-1 text-muted-foreground">
            Alle Zeitbuchungen in 15-Minuten-Schritten
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="gap-2"
          data-ocid="zeit.open_modal_button"
        >
          <Plus className="h-4 w-4" />
          Zeit erfassen
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={filterClient} onValueChange={setFilterClient}>
          <SelectTrigger className="w-48" data-ocid="zeit.select">
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
        <Select value={filterYear} onValueChange={setFilterYear}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Jahr" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2" data-ocid="zeit.loading_state">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-20 text-center"
          data-ocid="zeit.empty_state"
        >
          <Clock className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-medium">Keine Einträge gefunden</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Passe die Filter an oder erfasse neue Zeit.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <Table data-ocid="zeit.table">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Datum</TableHead>
                <TableHead>Kunde</TableHead>
                <TableHead>Zeit</TableHead>
                <TableHead>Dauer</TableHead>
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
                  data-ocid="zeit.row"
                >
                  <TableCell className="font-medium">
                    {formatDate(e.date)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getClientName(e.clientId)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {nsToTimeString(e.startTime)} – {nsToTimeString(e.endTime)}
                  </TableCell>
                  <TableCell>{formatDuration(e.duration)}</TableCell>
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
                        data-ocid="zeit.edit_button"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => setDeleteId(e.id)}
                        data-ocid="zeit.delete_button"
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
        <DialogContent data-ocid="zeit.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editing ? "Eintrag bearbeiten" : "Zeit erfassen"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Kunde *</Label>
              <Select
                value={form.clientId}
                onValueChange={(v) => setForm((p) => ({ ...p, clientId: v }))}
              >
                <SelectTrigger data-ocid="zeit.select">
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
              <Label htmlFor="z-date">Datum *</Label>
              <Input
                id="z-date"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                data-ocid="zeit.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="z-start">Von</Label>
                <Input
                  id="z-start"
                  type="time"
                  value={form.start}
                  step={900}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, start: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="z-end">Bis</Label>
                <Input
                  id="z-end"
                  type="time"
                  value={form.end}
                  step={900}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, end: e.target.value }))
                  }
                />
              </div>
            </div>
            {form.start && form.end && form.start < form.end && (
              <p className="text-sm text-muted-foreground">
                Dauer (gerundet):{" "}
                <span className="font-medium text-foreground">
                  {formatDuration(calcDuration())}
                </span>
              </p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="z-desc">Beschreibung</Label>
              <Textarea
                id="z-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Was wurde gemacht?"
                rows={3}
                data-ocid="zeit.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-ocid="zeit.cancel_button"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleSave}
              disabled={createMut.isPending || updateMut.isPending}
              data-ocid="zeit.submit_button"
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
        <AlertDialogContent data-ocid="zeit.modal">
          <AlertDialogHeader>
            <AlertDialogTitle>Eintrag löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="zeit.cancel_button">
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
              data-ocid="zeit.confirm_button"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
