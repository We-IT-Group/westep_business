import {useMemo} from "react";
import {useFormik} from "formik";
import * as Yup from "yup";
import {CreditCard, LoaderCircle} from "lucide-react";
import PhoneNumberInput from "../form/PhoneNumberInput.tsx";
import Button from "../ui/button/Button.tsx";
import {useBusinessWalletTopUpCheckout} from "../../api/payments/useBusinessWalletPayments.ts";
import type {BusinessWalletTopUpCheckoutRequest} from "../../types/types.ts";
import {showSuccessToast} from "../../utils/toast.tsx";

interface BusinessWalletTopUpSectionProps {
    defaultPhoneNumber?: string;
    variant?: "default" | "hero";
}

type BusinessWalletTopUpFormValues = BusinessWalletTopUpCheckoutRequest & Record<string, unknown>;

const formatMoney = (value: number) =>
    `${new Intl.NumberFormat("uz-UZ").format(Math.round(value))} so‘m`;

const amountPresets = [100000, 300000, 500000, 1000000];

export default function BusinessWalletTopUpSection({
    defaultPhoneNumber,
    variant = "default",
}: BusinessWalletTopUpSectionProps) {
    const checkoutMutation = useBusinessWalletTopUpCheckout();
    const isHero = variant === "hero";

    const formik = useFormik<BusinessWalletTopUpFormValues>({
        enableReinitialize: true,
        initialValues: {
            phoneNumber: defaultPhoneNumber || "",
            amount: 100000,
        },
        validationSchema: Yup.object({
            phoneNumber: Yup.string()
                .required("Telefon raqamini kiriting.")
                .matches(/^998\d{9}$/, "Telefon raqamini +998770440105 yoki 998770440105 formatda kiriting."),
            amount: Yup.number()
                .typeError("Summani to‘g‘ri kiriting.")
                .required("Summani kiriting.")
                .min(1000, "Summa kamida 1 000 so‘m bo‘lishi kerak."),
        }),
        onSubmit: async (values) => {
            const response = await checkoutMutation.mutateAsync(values);
            showSuccessToast("Payme sahifasiga yo‘naltirilmoqda");
            window.location.href = response.checkoutUrl;
        },
    });

    const helperTitle = useMemo(
        () => (isHero ? "Biznes hisobini tez to‘ldiring" : "Payme orqali hisobni to‘ldirish"),
        [isHero],
    );

    return (
        <section
            className={
                isHero
                    ? "relative overflow-hidden rounded-[32px] border border-sky-100 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.2),_transparent_30%),linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(248,250,252,0.94))] p-6 shadow-[0_28px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_32%),linear-gradient(135deg,_rgba(2,6,23,0.98),_rgba(15,23,42,0.94))] dark:shadow-[0_28px_80px_rgba(2,6,23,0.45)]"
                    : "rounded-[32px] border border-white/80 bg-white/88 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.07)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_28px_80px_rgba(2,6,23,0.45)]"
            }
        >
            <div className={isHero ? "pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:140px_140px] opacity-35 dark:opacity-20" : "hidden"}/>
            <div className="relative">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200">
                            PAYME CHECKOUT
                        </span>
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                            Himoyalangan to‘lov
                        </span>
                    </div>

                    <h2 className={`mt-4 tracking-tight text-slate-950 dark:text-slate-100 ${isHero ? "text-3xl font-black md:text-[2.5rem]" : "text-2xl font-black"}`}>
                        {helperTitle}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-500 dark:text-slate-400">
                        Telefon raqami va summani kiriting. Tasdiqlangandan keyin siz Payme checkout sahifasiga o‘tasiz.
                    </p>

                    <form onSubmit={formik.handleSubmit} className="mt-6 space-y-5">
                        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
                            <div>
                                <p className="mb-2 text-sm font-black tracking-tight text-slate-900 dark:text-slate-100">Telefon raqami</p>
                                <PhoneNumberInput name="phoneNumber" formik={formik}/>
                            </div>

                            <div>
                                <label htmlFor="amount" className="mb-2 block text-sm font-black tracking-tight text-slate-900 dark:text-slate-100">
                                    Summa
                                </label>
                                <input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    min={1000}
                                    step={1000}
                                    value={formik.values.amount}
                                    onChange={(event) => {
                                        formik.setFieldValue("amount", Number(event.target.value));
                                    }}
                                    onBlur={formik.handleBlur}
                                    className="h-[54px] w-full rounded-full border border-slate-300 bg-white px-5 text-lg font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
                                    placeholder="500000"
                                />
                                {formik.touched.amount && formik.errors.amount ? (
                                    <p className="mt-2 ml-2 text-sm text-red-500">{formik.errors.amount}</p>
                                ) : (
                                    <p className="mt-2 ml-2 text-xs font-medium text-slate-400 dark:text-slate-500">
                                        Kiritilgan summa: {formatMoney(Number(formik.values.amount || 0))}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {amountPresets.map((amount) => (
                                <button
                                    key={amount}
                                    type="button"
                                    onClick={() => formik.setFieldValue("amount", amount)}
                                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                                        Number(formik.values.amount) === amount
                                            ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-950"
                                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                                    }`}
                                >
                                    {formatMoney(amount)}
                                </button>
                            ))}
                        </div>

                        <div className="rounded-[24px] border border-amber-100 bg-amber-50/80 p-4 text-sm font-medium leading-6 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
                            Hozircha current balance uchun alohida endpoint ulanmagan. Bu bo‘lim faqat checkoutga o‘tish oqimini bajaradi.
                        </div>

                        <Button
                            type="submit"
                            className="w-full rounded-2xl px-6 py-4 text-base font-semibold md:w-auto"
                            disabled={checkoutMutation.isPending || !formik.isValid}
                            isPending={checkoutMutation.isPending}
                            startIcon={
                                checkoutMutation.isPending
                                    ? <LoaderCircle className="h-4 w-4 animate-spin"/>
                                    : <CreditCard className="h-4 w-4"/>
                            }
                        >
                            Payme orqali to‘lash
                        </Button>
                    </form>
                </div>
            </div>
        </section>
    );
}
