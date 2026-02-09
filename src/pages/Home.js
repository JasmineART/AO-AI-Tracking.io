import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '4s'}}></div>
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-16 animate-fadeInDown">
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight">
            <span className="gradient-text">OA AI Tracker</span>
          </h1>
          <div className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg">
            🚀 Enterprise AI Readiness Platform
          </div>
          <p className="text-2xl md:text-3xl text-gray-800 font-semibold mb-4">
            Transform Your AI Journey
          </p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Track, measure, and optimize your organization's AI and automation initiatives 
            with comprehensive metrics, real-time insights, and intelligent dashboards.
          </p>
          
          {!currentUser ? (
            <div className="flex gap-4 justify-center flex-wrap animate-fadeInUp">
              <Link
                to="/login"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 transform hover:-translate-y-1"
              >
                Get Started Free →
              </Link>
              <Link
                to="/login?demo=true"
                className="bg-white text-indigo-600 px-10 py-4 rounded-xl font-bold text-lg border-2 border-indigo-600 hover:bg-indigo-50 hover:shadow-xl hover:scale-105 transition-all duration-300 transform"
              >
                🎮 Try Live Demo
              </Link>
            </div>
          ) : (
            <Link
              to="/dashboard"
              className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 transform hover:-translate-y-1"
            >
              Open Dashboard →
            </Link>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="group bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fadeInUp" style={{animationDelay: '0.1s'}}>
            <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">📊</div>
            <h3 className="text-lg md:text-2xl font-bold mb-3 text-gray-900">Real-Time Analytics</h3>
            <p className="text-gray-600 leading-relaxed">
              Monitor AI readiness scores, project status, and key performance indicators with 
              live dashboards and interactive visualizations.
            </p>
            <div className="mt-4 h-1 w-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transform group-hover:w-full transition-all duration-300"></div>
          </div>
          
          <div className="group bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
            <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">🔗</div>
            <h3 className="text-lg md:text-2xl font-bold mb-3 text-gray-900">10+ Integrations</h3>
            <p className="text-gray-600 leading-relaxed">
              Seamlessly connect to AWS, Azure, Google Sheets, Excel, Salesforce, and 6+ more 
              popular enterprise data platforms.
            </p>
            <div className="mt-4 h-1 w-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transform group-hover:w-full transition-all duration-300"></div>
          </div>
          
          <div className="group bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fadeInUp" style={{animationDelay: '0.3s'}}>
            <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">🤖</div>
            <h3 className="text-lg md:text-2xl font-bold mb-3 text-gray-900">AI-Powered Insights</h3>
            <p className="text-gray-600 leading-relaxed">
              Auto-generated dashboards with intelligent recommendations and actionable 
              insights powered by advanced analytics.
            </p>
            <div className="mt-4 h-1 w-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transform group-hover:w-full transition-all duration-300"></div>
          </div>
        </div>

        {/* Key Features Section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-10 mb-16 border border-white/50 animate-fadeInUp">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            <span className="gradient-text">Powerful Features</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: '✅', title: 'Project Management', desc: 'Track AI systems and automation projects across your enterprise' },
              { icon: '📈', title: 'Readiness Scoring', desc: 'Measure AI readiness with comprehensive metrics and benchmarks' },
              { icon: '👥', title: 'Department Analytics', desc: 'View progress and metrics segmented by department and team' },
              { icon: '📉', title: 'Trend Analysis', desc: 'Identify patterns and forecast future AI adoption trends' },
              { icon: '🔐', title: 'Secure Authentication', desc: 'Google, GitHub, and email-based secure login options' },
              { icon: '🎯', title: 'Custom Dashboards', desc: 'AI-generated visualizations tailored to your data' }
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-xl hover:bg-indigo-50 transition-all duration-300 group" style={{animationDelay: `${idx * 0.1}s`}}>
                <span className="text-3xl transform group-hover:scale-125 transition-transform duration-300">{feature.icon}</span>
                <div>
                  <h4 className="font-bold text-base md:text-lg mb-1 text-gray-900">{feature.title}</h4>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { value: '10+', label: 'Data Sources' },
            { value: '100%', label: 'Secure' },
            { value: '24/7', label: 'Monitoring' },
            { value: '∞', label: 'Scalability' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-2xl text-center text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-scaleIn" style={{animationDelay: `${idx * 0.1}s`}}>
              <div className="text-3xl md:text-4xl font-extrabold mb-2">{stat.value}</div>
              <div className="text-xs md:text-sm opacity-90">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-3xl shadow-2xl p-12 text-center overflow-hidden animate-gradient">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your AI Journey?</h2>
            <p className="text-xl mb-8 opacity-95">
              Join forward-thinking organizations successfully managing their AI transformation.
            </p>
            {!currentUser && (
              <Link
                to="/login"
                className="inline-block bg-white text-indigo-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 transform"
              >
                Start Tracking Now →
              </Link>
            )}
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        </div>
      </div>
    </div>
  );
};

export default Home;
