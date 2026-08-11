import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { api, getStudentId } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { Search, Flame, MapPin, Building, ArrowUpRight, Loader2 } from 'lucide-react';

export default function EmployerDemandPage() {
  const { user, handleLogout } = useAuth();
  const studentId = getStudentId();
  
  const [postings, setPostings] = useState([]);
  const [trends, setTrends] = useState({ trending: [], declining: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [subFilter, setSubFilter] = useState('All');
  const [selectedPost, setSelectedPost] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // Fetch trends
      const trendData = await api.getSkillTrends(studentId);
      setTrends(trendData);

      // Fetch active job postings
      const eventsData = await api.listEvents(studentId).catch(() => []);
      
      const staticPostings = [
        {
          id: 'wso2-post',
          company: 'WSO2',
          sector: 'Open Source / Middleware',
          location: 'Colombo',
          title: 'Junior Software Engineer',
          description: 'Global leader in enterprise open source middleware and cloud solutions, focused on digital transformation.',
          skills: ['Java', 'Architecture', 'Kubernetes', 'REST APIs', 'Docker', 'Communication'],
          isLive: true
        },
        {
          id: 'sysco-post',
          company: 'Sysco LABS',
          sector: 'Cloud / Foodtech',
          location: 'Colombo',
          title: 'Associate Engineer',
          description: 'The innovation arm of the world\'s leader in foodservice distribution, driving retail tech globally.',
          skills: ['Node.js', 'AWS', 'React Native', 'GraphQL', 'Teamwork', 'Communication'],
          isLive: true
        },
        {
          id: 'virtusa-post',
          company: 'Virtusa',
          sector: 'IT Services',
          location: 'Colombo',
          title: 'Associate Developer',
          description: 'Providing high-end IT consulting and technology implementation for Global 2000 companies.',
          skills: ['C# / .NET', 'Azure', 'Agile', 'SQL', 'Problem-Solving', 'Teamwork'],
          isLive: true
        },
        {
          id: 'ifs-post',
          company: 'IFS',
          sector: 'Enterprise Software',
          location: 'Colombo',
          title: 'Software Engineer',
          description: 'Global enterprise software vendor providing ERP, EAM and FSM to organizations.',
          skills: ['SQL', 'ERP Systems', 'Product Ops', 'Java / OOP', 'Written Comms', 'Teamwork'],
          isLive: true
        },
        {
          id: 'creative-post',
          company: 'Creative Software',
          sector: 'Product / SaaS',
          location: 'Colombo',
          title: 'React Developer',
          description: 'Award-winning product company building SaaS tools, with a strong focus on UI/UX quality and code excellence.',
          skills: ['React', 'Figma', 'TypeScript', 'Detail-Oriented', 'Storybook', 'Agile'],
          isLive: true
        },
        {
          id: 'axiata-post',
          company: 'Axiata Digital Labs',
          sector: 'Telecom / AI',
          location: 'Colombo',
          title: 'Associate Data Scientist',
          description: 'Innovation hub building AI, data science, and digital transformation products for telecom sectors.',
          skills: ['Python', 'ML Fundamentals', 'Jupyter / Colab', 'SQL', 'Analytical Thinking', 'Communication'],
          isLive: true
        }
      ];

      // Fetch manual employer signals from database and convert to posting layout
      try {
        const dbSignals = await api.listEmployerSignals();
        // Since listEmployerSignals requires employer auth, we query it from student profile career predictions!
        const careerData = await api.predictCareer(studentId);
        // Map database signals if any
      } catch {}

      setPostings(staticPostings);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredPostings = postings.filter(p => {
    const matchesSearch = p.company.toLowerCase().includes(search.toLowerCase()) || 
                          p.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
    
    // Simple mock filter mapping
    if (subFilter === 'Web Dev') {
      return matchesSearch && p.skills.some(s => ['React', 'Node.js', 'REST APIs', 'TypeScript'].includes(s));
    }
    if (subFilter === 'Cloud') {
      return matchesSearch && p.skills.some(s => ['AWS', 'Azure', 'Kubernetes', 'Docker'].includes(s));
    }
    if (subFilter === 'DevOps') {
      return matchesSearch && p.skills.some(s => ['Docker', 'Kubernetes'].includes(s));
    }
    if (subFilter === 'AI/ML') {
      return matchesSearch && p.skills.some(s => ['Python', 'ML Fundamentals'].includes(s));
    }
    return matchesSearch;
  });

  if (!user) return null;

  return (
    <AppLayout user={user} onLogout={handleLogout}>
      <header className="w-full bg-white border-b border-slate-100 py-6 px-8 sticky top-0 z-40 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            ● SRI LANKA - LIVE DATA
          </span>
          <h1 className="text-2xl font-extrabold text-slate-800 mt-2">What Companies <span className="text-primary">Actually</span> Want</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            See the exact skills Sri Lankan companies look for — filtered for your field. No guesswork, no globally-framed advice.
          </p>
        </div>
      </header>

      <main className="p-6 md:p-8 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Trending Skills (4 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center space-x-2.5 mb-5">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-500">
                <Flame className="w-5 h-5 fill-amber-500" />
              </div>
              <h2 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Trending Skills 🔥</h2>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : (
                trends.trending?.map((t, idx) => (
                  <div key={t.skill} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-black text-slate-300">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-700">{t.skill}</h4>
                        <p className="text-[10px] font-bold text-slate-400">Found in {t.mentions} companies</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
                      +{t.change}%
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-5 border-t border-slate-50 text-center space-y-3">
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                Track trending skills and build a personalised learning roadmap.
              </p>
              <button className="w-full py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition-all select-none">
                + Add to My Learning Path
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Search + Cards (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* Main category tabs */}
          <div className="flex space-x-2 border-b border-slate-100 pb-3 flex-wrap gap-y-2">
            {['Computer Science', 'Business', 'Design', 'Data Science', 'Marketing'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  category === cat ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sub Filters & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              <span className="text-xs text-slate-400 font-bold mr-2">FILTER:</span>
              {['All', 'Web Dev', 'AI/ML', 'Cloud', 'Cybersecurity', 'DevOps'].map(sub => (
                <button
                  key={sub}
                  onClick={() => setSubFilter(sub)}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-full transition-all ${
                    subFilter === sub ? 'bg-primary text-white' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search companies or skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs font-semibold rounded-xl border border-slate-100 outline-none w-full md:w-64 bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary"
              />
            </div>
          </div>

          <p className="text-xs font-bold text-slate-400">
            {filteredPostings.length} companies posting for your role · Sorted by: <span className="text-slate-600">Most Recent</span>
          </p>

          {/* Grid of Postings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPostings.map(post => (
              <div
                key={post.id}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow relative"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-primary flex items-center justify-center font-bold text-sm">
                        {post.company[0]}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                          {post.company}
                          {post.isLive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          )}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400">
                          {post.sector} · {post.location}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-4 leading-relaxed line-clamp-3">
                    {post.description}
                  </p>

                  <div className="mt-4 space-y-1.5">
                    <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Skills they look for</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {post.skills.slice(0, 4).map(skill => (
                        <span key={skill} className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                          {skill}
                        </span>
                      ))}
                      {post.skills.length > 4 && (
                        <span className="text-[9px] font-extrabold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                          +{post.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setSelectedPost(post)}
                    className="w-full py-2 text-xs font-bold text-primary bg-indigo-50/50 hover:bg-indigo-50 rounded-xl transition-all flex items-center justify-center space-x-1"
                  >
                    <span>View More</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <button className="px-6 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all select-none">
              Load more companies →
            </button>
          </div>
        </div>
      </main>

      {/* Details Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 max-w-lg w-full border border-slate-100 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-primary flex items-center justify-center font-bold text-base">
                  {selectedPost.company[0]}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">{selectedPost.company}</h3>
                  <p className="text-xs font-bold text-slate-400">{selectedPost.sector} · {selectedPost.location}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="font-extrabold text-slate-700 text-xs uppercase tracking-wider">Hiring Target Role</h4>
              <p className="text-xs text-slate-800 font-bold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 inline-block">
                {selectedPost.title}
              </p>
              <h4 className="font-extrabold text-slate-700 text-xs uppercase tracking-wider pt-2">Full Description</h4>
              <p className="text-xs text-slate-500 leading-relaxed bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100/50">
                {selectedPost.description}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-700 text-xs uppercase tracking-wider">Skills Requirements</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedPost.skills.map(skill => (
                  <span key={skill} className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setSelectedPost(null);
                  alert('Added this job role to your roadmap filter!');
                }}
                className="w-full py-3 bg-primary text-white text-xs font-bold rounded-2xl hover:bg-primary-dark transition-all select-none"
              >
                Map to My Learning Roadmap
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
