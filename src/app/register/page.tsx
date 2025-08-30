'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, Eye, EyeOff, Loader2, Building, Users } from 'lucide-react';

const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase and number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  businessName: z
    .string()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name cannot exceed 100 characters'),
  businessType: z.enum(['spa', 'salon', 'wellness'], {
    errorMap: () => ({ message: 'Please select your business type' }),
  }),
  role: z.enum(['manager', 'staff'], {
    errorMap: () => ({ message: 'Please select your role' }),
  }),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const watchedRole = watch('role');
  const watchedBusinessType = watch('businessType');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    
    try {
      await registerUser(
        data.email,
        data.password,
        data.businessName,
        data.businessType,
        data.role
      );
      toast.success('Account created successfully! Redirecting...');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 to-earth-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-sage-300 rounded-full flex items-center justify-center mb-6">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-earth-800 mb-3">
            Welcome to Upsell Agent
          </h1>
          <p className="text-lg text-earth-600 mb-8">
            Create your sales training platform account
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm py-8 px-8 shadow-spa-lg rounded-2xl border border-sage-100/50" style={{ boxShadow: 'var(--shadow-lg)' }}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  placeholder="your.email@business.com"
                  disabled={isLoading || isSubmitting}
                />
                {errors.email && (
                  <p className="text-sm text-accent-coral flex items-center gap-1 mt-1">
                    <span className="w-4 h-4">⚠</span>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Business Information */}
              <div className="space-y-2">
                <label htmlFor="businessName" className="block text-sm font-medium text-earth-700">
                  Business Name <span className="text-accent-coral">*</span>
                </label>
                <input
                  {...register('businessName')}
                  type="text"
                  id="businessName"
                  autoComplete="organization"
                  className={`w-full px-4 py-3 border-2 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sage-300/50 focus:border-sage-300 ${errors.businessName ? 'border-accent-coral bg-red-50/30' : 'border-sage-200 hover:border-sage-300'}`}
                  placeholder="Your Business Name"
                  disabled={isLoading || isSubmitting}
                />
                {errors.businessName && (
                  <p className="text-sm text-accent-coral flex items-center gap-1 mt-1">
                    <span className="w-4 h-4">⚠</span>
                    {errors.businessName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="businessType" className="block text-sm font-medium text-earth-700">
                  Business Type <span className="text-accent-coral">*</span>
                </label>
                <div className="relative">
                  <select
                    {...register('businessType')}
                    id="businessType"
                    className={`w-full px-4 py-3 border-2 rounded-xl bg-white/70 backdrop-blur-sm appearance-none transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sage-300/50 focus:border-sage-300 ${errors.businessType ? 'border-accent-coral bg-red-50/30' : 'border-sage-200 hover:border-sage-300'}`}
                    disabled={isLoading || isSubmitting}
                  >
                    <option value="">Choose your business type</option>
                    <option value="spa">Day Spa & Medical Spa</option>
                    <option value="salon">Hair & Beauty Salon</option>
                    <option value="wellness">Wellness & Massage Center</option>
                  </select>
                  <Building 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none text-sage-400" 
                  />
                </div>
                {errors.businessType && (
                  <p className="text-sm text-accent-coral flex items-center gap-1 mt-1">
                    <span className="w-4 h-4">⚠</span>
                    {errors.businessType.message}
                  </p>
                )}
              </div>

              {/* Role Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-earth-700">
                  Your Role <span className="text-accent-coral">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      {...register('role')}
                      type="radio"
                      value="manager"
                      id="role-manager"
                      className="peer hidden"
                      disabled={isLoading || isSubmitting}
                    />
                    <label 
                      htmlFor="role-manager"
                      className={`flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md ${
                        watchedRole === 'manager' 
                          ? 'border-sage-300 bg-sage-50/80 shadow-sage' 
                          : 'border-sage-200/60 bg-white/40 hover:border-sage-300 hover:bg-sage-50/40'
                      }`}
                    >
                      <div className="text-center">
                        <Building className={`w-6 h-6 mx-auto mb-2 ${
                          watchedRole === 'manager' ? 'text-sage-500' : 'text-earth-400'
                        }`} />
                        <div className="font-medium text-earth-700">Manager</div>
                        <div className="text-xs text-earth-500 mt-1">
                          Full access & team management
                        </div>
                      </div>
                    </label>
                  </div>

                  <div>
                    <input
                      {...register('role')}
                      type="radio"
                      value="staff"
                      id="role-staff"
                      className="peer hidden"
                      disabled={isLoading || isSubmitting}
                    />
                    <label 
                      htmlFor="role-staff"
                      className={`flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md ${
                        watchedRole === 'staff' 
                          ? 'border-sage-300 bg-sage-50/80 shadow-sage' 
                          : 'border-sage-200/60 bg-white/40 hover:border-sage-300 hover:bg-sage-50/40'
                      }`}
                    >
                      <div className="text-center">
                        <Users className={`w-6 h-6 mx-auto mb-2 ${
                          watchedRole === 'staff' ? 'text-sage-500' : 'text-earth-400'
                        }`} />
                        <div className="font-medium text-earth-700">Staff</div>
                        <div className="text-xs text-earth-500 mt-1">
                          Access product materials & training
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
                {errors.role && (
                  <p className="text-sm text-accent-coral flex items-center gap-1 mt-2">
                    <span className="w-4 h-4">⚠</span>
                    {errors.role.message}
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
                    autoComplete="new-password"
                    className={`w-full px-4 py-3 pr-12 border-2 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sage-300/50 focus:border-sage-300 ${errors.password ? 'border-accent-coral bg-red-50/30' : 'border-sage-200 hover:border-sage-300'}`}
                    placeholder="Create a secure password"
                    disabled={isLoading || isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
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
                <p className="text-xs text-earth-500 mt-1 flex items-center gap-1">
                  <span className="w-3 h-3">🔒</span>
                  At least 8 characters with uppercase, lowercase & numbers
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-earth-700">
                  Confirm Password <span className="text-accent-coral">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    autoComplete="new-password"
                    className={`w-full px-4 py-3 pr-12 border-2 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sage-300/50 focus:border-sage-300 ${errors.confirmPassword ? 'border-accent-coral bg-red-50/30' : 'border-sage-200 hover:border-sage-300'}`}
                    placeholder="Confirm your password"
                    disabled={isLoading || isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sage-400 hover:text-sage-500 transition-colors"
                    disabled={isLoading || isSubmitting}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-accent-coral flex items-center gap-1 mt-1">
                    <span className="w-4 h-4">⚠</span>
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start gap-3 pt-2">
                <input
                  {...register('agreedToTerms')}
                  type="checkbox"
                  id="agreedToTerms"
                  className="w-5 h-5 mt-0.5 rounded-md border-2 border-sage-300 text-sage-500 focus:ring-sage-300/50 focus:ring-2 bg-white/70"
                  disabled={isLoading || isSubmitting}
                />
                <label htmlFor="agreedToTerms" className="text-sm text-earth-600 leading-relaxed">
                  I agree to the{' '}
                  <Link 
                    href="/terms" 
                    className="font-medium text-sage-600 hover:text-sage-700 underline decoration-sage-300 underline-offset-2 transition-colors"
                  >
                    Terms and Conditions
                  </Link>
                  {' '}and{' '}
                  <Link 
                    href="/privacy" 
                    className="font-medium text-sage-600 hover:text-sage-700 underline decoration-sage-300 underline-offset-2 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  {errors.agreedToTerms && (
                    <p className="text-sm text-accent-coral flex items-center gap-1 mt-1">
                      <span className="w-4 h-4">⚠</span>
                      {errors.agreedToTerms.message}
                    </p>
                  )}
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || isSubmitting}
                className="w-full bg-gradient-to-r from-sage-400 to-sage-500 hover:from-sage-500 hover:to-sage-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sage-300/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading || isSubmitting ? (
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating your wellness account...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <UserPlus className="w-5 h-5" />
                    <span>Create Wellness Account</span>
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
                  Already have a wellness account?
                </span>
              </div>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 border-2 border-sage-300 text-sage-600 font-medium rounded-xl bg-white/50 backdrop-blur-sm hover:bg-sage-50/80 hover:border-sage-400 hover:text-sage-700 transition-all duration-300 transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-sage-300/50 focus:ring-offset-2"
            >
              <span>Sign into your account</span>
              <span className="text-sm">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}