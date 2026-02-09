import React from 'react';

import { AuthScreenWrapper } from '../../components/auth/AuthScreenWrapper';
import { SignupForm } from '../../components/auth/SignupForm';

export default function SignupScreen() {
  return (
    <AuthScreenWrapper
      screenTitle="Sign Up"
      title="Create Account"
      subtitle="Sign up to get started with our library services"
      logoSize="small">
      <SignupForm />
    </AuthScreenWrapper>
  );
}
