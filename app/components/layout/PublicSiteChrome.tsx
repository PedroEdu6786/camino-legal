"use client";

import { Suspense, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AnalyticsScripts from '../ui/AnalyticsScripts';
import SectionViewTracker from '../ui/SectionViewTracker';
import ConsentBanner from '../ui/ConsentBanner';
import MotionEnhancer from '../ui/MotionEnhancer';
import Navbar from './Navbar';
import { publicAnalyticsPath } from '../../lib/measurement/contracts';
import { suspendMarketingCollection } from '../../lib/analytics';

/** A fresh document at the admin boundary prevents already-loaded SDK auto collection. */
export default function PublicSiteChrome() {
  const path = usePathname();
  useEffect(() => {
    const startsPublic = publicAnalyticsPath(window.location.pathname);
    const push = history.pushState;
    const replace = history.replaceState;
    function wrap(original: typeof push): typeof push {
      return function (state, unused, url) {
        const target = url == null ? window.location.pathname : new URL(String(url), window.location.href).pathname;
        if (publicAnalyticsPath(target) !== startsPublic) {
          // Disable before history mutation, while the SDK still has the public URL.
          suspendMarketingCollection();
          window.location.assign(String(url));
          return;
        }
        return original.call(history, state, unused, url);
      };
    }
    const wrappedPush = wrap(push), wrappedReplace = wrap(replace);
    history.pushState = wrappedPush; history.replaceState = wrappedReplace;
    function onPop() {
      if (publicAnalyticsPath(window.location.pathname) !== startsPublic) {
        suspendMarketingCollection();
        window.location.reload();
      }
    }
    window.addEventListener('popstate', onPop);
    return () => {
      if (history.pushState === wrappedPush) history.pushState = push;
      if (history.replaceState === wrappedReplace) history.replaceState = replace;
      window.removeEventListener('popstate', onPop);
    };
  }, []);
  if (!publicAnalyticsPath(path)) return null;
  return <><Suspense fallback={null}><AnalyticsScripts /><SectionViewTracker /></Suspense><ConsentBanner /><Navbar /><MotionEnhancer /></>;
}
