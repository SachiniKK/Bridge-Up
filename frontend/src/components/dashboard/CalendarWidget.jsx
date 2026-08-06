import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarWidget() {
  const daysOfWeek = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
  
  // Custom March 2026 cells matching the mockup calendar structure
  // Each day has an ID, value, and styling flag
  const calendarCells = [
    { value: '', type: 'empty' },
    { value: '', type: 'empty' },
    { value: '', type: 'empty' },
    { value: '', type: 'empty' },
    { value: '', type: 'empty' },
    { value: '1', type: 'REST-ongoing' }, // Sat
    { value: '2', type: 'REST-ongoing' }, // Sun
    
    { value: '3', type: 'normal' },
    { value: '4', type: 'REST-ongoing' },
    { value: '5', type: 'REST-ongoing' },
    { value: '6', type: 'SQL-ongoing' },
    { value: '7', type: 'SQL-ongoing' },
    { value: '8', type: 'SQL-ongoing' },
    { value: '9', type: 'SQL-ongoing' },
    
    { value: '10', type: 'normal' },
    { value: '11', type: 'REST-ongoing' },
    { value: '12', type: 'REST-ongoing' },
    { value: '13', type: 'SQL-ongoing' },
    { value: '14', type: 'SQL-ongoing' },
    { value: '15', type: 'Git-starting' },
    { value: '16', type: 'Git-starting' },
    
    { value: '17', type: 'normal' },
    { value: '18', type: 'Git-starting' },
    { value: '19', type: 'Git-starting' },
    { value: '20', type: 'Git-starting' },
    { value: '21', type: 'Git-starting' },
    { value: '22', type: 'SQL-ongoing' },
    { value: '23', type: 'normal' },
    
    { value: '24', type: 'normal' },
    { value: '25', type: 'REST-ongoing' },
    { value: '26', type: 'REST-ongoing' },
    { value: '27', type: 'current-day' }, // Solid blue circle
    { value: '28', type: 'SQL-ongoing' },
    { value: '29', type: 'SQL-ongoing' },
    { value: '30', type: 'normal' },
    
    { value: '31', type: 'normal' }
  ];

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
              March 2026
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
          let dayStyle = 'text-slate-500 hover:bg-slate-50 rounded-lg p-1.5';
          
          if (cell.type === 'empty') {
            return <div key={`empty-${idx}`} className="p-1.5" />;
          }

          if (cell.type === 'current-day') {
            dayStyle = 'bg-primary text-white rounded-full p-1.5 shadow-md shadow-primary/20 scale-105';
          } else if (cell.type === 'REST-ongoing') {
            dayStyle = 'border border-indigo-400 bg-indigo-50/20 text-indigo-700 rounded-full p-1.5';
          } else if (cell.type === 'SQL-ongoing') {
            dayStyle = 'border border-cyan-400 bg-cyan-50/20 text-cyan-700 rounded-full p-1.5';
          } else if (cell.type === 'Git-starting') {
            dayStyle = 'border border-rose-400 bg-rose-50/20 text-rose-700 rounded-full p-1.5';
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
          <span className="text-[11px] font-bold text-slate-500">REST API Course (Ongoing)</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/20" />
          <span className="text-[11px] font-bold text-slate-500">SQL for Analysts (Ongoing)</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/20" />
          <span className="text-[11px] font-bold text-slate-500">Git Fundamentals (Starting)</span>
        </div>
      </div>

    </div>
  );
}
