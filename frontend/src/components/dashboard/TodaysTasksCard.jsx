import React from 'react';
import { CheckCircle, Circle, ArrowRight, CheckSquare } from 'lucide-react';

export default function TodaysTasksCard({ tasks, onCompleteTask, onSkipTask }) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3.5">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-500 text-white">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500 block">
              Today's Daily Tasks
            </span>
            <h3 className="font-extrabold text-slate-700 text-sm">
              Personalized Learning Tasks
            </h3>
          </div>
        </div>
        <div className="p-6 bg-slate-50/70 rounded-2xl border border-slate-100 text-center flex flex-col items-center gap-2">
          <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-md">
            No tasks available yet. Create your personalized learning path roadmap to unlock tailored daily tasks!
          </p>
          <a
            href="/roadmap-builder"
            className="mt-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            Create Learning Path Roadmap →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Today's Daily Tasks</h2>
        <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">
          UTC Day Boundary
        </span>
      </div>
      <div className="divide-y divide-slate-100">
        {tasks.map((task) => {
          const isCompleted = task.status === 'completed';
          const isSkipped = task.status === 'skipped';
          const isPending = task.status === 'pending';

          return (
            <div
              key={task.id}
              className={`p-6 flex items-start justify-between gap-4 transition-colors ${
                isCompleted ? 'bg-slate-50/50' : 'hover:bg-slate-50/30'
              }`}
            >
              <div className="flex items-start gap-4 flex-1">
                <button
                  disabled={!isPending}
                  onClick={() => onCompleteTask(task.id)}
                  className={`mt-1 flex-shrink-0 transition-transform ${
                    isPending ? 'hover:scale-110 cursor-pointer text-slate-400 hover:text-blue-600' : ''
                  } ${isCompleted ? 'text-green-600' : ''} ${isSkipped ? 'text-slate-300' : ''}`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 fill-green-50" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h3
                      className={`text-sm font-semibold transition-all ${
                        isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                      } ${isSkipped ? 'text-slate-400' : ''}`}
                    >
                      {task.title}
                    </h3>
                    {task.skillTag && (
                      <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase tracking-wider">
                        {task.skillTag}
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center text-xs font-bold ${
                        isCompleted
                          ? 'text-slate-400'
                          : 'bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full'
                      }`}
                    >
                      +{task.xpValue} XP
                    </span>
                  </div>
                  {task.description && (
                    <p
                      className={`text-xs leading-relaxed ${
                        isCompleted || isSkipped ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {task.description}
                    </p>
                  )}
                </div>
              </div>

              {isPending && (
                <button
                  onClick={() => onSkipTask(task.id)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                >
                  Skip
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {isCompleted && (
                <span className="text-xs font-bold text-green-600 px-2 py-1 bg-green-50 rounded-lg">
                  Completed
                </span>
              )}
              {isSkipped && (
                <span className="text-xs font-bold text-slate-400 px-2 py-1 bg-slate-100 rounded-lg">
                  Skipped
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
