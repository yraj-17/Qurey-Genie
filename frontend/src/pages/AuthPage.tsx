import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';

const AuthPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSignup, setIsSignup] = useState(searchParams.get('mode') === 'signup');

  const switchToSignup = () => {
    setIsSignup(true);
    setSearchParams({ mode: 'signup' });
  };

  const switchToLogin = () => {
    setIsSignup(false);
    setSearchParams({});
  };

  return (
    <AuthLayout 
      title={isSignup ? 'Create Account' : 'Welcome Back'}
      subtitle={isSignup 
        ? 'Join Query Genie and unlock AI-powered database interactions' 
        : 'Sign in to continue your database journey'
      }
    >
      {isSignup ? (
        <SignupForm onSwitchToLogin={switchToLogin} />
      ) : (
        <LoginForm onSwitchToSignup={switchToSignup} />
      )}
    </AuthLayout>
  );
};

export default AuthPage;
