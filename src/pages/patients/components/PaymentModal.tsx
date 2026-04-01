

import { FormEvent, useEffect, useMemo, useState } from "react";
import { PaymentMethod, type PlanItem } from "@/api/treatmentPlanService";
import { usePayments } from "@/hooks/usePayments";

interface PaymentModalProps {
  isOpen: boolean;
  item: PlanItem | null;
  clinicId: string;
  patientId: string;
  planId: string;
  onClose: () => void;
}

const paymentMethods: Array<{ value: PaymentMethod; label: string }> = [
  { value: PaymentMethod.Pix, label: "Pix" },
  { value: PaymentMethod.Cash, label: "Dinheiro" },
  { value: PaymentMethod.CreditCard, label: "Cartao de credito" },
  { value: PaymentMethod.DebitCard, label: "Cartao de debito" },
];

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const safeNumber = (value?: number | null) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const PaymentModal = ({
  isOpen,
  item,
  clinicId,
  patientId,
  planId,
  onClose,
}: PaymentModalProps) => {
  const { registerPayment, isPending, error, reset } = usePayments({
    clinicId,
    patientId,
    planId,
  });

  const totalAmount = useMemo(() => safeNumber(item?.price), [item]);
  const paidAmount = useMemo(() => safeNumber(item?.paidAmount), [item]);
  const remainingAmount = useMemo(() => Math.max(totalAmount - paidAmount, 0), [totalAmount, paidAmount]);

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.Pix);
  const [installments, setInstallments] = useState("1");
  const [discountPercent, setDiscountPercent] = useState("0");
  const [machineFeePercent, setMachineFeePercent] = useState("0");
  const [note, setNote] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const parsedAmount = Number(amount || "0");
  const parsedDiscountPercent = Number(discountPercent || "0");
  const parsedMachineFeePercent = Number(machineFeePercent || "0");
  const isCardPayment = method === PaymentMethod.CreditCard || method === PaymentMethod.DebitCard;
  const discountAmountPreview = Math.max(parsedAmount * (parsedDiscountPercent / 100), 0);
  const discountedAmountPreview = Math.max(parsedAmount - discountAmountPreview, 0);
  const machineFeeAmountPreview = isCardPayment
    ? Math.max(discountedAmountPreview * (parsedMachineFeePercent / 100), 0)
    : 0;
  const netAmountPreview = Math.max(discountedAmountPreview - machineFeeAmountPreview, 0);

  useEffect(() => {
    if (isOpen) {
      setAmount(remainingAmount > 0 ? remainingAmount.toFixed(2) : "0.00");
      setMethod(PaymentMethod.Pix);
      setInstallments("1");
      setDiscountPercent("0");
      setMachineFeePercent("0");
      setNote("");
      setValidationError(null);
      reset();
    }
  }, [isOpen, remainingAmount, reset]);

  if (!isOpen || !item) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setValidationError("Informe um valor de pagamento valido.");
      return;
    }

    if (method === PaymentMethod.CreditCard) {
      const parsedInstallments = Number(installments);
      if (Number.isNaN(parsedInstallments) || parsedInstallments < 1 || parsedInstallments > 12) {
        setValidationError("Parcelamento invalido.");
        return;
      }
    }

    setValidationError(null);

    registerPayment(
      {
        itemId: item.id,
        data: {
          amount: parsedAmount,
          method,
          installments: method === PaymentMethod.CreditCard ? Number(installments) : undefined,
          discountPercent: parsedDiscountPercent,
          discountAmount: discountAmountPreview,
          machineFeePercent: isCardPayment ? parsedMachineFeePercent : undefined,
          machineFeeAmount: isCardPayment ? machineFeeAmountPreview : undefined,
          netAmount: netAmountPreview,
          paidAt: new Date().toISOString(),
          note: note.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (err) => {
          const errorPayload = (err as { response?: { data?: { code?: string; message?: string } } })?.response?.data;
          const code = errorPayload?.code;

          if (code === "PAYMENT_EXCEEDS_BALANCE") {
            setValidationError(errorPayload?.message || "Pagamento maior que o saldo pendente.");
          } else if (code === "FINANCIAL_INCONSISTENCY") {
            setValidationError(errorPayload?.message || "Inconsistencia financeira. Revise os valores.");
          } else {
            setValidationError(errorPayload?.message || "Nao foi possivel registrar pagamento.");
          }
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Registrar Pagamento</h3>
            <p className="text-sm text-slate-500">{item.procedureName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Valor total</p>
              <p className="text-lg font-extrabold text-slate-800">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Ja pago</p>
              <p className="text-lg font-extrabold text-emerald-700">{formatCurrency(paidAmount)}</p>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Saldo</p>
              <p className="text-lg font-extrabold text-amber-700">{formatCurrency(remainingAmount)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="payment-amount">
              Valor do pagamento
            </label>
            <input
              id="payment-amount"
              type="number"
              min="0.01"
              max={remainingAmount}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="discount-percent">
                Desconto (%)
              </label>
              <input
                id="discount-percent"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            {isCardPayment && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700" htmlFor="machine-fee-percent">
                  Taxa da maquininha (%)
                </label>
                <input
                  id="machine-fee-percent"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={machineFeePercent}
                  onChange={(e) => setMachineFeePercent(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Resumo financeiro desta baixa</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <p className="text-slate-600">Desconto aplicado: <span className="font-semibold text-slate-800">{formatCurrency(discountAmountPreview)}</span></p>
              <p className="text-slate-600">Taxa maquininha: <span className="font-semibold text-slate-800">{formatCurrency(machineFeeAmountPreview)}</span></p>
              <p className="text-slate-600">Valor apos desconto: <span className="font-semibold text-slate-800">{formatCurrency(discountedAmountPreview)}</span></p>
              <p className="text-slate-600">Valor liquido: <span className="font-semibold text-emerald-700">{formatCurrency(netAmountPreview)}</span></p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">Forma de pagamento</p>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((paymentMethod) => (
                <label
                  key={paymentMethod.value}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium cursor-pointer transition-colors ${
                    method === paymentMethod.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={paymentMethod.value}
                    checked={method === paymentMethod.value}
                    onChange={() => setMethod(paymentMethod.value)}
                    className="sr-only"
                  />
                  {paymentMethod.label}
                </label>
              ))}
            </div>
          </div>

          {method === PaymentMethod.CreditCard && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="installments">
                Parcelamento
              </label>
              <select
                id="installments"
                value={installments}
                onChange={(e) => setInstallments(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              >
                {Array.from({ length: 12 }, (_, index) => index + 1).map((option) => (
                  <option key={option} value={option}>
                    {option}x
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="payment-note">
              Observacao
            </label>
            <textarea
              id="payment-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
              placeholder="Detalhes opcionais"
            />
          </div>

          {(validationError || error) && (
            <p className="text-sm font-medium text-rose-600">
              {validationError || (error as Error).message || "Erro ao registrar pagamento."}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || remainingAmount <= 0}
              className="flex-1 py-3 px-4 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Registrando..." : "Confirmar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
