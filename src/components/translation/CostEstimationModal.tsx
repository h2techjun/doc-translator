"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, AlertTriangle, FileText, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { POINT_COSTS } from "@/lib/payment/types";

interface CostEstimationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    onCharge: () => void;
    file: File | null;
    driveFile: any | null; // using any for simplicity, can be DriveFile type
}

export function CostEstimationModal({
    isOpen,
    onClose,
    onConfirm,
    onCharge,
    file,
    driveFile
}: CostEstimationModalProps) {
    const [userPoints, setUserPoints] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // 파일 이름
    const fileName = file?.name || driveFile?.name || "Unknown File";

    // 예상 비용 (기본값)
    const baseCost = POINT_COSTS.BASE_COST;
    const extraCostPerPage = POINT_COSTS.ADDITIONAL_PAGE_COST;
    const basePages = POINT_COSTS.BASE_PAGES;

    useEffect(() => {
        if (isOpen) {
            fetchUserPoints();
        }
    }, [isOpen]);

    const fetchUserPoints = async () => {
        setIsLoading(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('points')
                    .eq('id', user.id)
                    .single();
                setUserPoints(data?.points || 0);
            } else {
                setUserPoints(0); // Guest likely has specific logic or 0
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const isSufficient = (userPoints || 0) >= baseCost;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <FileText className="w-5 h-5 text-blue-500" />
                        번역 예상 견적 (Estimation)
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        번역 작업을 시작하기 전에 포인트를 확인해주세요.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {/* File Info */}
                    <div className="p-3 bg-zinc-800/50 rounded-lg flex items-center justify-between">
                        <span className="text-sm text-zinc-400 truncate max-w-[200px]">{fileName}</span>
                        <span className="text-xs px-2 py-1 bg-zinc-700 rounded text-zinc-300">문서</span>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="space-y-2 border border-blue-500/20 bg-blue-500/5 p-4 rounded-xl">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-zinc-300">기본 요금 ({basePages}페이지 이내)</span>
                            <span className="font-bold text-white">{baseCost} P</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-zinc-500">
                            <span>초과 페이지당 (<span className="text-amber-500">{basePages + 1}p~</span>)</span>
                            <span>+{extraCostPerPage} P / page</span>
                        </div>
                        <div className="h-px bg-blue-500/20 my-2" />
                        <div className="flex justify-between items-center">
                            <span className="text-blue-400 font-bold">최소 필요 포인트</span>
                            <div className="flex items-center gap-1 text-xl font-black text-blue-400">
                                <Zap className="w-4 h-4 fill-current" />
                                {baseCost} P <span className="text-xs font-normal text-zinc-400 ml-1">(최소)</span>
                            </div>
                        </div>
                    </div>

                    {/* User Balance */}
                    <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                        <span className="text-sm text-zinc-400">현재 보유 포인트</span>
                        {isLoading ? (
                            <span className="animate-pulse w-10 h-4 bg-zinc-800 rounded"></span>
                        ) : (
                            <span className={`font-bold ${isSufficient ? 'text-emerald-400' : 'text-red-400'}`}>
                                {userPoints} P
                            </span>
                        )}
                    </div>

                    {!isSufficient && !isLoading && (
                        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 p-2 rounded">
                            <AlertTriangle className="w-4 h-4" />
                            포인트가 부족합니다. 충전 후 이용해주세요.
                        </div>
                    )}

                    <p className="text-[10px] text-zinc-500 text-center">
                        * 실제 페이지 수가 {basePages}페이지를 초과할 경우, 완료 시점에 추가 포인트가 차감될 수 있습니다.
                    </p>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto text-zinc-400 hover:text-white">
                        취소
                    </Button>
                    <Button
                        onClick={isSufficient ? onConfirm : onCharge}
                        disabled={isLoading}
                        className={`w-full sm:w-auto font-bold text-white ${isSufficient ? 'bg-blue-600 hover:bg-blue-500' : 'bg-amber-600 hover:bg-amber-500'}`}
                    >
                        {isSufficient ? "동의하고 번역 시작" : "포인트 충전하러 가기"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
