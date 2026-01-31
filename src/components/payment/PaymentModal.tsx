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

                <div className="mt-4 space-y-4">
                    {/* 🚧 베타 테스트 안내 문구 */}
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3">
                        <Zap className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-yellow-500">결제 시스템 점검 중 (Beta)</h4>
                            <p className="text-xs text-yellow-200/70 leading-relaxed">
                                현재 베타 테스트 기간으로 실제 결제 기능은 잠시 제한되어 있습니다.<br />
                                포인트 부족 시 <b>광고 시청 리워드(+5P)</b>를 이용해 주세요.
                            </p>
                        </div>
                    </div>

                    {/* <PaypalButton 
                        packageId={pkg.id} 
                        onSuccess={() => {
                            onClose();
                            window.location.reload(); 
                        }} 
                    /> */}

                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-sm transition-colors"
                    >
                        닫기 (Close)
                    </button>
                </div>

                <p className="text-[10px] text-zinc-500 text-center mt-2">
                    * PayPal을 통해 안전하게 결제됩니다. (USD로 환산되어 결제될 수 있습니다)
                </p>
            </DialogContent>
        </Dialog>
    );
};
