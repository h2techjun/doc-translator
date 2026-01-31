'use client';

import { useEffect } from 'react';

export default function AdSense() {
    useEffect(() => {
        // 1. Google AdSense
        if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
            const adsScript = document.createElement('script');
            adsScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8134930906845147';
            adsScript.async = true;
            // Removed crossOrigin to match default browser preload mode if it exists
            document.head.appendChild(adsScript);
        }

        // 2. Funding Choices
        if (!document.querySelector('script[src*="fundingchoicesmessages"]')) {
            const fcScript = document.createElement('script');
            fcScript.src = 'https://fundingchoicesmessages.google.com/i/pub-8134930906845147?ers=1';
            fcScript.async = true;
            document.head.appendChild(fcScript);
        }

        // 3. Signal Google FC Present
        if (!window.frames['googlefcPresent']) {
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
