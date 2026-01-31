'use client';

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from "sonner";
import { POINT_PACKAGES } from "@/lib/payment/types";

interface PaypalPaymentProps {
    packageId: string;
    onSuccess: () => void;
}

export const PaypalButton = ({ packageId, onSuccess }: PaypalPaymentProps) => {
    const selectedPackage = POINT_PACKAGES.find(p => p.id === packageId);

    if (!selectedPackage) return null;

    // 환율 대략 계산 (1 KRW = 0.00075 USD 가정, PayPal은 USD 결제가 일반적이나 KRW도 지원함)
    // 여기서는 KRW 그대로 시도하되, PayPal 설정에 따라 다를 수 있음.
    // 안전하게 USD로 변환해서 요청하거나 KRW를 지원하는지 확인 필요.
    // 일단 KRW로 요청.
    const amount = selectedPackage.price.toString();

    return (
        <div className="w-full z-10 relative">
            <PayPalScriptProvider options={{
                clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
                currency: "USD", // KRW는 PayPal 기본 지원 통화가 아닐 수 있어 USD로 설정 권장
                intent: "capture"
            }}>
                <PayPalButtons
                    style={{ layout: "horizontal", height: 45, tagline: false, text: false }}
                    createOrder={(data, actions) => {
                        // 5000 KRW -> approx 3.8 USD (고정 환율 또는 실시간 환율 적용 필요)
                        // 여기서는 데모를 위해 5000원을 $4.99로 가정하거나 
                        // 실제로는 서버에서 Order를 생성해서 반환하는 것이 가장 안전함.
                        // *** 중요: 클라이언트에서 금액 조작 가능성 있으므로, 
                        // 실제 구현 시에는 /api/payments/create-order 호출을 권장.
                        // 여기서는 간단한 데모를 위해 클라이언트에서 처리.

                        return actions.order.create({
                            purchase_units: [
                                {
                                    description: selectedPackage.name,
                                    amount: {
                                        // value: amount, // KRW
                                        // currency_code: "KRW"
                                        value: "4.99", // $4.99 ~ 5000 KRW
                                        currency_code: "USD"
                                    },
                                },
                            ],
                            intent: "CAPTURE"
                        });
                    }}
                    onApprove={async (data, actions) => {
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
                    onError={(err) => {
                        console.error("PayPal Error:", err);
                        toast.error("PayPal 결제 연결에 실패했습니다.");
                    }}
                />
            </PayPalScriptProvider>
        </div>
    );
};
