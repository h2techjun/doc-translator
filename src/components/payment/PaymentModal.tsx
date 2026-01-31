'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PaypalButton } from "./PaypalButton";
import { POINT_PACKAGES } from "@/lib/payment/types";
import { Zap } from "lucide-react";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    packageId: string;
}

export const PaymentModal = ({ isOpen, onClose, packageId }: PaymentModalProps) => {
    const pkg = POINT_PACKAGES.find(p => p.id === packageId);

    if (!pkg) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Zap className="w-5 h-5 text-amber-500 fill-current" />
                        {pkg.name}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        {pkg.desc}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-4">
                    <div className="flex justify-between items-center p-4 bg-zinc-800/50 rounded-lg">
                        <span className="text-zinc-300">충전 포인트</span>
                        <span className="text-2xl font-bold text-amber-500">{pkg.points}P</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-zinc-800/50 rounded-lg">
                        <span className="text-zinc-300">결제 금액</span>
                        <span className="text-xl font-bold text-white">₩{pkg.price.toLocaleString()}</span>
                    </div>
                </div>

                <div className="mt-4">
                    <PaypalButton
                        packageId={pkg.id}
                        onSuccess={() => {
                            onClose();
                            // 페이지 새로고침하여 포인트 반영 (또는 전역 상태 업데이트)
                            window.location.reload();
                        }}
                    />
                </div>

                <p className="text-[10px] text-zinc-500 text-center mt-2">
                    * PayPal을 통해 안전하게 결제됩니다. (USD로 환산되어 결제될 수 있습니다)
                </p>
            </DialogContent>
        </Dialog>
    );
};
