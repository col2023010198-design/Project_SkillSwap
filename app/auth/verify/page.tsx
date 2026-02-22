import { Suspense } from 'react';
import VerifyClient from './VerifyClient';

export default function VerificationPage() {
  return (
    <Suspense fallback={null}>
      <VerifyClient />
    </Suspense>
  );
}
