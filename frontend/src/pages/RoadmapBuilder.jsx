import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getStudentId } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { CheckCircle2, User, Trophy, Calendar, Compass, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';

export default function RoadmapBuilder() {
  const { user } = useAuth();
  const studentId = getStudentId();
  const navigate = useNavigate();

const ROLE_SKILLS = {
    'Software Developer': ['Git & Version Control', 'Algorithms', 'Data Structures', 'System Design', 'Testing'],
    'Software Engineer': ['Git & Version Control', 'Algorithms', 'Data Structures', 'System Design', 'Testing'],
    'Backend Developer': ['REST APIs', 'Git & Version Control', 'SQL / Databases', 'Java', 'Springboot'],
    'Frontend Developer': ['React.js', 'JavaScript', 'CSS & Styling', 'HTML', 'Figma'],
    'Full Stack Developer': ['React.js', 'Node.js', 'SQL / Databases', 'REST APIs', 'Git & Version Control'],
    'Data Analyst': ['SQL / Databases', 'Excel', 'Python', 'PowerBI', 'Tableau'],
    'ML / AI Engineer': ['Python', 'SQL / Databases', 'TensorFlow', 'Pandas', 'NumPy'],
    'DevOps / Cloud': ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Git & Version Control'],
    'QA Engineer': ['Testing', 'Git & Version Control', 'Python', 'Selenium', 'API Testing'],
    'UI/UX Designer': ['Figma', 'UX Research', 'Wireframing', 'Prototyping', 'Visual Design'],
    'UX/UI Designer': ['Figma', 'UX Research', 'Wireframing', 'Prototyping', 'Visual Design'],
    
    'Business Analyst': ['Requirements Gathering', 'SQL / Databases', 'Excel', 'Agile', 'Communication Skills'],
    'Marketing Executive': ['Market Research', 'Communication Skills', 'Content Strategy', 'Excel', 'Social Media'],
    'Digital Marketing': ['SEO', 'Google Analytics', 'Content Strategy', 'Social Media', 'Ad Campaigns'],
    'Product Manager': ['Product Strategy', 'Agile', 'UX Research', 'Communication Skills', 'Project Management'],
    'HR / People Ops': ['Talent Acquisition', 'Communication Skills', 'Onboarding', 'Conflict Resolution', 'Employee Engagement'],
    
    'Content Writer': ['Content Strategy', 'SEO', 'Communication Skills', 'Copywriting', 'Editing'],
    'UX Writer': ['UX Writing', 'Figma', 'UX Research', 'Communication Skills', 'Wireframing'],
    'Journalist / Editor': ['Writing', 'Editing', 'Fact Checking', 'Interviewing', 'Communication Skills'],
    'Research / Policy': ['Research Methods', 'Data Analysis', 'Report Writing', 'Policy Analysis', 'Communication Skills'],
    '🤷‍♂️ Not sure yet': ['General Programming', 'Problem Solving', 'Communication Skills', 'Git & Version Control', 'Agile']
  };

  const ALL_ROLES_METADATA = [
    // Tech Roles
    { name: 'Software Developer', category: 'tech', desc: 'Desktop, mobile, or system software' },
    { name: 'Software Engineer', category: 'tech', desc: 'Algorithms, systems, engineering principles' },
    { name: 'Backend Developer', category: 'tech', desc: 'APIs, databases, server routing' },
    { name: 'Frontend Developer', category: 'tech', desc: 'React, UI styling, web layouts' },
    { name: 'Full Stack Developer', category: 'tech', desc: 'Client interfaces, server logic, databases' },
    { name: 'Data Analyst', category: 'tech', desc: 'SQL queries, Excel modeling, dashboards' },
    { name: 'ML / AI Engineer', category: 'tech', desc: 'Machine learning, Python models, data arrays' },
    { name: 'DevOps / Cloud', category: 'tech', desc: 'Docker containers, CI/CD pipelines, AWS cloud' },
    { name: 'QA Engineer', category: 'tech', desc: 'Quality assurance, automation, test cases' },
    { name: 'UI/UX Designer', category: 'tech', desc: 'Figma wireframes, prototyping, user research' },

    // Business Roles
    { name: 'Business Analyst', category: 'business', desc: 'Business requirements, workflow mapping, Agile' },
    { name: 'Marketing Executive', category: 'business', desc: 'Market research, presentations, campaigns' },
    { name: 'Digital Marketing', category: 'business', desc: 'SEO tracking, ad runs, web analytics' },
    { name: 'Product Manager', category: 'business', desc: 'Product scope, prioritization, strategy roadmaps' },
    { name: 'HR / People Ops', category: 'business', desc: 'Hiring, onboarding, employee engagement' },

    // Content Roles
    { name: 'Content Writer', category: 'content', desc: 'Blogging, articles, web copywriting, SEO' },
    { name: 'UX Writer', category: 'content', desc: 'Interface copy, microcopy, tooltips, guidance' },
    { name: 'Journalist / Editor', category: 'content', desc: 'News gathering, interviewing, editorial checks' },
    { name: 'Research / Policy', category: 'content', desc: 'Policy briefs, quantitative and qualitative research' },
    { name: '🤷‍♂️ Not sure yet', category: 'content', desc: 'Explore general skills' }
  ];

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Calculate dynamic roles list based on user categories from signup
  const rolesList = React.useMemo(() => {
    const userRoles = user?.selectedRoles || [];
    const categories = new Set();
    userRoles.forEach(r => {
      const match = ALL_ROLES_METADATA.find(meta => meta.name.toLowerCase() === r.toLowerCase());
      if (match) categories.add(match.category);
    });

    const activeCategories = Array.from(categories);
    const targetCategories = activeCategories.length > 0 ? activeCategories : ['tech'];

    return ALL_ROLES_METADATA.filter(r => targetCategories.includes(r.category));
  }, [user]);

  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selfAssessments, setSelfAssessments] = useState({});

  // Initialize selected role and assessments once rolesList is calculated
  React.useEffect(() => {
    if (rolesList.length > 0) {
      const preferredRole = user?.selectedRoles?.find(ur => rolesList.some(rl => rl.name.toLowerCase() === ur.toLowerCase()));
      const initialRole = preferredRole || rolesList[0].name;
      
      setSelectedRoles([initialRole]);

      const skills = ROLE_SKILLS[initialRole] || ROLE_SKILLS['Backend Developer'] || [];
      const initialAssessments = {};
      skills.forEach(s => {
        initialAssessments[s] = 'None';
      });
      setSelfAssessments(initialAssessments);
    }
  }, [rolesList, user]);

  // Generated roadmap container
  const [generatedRoadmap, setGeneratedRoadmap] = useState(null);

  const skillOptions = ['None', 'Heard of it', 'Used it', 'Comfortable'];

  function handleToggleRole(roleName) {
    setSelectedRoles([roleName]);
    const skills = ROLE_SKILLS[roleName] || ROLE_SKILLS['Backend Developer'];
    const initialAssessments = {};
    skills.forEach(s => {
      initialAssessments[s] = 'None';
    });
    setSelfAssessments(initialAssessments);
  }

  function handleSetRating(skill, rating) {
    setSelfAssessments(prev => ({ ...prev, [skill]: rating }));
  }

  async function handleGenerateRoadmap() {
    if (selectedRoles.length === 0) {
      alert('Please select at least one role.');
      return;
    }
    setLoading(true);
    try {
      // Register selections on backend profile onboarding
      const result = await api.updateOnboarding(studentId, {
        degree: user?.degree || 'Computer Science',
        currentYear: user?.currentYear || '3rd Year',
        selectedRoles,
        weeklyHours: 5
      });

      // Fetch the generated roadmap steps from service
      const roadmap = await api.regenerateRoadmap(studentId, {
        targetRole: selectedRoles[0],
        selfAssessments: selfAssessments
      });

      setGeneratedRoadmap(roadmap);
      setStep(3);
    } catch (err) {
      alert(err.message || 'Error generating roadmap');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 md:p-6 font-sans">
      {loading && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-white" />
          <span className="text-white font-bold text-sm">Building your personalized roadmap...</span>
        </div>
      )}

      {/* Main Wizard Card */}
      <div className="max-w-6xl w-full bg-slate-50/80 backdrop-blur-md rounded-[36px] p-3 shadow-xl border border-white/60 min-h-[600px] flex flex-col">
        {/* Step Navigation header */}
        <div className="flex justify-center space-x-12 py-3 border-b border-slate-100/50">
          <div className="flex items-center space-x-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'
            }`}>1</span>
            <span className="text-xs font-bold text-slate-500">Career goals</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'
            }`}>2</span>
            <span className="text-xs font-bold text-slate-500">Skill check</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 3 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'
            }`}>3</span>
            <span className="text-xs font-bold text-slate-500">Your roadmap</span>
          </div>
        </div>

        {/* Contents Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
          {/* STEP 1: CAREER GOALS */}
          {step === 1 && (
            <>
              {/* Left sidebar info */}
              <div className="lg:col-span-4 bg-[#1e1b4b] rounded-3xl p-6 text-white flex flex-col justify-between space-y-8">
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
                    Your career gap starts closing <span className="text-indigo-400">today.</span>
                  </h2>
                  <p className="text-slate-300 text-xs mt-3 leading-relaxed">
                    Set up your profile once. Get a skill roadmap built for Sri Lankan employers — not LinkedIn job boards.
                  </p>
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">
                    ★ COLOMBO TECH ROLES
                  </span>
                  <div className="space-y-3">
                    {[
                      { name: 'REST APIs', val: 87 },
                      { name: 'Git', val: 82 },
                      { name: 'SQL', val: 74 },
                      { name: 'React', val: 61 }
                    ].map(item => (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span>{item.name}</span>
                          <span>{item.val}%</span>
                        </div>
                        <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${item.val}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] text-slate-400">
                    Skills scraped from TopJobs.lk - LinkedIn LK. Updated weekly.
                  </p>
                </div>
              </div>

              {/* Right forms list */}
              <div className="lg:col-span-8 bg-white/40 rounded-3xl p-6 md:p-8 flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">What roles <span className="text-primary">interest</span> you?</h3>
                    <p className="text-slate-400 text-xs mt-1">
                      Pick all that apply. We'll map exactly which skills Sri Lankan employers ask for in these roles — not a global job board.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rolesList.map(role => {
                      const isSel = selectedRoles.includes(role.name);
                      return (
                        <div
                          key={role.name}
                          onClick={() => handleToggleRole(role.name)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                            isSel
                              ? 'bg-indigo-50/50 border-primary text-primary ring-2 ring-primary/10'
                              : 'bg-white border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <h4 className="text-xs font-extrabold text-slate-800">{role.name}</h4>
                          <p className="text-[10px] text-slate-400 mt-1">{role.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-6 text-right">
                  <button
                    onClick={() => setStep(2)}
                    disabled={selectedRoles.length === 0}
                    className="px-6 py-3 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary-dark transition-all inline-flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* STEP 2: SKILL CHECK / ASSESSMENT */}
          {step === 2 && (
            <>
              {/* Left sidebar rating guide */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between space-y-6">
                <div>
                  <span className="text-[9px] font-black uppercase text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded">
                    🎯 Your Selected Roles
                  </span>
                  <h4 className="font-extrabold text-slate-800 text-sm mt-2">
                    {selectedRoles.join(', ')}
                  </h4>
                </div>

                <div className="space-y-4">
                  <h5 className="font-black text-slate-800 text-xs">WHY BE HONEST?</h5>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Rating yourself higher than you are gives you a roadmap that skips what you need. Your ratings are private — only your roadmap sees them.
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h5 className="font-black text-slate-800 text-xs">RATING GUIDE</h5>
                  {[
                    { label: 'None', desc: 'Never heard of it or tried it' },
                    { label: 'Heard of it', desc: 'Know what it is, never used it' },
                    { label: 'Used it', desc: 'Used it once or twice in a project' },
                    { label: 'Comfortable', desc: 'Can use it confidently without help' }
                  ].map(g => (
                    <div key={g.label} className="text-[10px]">
                      <span className="font-black text-slate-700 block">{g.label}</span>
                      <span className="text-slate-400">{g.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right self-assessment form */}
              <div className="lg:col-span-8 bg-white/40 rounded-3xl p-6 md:p-8 flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">Where are you <span className="text-primary">right now?</span></h3>
                    <p className="text-slate-400 text-xs mt-1">
                      Rate yourself on these skills. Be honest — this builds a roadmap from your actual starting point, not an assumed one.
                    </p>
                  </div>

                  <div className="space-y-5">
                    {Object.keys(selfAssessments).map(skill => (
                      <div key={skill} className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100/50 pb-3">
                        <span className="text-xs font-black text-slate-700">{skill}</span>
                        <div className="flex space-x-1.5">
                          {skillOptions.map(opt => {
                            const isSel = selfAssessments[skill] === opt;
                            return (
                              <button
                                key={opt}
                                onClick={() => handleSetRating(skill, opt)}
                                className={`px-2.5 py-1 text-[9px] font-bold rounded-lg border transition-all ${
                                  isSel
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
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
                </div>

                <div className="flex justify-between items-center pt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 font-bold text-xs hover:bg-slate-50 flex items-center space-x-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleGenerateRoadmap}
                    className="px-6 py-3 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary-dark transition-all inline-flex items-center space-x-1.5"
                  >
                    <span>Generate my roadmap</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* STEP 3: VIEW GENERATED ROADMAP */}
          {step === 3 && generatedRoadmap && (
            <div className="lg:col-span-12 bg-white/40 rounded-3xl p-6 md:p-8 flex flex-col justify-between space-y-6">
              <div className="text-center space-y-2">
                <span className="text-[10px] font-black uppercase text-primary bg-indigo-50 px-2.5 py-1 rounded-full">
                  ★ PRIORITY ORDER
                </span>
                <h3 className="text-3xl font-black text-slate-800">Skills in the <span className="text-primary">right</span> order.</h3>
                <p className="text-slate-400 text-xs max-w-xl mx-auto">
                  Each skill unlocks the next. The order is determined by employer demand frequency, learning dependencies, and your degree time remaining — not guesswork.
                </p>

                <div className="flex justify-center gap-3 pt-3">
                  <span className="text-[10px] font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                    Target: {generatedRoadmap.targetRole}
                  </span>
                  <span className="text-[10px] font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                    Duration: {generatedRoadmap.totalWeeks} weeks total
                  </span>
                  <span className="text-[10px] font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                    XP Value: {generatedRoadmap.potentialXP} XP potential
                  </span>
                </div>
              </div>

              {/* Steps Timeline view */}
              <div className="space-y-6 max-w-3xl w-full mx-auto py-4">
                {generatedRoadmap.steps.map((st, idx) => (
                  <div key={st.id} className="relative flex items-start space-x-4">
                    {/* Circle marker */}
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-black shrink-0 shadow-md">
                      {idx + 1}
                    </div>

                    {/* Step Content Box */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex-1 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="text-sm font-extrabold text-slate-800">{st.skillName}</h4>
                        <div className="flex gap-2">
                          <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded uppercase">
                            High Demand
                          </span>
                          <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">
                            {st.demandPercent}% of JDs
                          </span>
                          <span className="text-[9px] font-black text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
                            {st.durationWeeks} weeks
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed">
                        {st.description}
                      </p>

                      {/* Weeks Details rendering */}
                      {st.weeksDetails && Array.isArray(st.weeksDetails) && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                          {st.weeksDetails.map((w, wIdx) => (
                            <div key={wIdx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                                {w.weeks}
                              </span>
                              <span className="text-[10px] text-slate-600 font-bold mt-0.5 block leading-tight">
                                {w.content}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 text-center">
                <button
                  onClick={() => navigate('/learning-path')}
                  className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-extrabold text-xs rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Begin Week 1 →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
