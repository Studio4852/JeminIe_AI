import React, { useState } from 'react';
import { ShieldCheck, Activity, MessageSquareText, Lock, ArrowRight, CheckCircle, Globe, ChevronRight, X, CreditCard, Check, FileText, Server, Eye } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onSignupClick }) => {
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'terms' | 'baa' | null>(null);

  const scrollToSection = (id: string) => {
      const element = document.getElementById(id);
      if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
      }
  };

  const LegalModal = ({ title, content, onClose }: { title: string, content: React.ReactNode, onClose: () => void }) => (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#13131f] rounded-3xl shadow-2xl max-w-2xl w-full h-[80vh] flex flex-col relative overflow-hidden border border-white/10">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0f0f1a]">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                          <FileText size={20} />
                      </div>
                      <h3 className="text-xl font-bold text-white">{title}</h3>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-slate-400 hover:text-white"><X size={20}/></button>
              </div>
              <div className="p-8 overflow-y-auto leading-relaxed text-slate-300 space-y-4 font-light text-sm md:text-base">
                  {content}
              </div>
              <div className="p-6 border-t border-white/10 bg-[#0f0f1a] flex justify-end">
                  <button onClick={onClose} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-900/20">Acknowledge & Close</button>
              </div>
          </div>
      </div>
  );

  const getLegalContent = (type: 'privacy' | 'terms' | 'baa') => {
      switch(type) {
          case 'privacy':
              return (
                  <>
                    <p className="text-indigo-300 font-bold mb-4">Effective Date: October 2024</p>
                    <p>Jemine AI ("we", "our") is committed to protecting Personal Health Information (PHI) in accordance with the <strong>African Union Convention on Cyber Security and Personal Data Protection (Malabo Convention)</strong>.</p>
                    
                    <h4 className="text-lg font-bold text-white mt-6 mb-2">1. Regional Compliance Framework</h4>
                    <p>We operate in strict adherence to national data protection laws across our service regions:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-2 marker:text-indigo-500">
                        <li><strong>Nigeria:</strong> Nigeria Data Protection Regulation (NDPR) 2019 & Nigeria Data Protection Act 2023.</li>
                        <li><strong>South Africa:</strong> Protection of Personal Information Act (POPIA).</li>
                        <li><strong>Kenya:</strong> Data Protection Act (DPA) 2019.</li>
                        <li><strong>Ghana:</strong> Data Protection Act, 2012 (Act 843).</li>
                    </ul>

                    <h4 className="text-lg font-bold text-white mt-6 mb-2">2. Data Sovereignty & Residency</h4>
                    <p>Patient data is processed with respect to data sovereignty. Where required by local law (e.g., health data in Kenya or Nigeria), primary data storage is maintained within the respective national borders or in compliant jurisdictions with adequate data protection adequacy status.</p>

                    <h4 className="text-lg font-bold text-white mt-6 mb-2">3. Patient Directory Privacy</h4>
                    <p>The Patient Directory feature implements <strong>Role-Based Access Control (RBAC)</strong>. Only authorized healthcare providers with a verified National Provider Identifier (or local equivalent) may access patient records. All access is logged for audit purposes.</p>
                  </>
              );
          case 'terms':
              return (
                  <>
                    <p className="text-indigo-300 font-bold mb-4">Terms of Service</p>
                    <p>By accessing Jemine AI, you agree to be bound by these Terms, which are governed by the laws of the jurisdiction in which your healthcare facility is licensed.</p>
                    
                    <h4 className="text-lg font-bold text-white mt-6 mb-2">1. Acceptable Use Policy</h4>
                    <p>You agree to use the platform solely for lawful healthcare management purposes. Unauthorized extraction of data (scraping) or misuse of the AI communication tools for marketing spam is strictly prohibited under the <strong>Cybercrimes Acts</strong> of respective African nations.</p>
                    
                    <h4 className="text-lg font-bold text-white mt-6 mb-2">2. Medical Disclaimer</h4>
                    <p>Jemine AI is a clinical decision support tool, not a diagnostic device. The AI-generated suggestions must be verified by a licensed healthcare professional. We assume no liability for medical decisions made based on platform data.</p>
                    
                    <h4 className="text-lg font-bold text-white mt-6 mb-2">3. Dispute Resolution</h4>
                    <p>Any disputes arising from these terms shall be resolved through arbitration in Lagos, Nigeria, or Nairobi, Kenya, depending on the user's primary region of operation.</p>
                  </>
              );
          case 'baa':
              return (
                  <>
                    <p className="text-indigo-300 font-bold mb-4">Data Processing & Business Associate Agreement</p>
                    <p>This Agreement governs the processing of Protected Health Information (PHI) between the Covered Entity (You) and Jemine AI (Data Processor/Business Associate).</p>
                    
                    <h4 className="text-lg font-bold text-white mt-6 mb-2">1. Processor Obligations</h4>
                    <p>Jemine AI agrees to process PHI only on documented instructions from the Controller (You), ensuring confidentiality and security measures as required by <strong>GDPR, HIPAA, and African Data Protection Laws</strong>.</p>
                    
                    <h4 className="text-lg font-bold text-white mt-6 mb-2">2. Security Measures</h4>
                    <p>We implement technical and organizational measures including AES-256 encryption at rest, TLS 1.3 in transit, and regular vulnerability assessments to prevent unauthorized access.</p>
                    
                    <h4 className="text-lg font-bold text-white mt-6 mb-2">3. Breach Notification</h4>
                    <p>In the event of a personal data breach, we will notify the Data Controller without undue delay (within 72 hours) after becoming aware of the breach, assisting in obligations to notify supervisory authorities (e.g., ODPC in Kenya, NDPC in Nigeria).</p>
                  </>
              );
      }
  };

  return (
    <div className="min-h-screen bg-[#0a0a16] font-sans text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {activeLegalModal && (
          <LegalModal 
            title={activeLegalModal === 'privacy' ? 'Privacy Policy & Data Protection' : activeLegalModal === 'terms' ? 'Terms of Service' : 'Data Processing Agreement'}
            content={getLegalContent(activeLegalModal)}
            onClose={() => setActiveLegalModal(null)}
          />
      )}

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-[#0a0a16]/80 backdrop-blur-md z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-indigo-500/20">J</div>
            <div>
              <h1 className="text-xl font-bold tracking-tight leading-none text-white">Jemine AI</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">Hospital & Pharmacy</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
            <button onClick={() => scrollToSection('solutions')} className="hover:text-indigo-400 transition">Solutions</button>
            <button onClick={() => scrollToSection('compliance')} className="hover:text-indigo-400 transition">Compliance</button>
            {/* Pricing Link Removed */}
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={onLoginClick}
              className="hidden md:block text-sm font-bold text-slate-400 hover:text-white transition"
            >
              Sign In
            </button>
            <button 
              onClick={onSignupClick}
              className="bg-white text-[#0a0a16] px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-200 transition shadow-lg shadow-white/5 flex items-center gap-2"
            >
              Get Started <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-wider mb-8">
            <ShieldCheck size={14} /> NDPR & POPIA Compliant
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 leading-tight">
            Intelligent Care for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">African Healthcare.</span>
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Automate patient adherence reminders, manage loyalty rewards, and bridge communication gaps with AI-driven engagement—securely and efficiently.
          </p>
          
          <div className="mt-12 flex items-center justify-center gap-8 text-slate-500 opacity-60">
             {/* Mock Partner Logos */}
             <div className="font-bold text-xl flex items-center gap-2 grayscale hover:grayscale-0 transition duration-300 hover:text-white cursor-default"><Activity size={24}/> MedPlus</div>
             <div className="font-bold text-xl flex items-center gap-2 grayscale hover:grayscale-0 transition duration-300 hover:text-white cursor-default"><ShieldCheck size={24}/> HealthGuard</div>
             <div className="font-bold text-xl flex items-center gap-2 grayscale hover:grayscale-0 transition duration-300 hover:text-white cursor-default"><Globe size={24}/> CareAfrica</div>
          </div>
        </div>
      </section>

      {/* Feature Grid (Solutions) */}
      <section id="solutions" className="py-20 bg-[#0e0e17] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Everything you need to improve adherence</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Our platform integrates seamlessly into your pharmacy or hospital workflow to reduce churn and improve outcomes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#151521] p-8 rounded-3xl shadow-lg shadow-black/20 border border-white/5 hover:border-white/10 transition group">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                <MessageSquareText size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI Communication</h3>
              <p className="text-slate-400 leading-relaxed">
                  Generate culturally relevant SMS and WhatsApp messages in Hausa, Igbo, Yoruba, Swahili, and French automatically, plus handle voice notes and custom templates for personalized care.
              </p>
            </div>
            
            <div className="bg-[#151521] p-8 rounded-3xl shadow-lg shadow-black/20 border border-white/5 hover:border-white/10 transition group">
              <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                <Activity size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Adherence Analytics</h3>
              <p className="text-slate-400 leading-relaxed">Track patient refill rates and vital signs. Identify at-risk patients before they drop off therapy.</p>
            </div>

            <div className="bg-[#151521] p-8 rounded-3xl shadow-lg shadow-black/20 border border-white/5 hover:border-white/10 transition group">
              <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mb-6 border border-rose-500/10 group-hover:bg-rose-500/20 transition-colors">
                <Lock size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">African Compliance</h3>
              <p className="text-slate-400 leading-relaxed">Built-in PHI masking, role-based access control (RBAC), and audit logs aligned with NDPR, POPIA, and DPA regulations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* New Dedicated Compliance Section */}
      <section id="compliance" className="py-24 bg-[#05050a] border-t border-white/5 relative overflow-hidden">
         <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
         <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>
         
         <div className="max-w-5xl mx-auto px-6 text-center">
             <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
                <ShieldCheck size={14} /> Enterprise Security
             </div>
             <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                Uncompromised Data Security & <br/>
                <span className="text-indigo-400">Regulatory Compliance.</span>
             </h2>
             <p className="text-slate-400 text-lg mb-12 leading-relaxed max-w-2xl mx-auto">
                Jemine AI is built from the ground up to adhere to the strictest healthcare data protection standards across Africa and the globe. Your patient data never leaves secure, sovereign jurisdictions where required.
             </p>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                {[
                  "NDPR & NDPA (Nigeria) Compliant",
                  "POPIA (South Africa) Ready",
                  "HIPAA & GDPR Standards",
                  "AES-256 Data Encryption",
                  "Role-Based Access Control (RBAC)",
                  "Sovereign Data Residency"
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-[#13131f] border border-white/5 p-4 rounded-2xl hover:border-white/10 transition text-left">
                       <div className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-400 shrink-0"><Check size={14} /></div>
                       <span className="text-slate-300 font-medium text-sm">{item}</span>
                    </div>
                ))}
             </div>

             <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => setActiveLegalModal('baa')} className="px-8 py-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2">
                    <FileText size={18} /> View BAA Agreement
                </button>
                <button onClick={() => setActiveLegalModal('privacy')} className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition flex items-center justify-center gap-2">
                    <ShieldCheck size={18} /> Privacy Policy
                </button>
             </div>
         </div>
      </section>

      {/* Compliance Footer */}
      <footer className="bg-[#05050a] py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-indigo-900/20">J</div>
                <span className="font-bold text-xl text-white">Jemine AI</span>
              </div>
              <p className="text-slate-400 max-w-xs mb-6">
                Empowering healthcare providers with intelligent tools for better patient outcomes across Africa.
              </p>
              <div className="flex gap-4">
                <ShieldCheck className="text-emerald-500" />
                <Lock className="text-slate-500" />
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Platform</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><button onClick={() => scrollToSection('compliance')} className="hover:text-indigo-400 transition">Patient Directory Compliance</button></li>
                <li><button onClick={() => scrollToSection('solutions')} className="hover:text-indigo-400 transition">Bulk Campaigns</button></li>
                <li><button onClick={() => scrollToSection('solutions')} className="hover:text-indigo-400 transition">Analytics</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Legal (Africa)</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><button onClick={() => setActiveLegalModal('privacy')} className="hover:text-indigo-400 transition">Privacy Policy (NDPR/POPIA)</button></li>
                <li><button onClick={() => setActiveLegalModal('terms')} className="hover:text-indigo-400 transition">Terms of Service</button></li>
                <li><button onClick={() => setActiveLegalModal('baa')} className="hover:text-indigo-400 transition">Data Processing (BAA)</button></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p>&copy; 2024 Jemine AI Health. All rights reserved. Lagos • Nairobi • Cape Town</p>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
               <span>Systems Operational • Encrypted (TLS 1.3)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;