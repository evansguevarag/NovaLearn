"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Eye,
  Loader2,
  ReceiptText,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getStudentPayments } from "@/features/dashboard/services/student-dashboard.service";
import type { StudentPayment } from "@/features/dashboard/types/student-dashboard.types";
import { useAuthGuard } from "@/hooks/use-auth-guard";

export function StudentPaymentsClient() {
  const { isChecking } = useAuthGuard(["STUDENT"]);
  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [selectedPayment, setSelectedPayment] =
    useState<StudentPayment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isChecking) {
      return;
    }

    async function loadPayments(): Promise<void> {
      try {
        setIsLoading(true);
        setError(null);
        setPayments(await getStudentPayments());
      } catch {
        setError("No se pudieron cargar tus pagos.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadPayments();
  }, [isChecking]);

  const totalPaid = useMemo(
    () =>
      payments
        .filter((payment) => payment.status === "PAID")
        .reduce((total, payment) => total + getPaymentTotal(payment), 0),
    [payments]
  );

  if (isChecking) {
    return <main className="p-8">Validando sesión...</main>;
  }

  return (
    <DashboardShell
      title="Mis pagos"
      description="Consulta el historial de pagos y el estado de tus compras."
    >
      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando pagos...
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && (
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            title="Pagos registrados"
            value={payments.length}
            description="Operaciones creadas en tu cuenta"
          />
          <SummaryCard
            title="Pagos aprobados"
            value={payments.filter((payment) => payment.status === "PAID").length}
            description="Compras confirmadas"
          />
          <SummaryCard
            title="Total pagado"
            value={`S/ ${totalPaid.toFixed(2)}`}
            description="Suma de pagos confirmados"
          />
        </div>
      )}

      {!isLoading && !error && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Historial de pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[520px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Curso</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.courseTitle}
                      </TableCell>
                      <TableCell>{formatDate(payment.createdAt)}</TableCell>
                      <TableCell>
                        {formatCurrency(getPaymentTotal(payment))}
                      </TableCell>
                      <TableCell>
                        <PaymentStatusBadge status={payment.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          {payment.provider}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPayment(payment)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          Detalle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {payments.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-10 text-center text-muted-foreground"
                      >
                        No tienes pagos registrados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <PaymentDetailDialog
        payment={selectedPayment}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedPayment(null);
          }
        }}
      />
    </DashboardShell>
  );
}

function PaymentDetailDialog({
  payment,
  onOpenChange,
}: {
  payment: StudentPayment | null;
  onOpenChange: (isOpen: boolean) => void;
}) {
  return (
    <Dialog open={payment !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {payment && (
          <>
            <DialogHeader>
              <DialogTitle>Detalle del pago</DialogTitle>
              <DialogDescription>
                Resumen de la compra asociada a tu curso.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Curso</p>
                <p className="mt-1 font-semibold">{payment.courseTitle}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <PaymentStatusBadge status={payment.status} />
                  <Badge variant="secondary">{payment.provider}</Badge>
                </div>
              </div>

              <div className="grid gap-3 rounded-lg border p-4 text-sm">
                <DetailRow
                  label="Fecha de creación"
                  value={formatDate(payment.createdAt)}
                />
                <DetailRow
                  label="Fecha de pago"
                  value={payment.paidAt ? formatDate(payment.paidAt) : "-"}
                />
                <DetailRow
                  label="Precio del curso"
                  value={formatCurrency(getPaymentSubtotal(payment))}
                />
                <DetailRow
                  label="Comisión de pasarela"
                  value={formatCurrency(getPaymentFee(payment))}
                />
                {getPaymentTax(payment) > 0 && (
                  <DetailRow
                    label="Impuesto de comisión"
                    value={formatCurrency(getPaymentTax(payment))}
                  />
                )}
                <div className="border-t pt-3">
                  <DetailRow
                    label="Total pagado"
                    value={formatCurrency(getPaymentTotal(payment))}
                    strong
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button asChild>
                <Link href={`/student/courses/${payment.courseId}/learn`}>
                  Ver curso
                </Link>
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "text-base font-semibold" : "font-medium"}>
        {value}
      </span>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string | number;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <ReceiptText className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const labelByStatus: Record<string, string> = {
    PAID: "Pagado",
    PENDING: "Pendiente",
    PROCESSING: "Procesando",
    FAILED: "Fallido",
    CANCELLED: "Cancelado",
    REJECTED: "Rechazado",
    REFUNDED: "Reembolsado",
  };

  return (
    <Badge variant={status === "PAID" ? "default" : "secondary"}>
      {labelByStatus[status] ?? status}
    </Badge>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getPaymentSubtotal(payment: StudentPayment): number {
  return Number.isFinite(payment.subtotalAmount)
    ? payment.subtotalAmount
    : payment.amount;
}

function getPaymentFee(payment: StudentPayment): number {
  return Number.isFinite(payment.processingFeeAmount)
    ? payment.processingFeeAmount
    : 0;
}

function getPaymentTax(payment: StudentPayment): number {
  return Number.isFinite(payment.taxAmount) ? payment.taxAmount : 0;
}

function getPaymentTotal(payment: StudentPayment): number {
  return Number.isFinite(payment.totalAmount)
    ? payment.totalAmount
    : payment.amount;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(Number.isFinite(value) ? value : 0);
}
