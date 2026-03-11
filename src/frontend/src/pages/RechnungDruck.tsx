import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, Printer, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Expense, Invoice, TimeEntry } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useClients, useSendInvoice, useSettings } from "../hooks/useQueries";
import {
  formatCHF,
  formatDate,
  formatDuration,
  getMonthName,
} from "../lib/dateUtils";

interface Props {
  invoiceId: number;
  onBack: () => void;
}

export default function RechnungDruck({ invoiceId, onBack }: Props) {
  const { actor } = useActor();
  const { data: settings } = useSettings();
  const { data: clients } = useClients();
  const sendMut = useSendInvoice();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor) return;
    const load = async () => {
      setLoading(true);
      const [inv, allEntries, allExpenses] = await Promise.all([
        actor.getInvoice(invoiceId),
        actor.getAllTimeEntries(),
        actor.getAllExpenses(),
      ]);
      if (inv) {
        setInvoice(inv);
        const ids = new Set(Array.from(inv.timeEntryIds));
        const eids = new Set(Array.from(inv.expenseIds));
        setTimeEntries(allEntries.filter((e) => ids.has(e.id)));
        setExpenses(allExpenses.filter((e) => eids.has(e.id)));
      }
      setLoading(false);
    };
    load();
  }, [actor, invoiceId]);

  const handleSend = async () => {
    try {
      await sendMut.mutateAsync(invoiceId);
      toast.success("Rechnung als gesendet markiert");
    } catch {
      toast.error("Fehler");
    }
  };

  const client = invoice
    ? clients?.find((c) => c.id === invoice.clientId)
    : null;

  if (loading) {
    return (
      <div
        className="flex items-center justify-center py-32"
        data-ocid="rechnung.loading_state"
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="py-20 text-center" data-ocid="rechnung.error_state">
        <p className="text-muted-foreground">Rechnung nicht gefunden.</p>
        <Button variant="outline" className="mt-4" onClick={onBack}>
          Zurück
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between no-print">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={onBack}
          data-ocid="rechnung.secondary_button"
        >
          <ArrowLeft className="h-4 w-4" /> Zurück
        </Button>
        <div className="flex gap-2">
          {invoice.status === "draft" && (
            <Button
              variant="outline"
              onClick={handleSend}
              disabled={sendMut.isPending}
              data-ocid="rechnung.primary_button"
            >
              {sendMut.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Als gesendet markieren
            </Button>
          )}
          <Button
            onClick={() => window.print()}
            className="gap-2"
            data-ocid="rechnung.button"
          >
            <Printer className="h-4 w-4" /> Drucken
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-card p-10 shadow-card print:shadow-none print:border-none print:p-0 print:rounded-none">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              {settings?.companyName ?? "Mein Unternehmen"}
            </h1>
            <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
              {settings?.address}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-display font-semibold text-muted-foreground">
              Rechnung
            </p>
            <p className="mt-1 font-mono text-sm">
              # {String(invoice.id).padStart(5, "0")}
            </p>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Rechnungsempfänger
            </p>
            <p className="font-semibold">{client?.name}</p>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {client?.address}
            </p>
            {client?.contact && (
              <p className="text-sm text-muted-foreground">{client.contact}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Details
            </p>
            <p className="text-sm">
              Periode:{" "}
              <span className="font-medium">
                {getMonthName(invoice.month)} {invoice.year}
              </span>
            </p>
            <p className="text-sm">
              Datum:{" "}
              <span className="font-medium">
                {formatDate(invoice.createdDate)}
              </span>
            </p>
            <p className="mt-1">
              <Badge
                variant={invoice.status === "sent" ? "default" : "secondary"}
                className={invoice.status === "sent" ? "bg-primary" : ""}
              >
                {invoice.status === "sent" ? "Gesendet" : "Entwurf"}
              </Badge>
            </p>
          </div>
        </div>

        <Separator className="my-8" />

        {timeEntries.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 font-semibold">Zeitaufwand</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 text-left font-medium text-muted-foreground">
                    Datum
                  </th>
                  <th className="py-2 text-left font-medium text-muted-foreground">
                    Beschreibung
                  </th>
                  <th className="py-2 text-right font-medium text-muted-foreground">
                    Dauer
                  </th>
                  <th className="py-2 text-right font-medium text-muted-foreground">
                    Betrag
                  </th>
                </tr>
              </thead>
              <tbody>
                {timeEntries.map((e) => (
                  <tr key={e.id} className="border-b border-border/50">
                    <td className="py-2.5">{formatDate(e.date)}</td>
                    <td className="py-2.5 text-muted-foreground">
                      {e.description || "—"}
                    </td>
                    <td className="py-2.5 text-right">
                      {formatDuration(e.duration)}
                    </td>
                    <td className="py-2.5 text-right font-medium">
                      {formatCHF(e.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {expenses.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 font-semibold">Spesen</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 text-left font-medium text-muted-foreground">
                    Datum
                  </th>
                  <th className="py-2 text-left font-medium text-muted-foreground">
                    Beschreibung
                  </th>
                  <th className="py-2 text-right font-medium text-muted-foreground">
                    Betrag
                  </th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id} className="border-b border-border/50">
                    <td className="py-2.5">{formatDate(e.date)}</td>
                    <td className="py-2.5 text-muted-foreground">
                      {e.description || "—"}
                    </td>
                    <td className="py-2.5 text-right font-medium">
                      {formatCHF(e.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Separator className="my-6" />
        <div className="ml-auto max-w-xs space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Nettobetrag</span>
            <span>{formatCHF(invoice.netAmount)}</span>
          </div>
          {invoice.smallExpenseFlatRate > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Kleinspesenpauschale
              </span>
              <span>{formatCHF(invoice.smallExpenseFlatRate)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              MwSt. {invoice.vatRate}%
            </span>
            <span>{formatCHF(invoice.vatAmount)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-display text-lg font-bold">
            <span>Total CHF</span>
            <span className="text-primary">
              {formatCHF(invoice.grossAmount)}
            </span>
          </div>
        </div>

        <div className="mt-12 text-xs text-muted-foreground text-center">
          Vielen Dank für Ihr Vertrauen.
        </div>
      </div>
    </div>
  );
}
