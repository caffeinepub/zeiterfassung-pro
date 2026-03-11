import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Settings } from "../backend.d";
import { useSettings, useUpdateSettings } from "../hooks/useQueries";

export default function Einstellungen() {
  const { data: settings, isLoading } = useSettings();
  const updateMut = useUpdateSettings();

  const [form, setForm] = useState<Settings>({
    companyName: "",
    address: "",
    vatRate: 8.1,
    smallExpenseFlatRate: 0,
    standardRate: 120,
  });

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateMut.mutateAsync(form);
      toast.success("Einstellungen gespeichert");
    } catch {
      toast.error("Fehler beim Speichern");
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Einstellungen</h1>
        <p className="mt-1 text-muted-foreground">
          Firmendaten und Rechnungsparameter
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-lg">Firmendaten</CardTitle>
            <CardDescription>
              Diese Angaben erscheinen auf den Rechnungen.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="e-name">Firmenname</Label>
              <Input
                id="e-name"
                value={form.companyName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, companyName: e.target.value }))
                }
                placeholder="Muster Consulting GmbH"
                data-ocid="settings.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-addr">Adresse</Label>
              <Textarea
                id="e-addr"
                value={form.address}
                rows={3}
                onChange={(e) =>
                  setForm((p) => ({ ...p, address: e.target.value }))
                }
                placeholder="Musterstrasse 1\n8001 Zürich\nSchweiz"
                data-ocid="settings.textarea"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-lg">
              Rechnungsparameter
            </CardTitle>
            <CardDescription>
              Steuersatz, Stundensatz und Spesenpauschale.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="e-vat">MwSt-Satz (%)</Label>
              <Input
                id="e-vat"
                type="number"
                step="0.1"
                min={0}
                max={100}
                value={form.vatRate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, vatRate: Number(e.target.value) }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Normalsatz Schweiz: 8.1% (ab 2024)
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-flatrate">Kleinspesenpauschale (CHF)</Label>
              <Input
                id="e-flatrate"
                type="number"
                step="0.5"
                min={0}
                value={form.smallExpenseFlatRate}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    smallExpenseFlatRate: Number(e.target.value),
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Pauschalbetrag pro Rechnung für Kleinspesen
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-rate">Standard-Stundensatz (CHF/h)</Label>
              <Input
                id="e-rate"
                type="number"
                step="5"
                min={0}
                value={form.standardRate}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    standardRate: Number(e.target.value),
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Wird beim Anlegen neuer Kunden vorgeschlagen
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button
        onClick={handleSave}
        disabled={updateMut.isPending || isLoading}
        className="gap-2"
        data-ocid="settings.save_button"
      >
        {updateMut.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {updateMut.isPending ? "Wird gespeichert…" : "Einstellungen speichern"}
      </Button>
    </div>
  );
}
