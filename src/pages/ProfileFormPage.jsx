import React, { useState } from 'react';
import { User, Mail, Globe, BookOpen, Users, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { submitProfile } from '../api/profileApi';
import { getRecommendations } from '../api/recommendationApi';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

import FormInput from '../components/FormInput';

const ProfileFormPage = () => {
  const navigate = useNavigate();
  const { setUserProfile, setRecommendations } = useApp();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [budgetLabel, setBudgetLabel] = useState(2500000);  // ₹25L default

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: { 
      budget: 2500000,  // ₹25L default
      full_name: user?.name || '',
      email: user?.email || ''
    }
  });


  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        full_name: data.full_name,
        email: data.email,
        cgpa: parseFloat(data.cgpa),
        gre_score: parseInt(data.gre_score),
        ielts_score: parseFloat(data.ielts_score),
        preferred_country: data.preferred_country,
        course_interest: data.course_interest,
        budget: parseInt(data.budget),
        family_income: parseInt(data.family_income),
      };

      // Step 1: Save profile
      await submitProfile(payload);

      // Step 2: Get recommendations
      const recommendPayload = {
        cgpa: payload.cgpa,
        gre_score: payload.gre_score,
        budget: payload.budget,
        preferred_country: payload.preferred_country,
        course_interest: payload.course_interest,
      };
      const recommendations = await getRecommendations(recommendPayload);

      // Step 3: Store in global context (persists across pages)
      setUserProfile(payload);
      setRecommendations(recommendations);

      toast.success('Profile analyzed! Showing your university matches.');

      // Step 4: Redirect
      setTimeout(() => navigate('/recommendations', {
        state: { recommendations, profile: payload }
      }), 1600);

    } catch (error) {
      const msg = error.userMessage || 'Failed to submit profile. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Complete Your Profile</h1>
          <p className="text-gray-400 text-sm">
            Our AI uses this data to recommend the best universities and financial options for you.
          </p>

        </div>

        <div className="glass-card p-8 md:p-10">
          <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
            
            {/* Section 1: Personal */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-white border-b border-white/10 pb-2">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Full Name"
                  icon={User}
                  name="full_name"
                  placeholder="John Doe"
                  register={register}
                  error={errors.full_name}
                  validation={{ required: 'Full name is required', minLength: { value: 2, message: 'At least 2 characters' } }}
                />
                
                <FormInput
                  label="Email"
                  icon={Mail}
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  register={register}
                  error={errors.email}
                  validation={{ required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } }}
                />
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-400 mb-1">Annual Family Income (INR)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users className="h-5 w-5 text-gray-500" />
                    </div>
                    <select
                      {...register("family_income", { required: "Family income is required", valueAsNumber: true })}
                      className={`block w-full pl-10 pr-3 py-2.5 bg-surface border ${errors.family_income ? 'border-red-500' : 'border-white/10'} rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all`}
                    >
                      <option value="">Select income range</option>
                      <option value="300000">₹3L – ₹5L / year</option>
                      <option value="700000">₹5L – ₹10L / year</option>
                      <option value="1200000">₹10L – ₹20L / year</option>
                      <option value="2500000">₹20L+ / year</option>
                    </select>
                  </div>
                  {errors.family_income && <span className="text-red-400 text-xs mt-1 block">{errors.family_income.message}</span>}
                </div>
              </div>
            </div>

            {/* Section 2: Academics */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-white border-b border-white/10 pb-2">Academic Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormInput
                  label="CGPA (out of 10)"
                  name="cgpa"
                  type="number"
                  step="0.1"
                  placeholder="8.5"
                  register={register}
                  error={errors.cgpa}
                  validation={{ required: 'CGPA is required', min: { value: 0, message: 'Min 0' }, max: { value: 10, message: 'Max 10' } }}
                />
                
                <FormInput
                  label="GRE Score"
                  name="gre_score"
                  type="number"
                  placeholder="320"
                  register={register}
                  error={errors.gre_score}
                  validation={{ required: 'GRE score is required', min: { value: 260, message: 'Min 260' }, max: { value: 340, message: 'Max 340' } }}
                />
                
                <FormInput
                  label="IELTS/TOEFL"
                  name="ielts_score"
                  type="number"
                  step="0.5"
                  placeholder="7.5"
                  register={register}
                  error={errors.ielts_score}
                  validation={{ required: 'IELTS score is required', min: { value: 0, message: 'Min 0' }, max: { value: 9, message: 'Max 9' } }}
                />
              </div>
            </div>

            {/* Section 3: Preferences */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-white border-b border-white/10 pb-2">Study Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-400 mb-1">Preferred Country</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="h-5 w-5 text-gray-500" />
                    </div>
                    <select 
                      {...register("preferred_country", { required: "Country is required" })}
                      className={`block w-full pl-10 pr-3 py-2.5 bg-surface border ${errors.preferred_country ? 'border-red-500' : 'border-white/10'} rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/50`}
                    >
                      <option value="">Select country</option>
                      <option value="USA">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                    </select>
                  </div>
                  {errors.preferred_country && <span className="text-red-400 text-xs mt-1 block">{errors.preferred_country.message}</span>}
                </div>

                <div className="relative">
                  <label className="block text-xs font-medium text-gray-400 mb-1">Course Interest</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BookOpen className="h-5 w-5 text-gray-500" />
                    </div>
                    <select 
                      {...register("course_interest", { required: "Course is required" })}
                      className={`block w-full pl-10 pr-3 py-2.5 bg-surface border ${errors.course_interest ? 'border-red-500' : 'border-white/10'} rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/50`}
                    >
                      <option value="">Select course</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Business Administration (MBA)">Business Administration (MBA)</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                    </select>
                  </div>
                  {errors.course_interest && <span className="text-red-400 text-xs mt-1 block">{errors.course_interest.message}</span>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-3 flex justify-between">
                  <span>Total Budget (Tuition + Living, in INR)</span>
                  <span className="text-primary-400 font-bold">
                    ₹{(budgetLabel / 100000).toFixed(1)}L
                  </span>
                </label>
                <input
                  type="range"
                  min="1000000"
                  max="8000000"
                  step="500000"
                  {...register("budget", { valueAsNumber: true, onChange: (e) => setBudgetLabel(Number(e.target.value)) })}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>₹10L</span>
                  <span>₹80L</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-background bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-background transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing Profile...
                  </span>
                ) : (
                  "Analyze My Profile"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileFormPage;
