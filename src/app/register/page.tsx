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
    <div className="min-h-screen flex">
      {/* Left side - Registration form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h1 className="heading-2 text-center mb-2">
              Create your account
            </h1>
            <p className="body-base text-center mb-8" style={{ color: 'var(--neutral-600)' }}>
              Start generating AI-powered training materials today
            </p>
          </div>

          <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10" style={{ boxShadow: 'var(--shadow-lg)' }}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
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

              {/* Business Information */}
              <div className="form-group">
                <label htmlFor="businessName" className="form-label form-label--required">
                  Business Name
                </label>
                <input
                  {...register('businessName')}
                  type="text"
                  id="businessName"
                  autoComplete="organization"
                  className={`form-input ${errors.businessName ? 'border-red-500' : ''}`}
                  placeholder="Enter your business name"
                  disabled={isLoading || isSubmitting}
                />
                {errors.businessName && (
                  <p className="form-error">{errors.businessName.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="businessType" className="form-label form-label--required">
                  Business Type
                </label>
                <div className="relative">
                  <select
                    {...register('businessType')}
                    id="businessType"
                    className={`form-input appearance-none ${errors.businessType ? 'border-red-500' : ''}`}
                    disabled={isLoading || isSubmitting}
                  >
                    <option value="">Select your business type</option>
                    <option value="spa">Spa</option>
                    <option value="salon">Salon</option>
                    <option value="wellness">Wellness Center</option>
                  </select>
                  <Building 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none" 
                    style={{ color: 'var(--neutral-400)' }}
                  />
                </div>
                {errors.businessType && (
                  <p className="form-error">{errors.businessType.message}</p>
                )}
              </div>

              {/* Role Selection */}
              <div className="form-group">
                <label className="form-label form-label--required">
                  Your Role
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`
                    flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all
                    ${watchedRole === 'manager' 
                      ? 'border-teal-500 bg-teal-50' 
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `} style={{
                    borderColor: watchedRole === 'manager' ? 'var(--primary-teal)' : 'var(--neutral-300)',
                    backgroundColor: watchedRole === 'manager' ? 'var(--primary-teal-pale)' : 'transparent'
                  }}>
                    <input
                      {...register('role')}
                      type="radio"
                      value="manager"
                      className="sr-only"
                      disabled={isLoading || isSubmitting}
                    />
                    <div className="text-center">
                      <Building className="w-6 h-6 mx-auto mb-2" style={{ 
                        color: watchedRole === 'manager' ? 'var(--primary-teal)' : 'var(--neutral-600)'
                      }} />
                      <div className="font-medium">Manager</div>
                      <div className="text-xs" style={{ color: 'var(--neutral-600)' }}>
                        Upload materials, manage team
                      </div>
                    </div>
                  </label>

                  <label className={`
                    flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all
                    ${watchedRole === 'staff' 
                      ? 'border-teal-500 bg-teal-50' 
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `} style={{
                    borderColor: watchedRole === 'staff' ? 'var(--primary-teal)' : 'var(--neutral-300)',
                    backgroundColor: watchedRole === 'staff' ? 'var(--primary-teal-pale)' : 'transparent'
                  }}>
                    <input
                      {...register('role')}
                      type="radio"
                      value="staff"
                      className="sr-only"
                      disabled={isLoading || isSubmitting}
                    />
                    <div className="text-center">
                      <Users className="w-6 h-6 mx-auto mb-2" style={{ 
                        color: watchedRole === 'staff' ? 'var(--primary-teal)' : 'var(--neutral-600)'
                      }} />
                      <div className="font-medium">Staff Member</div>
                      <div className="text-xs" style={{ color: 'var(--neutral-600)' }}>
                        Access training materials
                      </div>
                    </div>
                  </label>
                </div>
                {errors.role && (
                  <p className="form-error">{errors.role.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="form-group">
                <label htmlFor="password" className="form-label form-label--required">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="new-password"
                    className={`form-input pr-12 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="Create a strong password"
                    disabled={isLoading || isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
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
                <p className="form-help">
                  Password must contain at least 8 characters with uppercase, lowercase, and numbers
                </p>
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label form-label--required">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    autoComplete="new-password"
                    className={`form-input pr-12 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    placeholder="Confirm your password"
                    disabled={isLoading || isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isLoading || isSubmitting}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" style={{ color: 'var(--neutral-400)' }} />
                    ) : (
                      <Eye className="h-5 w-5" style={{ color: 'var(--neutral-400)' }} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="form-error">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="form-group">
                <div className="flex items-start">
                  <input
                    {...register('agreedToTerms')}
                    type="checkbox"
                    id="agreedToTerms"
                    className="h-4 w-4 mt-1 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    style={{ accentColor: 'var(--primary-teal)' }}
                    disabled={isLoading || isSubmitting}
                  />
                  <label htmlFor="agreedToTerms" className="ml-3 body-small">
                    I agree to the{' '}
                    <Link 
                      href="/terms" 
                      className="font-medium hover:opacity-80 transition-opacity"
                      style={{ color: 'var(--primary-teal)' }}
                    >
                      Terms and Conditions
                    </Link>
                    {' '}and{' '}
                    <Link 
                      href="/privacy" 
                      className="font-medium hover:opacity-80 transition-opacity"
                      style={{ color: 'var(--primary-teal)' }}
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.agreedToTerms && (
                  <p className="form-error">{errors.agreedToTerms.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || isSubmitting}
                className="btn btn--primary w-full"
              >
                {isLoading || isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Create account
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
                    Already have an account?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/login"
                  className="btn btn--secondary w-full"
                >
                  Sign in instead
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Marketing content */}
      <div 
        className="hidden lg:block relative w-0 flex-1"
        style={{ backgroundColor: 'var(--secondary-sage-pale)' }}
      >
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md text-center">
            <div 
              className="w-16 h-16 mx-auto mb-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--secondary-sage)' }}
            >
              <UserPlus className="w-8 h-8" style={{ color: 'var(--white)' }} />
            </div>
            <h2 className="heading-3 mb-4" style={{ color: 'var(--neutral-900)' }}>
              Join the Future of Sales Training
            </h2>
            <p className="body-base mb-8" style={{ color: 'var(--neutral-700)' }}>
              Trusted by {watchedBusinessType === 'spa' ? 'spas' : watchedBusinessType === 'salon' ? 'salons' : 'wellness centers'} nationwide to transform their sales performance with AI-powered training.
            </p>
            <div className="space-y-4 text-left">
              <div className="flex items-center">
                <div 
                  className="w-2 h-2 rounded-full mr-3"
                  style={{ backgroundColor: 'var(--success)' }}
                />
                <span className="body-small" style={{ color: 'var(--neutral-700)' }}>
                  Free 14-day trial with full access
                </span>
              </div>
              <div className="flex items-center">
                <div 
                  className="w-2 h-2 rounded-full mr-3"
                  style={{ backgroundColor: 'var(--success)' }}
                />
                <span className="body-small" style={{ color: 'var(--neutral-700)' }}>
                  No credit card required to start
                </span>
              </div>
              <div className="flex items-center">
                <div 
                  className="w-2 h-2 rounded-full mr-3"
                  style={{ backgroundColor: 'var(--success)' }}
                />
                <span className="body-small" style={{ color: 'var(--neutral-700)' }}>
                  Cancel anytime, keep your data
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}