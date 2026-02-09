import React from 'react';

import { AuthScreenWrapper } from '../../components/auth/AuthScreenWrapper';
import { VerifyEmailForm } from '../../components/auth/VerifyEmailForm';

export default function VerifyEmailScreen() {
  return (
    <AuthScreenWrapper
      screenTitle="Verify Email"
      title="Almost There!"
      subtitle="Verify your email to complete your registration"
      logoSize="small">
      <VerifyEmailForm />
    </AuthScreenWrapper>
  );
}
