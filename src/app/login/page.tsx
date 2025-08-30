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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 to-earth-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-sage-300 rounded-full flex items-center justify-center mb-6">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-earth-800 mb-3">
            Welcome Back to Serenity
          </h1>
          <p className="text-lg text-earth-600 mb-8">
            Sign in to your wellness management platform
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm py-8 px-8 shadow-spa-lg rounded-2xl border border-sage-100/50">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-earth-700">
                  Email Address <span className="text-accent-coral">*</span>
                </label>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  autoComplete="email"
                  className={`w-full px-4 py-3 border-2 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sage-300/50 focus:border-sage-300 ${errors.email ? 'border-accent-coral bg-red-50/30' : 'border-sage-200 hover:border-sage-300'}`}
                  placeholder="your.email@spa.com"
                  disabled={isLoading || isSubmitting}
                />
                {errors.email && (
                  <p className="text-sm text-accent-coral flex items-center gap-1 mt-1">
                    <span className="w-4 h-4">⚠</span>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-earth-700">
                  Password <span className="text-accent-coral">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    className={`w-full px-4 py-3 pr-12 border-2 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sage-300/50 focus:border-sage-300 ${errors.password ? 'border-accent-coral bg-red-50/30' : 'border-sage-200 hover:border-sage-300'}`}
                    placeholder="Enter your secure password"
                    disabled={isLoading || isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sage-400 hover:text-sage-500 transition-colors"
                    disabled={isLoading || isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-accent-coral flex items-center gap-1 mt-1">
                    <span className="w-4 h-4">⚠</span>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="w-5 h-5 rounded-md border-2 border-sage-300 text-sage-500 focus:ring-sage-300/50 focus:ring-2 bg-white/70"
                  />
                  <label htmlFor="remember-me" className="text-sm text-earth-600">
                    Keep me signed in
                  </label>
                </div>

                <Link 
                  href="/forgot-password" 
                  className="text-sm font-medium text-sage-600 hover:text-sage-700 underline decoration-sage-300 underline-offset-2 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isSubmitting}
                className="w-full bg-gradient-to-r from-sage-400 to-sage-500 hover:from-sage-500 hover:to-sage-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sage-300/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading || isSubmitting ? (
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing into your spa...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <LogIn className="w-5 h-5" />
                    <span>Sign In to Serenity</span>
                  </div>
                )}
              </button>
            </form>

          <div className="mt-8 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-sage-200/60" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 text-earth-500 font-medium">
                  New to our wellness platform?
                </span>
              </div>
            </div>

            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 border-2 border-sage-300 text-sage-600 font-medium rounded-xl bg-white/50 backdrop-blur-sm hover:bg-sage-50/80 hover:border-sage-400 hover:text-sage-700 transition-all duration-300 transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-sage-300/50 focus:ring-offset-2"
            >
              <span>Create your wellness account</span>
              <span className="text-sm">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}