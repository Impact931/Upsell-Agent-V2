'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, Eye, EyeOff, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    try {
      await login(data.email, data.password);
      toast.success('Welcome back! Redirecting to your dashboard...');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h1 className="heading-2 text-center mb-2">
              Welcome back
            </h1>
            <p className="body-base text-center mb-8" style={{ color: 'var(--neutral-600)' }}>
              Sign in to your Upsell Agent account
            </p>
          </div>

          <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10" style={{ boxShadow: 'var(--shadow-lg)' }}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="form-group">
                <label htmlFor="email" className="form-label form-label--required">
                  Email Address
                </label>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  autoComplete="email"
                  className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter your email address"
                  disabled={isLoading || isSubmitting}
                />
                {errors.email && (
                  <p className="form-error">{errors.email.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label form-label--required">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    className={`form-input pr-12 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="Enter your password"
                    disabled={isLoading || isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isLoading || isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" style={{ color: 'var(--neutral-400)' }} />
                    ) : (
                      <Eye className="h-5 w-5" style={{ color: 'var(--neutral-400)' }} />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="form-error">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    style={{ accentColor: 'var(--primary-teal)' }}
                  />
                  <label htmlFor="remember-me" className="ml-2 block body-small">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link 
                    href="/forgot-password" 
                    className="font-medium hover:opacity-80 transition-opacity"
                    style={{ color: 'var(--primary-teal)' }}
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || isSubmitting}
                className="btn btn--primary w-full"
              >
                {isLoading || isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign in
                  </>
                )}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: 'var(--neutral-300)' }} />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white body-small" style={{ color: 'var(--neutral-500)' }}>
                    New to Upsell Agent?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/register"
                  className="btn btn--secondary w-full"
                >
                  Create your account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Marketing content */}
      <div 
        className="hidden lg:block relative w-0 flex-1"
        style={{ backgroundColor: 'var(--primary-teal-pale)' }}
      >
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md text-center">
            <div 
              className="w-16 h-16 mx-auto mb-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary-teal)' }}
            >
              <LogIn className="w-8 h-8" style={{ color: 'var(--white)' }} />
            </div>
            <h2 className="heading-3 mb-4" style={{ color: 'var(--neutral-900)' }}>
              Transform Your Sales Training
            </h2>
            <p className="body-base mb-8" style={{ color: 'var(--neutral-700)' }}>
              Generate AI-powered training materials for your spa or salon team in minutes. 
              Boost sales performance with customized scripts and guides.
            </p>
            <div className="space-y-4 text-left">
              <div className="flex items-center">
                <div 
                  className="w-2 h-2 rounded-full mr-3"
                  style={{ backgroundColor: 'var(--success)' }}
                />
                <span className="body-small" style={{ color: 'var(--neutral-700)' }}>
                  Upload product information in seconds
                </span>
              </div>
              <div className="flex items-center">
                <div 
                  className="w-2 h-2 rounded-full mr-3"
                  style={{ backgroundColor: 'var(--success)' }}
                />
                <span className="body-small" style={{ color: 'var(--neutral-700)' }}>
                  Get customized training materials instantly
                </span>
              </div>
              <div className="flex items-center">
                <div 
                  className="w-2 h-2 rounded-full mr-3"
                  style={{ backgroundColor: 'var(--success)' }}
                />
                <span className="body-small" style={{ color: 'var(--neutral-700)' }}>
                  Share with your team on any device
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}