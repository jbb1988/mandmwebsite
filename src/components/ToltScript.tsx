'use client';

import { useEffect } from 'react';

export function ToltScript() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.tolt.io/tolt.js';
    script.setAttribute('data-tolt', 'pk_knKjzY4oMarf4aSoCo2PzzKz');
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
}
