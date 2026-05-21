import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Globe, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-surface/50 border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary-500/20 p-2 rounded-xl">
                <GraduationCap className="h-6 w-6 text-primary-500" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                NextDegree <span className="text-primary-500">AI</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm max-w-sm">
              Your Smart Study Abroad Companion. Plan, estimate, and succeed in your international education journey with data-driven insights.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Product</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/universities" className="hover:text-white transition-colors">Universities</Link></li>
              <li><Link to="/roi-analysis" className="hover:text-white transition-colors">ROI Calculator</Link></li>
              <li><Link to="/loan-estimator" className="hover:text-white transition-colors">Loan Estimator</Link></li>
              <li><Link to="/ai-mentor" className="hover:text-white transition-colors">AI Mentor</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-white/5 pt-8 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} NextDegree AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
