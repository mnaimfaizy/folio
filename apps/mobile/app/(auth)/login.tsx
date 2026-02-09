import React from 'react';

import { AuthScreenWrapper } from '../../components/auth/AuthScreenWrapper';
import { LoginForm } from '../../components/auth/LoginForm';

export default function LoginScreen() {
  return (
    <AuthScreenWrapper
      screenTitle="Login"
      title="Welcome back!"
      subtitle="Sign in to continue to your account"
      logoSize="medium">
      <LoginForm />
    </AuthScreenWrapper>
  );
}
