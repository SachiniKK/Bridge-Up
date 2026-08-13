import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Star } from 'lucide-react';

export default function CalendarWidget({ roadmap }) {
  const daysOfWeek = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
  
  // Get current date details
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const todayDate = now.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Calculate first day index (convert Sunday 0 to index 6, Monday 1 to 0)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  let startDayIndex = firstDayOfMonth.getDay();
  startDayIndex = startDayIndex === 0 ? 6 : startDayIndex - 1;

  // Calculate total days in current month
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Find active and upcoming skills in student's roadmap
  const activeStep = roadmap?.steps?.find(s => s.status === 'active');
  const nextSteps = roadmap?.steps?.filter(s => s.status === 'locked') || [];

  const activeSkillName = activeStep ? activeStep.skillName : 'REST APIs';
  const nextSkillName = nextSteps.length > 0 ? nextSteps[0].skillName : 'SQL Databases';

  // Build cells
  const calendarCells = [];
  for (let i = 0; i < startDayIndex; i++) {
    calendarCells.push({ value: '', type: 'empty' });
  }

  for (let day = 1; day <= totalDays; day++) {
    let type = 'normal';
    if (day === todayDate) {
      type = 'current-day';
    } else if (day >= 5 && day <= 14) {
      type = 'active-ongoing';
    } else if (day >= 16 && day <= 24) {
      type = 'next-starting';
    }
    calendarCells.push({ value: day.toString(), type });
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
              Course Calendar
            </span>
            <h3 className="font-extrabold text-slate-700 text-sm">
              {monthNames[currentMonth]} {currentYear}
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button className="p-1.5 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all select-none">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all select-none">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 select-none pb-1">
        {daysOfWeek.map(d => <span key={d}>{d}</span>)}
      </div>

      {/* Grid Days */}
      <div className="grid grid-cols-7 gap-1 text-center select-none font-bold text-xs">
        {calendarCells.map((cell, idx) => {
          let dayStyle = '';
          
          if (cell.type === 'empty') {
            return <div key={`empty-${idx}`} className="p-1.5" />;
          }

          if (cell.type === 'current-day') {
            dayStyle = 'bg-primary text-white rounded-full p-1.5 shadow-md shadow-primary/20 scale-105';
          } else if (cell.type === 'active-ongoing') {
            dayStyle = 'border border-indigo-400 bg-indigo-50/20 text-indigo-700 rounded-full p-1.5';
          } else if (cell.type === 'next-starting') {
            dayStyle = 'border border-cyan-400 bg-cyan-50/20 text-cyan-700 rounded-full p-1.5';
          } else {
            dayStyle = 'text-slate-600 hover:bg-slate-100/50 rounded-full p-1.5';
          }

          return (
            <div key={idx} className="flex items-center justify-center p-0.5">
              <span className={`w-7 h-7 flex items-center justify-center transition-all ${dayStyle}`}>
                {cell.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend Dots List */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100">
        <div className="flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/20" />
          <span className="text-[11px] font-bold text-slate-500">{activeSkillName} Course (Ongoing)</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/20" />
          <span className="text-[11px] font-bold text-slate-500">{nextSkillName} Course (Starting)</span>
        </div>
      </div>

    </div>
  );
}
