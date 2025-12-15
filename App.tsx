
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import PatientList from './components/PatientList';
import PatientDetail from './components/PatientDetail';
import AIAssistant from './components/AIAssistant';
import Analytics from './components/Analytics';
import LandingPage from './components/LandingPage';
import { mockPatients, adherenceHistoryData } from './services/mockData';
import { Patient, AdherenceStatus } from './types';
import { ShieldCheck, Lock, User, ArrowRight, X, Save, Globe, AlertCircle, ArrowLeft, Coins } from 'lucide-react';
import { translations } from './translations';

type AppView = 'landing' | 'auth' | 'app';

function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<AppView>('landing');
  
  // Auth State
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [signupData, setSignupData] = useState({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
  });
  const [authError, setAuthError] = useState('');
  
  // App State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [viewingPatientDetail, setViewingPatientDetail] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // User Profile State
  const [userProfile, setUserProfile] = useState({
    name: 'Pharm. A. Bello',
    role: 'Lead Pharmacist',
    facility: 'General Hospital • Pharmacy Unit',
    email: 'pharm.bello@hospital.com',
    providerId: 'PHARM-BELLO-001'
  });

  // Deep Link State (Navigation with filters)
  const [patientListFilter, setPatientListFilter] = useState<string>('All');

  // Add Patient Form State
  const [newPatient, setNewPatient] = useState<Partial<Patient>>({
    name: '',
    age: 0,
    phone: '',
    email: '',
    condition: '',
    language: 'English',
    status: AdherenceStatus.Good
  });
  
  // Settings State
  const [settings, setSettings] = useState({
    maskPhi: true,
    emailAlerts: true,
    dailyDigest: false,
    darkMode: false,
    language: 'English',
    currency: 'NGN' // Default currency
  });

  // Determine current language object
  const currentLangCode = settings.language === 'English-UK' ? 'English' : settings.language;
  const t = translations[currentLangCode] || translations['English'];

  // Calculate stats dynamically based on current state
  const stats = {
    totalPatients: patients.length,
    avgAdherence: Math.round(patients.reduce((acc, curr) => acc + curr.adherenceRate, 0) / (patients.length || 1)),
    refillsDue: patients.filter(p => p.medications.some(m => m.refillDue)).length,
    criticalPatients: patients.filter(p => p.status === AdherenceStatus.Critical).length,
    avgSatisfaction: 4.5,
    activeSubscriptions: patients.filter(p => p.subscriptionStatus === 'Active').length
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, validate credentials here
    setCurrentView('app');
  };

  const handleSignup = (e: React.FormEvent) => {
      e.preventDefault();
      setAuthError('');

      // LOG 002 & LOG 004: Validate Password Confirmation
      if (signupData.password !== signupData.confirmPassword) {
          setAuthError("Passwords do not match. Please verify your entries.");
          return;
      }

      if (signupData.password.length < 6) {
          setAuthError("Password must be at least 6 characters.");
          return;
      }

      // In a real app, create user account here
      alert("Account created successfully!");
      setCurrentView('app');
  }

  const handleLogout = () => {
    setCurrentView('landing');
    setActiveTab('dashboard');
    setSelectedPatient(null);
    setViewingPatientDetail(false);
    setAuthMode('login');
    setSignupData({ fullName: '', email: '', password: '', confirmPassword: '' });
    setAuthError('');
  }

  // Handle navigation from sidebar/layout to ensure filters reset
  const handleSidebarNavigation = (tab: string) => {
    if (tab === 'patients') {
        setPatientListFilter('All');
        setSelectedPatient(null);
        setViewingPatientDetail(false);
    }
    setActiveTab(tab);
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setViewingPatientDetail(true);
  };

  const handleUpdatePatient = (updatedPatient: Patient) => {
      setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
      setSelectedPatient(updatedPatient);
  };

  const handleNavigateToCommunication = (patient: Patient) => {
    setSelectedPatient(patient);
    setViewingPatientDetail(false);
    setActiveTab('communication');
  }

  const handleBackToPatientList = () => {
      setViewingPatientDetail(false);
      setSelectedPatient(null);
  }

  const handleViewCriticalPatients = () => {
    setPatientListFilter(AdherenceStatus.Critical);
    setActiveTab('patients');
  };

  const handleAddPatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient: Patient = {
        id: `P${Math.floor(Math.random() * 10000)}`,
        name: newPatient.name || 'Unknown',
        age: newPatient.age || 30,
        phone: newPatient.phone || '',
        email: newPatient.email || '',
        language: newPatient.language || 'English',
        condition: newPatient.condition || 'General Care',
        adherenceRate: 100, // Default for new
        status: AdherenceStatus.Excellent,
        subscriptionStatus: 'Active',
        communicationPreference: 'SMS', // Default
        loyaltyPoints: 0,
        medications: [],
        appointments: [],
        vitals: [],
        lastContact: new Date().toISOString().split('T')[0]
    };
    setPatients(prev => [patient, ...prev]);
    setIsAddModalOpen(false);
    // Reset form
    setNewPatient({
        name: '', age: 0, phone: '', email: '', condition: '', language: 'English'
    });
    alert("Patient added successfully.");
  };

  const handleSaveProfile = () => {
      // In a real app, this would perform an API call
      alert("Profile details updated successfully.");
  };

  useEffect(() => {
    if (activeTab !== 'patients') {
        setViewingPatientDetail(false);
    }
  }, [activeTab]);

  // Settings Component
  const renderSettings = () => (
      <div className="max-w-3xl mx-auto mt-6 animate-fade-in-up">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Settings</h2>
        <p className="text-slate-500 mb-8">Manage provider preferences and system configuration.</p>
        
        <div className="bg-white rounded-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
            {/* Profile Section */}
            <div className="p-8 border-b border-slate-100">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                        <User size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Provider Profile</h3>
                        <p className="text-sm text-slate-500">Edit your professional details</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Full Name</label>
                        <input 
                            type="text" 
                            value={userProfile.name}
                            onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Role Title</label>
                        <input 
                            type="text" 
                            value={userProfile.role}
                            onChange={(e) => setUserProfile({...userProfile, role: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Facility Name</label>
                        <input 
                            type="text" 
                            value={userProfile.facility}
                            onChange={(e) => setUserProfile({...userProfile, facility: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Provider ID</label>
                         <input 
                            type="text" 
                            value={userProfile.providerId}
                            disabled
                            className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 font-semibold text-slate-500 outline-none cursor-not-allowed"
                        />
                    </div>
                </div>
            </div>

            {/* System Preferences */}
            <div className="p-8 border-b border-slate-100">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                        <Globe size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">System Preferences</h3>
                        <p className="text-sm text-slate-500">Localization and display settings.</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Interface Language</label>
                        <div className="relative">
                            <select 
                                value={settings.language}
                                onChange={(e) => setSettings({...settings, language: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
                            >
                                <option value="English">English (US)</option>
                                <option value="English-UK">English (UK)</option>
                                <option value="Hausa">Hausa</option>
                                <option value="Igbo">Igbo</option>
                                <option value="Yoruba">Yoruba</option>
                                <option value="French">Français</option>
                                <option value="Swahili">Kiswahili</option>
                                <option value="Portuguese">Português</option>
                            </select>
                            <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Default Currency</label>
                        <div className="relative">
                            <select 
                                value={settings.currency}
                                onChange={(e) => setSettings({...settings, currency: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
                            >
                                <option value="NGN">NGN (₦)</option>
                                <option value="KES">KES (KSh)</option>
                                <option value="GHS">GHS (₵)</option>
                                <option value="ZAR">ZAR (R)</option>
                                <option value="USD">USD ($)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="EUR">EUR (€)</option>
                            </select>
                            <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400">
                                <Coins size={12} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notifications & Privacy */}
            <div className="p-8 border-b border-slate-100">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Privacy & Notifications</h3>
                        <p className="text-sm text-slate-500">Compliance controls and alert preferences.</p>
                    </div>
                </div>
                
                <div className="space-y-4">
                     <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer">
                        <span className="font-semibold text-slate-700">Mask PHI (Patient Health Info) by default</span>
                        <div className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={settings.maskPhi} onChange={() => setSettings({...settings, maskPhi: !settings.maskPhi})} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </div>
                     </label>

                     <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer">
                        <span className="font-semibold text-slate-700">Email Alerts for Low Supply</span>
                        <div className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={settings.emailAlerts} onChange={() => setSettings({...settings, emailAlerts: !settings.emailAlerts})} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </div>
                     </label>

                     <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer">
                        <span className="font-semibold text-slate-700">Daily Adherence Digest</span>
                        <div className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={settings.dailyDigest} onChange={() => setSettings({...settings, dailyDigest: !settings.dailyDigest})} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </div>
                     </label>
                </div>
            </div>
            
            <div className="p-6 bg-slate-50/50 flex justify-end">
                <button 
                    onClick={handleSaveProfile}
                    className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition shadow-lg shadow-slate-900/10 flex items-center gap-2"
                >
                    <Save size={18} /> Save Changes
                </button>
            </div>
        </div>
      </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            stats={stats} 
            chartData={adherenceHistoryData} 
            patients={patients} 
            onAddPatient={() => setIsAddModalOpen(true)}
            onViewCriticalPatients={handleViewCriticalPatients}
            t={t}
          />
        );
      case 'patients':
        if (viewingPatientDetail && selectedPatient) {
            return <PatientDetail 
                patient={selectedPatient} 
                onBack={handleBackToPatientList} 
                onNavigateToCommunication={handleNavigateToCommunication}
                onUpdatePatient={handleUpdatePatient}
                currency={settings.currency}
            />;
        }
        return (
          <PatientList 
            patients={patients} 
            onSelectPatient={handlePatientSelect} 
            onAddPatient={() => setIsAddModalOpen(true)}
            initialFilter={patientListFilter}
            onImportPatients={(newPatients) => setPatients(prev => [...newPatients, ...prev])}
            t={t}
          />
        );
      case 'communication':
        return <AIAssistant selectedPatient={selectedPatient} patients={patients} />;
      case 'analytics':
        return <Analytics patients={patients} adherenceHistory={adherenceHistoryData} />;
      case 'settings':
        return renderSettings();
      default:
        return <Dashboard stats={stats} chartData={adherenceHistoryData} patients={patients} onAddPatient={() => setIsAddModalOpen(true)} t={t} />;
    }
  };

  // View: Landing Page
  if (currentView === 'landing') {
    return <LandingPage 
      onLoginClick={() => { setAuthMode('login'); setCurrentView('auth'); }} 
      onSignupClick={() => { setAuthMode('signup'); setCurrentView('auth'); }} 
    />;
  }

  // View: Auth Screen (Login/Signup)
  if (currentView === 'auth') {
    return (
        <div className="h-screen w-full bg-[#f8fafc] flex items-center justify-center p-4 font-sans text-slate-900">
            <div className="bg-white w-full max-w-md p-10 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-slate-100 text-center relative overflow-hidden animate-fade-in-up">
                {/* Close Button */}
                <button 
                  onClick={() => setCurrentView('landing')}
                  className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-full transition z-10"
                  aria-label="Close"
                  title="Close"
                >
                    <X size={24} />
                </button>

                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                
                {/* Logo - Click to return to Home */}
                <button 
                  onClick={() => setCurrentView('landing')}
                  className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-slate-900/20 text-white font-bold text-4xl hover:scale-105 transition-transform"
                  title="Back to Home"
                >
                    J
                </button>

                <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Jemine AI</h1>
                <p className="text-slate-500 mb-8 font-medium">Hospital & Pharmacy Portal</p>
                
                {authMode === 'login' ? (
                    <form onSubmit={handleLogin} className="space-y-5 text-left animate-fade-in">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Provider ID / Email</label>
                            <input type="text" defaultValue="pharm.bello@hospital.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium text-slate-800" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Password</label>
                            <input type="password" defaultValue="password" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium text-slate-800" />
                        </div>
                        <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition shadow-xl mt-4 flex items-center justify-center gap-3">
                            <Lock size={18} /> Secure Login
                        </button>
                    </form>
                ) : (
                     <form onSubmit={handleSignup} className="space-y-5 text-left animate-fade-in">
                        {authError && (
                            <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-start gap-3">
                                <AlertCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
                                <p className="text-sm text-rose-600 font-medium">{authError}</p>
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                            <input 
                                type="text" 
                                placeholder="Pharm. A. Bello" 
                                required 
                                value={signupData.fullName}
                                onChange={(e) => setSignupData({...signupData, fullName: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium text-slate-800" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Hospital Email</label>
                            <input 
                                type="email" 
                                placeholder="pharm.bello@hospital.com" 
                                required 
                                value={signupData.email}
                                onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium text-slate-800" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Create Password</label>
                            <input 
                                type="password" 
                                required 
                                value={signupData.password}
                                onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium text-slate-800" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Confirm Password</label>
                            <input 
                                type="password" 
                                required 
                                value={signupData.confirmPassword}
                                onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                                className={`w-full bg-slate-50 border rounded-xl p-4 focus:ring-2 outline-none transition font-medium text-slate-800 ${signupData.confirmPassword && signupData.password !== signupData.confirmPassword ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'}`} 
                            />
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition shadow-xl mt-4 flex items-center justify-center gap-3">
                            <ArrowRight size={18} /> Create Account
                        </button>
                    </form>
                )}
                
                <div className="mt-6">
                    {authMode === 'login' ? (
                        <p className="text-sm text-slate-500">
                            Don't have an account? <button onClick={() => setAuthMode('signup')} className="text-indigo-600 font-bold hover:underline">Sign Up</button>
                        </p>
                    ) : (
                        <p className="text-sm text-slate-500">
                            Already have an account? <button onClick={() => { setAuthMode('login'); setAuthError(''); }} className="text-indigo-600 font-bold hover:underline">Log In</button>
                        </p>
                    )}
                </div>

                <div className="mt-8 border-t border-slate-50 pt-6">
                    <button 
                        onClick={() => setCurrentView('landing')}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600 transition flex items-center justify-center gap-2 mx-auto uppercase tracking-wider"
                    >
                        <ArrowLeft size={14} /> Back to Home
                    </button>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span>HIPAA Compliant & Encrypted</span>
                </div>
            </div>
        </div>
    );
  }

  // View: Main App (Dashboard)
  return (
    <>
        <Layout activeTab={activeTab} setActiveTab={handleSidebarNavigation} onLogout={handleLogout} userProfile={userProfile} t={t}>
          {renderContent()}
        </Layout>

        {/* Global Add Patient Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full p-8 relative">
                  <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">Add New Patient</h3>
                  
                  <form onSubmit={handleAddPatientSubmit} className="space-y-4">
                      {/* ... existing form fields ... */}
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                          <input required type="text" value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Age</label>
                              <input required type="number" value={newPatient.age || ''} onChange={e => setNewPatient({...newPatient, age: parseInt(e.target.value)})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Language</label>
                              <select value={newPatient.language} onChange={e => setNewPatient({...newPatient, language: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                                  <option value="English">English</option>
                                  <option value="Hausa">Hausa</option>
                                  <option value="Igbo">Igbo</option>
                                  <option value="Yoruba">Yoruba</option>
                                  <option value="Twi">Twi</option>
                                  <option value="Ga">Ga</option>
                                  <option value="Ewe">Ewe</option>
                                  <option value="French">French</option>
                                  <option value="Swahili">Swahili</option>
                              </select>
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Primary Condition</label>
                          <input required type="text" value={newPatient.condition} onChange={e => setNewPatient({...newPatient, condition: e.target.value})} placeholder="e.g. Hypertension" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                               <input required type="tel" value={newPatient.phone} onChange={e => setNewPatient({...newPatient, phone: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                          </div>
                          <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                               <input type="email" value={newPatient.email} onChange={e => setNewPatient({...newPatient, email: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                          </div>
                      </div>
                      
                      <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-all mt-4">
                          Create Patient Profile
                      </button>
                  </form>
              </div>
          </div>
        )}
    </>
  );
}

export default App;
