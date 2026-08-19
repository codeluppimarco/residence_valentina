import type { Database } from "@/types/database";

export type UnitRow = Database["public"]["Tables"]["units"]["Row"];
export type ExpenseRow = Database["public"]["Tables"]["expenses"]["Row"];
export type ExpenseShareRow = Database["public"]["Tables"]["expense_shares"]["Row"];
export type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
export type ReportRow = Database["public"]["Tables"]["reports"]["Row"];
export type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type Role = Database["public"]["Enums"]["app_role"];
export type ConfigRow = Database["public"]["Tables"]["config"]["Row"];
export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type CashLedgerRow = Database["public"]["Tables"]["cash_ledger"]["Row"];
export type SplitMethod = Database["public"]["Enums"]["app_split_method"];
export type PaymentStatus = Database["public"]["Enums"]["app_payment_status"];
