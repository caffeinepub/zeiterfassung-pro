import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Eye, FileText, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useClients,
  useGenerateInvoice,
  useInvoices,
} from "../hooks/useQueries";
import { MONTHS, formatCHF, formatDate, getMonthName } from "../lib/dateUtils";
import RechnungDruck from "./RechnungDruck";

export default function Rechnungen() {
  const { data: invoices, isLoading } = useInvoices();
  const { data: clients } = useClients();
  const generateMut = useGenerateInvoice();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    clientId: "",
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
  });
  const [viewId, setViewId] = useState<number | null>(null);

  const years = [
    new Date().getFullYear(),
    new Date().getFullYear() - 1,
    new Date().getFullYear() - 2,
  ];

  const handleGenerate = async () => {
    if (!form.clientId) {
      toast.error("Bitte Kunde auswählen");
      return;
    }
    try {
      const id = await generateMut.mutateAsync({
        clientId: Number(form.clientId),
        month: Number(form.month),
        year: Number(form.year),
      });
      toast.success("Rechnung erstellt");
      setOpen(false);
      setViewId(id as number);
    } catch {
      toast.error("Fehler beim Erstellen der Rechnung");
    }
  };

  const getClientName = (id: number) =>
    clients?.find((c) => c.id === id)?.name ?? `Kunde #${id}`;

  if (viewId !== null) {
    return <RechnungDruck invoiceId={viewId} onBack={() => setViewId(null)} />;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Rechnungen</h1>
          <p className="mt-1 text-muted-foreground">
            Erstellte Rechnungen inkl. MwSt.
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="gap-2"
          data-ocid="rechnungen.open_modal_button"
        >
          <Plus className="h-4 w-4" />
          Rechnung erstellen
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2" data-ocid="rechnungen.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !invoices || invoices.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-20 text-center"
          data-ocid="rechnungen.empty_state"
        >
          <FileText className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-medium">Noch keine Rechnungen</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Erstelle am Monatsende eine Rechnung pro Kunde.
          </p>
          <Button className="mt-4" onClick={() => setOpen(true)}>
            Erste Rechnung erstellen
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <Table data-ocid="rechnungen.table">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Rechnungs-Nr.</TableHead>
                <TableHead>Kunde</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Brutto</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow
                  key={inv.id}
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => setViewId(inv.id)}
                  data-ocid="rechnungen.row"
                >
                  <TableCell className="font-mono font-medium">
                    #{String(inv.id).padStart(5, "0")}
                  </TableCell>
                  <TableCell>{getClientName(inv.clientId)}</TableCell>
                  <TableCell>
                    {getMonthName(inv.month)} {inv.year}
                  </TableCell>
                  <TableCell>{formatDate(inv.createdDate)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={inv.status === "sent" ? "default" : "secondary"}
                      className={inv.status === "sent" ? "bg-primary" : ""}
                    >
                      {inv.status === "sent" ? "Gesendet" : "Entwurf"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-primary">
                    {formatCHF(inv.grossAmount)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      data-ocid="rechnungen.button"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-ocid="rechnungen.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Rechnung erstellen
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Kunde *</Label>
              <Select
                value={form.clientId}
                onValueChange={(v) => setForm((p) => ({ ...p, clientId: v }))}
              >
                <SelectTrigger data-ocid="rechnungen.select">
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Monat</Label>
                <Select
                  value={form.month}
                  onValueChange={(v) => setForm((p) => ({ ...p, month: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => (
                      <SelectItem key={m.value} value={String(m.value)}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Jahr</Label>
                <Select
                  value={form.year}
                  onValueChange={(v) => setForm((p) => ({ ...p, year: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
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
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-ocid="rechnungen.cancel_button"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={generateMut.isPending}
              data-ocid="rechnungen.submit_button"
            >
              {generateMut.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird erstellt…
                </>
              ) : (
                "Rechnung erstellen"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
