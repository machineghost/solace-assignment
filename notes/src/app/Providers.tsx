'use client';

import { ConfirmProvider } from 'material-ui-confirm';
import { PropsWithChildren } from 'react';

// NOTE: This file is necessary to keep the context providers in a client-only file
export function Providers({ children }: PropsWithChildren) {
  return <ConfirmProvider>{children}</ConfirmProvider>;
}
