'use client';

import { useEffect, useRef } from 'react';
import useDrivePicker from 'react-google-drive-picker';
import { Button } from '@/components/ui/button';
import { Cloud } from 'lucide-react';

interface GoogleDrivePickerProps {
    onSelect: (file: DriveFile) => void;
    onError?: (error: any) => void;
}

export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    sizeBytes?: number;
    url: string;
    iconUrl: string;
    oauthToken: string; // Required for backend download
}

export function GoogleDrivePicker({ onSelect, onError }: GoogleDrivePickerProps) {
    const [openPicker, authResponse] = useDrivePicker();
    const authRef = useRef<any>(null);

    // Sync authResponse to ref to avoid stale closures in callback
    useEffect(() => {
        if (authResponse) {
            authRef.current = authResponse;
        }
    }, [authResponse]);

    // Redesigned Open Picker Handler
    const handleOpenPicker = () => {
        openPicker({
            clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            developerKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY!,
            viewId: "DOCS",
            showUploadView: true,
            showUploadFolders: true,
            supportDrives: true,
            multiselect: false,
            // Ensure we ask for the correct scope to get the token
            customScopes: ['https://www.googleapis.com/auth/drive.readonly'],
            callbackFunction: (data) => {
                if (data.action === 'cancel') return;

                if (data.action === 'picked') {
                    const doc = data.docs[0];

                    // Multi-layered token retrieval with safe checks
                    const gapiToken = (window as any).gapi?.auth?.getToken?.()?.access_token;
                    const googleToken = (window as any).google?.accounts?.oauth2?.getToken?.()?.access_token;

                    const token =
                        (data as any).accessToken ||
                        authRef.current?.access_token ||
                        gapiToken ||
                        googleToken;

                    if (!token) {
                        const errorMsg = 'Authentication failed. Please check your Google account and try again.';
                        console.error('Picker Debug:', {
                            pickedData: data,
                            refToken: authRef.current?.access_token,
                            gapiToken,
                            googleToken
                        });
                        onError?.(errorMsg);
                        return;
                    }

                    onSelect({
                        id: doc.id,
                        name: doc.name,
                        mimeType: doc.mimeType,
                        sizeBytes: doc.sizeBytes,
                        url: doc.url,
                        iconUrl: doc.iconUrl,
                        oauthToken: token
                    });
                }
            },
        });
    };

    return (
        <Button
            variant="outline"
            onClick={handleOpenPicker}
            className="
                relative overflow-hidden group/drive
                w-56 h-16 shrink-0
                rounded-2xl border border-border
                bg-background hover:bg-primary/5 hover:border-primary/40
                transition-all duration-300 shadow-sm hover:shadow-md
                flex items-center justify-center gap-3 p-0
            "
        >
            {/* Background Shine Animation */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-transparent -translate-x-full group-hover/drive:animate-shine" />

            <Cloud className="w-6 h-6 text-primary animate-pulse-subtle" />
            <span className="font-bold text-sm tracking-tight text-foreground">Google Drive</span>
        </Button>
    );
}
