import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Client,
  Expense,
  Invoice,
  Settings,
  TimeEntry,
} from "../backend.d";
import { useActor } from "./useActor";

export function useClients() {
  const { actor, isFetching } = useActor();
  return useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllClients();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTimeEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<TimeEntry[]>({
    queryKey: ["timeEntries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTimeEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useExpenses() {
  const { actor, isFetching } = useActor();
  return useQuery<Expense[]>({
    queryKey: ["expenses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllExpenses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useInvoices() {
  const { actor, isFetching } = useActor();
  return useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllInvoices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSettings() {
  const { actor, isFetching } = useActor();
  return useQuery<Settings>({
    queryKey: ["settings"],
    queryFn: async () => {
      if (!actor)
        return {
          companyName: "",
          address: "",
          vatRate: 8.1,
          smallExpenseFlatRate: 0,
          standardRate: 120,
        };
      return actor.getSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDashboard() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDashboardData();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateClient() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      address: string;
      rate: number;
      contact: string;
    }) => actor!.createClient(data.name, data.address, data.rate, data.contact),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });
}

export function useUpdateClient() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (client: Client) => actor!.updateClient(client),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });
}

export function useDeleteClient() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => actor!.deleteClient(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useCreateTimeEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      clientId: number;
      date: bigint;
      startTime: bigint;
      endTime: bigint;
      description: string;
    }) =>
      actor!.createTimeEntry(
        data.clientId,
        data.date,
        data.startTime,
        data.endTime,
        data.description,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timeEntries"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateTimeEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entry: TimeEntry) => actor!.updateTimeEntry(entry),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timeEntries"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteTimeEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => actor!.deleteTimeEntry(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timeEntries"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useCreateExpense() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      clientId: number;
      date: bigint;
      amount: number;
      description: string;
    }) =>
      actor!.createExpense(
        data.clientId,
        data.date,
        data.amount,
        data.description,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateExpense() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (expense: Expense) => actor!.updateExpense(expense),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  });
}

export function useDeleteExpense() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => actor!.deleteExpense(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  });
}

export function useGenerateInvoice() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { clientId: number; month: number; year: number }) =>
      actor!.generateInvoice(data.clientId, data.month, data.year),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useSendInvoice() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => actor!.sendInvoice(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useUpdateSettings() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settings: Settings) => actor!.updateSettings(settings),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });
}
