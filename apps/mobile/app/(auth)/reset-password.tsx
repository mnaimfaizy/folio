import React from 'react';

import { AuthScreenWrapper } from '../../components/auth/AuthScreenWrapper';
import { ResetPasswordForm } from '../../components/auth/ResetPasswordForm';

export default function ResetPasswordScreen() {
  return (
    <AuthScreenWrapper
      screenTitle="Reset Password"
      title="Reset Password"
      subtitle="Create a new secure password for your account"
      logoSize="small">
      <ResetPasswordForm />
    </AuthScreenWrapper>
  );
}
