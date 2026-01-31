'use client';

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from "sonner";
import { POINT_PACKAGES } from "@/lib/payment/types";

interface PaypalPaymentProps {
    packageId: string;
    amount?: number;
    currency?: string;
    onSuccess: () => void;
}

export const PaypalButton = ({ packageId, amount, currency = "USD", onSuccess }: PaypalPaymentProps) => {
    const selectedPackage = POINT_PACKAGES.find(p => p.id === packageId);

    if (!selectedPackage) return null;

    // 전달받은 금액이 없으면 기본값 (Fallback) - 현재는 무조건 props로 전달됨을 가정
    const finalAmount = amount ? amount.toString() : selectedPackage.priceUSD.toString();
    const finalCurrency = currency;

    return (
        <div className="w-full z-10 relative">
            <PayPalScriptProvider options={{
                clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
                currency: finalCurrency,
                intent: "capture"
            }}>
                <PayPalButtons
                    style={{ layout: "horizontal", height: 45, tagline: false }}
                    createOrder={(data: any, actions: any) => {
                        return actions.order.create({
                            purchase_units: [
                                {
                                    description: selectedPackage.name,
                                    amount: {
                                        value: finalAmount,
                                        currency_code: finalCurrency
                                    },
                                },
                            ],
                            intent: "CAPTURE"
                        });
                    }}
                    onApprove={async (data: any, actions: any) => {
                        try {
                            const details = await actions.order?.capture();
                            // console.log("Payment Successful:", details);

                            // 서버에 포인트 충전 요청
                            const res = await fetch('/api/payments/paypal/complete', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    orderId: data.orderID,
                                    packageId: packageId,
                                    userId: details?.payer?.payer_id // 실제로는 세션의 유저 ID 사용
                                })
                            });

                            if (res.ok) {
                                toast.success(`${selectedPackage.points}포인트가 충전되었습니다!`);
                                onSuccess();
                            } else {
                                toast.error("결제는 성공했으나 포인트 충전에 실패했습니다. 문의해주세요.");
                            }
                        } catch (err) {
                            console.error("Payment Error:", err);
                            toast.error("결제 처리 중 오류가 발생했습니다.");
                        }
                    }}
                    onError={(err: any) => {
                        console.error("PayPal Error:", err);
                        toast.error("PayPal 결제 연결에 실패했습니다.");
                    }}
                />
            </PayPalScriptProvider>
        </div>
    );
};
