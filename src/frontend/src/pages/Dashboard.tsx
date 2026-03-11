import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Clock, Plus, TrendingUp } from "lucide-react";
import { useClients, useDashboard } from "../hooks/useQueries";
import { formatCHF } from "../lib/dateUtils";

interface Props {
  onNavigate: (page: string) => void;
}

export default function Dashboard({ onNavigate }: Props) {
  const { data: dashboard, isLoading: dashLoading } = useDashboard();
  const { data: clients } = useClients();

  const totalHours = dashboard?.reduce((s, d) => s + d.openHours, 0) ?? 0;
  const totalAmount = dashboard?.reduce((s, d) => s + d.openAmount, 0) ?? 0;

  const getClientName = (id: number) =>
    clients?.find((c) => c.id === id)?.name ?? `Kunde #${id}`;

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Übersicht
          </h1>
          <p className="mt-1 text-muted-foreground">
            Offene Stunden und Beträge pro Kunde
          </p>
        </div>
        <Button
          onClick={() => onNavigate("zeiterfassung")}
          className="gap-2"
          data-ocid="dashboard.primary_button"
        >
          <Plus className="h-4 w-4" />
          Zeit erfassen
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Offene Stunden
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dashLoading ? (
              <Skeleton
                className="h-8 w-24"
                data-ocid="dashboard.loading_state"
              />
            ) : (
              <p className="font-display text-3xl font-bold">
                {totalHours.toFixed(2)} h
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Offener Betrag
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dashLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="font-display text-3xl font-bold text-primary">
                {formatCHF(totalAmount)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 font-display text-xl font-semibold">Nach Kunde</h2>
        {dashLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : !dashboard || dashboard.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-16 text-center"
            data-ocid="dashboard.empty_state"
          >
            <AlertCircle className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="font-medium text-muted-foreground">
              Noch keine offenen Posten
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Erfasse deine erste Zeitbuchung, um loszulegen.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => onNavigate("kunden")}
            >
              Kunden anlegen
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {dashboard.map((d, i) => (
              <Card
                key={d.clientId}
                className="shadow-card transition-shadow hover:shadow-md"
                data-ocid={`dashboard.item.${i + 1}`}
              >
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="font-semibold">{getClientName(d.clientId)}</p>
                    <p className="text-sm text-muted-foreground">
                      {d.openHours.toFixed(2)} Stunden offen
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-bold text-primary">
                      {formatCHF(d.openAmount)}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 text-xs"
                      onClick={() => onNavigate("rechnungen")}
                      data-ocid="dashboard.secondary_button"
                    >
                      Rechnung erstellen →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
