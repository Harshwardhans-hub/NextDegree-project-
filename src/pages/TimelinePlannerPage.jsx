import React from 'react';
import { Calendar, CheckCircle2, Circle, Clock, ChevronRight, Download, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

const timelineTasks = [
  { id: 1, title: 'GRE Preparation', date: 'Aug - Oct 2026', status: 'completed', description: 'Target score: 320+. Focus on quant and vocabulary.' },
  { id: 2, title: 'IELTS Exam', date: 'Nov 15, 2026', status: 'in-progress', description: 'Booked slot. Aiming for band 7.5.' },
  { id: 3, title: 'SOP Writing', date: 'Dec 1 - 20, 2026', status: 'pending', description: 'Drafting Statement of Purpose highlighting research experience.' },
  { id: 4, title: 'University Applications', date: 'Jan 5, 2027', status: 'pending', description: 'Submit applications for Fall 2027 intake (ASU, UTD, Purdue).' },
  { id: 5, title: 'Loan Processing', date: 'March 2027', status: 'pending', description: 'Apply for education loan after receiving admit letters.' },
  { id: 6, title: 'Visa Interview', date: 'May - June 2027', status: 'pending', description: 'F1 Visa slots booking and mock interviews.' }
];

const TimelinePlannerPage = () => {
  const completed = timelineTasks.filter(t => t.status === 'completed').length;
  const progress = Math.round((completed / timelineTasks.length) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Timeline Planner</h1>
          <p className="text-gray-400 mt-1">Track your study abroad milestones</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-white/5 border border-white/10 rounded-lg text-sm text-white transition-colors">
            <Share2 className="h-4 w-4" /> Share
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg text-sm text-white transition-colors">
            <Download className="h-4 w-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="glass-card p-6 md:p-8 mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white mb-2">Overall Progress</h2>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              {completed} of {timelineTasks.length} tasks completed
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-white">{progress}%</span>
              <span className="text-gray-400">Fall 2027 Intake</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative pl-4 md:pl-0">
        {/* Vertical Line */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2"></div>
        <div className="md:hidden absolute left-4 top-0 bottom-0 w-px bg-white/10"></div>

        <div className="space-y-8">
          {timelineTasks.map((task, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                key={task.id} 
                className={`relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8 ${isEven ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Connector Node */}
                <div className="absolute left-[-5px] md:left-1/2 top-6 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-10 w-4 h-4 rounded-full bg-background border-[3px] flex items-center justify-center
                  ${task.status === 'completed' ? 'border-green-500 bg-green-500/20' : task.status === 'in-progress' ? 'border-primary-500 bg-primary-500/20' : 'border-gray-600'}
                ">
                </div>

                <div className="hidden md:block w-5/12"></div>

                <div className="w-full md:w-5/12 ml-6 md:ml-0">
                  <div className={`glass-card p-6 border-l-4 hover:bg-white/5 transition-colors cursor-pointer group ${
                    task.status === 'completed' ? 'border-l-green-500' : 
                    task.status === 'in-progress' ? 'border-l-primary-500' : 'border-l-gray-600'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5">
                        <Calendar className="h-3 w-3" />
                        {task.date}
                      </div>
                      <div className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        task.status === 'completed' ? 'bg-green-500/10 text-green-400' : 
                        task.status === 'in-progress' ? 'bg-primary-500/10 text-primary-400' : 'bg-gray-500/10 text-gray-400'
                      }`}>
                        {task.status === 'completed' ? 'Done' : task.status === 'in-progress' ? 'Active' : 'Upcoming'}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors flex items-center gap-2">
                      {task.status === 'completed' ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : 
                       task.status === 'in-progress' ? <Clock className="h-5 w-5 text-primary-500" /> : <Circle className="h-5 w-5 text-gray-500" />}
                      {task.title}
                    </h3>
                    
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {task.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimelinePlannerPage;
