import React, { useState } from 'react';
import { FileText, Database, TrendingUp, Users, DollarSign, Target, Zap, Search, Filter, Bell, BarChart3, ChevronDown, ChevronRight } from 'lucide-react';

const AICareersDocumentation = () => {
  const [activeTab, setActiveTab] = useState('prd');
  const [expandedSections, setExpandedSections] = useState({
    market: true,
    problem: false,
    solution: false,
    features: false,
    personas: false,
    competitive: false,
    revenue: false,
    metrics: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const Section = ({ id, title, icon: Icon, children }) => (
    <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
        {expandedSections[id] ? (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-600" />
        )}
      </button>
      {expandedSections[id] && (
        <div className="p-6 bg-white">{children}</div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
            <Zap className="w-4 h-4" />
            AI-Powered Careers Platform
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Product Requirements & Architecture
          </h1>
          <p className="text-gray-600 text-lg">
            The definitive job board for AI-powered careers across all industries
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('prd')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'prd'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Product Requirements
            </div>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'architecture'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              System Architecture
            </div>
          </button>
        </div>

        {/* PRD Content */}
        {activeTab === 'prd' && (
          <div>
            {/* Executive Summary */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Executive Summary</h2>
              <p className="text-lg leading-relaxed mb-4">
                AI-Powered Careers Platform is a specialized job board that connects professionals with careers where artificial intelligence is central to the role—not just software engineers building AI, but sales professionals selling AI, consultants implementing AI, recruiters hiring for AI, and every role transformed by the AI revolution.
              </p>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="text-3xl font-bold">315K+</div>
                  <div className="text-sm opacity-90">Active AI-Powered Jobs</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="text-3xl font-bold">2M+</div>
                  <div className="text-sm opacity-90">Target Professionals</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="text-3xl font-bold">$156K</div>
                  <div className="text-sm opacity-90">Median AI Role Salary</div>
                </div>
              </div>
            </div>

            {/* Market Opportunity */}
            <Section id="market" title="Market Opportunity" icon={TrendingUp}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">The AI Career Revolution</h3>
                  <p className="text-gray-700 mb-4">
                    Every profession is being transformed by AI. This isn't just about ML engineers—it's about sales professionals using AI to close deals, consultants implementing AI strategies, recruiters leveraging AI for candidate matching, product managers building AI features, and marketers using generative AI for content.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-2xl font-bold text-green-700 mb-1">25%</div>
                      <div className="text-sm text-gray-700">YoY growth in AI job postings</div>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-2xl font-bold text-blue-700 mb-1">143%</div>
                      <div className="text-sm text-gray-700">Growth in AI Engineer roles</div>
                    </div>
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="text-2xl font-bold text-purple-700 mb-1">47%</div>
                      <div className="text-sm text-gray-700">Increase in entry-level dev jobs</div>
                    </div>
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="text-2xl font-bold text-orange-700 mb-1">17%</div>
                      <div className="text-sm text-gray-700">Projected growth rate (2023-2033)</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Target Job Categories</h3>
                  <div className="space-y-3">
                    <div className="p-4 border-l-4 border-blue-600 bg-blue-50">
                      <div className="font-semibold text-gray-900 mb-1">AI Core Engineering (50-100K jobs)</div>
                      <div className="text-sm text-gray-700">ML Engineers, Data Scientists, AI Researchers, NLP Engineers, Computer Vision Engineers, LLM Engineers, AI Safety Researchers</div>
                    </div>
                    <div className="p-4 border-l-4 border-purple-600 bg-purple-50">
                      <div className="font-semibold text-gray-900 mb-1">AI Software Development (100-150K jobs)</div>
                      <div className="text-sm text-gray-700">Software Engineers building AI features, Platform Engineers for ML, DevOps for AI systems, Full Stack with AI integration</div>
                    </div>
                    <div className="p-4 border-l-4 border-green-600 bg-green-50">
                      <div className="font-semibold text-gray-900 mb-1">AI Business Roles (20-30K jobs)</div>
                      <div className="text-sm text-gray-700">AI Product Managers, AI Sales Engineers, AI Consultants, AI Strategy Directors, AI Implementation Specialists</div>
                    </div>
                    <div className="p-4 border-l-4 border-orange-600 bg-orange-50">
                      <div className="font-semibold text-gray-900 mb-1">AI-Adjacent Operations (50-80K jobs)</div>
                      <div className="text-sm text-gray-700">AI Recruiters, AI Technical Writers, AI Training Specialists, AI Content Creators, Prompt Engineers</div>
                    </div>
                    <div className="p-4 border-l-4 border-red-600 bg-red-50">
                      <div className="font-semibold text-gray-900 mb-1">Data & Analytics (50-80K jobs)</div>
                      <div className="text-sm text-gray-700">Data Engineers building ML pipelines, Analytics Engineers with AI tools, BI Developers using AI insights</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Market Size & Economics</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-3 text-left">Segment</th>
                          <th className="p-3 text-left">Active Jobs</th>
                          <th className="p-3 text-left">Professionals</th>
                          <th className="p-3 text-left">Avg Salary</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="p-3">AI Core Engineering</td>
                          <td className="p-3 font-semibold">75K</td>
                          <td className="p-3">200K</td>
                          <td className="p-3 text-green-700 font-semibold">$165K</td>
                        </tr>
                        <tr>
                          <td className="p-3">AI Software Dev</td>
                          <td className="p-3 font-semibold">125K</td>
                          <td className="p-3">800K</td>
                          <td className="p-3 text-green-700 font-semibold">$145K</td>
                        </tr>
                        <tr>
                          <td className="p-3">AI Business</td>
                          <td className="p-3 font-semibold">25K</td>
                          <td className="p-3">150K</td>
                          <td className="p-3 text-green-700 font-semibold">$140K</td>
                        </tr>
                        <tr>
                          <td className="p-3">AI Operations</td>
                          <td className="p-3 font-semibold">40K</td>
                          <td className="p-3">200K</td>
                          <td className="p-3 text-green-700 font-semibold">$95K</td>
                        </tr>
                        <tr>
                          <td className="p-3">Data & Analytics</td>
                          <td className="p-3 font-semibold">50K</td>
                          <td className="p-3">400K</td>
                          <td className="p-3 text-green-700 font-semibold">$125K</td>
                        </tr>
                        <tr className="bg-blue-50 font-bold">
                          <td className="p-3">TOTAL</td>
                          <td className="p-3">315K</td>
                          <td className="p-3">1.75M</td>
                          <td className="p-3 text-green-700">$134K avg</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </Section>

            {/* Problem Statement */}
            <Section id="problem" title="Problem Statement" icon={Target}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Core Problems</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                      <div className="font-semibold text-red-900 mb-2">1. Signal vs Noise on Generic Job Boards</div>
                      <p className="text-gray-700 text-sm mb-2">LinkedIn has 30M+ jobs, Indeed has 10M+ jobs. Finding the needle (AI-powered roles) in the haystack is nearly impossible. A search for "AI Engineer" returns roles from 2 years ago, recruiting spam, and non-AI roles that just mention "AI" in passing.</p>
                      <div className="text-xs text-gray-600 italic">Impact: Job seekers spend 10+ hours/week filtering garbage</div>
                    </div>

                    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                      <div className="font-semibold text-red-900 mb-2">2. No AI-Specific Job Discovery</div>
                      <p className="text-gray-700 text-sm mb-2">A sales professional doesn't know "AI Sales Engineer" exists. A recruiter doesn't realize "AI Talent Acquisition Specialist" is a career path. A consultant has no idea companies are hiring "AI Implementation Consultants."</p>
                      <div className="text-xs text-gray-600 italic">Impact: Professionals miss high-paying AI career transitions</div>
                    </div>

                    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                      <div className="font-semibold text-red-900 mb-2">3. Can't Filter by AI Tech Stack</div>
                      <p className="text-gray-700 text-sm mb-2">Want a role using PyTorch? LangChain? OpenAI API? Claude? Impossible to filter on existing platforms. Job descriptions mention tools inconsistently, and search doesn't understand "LLM" vs "Large Language Model" vs "GPT."</p>
                      <div className="text-xs text-gray-600 italic">Impact: Skills mismatch, wasted applications</div>
                    </div>

                    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                      <div className="font-semibold text-red-900 mb-2">4. Stale Job Data</div>
                      <p className="text-gray-700 text-sm mb-2">Generic job boards update weekly or monthly. AI roles fill fast—often within days. By the time you see the job on Indeed, it's been filled for a week.</p>
                      <div className="text-xs text-gray-600 italic">Impact: Applying to closed positions, discouragement</div>
                    </div>

                    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                      <div className="font-semibold text-red-900 mb-2">5. No Career Path Guidance</div>
                      <p className="text-gray-700 text-sm mb-2">A data analyst wants to move into ML engineering but doesn't know: What skills do I need? What's the salary jump? What companies hire for this transition? Which roles are entry vs senior?</p>
                      <div className="text-xs text-gray-600 italic">Impact: Unclear career progression, missed opportunities</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">User Pain Points by Persona</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="font-semibold text-blue-700 mb-2">AI Engineers</div>
                      <ul className="text-sm space-y-1 text-gray-700">
                        <li>• Can't filter by specific AI frameworks</li>
                        <li>• No insight into team size/tech stack</li>
                        <li>• Spam from non-AI roles mentioning "AI"</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="font-semibold text-purple-700 mb-2">Career Transitioners</div>
                      <ul className="text-sm space-y-1 text-gray-700">
                        <li>• Don't know what AI roles exist</li>
                        <li>• Unclear skill requirements</li>
                        <li>• No career path visibility</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="font-semibold text-green-700 mb-2">AI Business Roles</div>
                      <ul className="text-sm space-y-1 text-gray-700">
                        <li>• AI PM/Sales/Consultant roles buried</li>
                        <li>• Generic boards don't categorize them</li>
                        <li>• Hard to find non-technical AI jobs</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="font-semibold text-orange-700 mb-2">Remote Workers</div>
                      <ul className="text-sm space-y-1 text-gray-700">
                        <li>• Remote AI jobs scattered everywhere</li>
                        <li>• No way to filter "remote-first AI"</li>
                        <li>• Time zone requirements unclear</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* Solution Overview */}
            <Section id="solution" title="Solution Overview" icon={Zap}>
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">The Platform</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    A curated job board exclusively for AI-powered careers across all industries. We aggregate 315K+ AI-relevant jobs, update them daily, and provide AI-native features like tech stack filtering, skill gap analysis, and career path recommendations.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Core Value Propositions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Filter className="w-5 h-5 text-blue-600 mt-1" />
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">AI-Only Curation</div>
                          <p className="text-sm text-gray-700">Every job is verified to be AI-powered. No spam, no ancient listings, no "AI" keyword stuffing.</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Search className="w-5 h-5 text-purple-600 mt-1" />
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">Tech Stack Filtering</div>
                          <p className="text-sm text-gray-700">Filter by PyTorch, TensorFlow, LangChain, OpenAI API, Claude, Hugging Face, and 100+ AI tools.</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-green-600 mt-1" />
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">Daily Freshness</div>
                          <p className="text-sm text-gray-700">Jobs updated every 12-24 hours. See opportunities while they're still open, not weeks later.</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <BarChart3 className="w-5 h-5 text-orange-600 mt-1" />
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">AI-Powered Matching</div>
                          <p className="text-sm text-gray-700">Upload resume, get skill gap analysis and "you're 2 skills away" recommendations.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Unique Differentiators</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white border-l-4 border-blue-600 rounded">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                      <div>
                        <div className="font-semibold text-gray-900">Cross-Industry AI Job Discovery</div>
                        <p className="text-sm text-gray-700">Surface AI Sales, AI Recruiting, AI Consulting roles that don't show up on traditional tech job boards</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white border-l-4 border-purple-600 rounded">
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                      <div>
                        <div className="font-semibold text-gray-900">AI Focus Classification</div>
                        <p className="text-sm text-gray-700">Tag jobs by AI specialization: NLP, Computer Vision, LLMs, Reinforcement Learning, MLOps, Generative AI</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white border-l-4 border-green-600 rounded">
                      <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                      <div>
                        <div className="font-semibold text-gray-900">Career Transition Pathways</div>
                        <p className="text-sm text-gray-700">"From Data Analyst to ML Engineer" - show exactly what skills to learn and which roles bridge the gap</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white border-l-4 border-orange-600 rounded">
                      <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                      <div>
                        <div className="font-semibold text-gray-900">Salary Transparency</div>
                        <p className="text-sm text-gray-700">Real salary data by role, location, and experience level. No more "competitive salary" nonsense</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* Core Features */}
            <Section id="features" title="Core Features & Prioritization" icon={Zap}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">MVP Features (Week 1-2)</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Job Search & Filtering', desc: 'Search by title, location, remote status, salary range', priority: 'P0' },
                      { name: 'AI Category Taxonomy', desc: 'Filter by AI Core, AI Business, AI Operations, Data roles', priority: 'P0' },
                      { name: 'Tech Stack Filter', desc: 'Multi-select checkboxes for AI tools (PyTorch, TensorFlow, etc)', priority: 'P0' },
                      { name: 'Job Detail Pages', desc: 'Full description, requirements, salary, company info, apply link', priority: 'P0' },
                      { name: 'Daily Data Refresh', desc: 'Automated Azure Functions updating job data from APIs', priority: 'P0' }
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className={`px-2 py-1 rounded text-xs font-bold ${
                          feature.priority === 'P0' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                        }`}>
                          {feature.priority}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{feature.name}</div>
                          <p className="text-sm text-gray-700">{feature.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Phase 2 Features (Month 2-3)</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'User Accounts & Saved Jobs', desc: 'Sign up, save jobs, track applications', priority: 'P1' },
                      { name: 'Email Job Alerts', desc: 'Daily/weekly digest of new jobs matching criteria', priority: 'P1' },
                      { name: 'Resume Upload & AI Matching', desc: 'Upload resume, get match scores and skill gaps', priority: 'P1' },
                      { name: 'Advanced Filters', desc: 'Company size, funding stage, industry, experience level', priority: 'P1' },
                      { name: 'Salary Insights Dashboard', desc: 'Show median salaries by role, location, experience', priority: 'P2' }
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className={`px-2 py-1 rounded text-xs font-bold ${
                          feature.priority === 'P1' ? 'bg-orange-600 text-white' : 'bg-yellow-600 text-white'
                        }`}>
                          {feature.priority}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{feature.name}</div>
                          <p className="text-sm text-gray-700">{feature.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Future Features (Month 4+)</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      'Career Path Navigator ("From X to Y")',
                      'Company Intelligence (funding, tech stack, culture)',
                      'AI Interview Prep (powered by Claude/Gemini)',
                      'Networking Features (connect with others applying)',
                      'Salary Negotiation Calculator',
                      'Application Tracking System',
                      'Chrome Extension (save jobs from anywhere)',
                      'Mobile App (iOS/Android)'
                    ].map((feature, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="text-sm font-medium text-gray-900">{feature}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            {/* User Personas */}
            <Section i
