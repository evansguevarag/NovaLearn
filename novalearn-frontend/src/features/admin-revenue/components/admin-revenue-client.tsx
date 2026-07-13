"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  Loader2,
  Percent,
  ReceiptText,
  Wallet,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuthGuard } from "@/hooks/use-auth-guard";

import { getRevenue } from "@/features/dashboard/services/admin-dashboard.service";
import type { RevenuePayment } from "@/features/dashboard/types/admin-dashboard.types";

export function AdminRevenueClient() {
  const { isChecking } = useAuthGuard(["ADMIN"]);
  const [revenue, setRevenue] = useState<RevenuePayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isChecking) {
      return;
    }

    async function loadRevenue(): Promise<void> {
      try {
        setIsLoading(true);
        setError(null);

        const revenueData = await getRevenue();

        setRevenue(revenueData.filter(isIndividualRevenue));
      } catch {
        setError("No se pudo cargar el módulo de ingresos.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadRevenue();
  }, [isChecking]);

  const totals = useMemo(
    () =>
      revenue.reduce(
        (currentTotals, item) => ({
          subtotal:
            currentTotals.subtotal +
            getRevenueSubtotalAmount(item),
          processingFee:
            currentTotals.processingFee +
            getRevenueProcessingFeeAmount(item),
          tax:
            currentTotals.tax + getRevenueTaxAmount(item),
          total:
            currentTotals.total + getRevenueAmount(item),
        }),
        {
          subtotal: 0,
          processingFee: 0,
          tax: 0,
          total: 0,
        }
      ),
    [revenue]
  );

  if (isChecking) {
    return <main className="p-8">Validando sesión...</main>;
  }

  return (
    <DashboardShell
      title="Ingresos"
      description="Consulta cada venta confirmada y su desglose de cobro."
    >
      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando ingresos...
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <RevenueMetricCard
              title="Total cobrado"
              value={formatCurrency(totals.total)}
              description="Pagos confirmados"
              icon={Wallet}
            />

            <RevenueMetricCard
              title="Cursos"
              value={formatCurrency(totals.subtotal)}
              description="Precio base vendido"
              icon={ReceiptText}
            />

            <RevenueMetricCard
              title="Comisión Culqi"
              value={formatCurrency(totals.processingFee)}
              description="Procesamiento configurado"
              icon={Percent}
            />

            <RevenueMetricCard
              title="IGV comisión"
              value={formatCurrency(totals.tax)}
              description="Impuesto de procesamiento"
              icon={Banknote}
            />
          </div>

          <Card className="mt-6 flex h-[38rem] min-w-0 flex-col overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">
                Ventas confirmadas
              </CardTitle>
            </CardHeader>

            <CardContent className="min-h-0 min-w-0 flex-1 overflow-hidden">
              <div className="h-full min-w-0 overflow-auto pr-1">
                <RevenueDetailsTable revenue={revenue} />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </DashboardShell>
  );
}

interface RevenueMetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
}

function RevenueMetricCard({
  title,
  value,
  description,
  icon: Icon,
}: RevenueMetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>

        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function RevenueDetailsTable({
  revenue,
}: {
  revenue: RevenuePayment[];
}) {
  return (
    <Table className="table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[13%] whitespace-normal">
            Fecha
          </TableHead>
          <TableHead className="w-[28%] whitespace-normal">
            Curso vendido
          </TableHead>
          <TableHead className="w-[20%] whitespace-normal">
            Estudiante
          </TableHead>
          <TableHead className="w-[13%] whitespace-normal text-right">
            Curso
          </TableHead>
          <TableHead className="w-[13%] whitespace-normal text-right">
            Comisión
          </TableHead>
          <TableHead className="w-[13%] whitespace-normal text-right">
            Total
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {revenue.map((item, index) => (
          <TableRow key={buildRevenueRowKey(item, index)}>
            <TableCell className="whitespace-normal align-top">
              {formatRevenueDate(item)}
            </TableCell>

            <TableCell className="whitespace-normal align-top">
              <p className="break-words font-medium leading-5">
                {getRevenueCourseTitle(item)}
              </p>
            </TableCell>

            <TableCell className="whitespace-normal align-top">
              <p className="break-words leading-5">
                {getRevenueStudentName(item)}
              </p>
              {item.studentEmail && (
                <p className="mt-1 break-all text-xs text-muted-foreground">
                  {item.studentEmail}
                </p>
              )}
            </TableCell>

            <TableCell className="text-right align-top">
              {formatCurrency(getRevenueSubtotalAmount(item))}
            </TableCell>

            <TableCell className="text-right align-top">
              {formatCurrency(
                getRevenueProcessingFeeAmount(item)
              )}
            </TableCell>

            <TableCell className="text-right align-top font-medium">
              {formatCurrency(getRevenueAmount(item))}
            </TableCell>
          </TableRow>
        ))}

        {revenue.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={6}
              className="py-8 text-center text-muted-foreground"
            >
              No hay ventas confirmadas.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function getRevenueAmount(item: RevenuePayment): number {
  const amount = item.totalAmount ?? item.amount ?? 0;

  return Number.isFinite(amount) ? amount : 0;
}

function getRevenueSubtotalAmount(item: RevenuePayment): number {
  const subtotal = item.subtotalAmount ?? item.amount ?? 0;

  return Number.isFinite(subtotal) ? subtotal : 0;
}

function getRevenueProcessingFeeAmount(
  item: RevenuePayment
): number {
  const fee = item.processingFeeAmount ?? 0;

  return Number.isFinite(fee) ? fee : 0;
}

function getRevenueTaxAmount(item: RevenuePayment): number {
  const tax = item.taxAmount ?? 0;

  return Number.isFinite(tax) ? tax : 0;
}

function getRevenueCourseTitle(item: RevenuePayment): string {
  return item.courseTitle?.trim() || "Curso no disponible";
}

function getRevenueStudentName(item: RevenuePayment): string {
  return (
    item.studentName?.trim() ||
    item.studentEmail?.trim() ||
    "Estudiante no disponible"
  );
}

function formatRevenueDate(item: RevenuePayment): string {
  if (item.paidAt) {
    return formatFullDate(item.paidAt);
  }

  return "Fecha no disponible";
}

function formatFullDate(value: string | number[] | null): string {
  const date = parseDashboardDate(value);

  if (!date) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function parseDashboardDate(value: string | number[] | null): Date | null {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    const [
      year,
      month,
      day,
      hour = 0,
      minute = 0,
      second = 0,
    ] = value;

    if (!year || !month || !day) {
      return null;
    }

    return new Date(
      year,
      month - 1,
      day,
      hour,
      minute,
      second
    );
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

function buildRevenueRowKey(
  item: RevenuePayment,
  index: number
): string {
  if (item.paymentId) {
    return `payment-${item.paymentId}`;
  }

  return [
    "revenue",
    item.courseId ?? "course",
    item.studentId ?? "student",
    item.paidAt ?? "date",
    item.amount ?? "amount",
    index,
  ].join("-");
}

function isIndividualRevenue(item: RevenuePayment): boolean {
  return Boolean(
    item.courseTitle &&
      (item.totalAmount != null || item.amount != null)
  );
}

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) {
    return formatCurrency(0);
  }

  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(value);
}
