import React from 'react';

import { AuthScreenWrapper } from '../../components/auth/AuthScreenWrapper';
import { PasswordResetForm } from '../../components/auth/PasswordResetForm';

export default function ForgotPasswordScreen() {
  return (
    <AuthScreenWrapper
      screenTitle="Forgot Password"
      title="Forgot Password?"
      subtitle="No worries, we'll help you reset it"
      logoSize="small">
      <PasswordResetForm />
    </AuthScreenWrapper>
  );
}
