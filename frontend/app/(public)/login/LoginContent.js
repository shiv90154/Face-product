'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  // Your login form logic here (use redirect)
  return (
    <div>
      {/* your login form */}
      <p>Redirect to: {redirect}</p>
    </div>
  );
}

export default function LoginContent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}