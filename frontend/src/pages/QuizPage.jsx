import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { api, getStudentId } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle, CheckCircle2, XCircle, ArrowLeft, Loader2 } from 'lucide-react';

export default function QuizPage() {
  const { user, handleLogout } = useAuth();
  const studentId = getStudentId();
  const { resourceId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQuiz();
  }, [resourceId]);

  async function loadQuiz() {
    try {
      const data = await api.getQuiz(studentId, resourceId);
      setQuiz(data);
    } catch (err) {
      setError(err.message || 'Make sure you have completed the learning resource first!');
    } finally {
      setLoading(false);
    }
  }

  function handleSelectOption(qIdx, optIdx) {
    if (result) return; // quiz completed
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  }

  async function handleSubmitQuiz() {
    if (Object.keys(answers).length !== quiz.questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const submissionAnswers = quiz.questions.map((_, idx) => answers[idx]);
      const res = await api.submitQuiz(studentId, quiz.id, submissionAnswers);
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <AppLayout user={user} onLogout={handleLogout}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user} onLogout={handleLogout}>
      <header className="w-full bg-white border-b border-slate-100 py-6 px-8 sticky top-0 z-40 shadow-sm flex items-center space-x-4">
        <button
          onClick={() => navigate('/learning-path')}
          className="p-2 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">Resource Quiz Assessment</h1>
          <p className="text-slate-400 text-xs font-semibold mt-0.5">
            Test your understanding to unlock the skill on your passport.
          </p>
        </div>
      </header>

      <main className="p-6 md:p-8 max-w-3xl w-full mx-auto space-y-6">
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start space-x-2.5 text-rose-700 text-xs font-bold animate-fade-in">
            <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {quiz && !result && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-2">
              <h2 className="text-lg font-black text-slate-800">{quiz.title}</h2>
              <p className="text-xs text-slate-400 font-semibold">
                Answer all multiple-choice questions honestly. 66% score required to pass.
              </p>
            </div>

            <div className="space-y-6">
              {quiz.questions.map((q, qIdx) => (
                <div key={qIdx} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Question {qIdx + 1}
                  </h3>
                  <p className="text-sm font-bold text-slate-850 leading-relaxed">
                    {q.question}
                  </p>

                  <div className="grid grid-cols-1 gap-2.5">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = answers[qIdx] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(qIdx, optIdx)}
                          className={`p-3.5 rounded-2xl border text-left text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-indigo-50 border-primary text-primary ring-2 ring-primary/10'
                              : 'bg-white border-slate-100 hover:border-slate-200 text-slate-600'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="px-6 py-3 bg-primary text-white hover:bg-primary-dark font-extrabold text-xs rounded-xl shadow-lg transition-all"
              >
                {submitting ? 'Submitting...' : 'Submit Answers'}
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-lg text-center space-y-6 animate-fade-in">
            <div className="flex justify-center">
              {result.passed ? (
                <CheckCircle2 className="w-16 h-16 text-emerald-500" />
              ) : (
                <XCircle className="w-16 h-16 text-rose-500" />
              )}
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-800">
                {result.passed ? 'Congratulations! You Passed! 🎉' : 'Quiz Failed'}
              </h2>
              <p className="text-slate-400 text-xs font-semibold">
                You scored {result.score}% ({result.correctCount} / {result.totalQuestions} correct)
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 max-w-sm mx-auto text-xs font-semibold text-slate-600 leading-relaxed">
              {result.passed
                ? 'Your passing attempt is logged. Get this skill verified by submitting work to Peer Reviews to fully unlock it on your passport!'
                : 'Do not worry! Review the learning materials and try again whenever you are ready.'}
            </div>

            <div className="pt-4 flex justify-center space-x-3">
              <button
                onClick={() => navigate('/learning-path')}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors"
              >
                Back to Roadmap
              </button>
              {!result.passed && (
                <button
                  onClick={() => {
                    setResult(null);
                    setAnswers({});
                  }}
                  className="px-5 py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary-dark transition-all"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </AppLayout>
  );
}
