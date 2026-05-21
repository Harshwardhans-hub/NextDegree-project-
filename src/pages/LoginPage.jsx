import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-1/2 xl:w-[45%] relative z-10">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="bg-primary-500/20 p-2 rounded-xl">
              <GraduationCap className="h-6 w-6 text-primary-500" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              NextDegree <span className="text-primary-500">AI</span>
            </span>
          </Link>

          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-400">
              Please sign in to access your dashboard.
            </p>
          </div>

          <div className="mt-10">
            <div>
              <button
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-white/10 rounded-xl shadow-sm bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-all"
              >
                <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                  <path
                    d="M12.0003 4.75C13.7703 4.75 15.3553 5.36 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                    fill="#EA4335"
                  />
                  <path
                    d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                    fill="#34A853"
                  />
                </svg>
                Continue with Google
              </button>
            </div>

            <div className="mt-8 flex items-center justify-center">
              <div className="text-sm text-gray-500">
                By continuing, you agree to our Terms of Service.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Illustration/Gradient */}
      <div className="hidden lg:block relative w-0 flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-surface/50">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-background to-accent-900/40 mix-blend-multiply" />
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg">
            <div className="glass-card p-8 rotate-3 shadow-2xl relative">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent-500/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl"></div>
              
              <div className="space-y-6 opacity-80">
                <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                  <div className="w-12 h-12 rounded-full bg-primary-500/20"></div>
                  <div>
                    <div className="h-4 w-32 bg-white/10 rounded mb-2"></div>
                    <div className="h-3 w-20 bg-white/5 rounded"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 w-full bg-white/5 rounded"></div>
                  <div className="h-3 w-4/5 bg-white/5 rounded"></div>
                  <div className="h-3 w-5/6 bg-white/5 rounded"></div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="h-24 rounded-xl bg-gradient-to-br from-primary-500/10 to-transparent border border-primary-500/20"></div>
                  <div className="h-24 rounded-xl bg-gradient-to-br from-accent-500/10 to-transparent border border-accent-500/20"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
