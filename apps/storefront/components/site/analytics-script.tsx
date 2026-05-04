import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// Renders the GA4 snippet only when NEXT_PUBLIC_GA_ID is configured.
// Strategy="afterInteractive" so it loads after hydration and doesn't block
// the initial paint.
export function AnalyticsScript() {
  if (!GA_ID) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          // anonymize_ip + cookie-flagged samesite to be friendlier on JM
          // privacy expectations; can revisit if we want full attribution.
          gtag('config', '${GA_ID}', {
            anonymize_ip: true,
            cookie_flags: 'SameSite=None;Secure',
          });
        `}
      </Script>
    </>
  );
}
