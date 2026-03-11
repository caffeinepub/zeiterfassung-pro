import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Client {
    id: ClientId;
    contact: string;
    name: string;
    rate: number;
    address: string;
}
export interface Settings {
    smallExpenseFlatRate: number;
    address: string;
    companyName: string;
    standardRate: number;
    vatRate: number;
}
export type TimeEntryId = number;
export interface DashboardData {
    clientId: ClientId;
    openAmount: number;
    openHours: number;
}
export type InvoiceId = number;
export type ExpenseId = number;
export interface Invoice {
    id: InvoiceId;
    status: InvoiceStatus;
    month: number;
    clientId: ClientId;
    netAmount: number;
    smallExpenseFlatRate: number;
    year: number;
    createdDate: bigint;
    grossAmount: number;
    timeEntryIds: Uint32Array;
    expenseIds: Uint32Array;
    vatAmount: number;
    vatRate: number;
}
export interface Expense {
    id: ExpenseId;
    clientId: ClientId;
    date: bigint;
    description: string;
    amount: number;
}
export type ClientId = number;
export interface UserProfile {
    name: string;
}
export interface TimeEntry {
    id: TimeEntryId;
    startTime: bigint;
    duration: number;
    clientId: ClientId;
    endTime: bigint;
    date: bigint;
    description: string;
    amount: number;
}
export enum InvoiceStatus {
    sent = "sent",
    draft = "draft"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createClient(name: string, address: string, rate: number, contact: string): Promise<ClientId>;
    createExpense(clientId: ClientId, date: bigint, amount: number, description: string): Promise<ExpenseId>;
    createTimeEntry(clientId: ClientId, date: bigint, startTime: bigint, endTime: bigint, description: string): Promise<TimeEntryId>;
    deleteClient(id: ClientId): Promise<void>;
    deleteExpense(id: ExpenseId): Promise<void>;
    deleteTimeEntry(id: TimeEntryId): Promise<void>;
    generateInvoice(clientId: ClientId, month: number, year: number): Promise<InvoiceId>;
    getAllClients(): Promise<Array<Client>>;
    getAllExpenses(): Promise<Array<Expense>>;
    getAllInvoices(): Promise<Array<Invoice>>;
    getAllTimeEntries(): Promise<Array<TimeEntry>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClient(id: ClientId): Promise<Client | null>;
    getDashboardData(): Promise<Array<DashboardData>>;
    getExpense(id: ExpenseId): Promise<Expense | null>;
    getInvoice(id: InvoiceId): Promise<Invoice | null>;
    getSettings(): Promise<Settings>;
    getTimeEntry(id: TimeEntryId): Promise<TimeEntry | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendInvoice(id: InvoiceId): Promise<void>;
    updateClient(client: Client): Promise<void>;
    updateExpense(expense: Expense): Promise<void>;
    updateSettings(newSettings: Settings): Promise<void>;
    updateTimeEntry(timeEntry: TimeEntry): Promise<void>;
}
