'use client';

import { useEffect } from 'react';

export default function AdSense() {
    useEffect(() => {
        // 1. Load AdSense
        const adsScript = document.createElement('script');
        adsScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8134930906845147';
        adsScript.async = true;
        adsScript.crossOrigin = 'anonymous';
        document.body.appendChild(adsScript);

        // 2. Load Funding Choices
        const fcScript = document.createElement('script');
        fcScript.src = 'https://fundingchoicesmessages.google.com/i/pub-8134930906845147?ers=1';
        fcScript.async = true;
        // Note: No crossOrigin for funding choices based on previous CORS error
        document.body.appendChild(fcScript);

        // 3. Signal Google FC Present
        const signalScript = document.createElement('script');
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
        document.body.appendChild(signalScript);

        return () => {
            // Optional: cleanup if needed, but usually third-party scripts stay
        };
    }, []);

    return null;
}
