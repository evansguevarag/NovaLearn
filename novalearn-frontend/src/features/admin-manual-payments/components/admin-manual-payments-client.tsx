"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  ReceiptText,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

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
import { Textarea } from "@/components/ui/textarea";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import {
  approveAdminManualPayment,
  getAdminManualPayments,
  rejectAdminManualPayment,
} from "@/features/admin-manual-payments/services/admin-manual-payments.service";
import type {
  AdminManualPayment,
  ManualPaymentStatus,
} from "@/features/admin-manual-payments/types/admin-manual-payments.types";

type StatusFilter = ManualPaymentStatus | "ALL";

const statusFilters: Array<{
  label: string;
  value: StatusFilter;
}> = [
  { label: "Todos", value: "ALL" },
  { label: "Pendientes", value: "PENDING" },
  { label: "Aprobados", value: "PAID" },
  { label: "Rechazados", value: "REJECTED" },
];

export function AdminManualPaymentsClient() {
  const { isChecking } = useAuthGuard(["ADMIN"]);
  const [payments, setPayments] = useState<AdminManualPayment[]>([]);
  const [status, setStatus] = useState<StatusFilter>("PENDING");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPaymentId, setProcessingPaymentId] =
    useState<number | null>(null);
  const [paymentToReject, setPaymentToReject] =
    useState<AdminManualPayment | null>(null);

  useEffect(() => {
    if (isChecking) {
      return;
    }

    async function loadPayments(): Promise<void> {
      try {
        setIsLoading(true);
        setError(null);
        setPayments(await getAdminManualPayments(status));
      } catch {
        setError("No se pudieron cargar los pagos manuales.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadPayments();
  }, [isChecking, status]);

  const summary = useMemo(
    () => ({
      pending: payments.filter((payment) => payment.status === "PENDING")
        .length,
      approved: payments.filter((payment) => payment.status === "PAID")
        .length,
      rejected: payments.filter((payment) => payment.status === "REJECTED")
        .length,
    }),
    [payments]
  );

  async function handleApprove(payment: AdminManualPayment): Promise<void> {
    try {
      setProcessingPaymentId(payment.id);
      const updatedPayment = await approveAdminManualPayment(payment.id);
      setPayments((currentPayments) =>
        currentPayments.map((currentPayment) =>
          currentPayment.id === updatedPayment.id
            ? updatedPayment
            : currentPayment
        )
      );
      toast.success("Pago manual aprobado.", {
        description: updatedPayment.courseTitle,
      });
    } catch (approveError) {
      toast.error("No se pudo aprobar el pago.", {
        description: getApiErrorMessage(approveError),
      });
    } finally {
      setProcessingPaymentId(null);
    }
  }

  async function handleReject(reason: string): Promise<void> {
    if (!paymentToReject) {
      return;
    }

    try {
      setProcessingPaymentId(paymentToReject.id);
      const updatedPayment = await rejectAdminManualPayment(
        paymentToReject.id,
        reason
      );
      setPayments((currentPayments) =>
        currentPayments.map((currentPayment) =>
          currentPayment.id === updatedPayment.id
            ? updatedPayment
            : currentPayment
        )
      );
      setPaymentToReject(null);
      toast.warning("Pago manual rechazado.", {
        description: updatedPayment.courseTitle,
      });
    } catch (rejectError) {
      toast.error("No se pudo rechazar el pago.", {
        description: getApiErrorMessage(rejectError),
      });
    } finally {
      setProcessingPaymentId(null);
    }
  }

  if (isChecking) {
    return <main className="p-8">Validando sesión...</main>;
  }

  return (
    <DashboardShell
      title="Pagos manuales"
      description="Revisa comprobantes enviados por estudiantes y activa accesos cuando correspondan."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard title="Pendientes" value={summary.pending} />
        <SummaryCard title="Aprobados" value={summary.approved} />
        <SummaryCard title="Rechazados" value={summary.rejected} />
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Comprobantes</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Aprueba solo pagos verificados fuera de Culqi.
            </p>
          </div>

          <select
            className="h-10 rounded-md border bg-background px-3 text-sm"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as StatusFilter)
            }
          >
            {statusFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </CardHeader>

        <CardContent>
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando comprobantes...
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && (
            <div className="max-h-[560px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">
                            {payment.studentFullName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {payment.studentEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {payment.courseTitle}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(payment.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p>{payment.manualMethod ?? "Manual"}</p>
                          {payment.manualReference && (
                            <p className="text-xs text-muted-foreground">
                              Ref. {payment.manualReference}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <PaymentStatusBadge status={payment.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {payment.manualProofUrl && (
                            <Button asChild variant="outline" size="sm">
                              <a
                                href={payment.manualProofUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <ExternalLink className="mr-1 h-4 w-4" />
                                Ver
                              </a>
                            </Button>
                          )}

                          {payment.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                disabled={processingPaymentId === payment.id}
                                onClick={() => void handleApprove(payment)}
                              >
                                <CheckCircle2 className="mr-1 h-4 w-4" />
                                Aprobar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={processingPaymentId === payment.id}
                                onClick={() => setPaymentToReject(payment)}
                              >
                                <XCircle className="mr-1 h-4 w-4" />
                                Rechazar
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {payments.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-10 text-center text-muted-foreground"
                      >
                        No hay comprobantes para este filtro.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <RejectPaymentDialog
        key={paymentToReject?.id ?? "empty-reject-payment"}
        payment={paymentToReject}
        isSubmitting={
          paymentToReject !== null &&
          processingPaymentId === paymentToReject.id
        }
        onSubmit={handleReject}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setPaymentToReject(null);
          }
        }}
      />
    </DashboardShell>
  );
}

function RejectPaymentDialog({
  payment,
  isSubmitting,
  onSubmit,
  onOpenChange,
}: {
  payment: AdminManualPayment | null;
  isSubmitting: boolean;
  onSubmit: (reason: string) => Promise<void>;
  onOpenChange: (isOpen: boolean) => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <Dialog open={payment !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rechazar comprobante</DialogTitle>
          <DialogDescription>
            Indica el motivo para que el estudiante pueda corregir el envío.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Ejemplo: el monto no coincide o el comprobante no es legible."
        />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={() =>
              void onSubmit(
                reason.trim() || "El comprobante no pudo ser validado."
              )
            }
          >
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Rechazar pago
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <ReceiptText className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const labelByStatus: Record<string, string> = {
    PENDING: "Pendiente",
    PAID: "Aprobado",
    REJECTED: "Rechazado",
    CANCELLED: "Cancelado",
    FAILED: "Fallido",
    REFUNDED: "Reembolsado",
  };

  return (
    <Badge variant={status === "PAID" ? "default" : "secondary"}>
      {labelByStatus[status] ?? status}
    </Badge>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(Number.isFinite(value) ? value : 0);
}
