
import React, { useState } from 'react';
import { Patient, AdherenceStatus, VitalLog, CommunicationChannel } from '../types';
import { 
  ArrowLeft, Calendar, Pill, Activity, Award, MessageCircle, 
  Phone, Mail, MapPin, AlertCircle, CheckCircle, Clock, 
  Plus, ChevronRight, Gift, Mic, Info, X, Bell, Truck, RefreshCw, ClipboardList, Stethoscope, MessageSquare
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyzeAdherencePattern } from '../services/geminiService';

interface PatientDetailProps {
  patient: Patient;
  onBack: () => void;
  onNavigateToCommunication: (patient: Patient) => void;
  onUpdatePatient?: (patient: Patient) => void;
  currency?: string;
}

const getCurrencySymbol = (currency: string) => {
    switch(currency) {
        case 'NGN': return '₦';
        case 'KES': return 'KSh ';
        case 'GHS': return '₵';
        case 'ZAR': return 'R ';
        case 'EUR': return '€';
        case 'GBP': return '£';
        default: return '$';
    }
}

const PatientDetail: React.FC<PatientDetailProps> = ({ patient, onBack, onNavigateToCommunication, onUpdatePatient, currency = 'NGN' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'meds' | 'appointments' | 'vitals' | 'loyalty'>('overview');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Data State (Promoted from props to allow mutations)
  const [medications, setMedications] = useState(patient.medications);
  const [vitalsHistory, setVitalsHistory] = useState<VitalLog[]>(patient.vitals);
  const [reminders, setReminders] = useState<{title: string, freq: string}[]>([]);
  const [callLogs, setCallLogs] = useState<{date: string, outcome: string, notes: string}[]>([]);

  // Modals Visibility State
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  
  // Form States
  const [newReminder, setNewReminder] = useState({ title: '', frequency: 'Daily', time: '09:00' });
  const [newCall, setNewCall] = useState({ outcome: 'Connected', notes: '' });
  const [newDelivery, setNewDelivery] = useState({ medId: '', date: '', notes: '', method: 'Delivery' });
  const [newVital, setNewVital] = useState({ type: 'Blood Pressure', value: '', unit: 'mmHg' });

  const handleAiAnalysis = async () => {
    setAnalyzing(true);
    const dataSummary = `Patient ${patient.name} has ${patient.condition}. Adherence is ${patient.adherenceRate}%. Latest vitals: ${vitalsHistory.map(v => `${v.type}: ${v.value}`).join(', ')}.`;
    const insight = await analyzeAdherencePattern(dataSummary);
    setAiAnalysis(insight);
    setAnalyzing(false);
  };

  const handleRefillCheckIn = (medId: string) => {
    setMedications(prev => prev.map(med => {
        if (med.id === medId) {
            return { ...med, remainingSupply: 30, refillDue: false };
        }
        return med;
    }));
    alert("Refill checked in successfully. Inventory updated.");
  };

  const handleCommunicationPrefChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onUpdatePatient) {
          onUpdatePatient({ ...patient, communicationPreference: e.target.value as CommunicationChannel });
      }
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newReminder.title) return;
    setReminders([...reminders, { title: newReminder.title, freq: `${newReminder.frequency} at ${newReminder.time}` }]);
    setShowReminderModal(false);
    setNewReminder({ title: '', frequency: 'Daily', time: '09:00' });
  };

  const handleLogCall = (e: React.FormEvent) => {
      e.preventDefault();
      const log = {
          date: new Date().toLocaleString(),
          outcome: newCall.outcome,
          notes: newCall.notes
      };
      setCallLogs([log, ...callLogs]);
      setShowCallModal(false);
      setNewCall({ outcome: 'Connected', notes: '' });
      // In a real app, you might show a toast notification here
  };

  const handleScheduleDelivery = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newDelivery.medId || !newDelivery.date) {
          alert(`Please select a medication and a ${newDelivery.method.toLowerCase()} date.`);
          return;
      }
      setShowDeliveryModal(false);
      const actionText = newDelivery.method === 'Delivery' ? 'Delivery scheduled' : 'Pickup scheduled';
      const destText = newDelivery.method === 'Delivery' ? `to ${patient.name}'s primary address` : 'at the pharmacy counter';
      alert(`${actionText} for ${newDelivery.date} ${destText}.`);
      setNewDelivery({ medId: '', date: '', notes: '', method: 'Delivery' });
  };

  const handleAddVital = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newVital.value) return;

      // Simple pseudo-logic for status
      let status: 'Normal' | 'Warning' | 'Critical' = 'Normal';
      if (newVital.type === 'Blood Pressure') {
          const sys = parseInt(newVital.value.split('/')[0]);
          if (sys > 140) status = 'Warning';
          if (sys > 160) status = 'Critical';
      } else if (newVital.type === 'Blood Sugar') {
           const val = parseInt(newVital.value);
           if (val > 140) status = 'Warning';
           if (val > 200) status = 'Critical';
      }

      const entry: VitalLog = {
          id: `v-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: newVital.type as any,
          value: newVital.value,
          unit: newVital.unit,
          status: status
      };

      setVitalsHistory([entry, ...vitalsHistory]);
      setShowVitalsModal(false);
      setNewVital({ type: 'Blood Pressure', value: '', unit: 'mmHg' });
  };

  const renderRiskModal = () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
              <button onClick={() => setShowRiskModal(false)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
              
              <div className="flex items-center gap-3 mb-4">
                 <div className={`p-3 rounded-xl ${patient.status === 'Critical' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                    <Activity size={24} />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900">Risk Assessment</h3>
              </div>
              
              <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">Current Status</p>
                      <p className="text-lg font-bold text-slate-900">{patient.status} ({patient.adherenceRate}%)</p>
                  </div>
                  
                  <div>
                      <h4 className="font-bold text-slate-800 mb-2">Primary Risk Factors:</h4>
                      <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm text-slate-600">
                              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                              Missed 3 doses of Lisinopril in the last 7 days.
                          </li>
                          <li className="flex items-start gap-2 text-sm text-slate-600">
                              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                              Blood pressure trending upward.
                          </li>
                      </ul>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                      <button 
                        onClick={() => { setShowRiskModal(false); onNavigateToCommunication(patient); }}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all"
                      >
                          Send Intervention Message
                      </button>
                  </div>
              </div>
          </div>
      </div>
  );

  const renderReminderModal = () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 relative">
              <button onClick={() => setShowReminderModal(false)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
              <h3 className="text-lg font-bold text-slate-900 mb-6">Add New Reminder</h3>
              
              <form onSubmit={handleAddReminder} className="space-y-4">
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reminder Title</label>
                      <input 
                          type="text" 
                          value={newReminder.title}
                          onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
                          placeholder="e.g. Take Blood Pressure"
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                      />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Frequency</label>
                          <select 
                              value={newReminder.frequency}
                              onChange={(e) => setNewReminder({...newReminder, frequency: e.target.value})}
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                              <option value="Daily">Daily</option>
                              <option value="Weekly">Weekly</option>
                              <option value="Monthly">Monthly</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Time</label>
                          <input 
                              type="time" 
                              value={newReminder.time}
                              onChange={(e) => setNewReminder({...newReminder, time: e.target.value})}
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                      </div>
                  </div>

                  <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-all mt-2">
                      Set Reminder
                  </button>
              </form>
          </div>
      </div>
  );

  const renderCallModal = () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 relative">
              <button onClick={() => setShowCallModal(false)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Phone size={20} className="text-indigo-600"/> Log Communication
              </h3>
              
              <form onSubmit={handleLogCall} className="space-y-4">
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Outcome</label>
                      <select 
                          value={newCall.outcome}
                          onChange={(e) => setNewCall({...newCall, outcome: e.target.value})}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                          <option value="Connected">Connected</option>
                          <option value="Voicemail">Voicemail</option>
                          <option value="No Answer">No Answer</option>
                          <option value="Busy">Busy</option>
                          <option value="Wrong Number">Wrong Number</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notes</label>
                      <textarea 
                          value={newCall.notes}
                          onChange={(e) => setNewCall({...newCall, notes: e.target.value})}
                          placeholder="Discussed medication refill..."
                          rows={4}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      />
                  </div>
                  <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-all">
                      Save Log
                  </button>
              </form>
          </div>
      </div>
  );

  const renderDeliveryModal = () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 relative">
              <button onClick={() => setShowDeliveryModal(false)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  {newDelivery.method === 'Delivery' ? <Truck size={20} className="text-emerald-600"/> : <MapPin size={20} className="text-emerald-600"/>} 
                  {newDelivery.method === 'Delivery' ? 'Schedule Delivery' : 'Schedule Pickup'}
              </h3>
              
              <form onSubmit={handleScheduleDelivery} className="space-y-4">
                   <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
                        <button
                            type="button"
                            onClick={() => setNewDelivery({...newDelivery, method: 'Delivery'})}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${newDelivery.method === 'Delivery' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Truck size={14} className="inline mr-1" /> Home Delivery
                        </button>
                        <button
                            type="button"
                            onClick={() => setNewDelivery({...newDelivery, method: 'Pickup'})}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${newDelivery.method === 'Pickup' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <MapPin size={14} className="inline mr-1" /> Store Pickup
                        </button>
                   </div>

                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Medication</label>
                      <select 
                          value={newDelivery.medId}
                          onChange={(e) => setNewDelivery({...newDelivery, medId: e.target.value})}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                          required
                      >
                          <option value="">Select Medication...</option>
                          {medications.map(m => (
                              <option key={m.id} value={m.id}>{m.name} ({m.dosage})</option>
                          ))}
                      </select>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{newDelivery.method === 'Delivery' ? 'Delivery Date' : 'Pickup Date'}</label>
                      <input 
                          type="date"
                          value={newDelivery.date}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setNewDelivery({...newDelivery, date: e.target.value})}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                          required
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Instructions</label>
                      <textarea 
                          value={newDelivery.notes}
                          onChange={(e) => setNewDelivery({...newDelivery, notes: e.target.value})}
                          placeholder={newDelivery.method === 'Delivery' ? "Leave at front desk..." : "Prepared by..."}
                          rows={2}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      />
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
                      {newDelivery.method === 'Delivery' ? 'Dispatch Delivery' : 'Confirm Pickup Slot'}
                  </button>
              </form>
          </div>
      </div>
  );

  const renderVitalsModal = () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 relative">
              <button onClick={() => setShowVitalsModal(false)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Activity size={20} className="text-rose-600"/> Add Vital Reading
              </h3>
              
              <form onSubmit={handleAddVital} className="space-y-4">
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vital Type</label>
                      <select 
                          value={newVital.type}
                          onChange={(e) => {
                              const unit = e.target.value === 'Blood Pressure' ? 'mmHg' : e.target.value === 'Blood Sugar' ? 'mg/dL' : e.target.value === 'Weight' ? 'kg' : 'bpm';
                              setNewVital({...newVital, type: e.target.value, unit});
                          }}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                      >
                          <option value="Blood Pressure">Blood Pressure</option>
                          <option value="Blood Sugar">Blood Sugar</option>
                          <option value="Weight">Weight</option>
                          <option value="Heart Rate">Heart Rate</option>
                      </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Value</label>
                          <input 
                              type="text"
                              value={newVital.value}
                              onChange={(e) => setNewVital({...newVital, value: e.target.value})}
                              placeholder={newVital.type === 'Blood Pressure' ? '120/80' : '0'}
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                              required
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Unit</label>
                          <input 
                              type="text"
                              value={newVital.unit}
                              readOnly
                              className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500"
                          />
                      </div>
                  </div>
                  <button type="submit" className="w-full bg-rose-600 text-white font-bold py-3 rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20">
                      Record Entry
                  </button>
              </form>
          </div>
      </div>
  );

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
        {/* Quick Stats */}
        <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100 hover:border-indigo-100 transition-colors group">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform"><Activity size={20} /></div>
                        <span className="text-sm font-semibold text-slate-500">Adherence Score</span>
                    </div>
                    <p className="text-4xl font-bold text-slate-900 tracking-tight">{patient.adherenceRate}%</p>
                    <div className="w-full bg-slate-100 h-1.5 mt-4 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{width: `${patient.adherenceRate}%`}}></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100 hover:border-purple-100 transition-colors group">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition-transform"><Award size={20} /></div>
                        <span className="text-sm font-semibold text-slate-500">Loyalty Points</span>
                    </div>
                    <p className="text-4xl font-bold text-slate-900 tracking-tight">{patient.loyaltyPoints}</p>
                    <p className="text-xs font-semibold text-purple-600 mt-2 bg-purple-50 inline-block px-2 py-1 rounded-lg">Silver Tier Member</p>
                </div>
            </div>

            {/* AI Insight Card */}
            <div className="bg-gradient-to-br from-[#eff6ff] to-white p-8 rounded-[2rem] border border-blue-100/50 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <div className="p-1.5 bg-blue-500 text-white rounded-lg"><Mic size={14} /></div>
                            AI Care Companion
                        </h3>
                        <button 
                            onClick={handleAiAnalysis}
                            disabled={analyzing}
                            className="text-xs bg-white text-blue-600 px-4 py-2 rounded-full font-bold shadow-sm hover:shadow-md transition border border-blue-100"
                        >
                            {analyzing ? 'Thinking...' : 'Refresh Analysis'}
                        </button>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed font-medium">
                        {aiAnalysis || "Jemine AI is ready to analyze adherence patterns. Click refresh to generate a personalized engagement plan."}
                    </p>
                </div>
            </div>

            {/* Active Reminders List */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-900 text-lg">Active Reminders</h3>
                    <button 
                        onClick={() => setShowReminderModal(true)} 
                        className="text-indigo-600 text-sm font-bold hover:bg-indigo-50 px-3 py-1.5 rounded-xl transition"
                    >
                        + Add New
                    </button>
                </div>
                {reminders.length > 0 || medications.length > 0 ? (
                    <div className="space-y-3">
                        {medications.map(med => (
                            <div key={med.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{med.name}</p>
                                        <p className="text-xs text-slate-500">{med.frequency}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-semibold bg-white px-2 py-1 rounded-md border border-slate-100 text-slate-400">Automated</span>
                            </div>
                        ))}
                        {reminders.map((rem, idx) => (
                             <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{rem.title}</p>
                                        <p className="text-xs text-slate-500">{rem.freq}</p>
                                    </div>
                                </div>
                                <button className="text-slate-400 hover:text-rose-500"><X size={14}/></button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Bell size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No custom reminders set.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
             <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] h-full flex flex-col">
                <div className="flex items-center gap-3 mb-8">
                    <img src={`https://ui-avatars.com/api/?name=${patient.name}&background=6366f1&color=fff`} className="w-12 h-12 rounded-2xl shadow-lg shadow-indigo-500/20" alt="Avatar"/>
                    <div>
                        <h3 className="font-bold text-slate-900">{patient.name}</h3>
                        <p className="text-xs text-slate-500">Member since 2023</p>
                    </div>
                </div>

                <div className="space-y-3 flex-1">
                    <button 
                        onClick={() => onNavigateToCommunication(patient)}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-900 text-white hover:bg-indigo-600 transition-all font-semibold shadow-lg shadow-slate-900/10 group"
                    >
                        <MessageCircle size={18} className="text-slate-400 group-hover:text-white transition-colors" /> Message
                        <ChevronRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button 
                        onClick={() => setShowCallModal(true)}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all font-semibold shadow-sm group"
                    >
                        <Phone size={18} className="text-slate-400 group-hover:text-indigo-600 transition-colors" /> Log Call
                    </button>
                    <button 
                         onClick={() => setShowDeliveryModal(true)}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all font-semibold shadow-sm group"
                    >
                        <Truck size={18} className="text-slate-400 group-hover:text-emerald-600 transition-colors" /> Schedule Delivery
                    </button>
                </div>
             </div>
        </div>
    </div>
  );

  const renderMedications = () => (
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] animate-fade-in">
          <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-900 text-lg">Current Medications</h3>
              <button 
                  onClick={() => {}} // Placeholder for add med
                  className="text-indigo-600 text-sm font-bold hover:bg-indigo-50 px-3 py-1.5 rounded-xl transition"
              >
                  + Add Prescription
              </button>
          </div>
          <div className="grid gap-4">
              {medications.map(med => (
                  <div key={med.id} className="flex flex-col md:flex-row items-center justify-between p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition">
                      <div className="flex items-center gap-4 w-full md:w-auto">
                          <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600">
                              <Pill size={24} />
                          </div>
                          <div>
                              <h4 className="font-bold text-slate-900">{med.name}</h4>
                              <p className="text-sm text-slate-500">{med.dosage} • {med.frequency}</p>
                              <div className="flex gap-2 mt-1">
                                  {med.refillDue && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md">Refill Due</span>}
                                  <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md">{med.remainingSupply} days left</span>
                              </div>
                          </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex items-center gap-4 w-full md:w-auto">
                           {med.price && (
                               <div className="text-right mr-4 hidden md:block">
                                   <p className="text-xs text-slate-400 uppercase font-bold">Est. Cost</p>
                                   <p className="text-slate-900 font-bold">{getCurrencySymbol(currency)}{med.price.toFixed(2)}</p>
                               </div>
                           )}
                           <button 
                              onClick={() => handleRefillCheckIn(med.id)}
                              className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:text-emerald-600 hover:border-emerald-200 transition"
                           >
                              Check In
                           </button>
                           <button className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition">
                              Refill
                           </button>
                      </div>
                  </div>
              ))}
              {medications.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                      <p>No active medications recorded.</p>
                  </div>
              )}
          </div>
      </div>
  );

  const renderAppointments = () => (
       <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] animate-fade-in">
          <h3 className="font-bold text-slate-900 text-lg mb-6">Upcoming Appointments</h3>
          <div className="space-y-4">
              {patient.appointments.map(apt => (
                  <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-start gap-4">
                          <div className="p-3 bg-white rounded-xl shadow-sm text-center min-w-[60px]">
                              <p className="text-xs font-bold text-slate-400 uppercase">{new Date(apt.date).toLocaleString('default', { month: 'short' })}</p>
                              <p className="text-xl font-bold text-slate-900">{new Date(apt.date).getDate()}</p>
                          </div>
                          <div>
                              <h4 className="font-bold text-slate-900">{apt.type}</h4>
                              <p className="text-sm text-slate-500">{apt.provider} • {apt.time}</p>
                              <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md ${apt.status === 'Scheduled' ? 'bg-indigo-100 text-indigo-700' : apt.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                  {apt.status}
                              </span>
                          </div>
                      </div>
                      <div className="mt-4 sm:mt-0">
                          <button className="w-full sm:w-auto px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
                              Reschedule
                          </button>
                      </div>
                  </div>
              ))}
              {patient.appointments.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                      <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                      <p>No appointments scheduled.</p>
                  </div>
              )}
          </div>
       </div>
  );

  const renderVitals = () => (
      <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
             <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-900 text-lg">Vitals History</h3>
                  <button 
                      onClick={() => setShowVitalsModal(true)} 
                      className="text-indigo-600 text-sm font-bold hover:bg-indigo-50 px-3 py-1.5 rounded-xl transition"
                  >
                      + Log Vital
                  </button>
              </div>
              
              <div className="h-64 w-full mb-8">
                  {vitalsHistory.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[...vitalsHistory].reverse()}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                            />
                            <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{r: 4, fill: '#6366f1', strokeWidth: 0}} activeDot={{r: 6}} />
                        </LineChart>
                      </ResponsiveContainer>
                  ) : (
                      <div className="h-full flex items-center justify-center text-slate-400 bg-slate-50 rounded-2xl">
                          <p>No vitals data available for visualization.</p>
                      </div>
                  )}
              </div>

              <div className="space-y-3">
                  {vitalsHistory.map((vital) => (
                      <div key={vital.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-lg ${vital.status === 'Critical' ? 'bg-rose-100 text-rose-600' : vital.status === 'Warning' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                  <Activity size={18} />
                              </div>
                              <div>
                                  <p className="font-bold text-slate-900">{vital.type}</p>
                                  <p className="text-xs text-slate-500">{vital.date}</p>
                              </div>
                          </div>
                          <div className="text-right">
                              <p className="font-bold text-slate-800">{vital.value} <span className="text-xs font-normal text-slate-400">{vital.unit}</span></p>
                              <span className={`text-[10px] font-bold ${vital.status === 'Critical' ? 'text-rose-600' : vital.status === 'Warning' ? 'text-amber-600' : 'text-emerald-600'}`}>
                                  {vital.status}
                              </span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );
  
  const renderLoyalty = () => (
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] animate-fade-in">
          <div className="text-center mb-8">
              <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{patient.loyaltyPoints} Points</h3>
              <p className="text-slate-500">Silver Tier Status</p>
          </div>
          
          <div className="space-y-4">
              <h4 className="font-bold text-slate-900">Available Rewards</h4>
              {[
                  { title: 'Free Consultation', cost: 500, icon: Stethoscope },
                  { title: '10% Off Medication', cost: 200, icon: Pill },
                  { title: 'Wellness Check', cost: 300, icon: Activity }
              ].map((reward, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm text-purple-600">
                              <reward.icon size={18} />
                          </div>
                          <div>
                              <p className="font-bold text-slate-900 text-sm">{reward.title}</p>
                              <p className="text-xs text-purple-600 font-bold">{reward.cost} pts</p>
                          </div>
                      </div>
                      <button 
                          disabled={patient.loyaltyPoints < reward.cost}
                          className="px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-slate-900 text-white hover:bg-purple-600"
                      >
                          Redeem
                      </button>
                  </div>
              ))}
          </div>
      </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Modals */}
      {showRiskModal && renderRiskModal()}
      {showReminderModal && renderReminderModal()}
      {showCallModal && renderCallModal()}
      {showDeliveryModal && renderDeliveryModal()}
      {showVitalsModal && renderVitalsModal()}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-4">
            <button 
                onClick={onBack}
                className="p-3 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition shadow-sm"
            >
                <ArrowLeft size={20} />
            </button>
            <div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{patient.name}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-700 font-medium">{patient.condition}</span>
                    <span>•</span>
                    <span>{patient.age} yrs</span>
                    <span>•</span>
                    <span>{patient.phone}</span>
                </div>
            </div>
        </div>
        <div className="flex gap-2 items-center">
            {/* Communication Preference Selector */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                    <MessageSquare size={14} />
                </div>
                <select 
                    value={patient.communicationPreference || 'SMS'}
                    onChange={handleCommunicationPrefChange}
                    className="pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-slate-600 hover:border-indigo-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none cursor-pointer shadow-sm transition"
                    title="Preferred Communication Channel"
                >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="SMS">SMS</option>
                    <option value="Email">Email</option>
                    <option value="Phone Call">Phone Call</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
            </div>

            <button 
                onClick={() => setShowRiskModal(true)}
                className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition shadow-sm ${patient.status === 'Critical' ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
                <AlertCircle size={18} /> Risk Status: {patient.status}
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 no-scrollbar">
          {[
              { id: 'overview', label: 'Overview', icon: ClipboardList },
              { id: 'meds', label: 'Medications', icon: Pill },
              { id: 'appointments', label: 'Appointments', icon: Calendar },
              { id: 'vitals', label: 'Vitals', icon: Activity },
              { id: 'loyalty', label: 'Rewards', icon: Gift },
          ].map((tab) => (
              <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${
                      activeTab === tab.id 
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' 
                      : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
              >
                  <tab.icon size={16} /> {tab.label}
              </button>
          ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'meds' && renderMedications()}
          {activeTab === 'appointments' && renderAppointments()}
          {activeTab === 'vitals' && renderVitals()}
          {activeTab === 'loyalty' && renderLoyalty()}
      </div>
    </div>
  );
};

export default PatientDetail;
