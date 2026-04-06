'use client';

import { useEffect } from 'react';

export default function BootstrapClient() {
  useEffect(() => {
    // @ts-expect-error - Bootstrap JS doesn't have type declarations
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return null;
}
