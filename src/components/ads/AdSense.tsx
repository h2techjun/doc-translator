'use client';

import { useEffect } from 'react';

/**
 * 🛡️ Third Party Scripts Manager
 * Handles AdSense, Funding Choices, and Google Analytics dynamically 
 * to avoid Next.js's data-nscript and preload warnings.
 */
export default function AdSense() {
    useEffect(() => {
        // 1. Google AdSense
        if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
            const adsScript = document.createElement('script');
            adsScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8134930906845147';
            adsScript.async = true;
            document.head.appendChild(adsScript);
        }

        // 2. Funding Choices
        if (!document.querySelector('script[src*="fundingchoicesmessages"]')) {
            const fcScript = document.createElement('script');
            fcScript.src = 'https://fundingchoicesmessages.google.com/i/pub-8134930906845147?ers=1';
            fcScript.async = true;
            document.head.appendChild(fcScript);
        }

        // 3. Google Analytics (gtag.js)
        const gaId = 'G-W3S70Y9F7L'; // From NEXT_PUBLIC_GOOGLE_ANALYTICS
        if (gaId && !document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${gaId}"]`)) {
            // a. Base gtag script
            const gaScript = document.createElement('script');
            gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
            gaScript.async = true;
            document.head.appendChild(gaScript);

            // b. Config script
            const configScript = document.createElement('script');
            configScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}');
      `;
            document.head.appendChild(configScript);
        }

        // 4. Signal Google FC Present
        if (!(window.frames as any)['googlefcPresent']) {
            const signalScript = document.createElement('script');
            signalScript.id = 'google-fc-present-logic';
            signalScript.innerHTML = `
        (function() {
          function signalGooglefcPresent() {
            if (!window.frames['googlefcPresent']) {
              if (document.body) {
                const iframe = document.createElement('iframe');
                iframe.style = 'width: 0; height: 0; border: none; z-index: -1000; left: -1000px; top: -1000px; display: none;';
                iframe.name = 'googlefcPresent';
                document.body.appendChild(iframe);
              } else {
                setTimeout(signalGooglefcPresent, 0);
              }
            }
          }
          signalGooglefcPresent();
        })();
      `;
            document.head.appendChild(signalScript);
        }
    }, []);

    return null;
}
