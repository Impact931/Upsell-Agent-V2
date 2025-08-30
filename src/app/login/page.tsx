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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-primary-50 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-50 via-secondary-50 to-neutral-50 px-8 pt-12 pb-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <LogIn className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-900 to-secondary-900 bg-clip-text text-transparent mb-3">
              Welcome Back to Upsell Agent
            </h1>
            <p className="text-secondary-900/80 text-lg font-medium">
              Sign in to your sales training platform
            </p>
          </div>
          
          <div className="px-8 py-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-primary-900 mb-3">
                  Email Address
                </label>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  autoComplete="email"
                  className={`w-full px-6 py-4 border-2 rounded-2xl bg-gradient-to-r from-white to-primary-50/30 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 text-neutral-900 placeholder-secondary-900/60 ${
                    errors.email 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-primary-500/30 hover:border-primary-500/50 hover:shadow-md'
                  }`}
                  placeholder="your.email@business.com"
                  disabled={isLoading || isSubmitting}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-2 mt-3 bg-red-50 px-4 py-2 rounded-xl border border-red-200">
                    <span className="text-red-500">⚠</span>
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-primary-900 mb-3">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    className={`w-full px-6 py-4 pr-14 border-2 rounded-2xl bg-gradient-to-r from-white to-primary-50/30 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 text-neutral-900 placeholder-secondary-900/60 ${
                      errors.password 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-primary-500/30 hover:border-primary-500/50 hover:shadow-md'
                    }`}
                    placeholder="Enter your password"
                    disabled={isLoading || isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-primary-500 hover:text-primary-900 transition-colors duration-200"
                    disabled={isLoading || isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-6 w-6" />
                    ) : (
                      <Eye className="h-6 w-6" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-center gap-2 mt-3 bg-red-50 px-4 py-2 rounded-xl border border-red-200">
                    <span className="text-red-500">⚠</span>
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="w-5 h-5 text-primary-500 bg-white border-primary-500/50 rounded-lg focus:ring-primary-500 focus:ring-2 focus:ring-offset-2"
                  />
                  <label htmlFor="remember-me" className="ml-3 text-sm font-medium text-secondary-900">
                    Keep me signed in
                  </label>
                </div>

                <Link 
                  href="/forgot-password" 
                  className="text-sm font-semibold text-primary-500 hover:text-primary-900 hover:underline transition-all duration-200"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading || isSubmitting}
                className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-900 hover:to-secondary-900 text-white font-bold py-5 px-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/25 focus:outline-none focus:ring-4 focus:ring-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading || isSubmitting ? (
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-lg">Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <LogIn className="w-6 h-6" />
                    <span className="text-lg font-semibold">Sign In to Upsell Agent</span>
                  </div>
                )}
              </button>
            </form>
          </div>

          <div className="px-8 pb-10">
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary-500/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-6 bg-white text-secondary-900 font-semibold">
                  New to Upsell Agent?
                </span>
              </div>
            </div>

            <Link
              href="/register"
              className="w-full inline-flex items-center justify-center gap-3 py-4 px-8 border-2 border-primary-500/30 text-secondary-900 font-semibold rounded-2xl bg-gradient-to-r from-white to-primary-50/30 hover:from-primary-50 hover:to-secondary-50/50 hover:border-primary-500/50 hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-500/20 transform hover:scale-[1.02]"
            >
              <span className="text-lg">Create your account</span>
              <span className="text-primary-500 font-bold">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}