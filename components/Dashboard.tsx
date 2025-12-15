import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardStats, ChartDataPoint, Patient, AppTranslations, LoyaltyRule, Reward } from '../types';
import { Pill, AlertTriangle, Users, TrendingUp, MoreHorizontal, ArrowRight, Download, X, Check, CheckCircle, Send, Gift, Clock, Search, Mail, Star, Plus, Trash2, Tag, Zap, MessageSquare } from 'lucide-react';
import { mockLoyaltyRules, mockRewardCatalog } from '../services/mockData';
import { generateSurveyPreview } from '../services/geminiService';

interface DashboardProps {
  stats: DashboardStats;
  chartData: ChartDataPoint[];
  patients?: Patient[]; 
  onAddPatient: () => void;
  onViewCriticalPatients?: () => void;
  t: AppTranslations;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; color: string; trend?: string; trendPositive?: boolean }> = ({ title, value, icon: Icon, color, trend, trendPositive }) => (
  <div className="bg-white p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100/50 hover:shadow-[0_8px_16px_rgba(0,0,0,0.04)] transition-shadow duration-300">
    <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl ${color} bg-opacity-10`}>
            <Icon className={color.replace('bg-', 'text-')} size={20} />
        </div>
        {trend && (
            <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${trendPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {trend}
            </span>
        )}
    </div>
    <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h3>
    <p className="text-sm text-gray-500 font-medium mt-1">{title}</p>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ stats, chartData, patients = [], onAddPatient, onViewCriticalPatients, t }) => {
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [showLoyaltyModal, setShowLoyaltyModal] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  
  // Refill Modal State
  const [isSendingRefills, setIsSendingRefills] = useState(false);
  const [refillsSent, setRefillsSent] = useState(false);
  const [selectedRefillIds, setSelectedRefillIds] = useState<Set<string>>(new Set());
  const [refillSearch, setRefillSearch] = useState('');

  // Loyalty Program Manager State
  const [loyaltyTab, setLoyaltyTab] = useState<'redemptions' | 'rules' | 'catalog'>('redemptions');
  const [pendingRewards, setPendingRewards] = useState([
      { id: 1, name: 'Kwame Mensah', reward: '10% Discount Consultation', cost: 200, status: 'Pending' },
      { id: 2, name: 'Amara Diop', reward: 'Free Diabetes Screening', cost: 450, status: 'Pending' },
      { id: 3, name: 'Ngozi Okafor', reward: 'Pharmacy Voucher ($10)', cost: 300, status: 'Pending' },
  ]);
  const [activeRules, setActiveRules] = useState<LoyaltyRule[]>(mockLoyaltyRules);
  const [rewardsCatalog, setRewardsCatalog] = useState<Reward[]>(mockRewardCatalog);
  const [newRule, setNewRule] = useState({ action: '', points: 0, description: '' });

  // Survey Modal State
  const [surveyTitle, setSurveyTitle] = useState('Patient Satisfaction Survey Q4');
  const [surveyTarget, setSurveyTarget] = useState('All Active Patients');
  const [isSendingSurvey, setIsSendingSurvey] = useState(false);
  const [surveySent, setSurveySent] = useState(false);
  const [emailPreview, setEmailPreview] = useState({ 
      subject: 'Subject: How are we doing, [Name]?', 
      body: 'We value your health journey. Please rate your experience with us on a scale of 1 to 5.' 
  });
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Auto-select patients due for refills when modal opens
  useEffect(() => {
    if (showRefillModal && patients) {
        const dueIds = patients
            .filter(p => p.medications.some(m => m.refillDue))
            .map(p => p.id);
        setSelectedRefillIds(new Set(dueIds));
    }
  }, [showRefillModal, patients]);

  const toggleRefillPatient = (id: string) => {
      const newSet = new Set(selectedRefillIds);
      if (newSet.has(id)) {
          newSet.delete(id);
      } else {
          newSet.add(id);
      }
      setSelectedRefillIds(newSet);
  };

  const handleApproveReward = (id: number) => {
      setPendingRewards(prev => prev.filter(r => r.id !== id));
      // In real app, make API call here
  };

  const handleRejectReward = (id: number) => {
      setPendingRewards(prev => prev.filter(r => r.id !== id));
  };

  const handleAddRule = () => {
      if(newRule.action && newRule.points > 0) {
          setActiveRules([...activeRules, { id: `L${Date.now()}`, ...newRule }]);
          setNewRule({ action: '', points: 0, description: '' });
      }
  };

  const handleDeleteRule = (id: string) => {
      setActiveRules(activeRules.filter(r => r.id !== id));
  };

  const handleSendBulkRefills = () => {
      setIsSendingRefills(true);
      setTimeout(() => {
          setIsSendingRefills(false);
          setRefillsSent(true);
          setTimeout(() => {
              setRefillsSent(false);
              setShowRefillModal(false);
          }, 2000);
      }, 2000);
  };

  const handlePushSurvey = () => {
      setIsSendingSurvey(true);
      setTimeout(() => {
          setIsSendingSurvey(false);
          setSurveySent(true);
          setTimeout(() => {
              setSurveySent(false);
              setShowSurveyModal(false);
          }, 2500);
      }, 2000);
  };

  const handleGeneratePreview = async () => {
      setIsPreviewLoading(true);
      const result = await generateSurveyPreview(surveyTitle, surveyTarget);
      setEmailPreview(result);
      setIsPreviewLoading(false);
  };
  
  const handleExportPHI = () => {
    if (patients.length === 0) {
        alert("No patient data available to export.");
        return;
    }

    try {
        const headers = ["ID", "Name", "Age", "Condition", "Phone", "Adherence Rate", "Status", "Last Contact"];
        const rows = patients.map(p => [
            p.id,
            p.name,
            p.age,
            p.condition,
            p.phone,
            `${p.adherenceRate}%`,
            p.status,
            p.lastContact
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `PHI_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error("Export failed:", error);
        alert("Failed to export report.");
    }
  };

  // Render Modals
  const renderRefillModal = () => {
      // Sort: Refill Due first, then alphabetical
      const sortedPatients = [...patients].sort((a, b) => {
          const aDue = a.medications.some(m => m.refillDue);
          const bDue = b.medications.some(m => m.refillDue);
          if (aDue && !bDue) return -1;
          if (!aDue && bDue) return 1;
          return a.name.localeCompare(b.name);
      });

      const filteredList = sortedPatients.filter(p => 
          p.name.toLowerCase().includes(refillSearch.toLowerCase()) || 
          p.phone.includes(refillSearch)
      );
      
      return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative overflow-hidden flex flex-col max-h-[90vh]">
             {!refillsSent ? (
                 <>
                    <button onClick={() => setShowRefillModal(false)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
                    <div className="flex items-center gap-3 mb-6 flex-shrink-0">
                        <div className="p-3 bg-amber-100 text-amber-700 rounded-xl"><Pill size={24} /></div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Bulk Refill Reminders</h3>
                            <p className="text-sm text-slate-500">Automated SMS Campaign</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4 mb-4 flex-1 overflow-hidden flex flex-col">
                        <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl flex-shrink-0">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-amber-800">Target Audience</span>
                                <span className="bg-amber-100 text-amber-900 text-xs px-2 py-1 rounded-md font-bold border border-amber-200">{selectedRefillIds.size} Selected</span>
                            </div>
                            <p className="text-xs text-amber-800 leading-relaxed">
                                Patients marked "Due" are pre-selected. You can manually check/uncheck any patient below to include them in this campaign.
                            </p>
                        </div>

                        {/* Search Bar inside Modal */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input 
                                type="text" 
                                placeholder="Search list..." 
                                value={refillSearch}
                                onChange={(e) => setRefillSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                            />
                        </div>

                        {/* Patient Selection List */}
                        <div className="border border-slate-100 rounded-xl overflow-y-auto flex-1 bg-slate-50">
                            {filteredList.length > 0 ? (
                                <ul className="divide-y divide-slate-100">
                                    {filteredList.map(p => {
                                        const isDue = p.medications.some(m => m.refillDue);
                                        return (
                                        <li key={p.id} className="p-3 flex items-center justify-between hover:bg-white transition cursor-pointer" onClick={() => toggleRefillPatient(p.id)}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedRefillIds.has(p.id) ? 'bg-amber-500 border-amber-500' : 'border-gray-300 bg-white'}`}>
                                                    {selectedRefillIds.has(p.id) && <Check size={12} className="text-white" />}
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-bold ${selectedRefillIds.has(p.id) ? 'text-slate-900' : 'text-slate-600'}`}>{p.name}</p>
                                                    <p className="text-[10px] text-slate-500">{p.language} • {p.phone}</p>
                                                </div>
                                            </div>
                                            {isDue && (
                                                <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Due</span>
                                            )}
                                        </li>
                                    )})}
                                </ul>
                            ) : (
                                <div className="p-6 text-center text-slate-400 text-sm">No patients found.</div>
                            )}
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex-shrink-0">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Preview (English)</p>
                            <p className="text-sm text-slate-600 italic">"Hello [Name], this is a reminder from [Hospital]. Please reply YES if you need a refill or check-up soon."</p>
                        </div>
                    </div>

                    <button 
                        onClick={handleSendBulkRefills}
                        disabled={isSendingRefills || selectedRefillIds.size === 0}
                        className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed flex-shrink-0"
                    >
                        {isSendingRefills ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Sending Broadcast...
                            </>
                        ) : (
                            <>
                                <Send size={18} /> Send to {selectedRefillIds.size} Patients
                            </>
                        )}
                    </button>
                 </>
             ) : (
                 <div className="text-center py-8 animate-fade-in-up">
                     <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                         <Check size={40} strokeWidth={3} />
                     </div>
                     <h3 className="text-2xl font-bold text-slate-900 mb-2">Campaign Sent!</h3>
                     <p className="text-slate-500 mb-6">{selectedRefillIds.size} reminders have been queued for delivery.</p>
                     <button onClick={() => setShowRefillModal(false)} className="bg-slate-100 text-slate-700 font-bold px-8 py-3 rounded-xl hover:bg-slate-200 transition">Close</button>
                 </div>
             )}
          </div>
      </div>
  )};

  const renderLoyaltyModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full h-[70vh] flex flex-col relative overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 text-purple-700 rounded-xl"><Gift size={24} /></div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">{t.manageLoyalty}</h3>
                        <p className="text-sm text-slate-500">Configure rules and manage redemptions</p>
                    </div>
                </div>
                <button onClick={() => setShowLoyaltyModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-6">
                <button onClick={() => setLoyaltyTab('redemptions')} className={`py-4 px-4 text-sm font-bold border-b-2 transition-colors ${loyaltyTab === 'redemptions' ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Redemptions ({pendingRewards.length})</button>
                <button onClick={() => setLoyaltyTab('rules')} className={`py-4 px-4 text-sm font-bold border-b-2 transition-colors ${loyaltyTab === 'rules' ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Earning Rules</button>
                <button onClick={() => setLoyaltyTab('catalog')} className={`py-4 px-4 text-sm font-bold border-b-2 transition-colors ${loyaltyTab === 'catalog' ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Rewards Catalog</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                {loyaltyTab === 'redemptions' && (
                    <div className="space-y-3">
                        {pendingRewards.length > 0 ? pendingRewards.map(req => (
                            <div key={req.id} className="p-4 border border-slate-100 rounded-2xl bg-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900">{req.name}</span>
                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md font-bold">-{req.cost} pts</span>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1">{req.reward}</p>
                                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                                        <Clock size={10} /> Requested 2 hrs ago
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button onClick={() => handleRejectReward(req.id)} className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition">Reject</button>
                                    <button onClick={() => handleApproveReward(req.id)} className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-emerald-600 transition">Approve</button>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                                <CheckCircle size={32} className="mx-auto mb-3 opacity-30" />
                                <p>All requests processed.</p>
                            </div>
                        )}
                    </div>
                )}

                {loyaltyTab === 'rules' && (
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                            <h4 className="text-sm font-bold text-slate-700 mb-3">Add New Earning Rule</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input type="text" placeholder="Action Name (e.g. Refill)" value={newRule.action} onChange={e => setNewRule({...newRule, action: e.target.value})} className="p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-purple-500" />
                                <input type="number" placeholder="Points (e.g. 50)" value={newRule.points || ''} onChange={e => setNewRule({...newRule, points: parseInt(e.target.value)})} className="p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-purple-500" />
                                <button onClick={handleAddRule} className="bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition flex items-center justify-center gap-2"><Plus size={16}/> Add Rule</button>
                            </div>
                        </div>
                        <div className="space-y-2">
                             {activeRules.map(rule => (
                                 <div key={rule.id} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl">
                                     <div>
                                         <p className="font-bold text-slate-800 text-sm">{rule.action}</p>
                                         <p className="text-xs text-slate-500">{rule.description}</p>
                                     </div>
                                     <div className="flex items-center gap-3">
                                         <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg">+{rule.points} pts</span>
                                         <button onClick={() => handleDeleteRule(rule.id)} className="text-slate-400 hover:text-rose-500"><Trash2 size={16}/></button>
                                     </div>
                                 </div>
                             ))}
                        </div>
                    </div>
                )}

                {loyaltyTab === 'catalog' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {rewardsCatalog.map(item => (
                             <div key={item.id} className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                     <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Gift size={18}/></div>
                                     <div>
                                         <p className="font-bold text-slate-800 text-sm">{item.title}</p>
                                         <p className="text-xs text-slate-500">{item.category}</p>
                                     </div>
                                 </div>
                                 <span className="font-bold text-purple-700 text-sm">{item.cost} pts</span>
                             </div>
                         ))}
                         <button className="p-4 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-purple-400 hover:text-purple-600 transition">
                             <Plus size={24} />
                             <span className="text-xs font-bold mt-1">Add Reward Item</span>
                         </button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );

  const renderSurveyModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative overflow-hidden flex flex-col">
           {!surveySent ? (
             <>
                <button onClick={() => setShowSurveyModal(false)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-100 text-blue-700 rounded-xl"><Mail size={24} /></div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">{t.pushSurvey}</h3>
                        <p className="text-sm text-slate-500">AI-Driven Email Campaign</p>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Survey Campaign Title</label>
                        <input type="text" value={surveyTitle} onChange={e => setSurveyTitle(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Audience</label>
                        <select value={surveyTarget} onChange={e => setSurveyTarget(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                            <option>All Active Patients</option>
                            <option>Hypertension Patients</option>
                            <option>Diabetes Patients</option>
                            <option>Patients with Low Adherence</option>
                        </select>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div className="flex justify-between items-center mb-2">
                             <span className="text-xs font-bold text-blue-800 uppercase flex items-center gap-1"><Zap size={12}/> AI Email Preview</span>
                             <button 
                                onClick={handleGeneratePreview}
                                disabled={isPreviewLoading}
                                className="text-[10px] bg-white text-blue-600 px-2 py-1 rounded-md font-bold shadow-sm hover:bg-blue-100 transition disabled:opacity-50"
                             >
                                {isPreviewLoading ? 'Generating...' : 'Refresh Preview'}
                             </button>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-100 text-sm text-slate-600 leading-relaxed shadow-sm">
                            <p className="font-bold text-slate-800 mb-1">{emailPreview.subject}</p>
                            <p>{emailPreview.body}</p>
                            <div className="flex gap-2 my-2 justify-center">
                                {[1,2,3,4,5].map(i => <Star key={i} size={16} className="text-gray-300" fill="currentColor" />)}
                            </div>
                            <p className="text-xs italic text-slate-400 mt-2">Includes secure link for optional comments. Unsubscribe link included.</p>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handlePushSurvey}
                    disabled={isSendingSurvey}
                    className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSendingSurvey ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Dispatching Emails...
                        </>
                    ) : (
                        <>
                            <Send size={18} /> Push Survey to {patients.length} Users
                        </>
                    )}
                </button>
             </>
           ) : (
                <div className="text-center py-8 animate-fade-in-up">
                     <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                         <Mail size={40} strokeWidth={2} />
                     </div>
                     <h3 className="text-2xl font-bold text-slate-900 mb-2">Surveys Dispatched!</h3>
                     <p className="text-slate-500 mb-6">Emails have been sent securely. Results will appear in Analytics as they arrive.</p>
                     <button onClick={() => setShowSurveyModal(false)} className="bg-slate-100 text-slate-700 font-bold px-8 py-3 rounded-xl hover:bg-slate-200 transition">Close</button>
                 </div>
           )}
        </div>
    </div>
  );

  return (
    <div className="space-y-8 relative">
      {showRefillModal && renderRefillModal()}
      {showLoyaltyModal && renderLoyaltyModal()}
      {showSurveyModal && renderSurveyModal()}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t.overview}</h2>
            <p className="text-gray-500 mt-1">Hospital General • Cardiology Unit</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={handleExportPHI}
                className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition shadow-sm flex items-center gap-2"
            >
                <Download size={16} /> {t.exportReport}
            </button>
            <button 
                onClick={onAddPatient}
                className="bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition shadow-lg shadow-gray-200 flex items-center gap-2"
            >
                <span>{t.addPatient}</span>
                <ArrowRight size={14} />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t.activePatients}
          value={stats.totalPatients}
          icon={Users}
          color="bg-slate-800"
          trend="+4 this week"
          trendPositive={true}
        />
        <StatCard
          title={t.avgAdherence}
          value={`${stats.avgAdherence}%`}
          icon={TrendingUp}
          color="bg-emerald-600"
          trend="+2.5% vs last mo"
          trendPositive={true}
        />
        <StatCard
          title={t.refillsDue}
          value={stats.refillsDue}
          icon={Pill}
          color="bg-amber-600"
        />
        <StatCard
          title={t.criticalStatus}
          value={stats.criticalPatients}
          icon={AlertTriangle}
          color="bg-rose-600"
          trend="Needs Action"
          trendPositive={false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-lg font-bold text-gray-900">Adherence Trends</h3>
             <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={20} /></button>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="value" stroke="#334155" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Action Required</h3>
          <div className="space-y-4 flex-1">
             <button 
                onClick={() => setShowRefillModal(true)}
                className="w-full text-left p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex items-start gap-3 cursor-pointer hover:bg-amber-100/50 transition group"
             >
                <div className="bg-amber-100 text-amber-700 p-1.5 rounded-lg shrink-0 group-hover:scale-110 transition-transform">
                    <Pill size={16} />
                </div>
                <div>
                    <p className="font-semibold text-amber-900 text-sm">Send Bulk Refill Reminders</p>
                    <p className="text-xs text-amber-700/80 mt-1">{stats.refillsDue > 0 ? stats.refillsDue : 24} patients due next week</p>
                </div>
             </button>
             
             <button 
                onClick={() => onViewCriticalPatients && onViewCriticalPatients()}
                className="w-full text-left p-4 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-start gap-3 cursor-pointer hover:bg-rose-100/50 transition group"
             >
                <div className="bg-rose-100 text-rose-700 p-1.5 rounded-lg shrink-0 group-hover:scale-110 transition-transform">
                    <AlertTriangle size={16} />
                </div>
                <div>
                    <p className="font-semibold text-rose-900 text-sm">Review Critical Adherence</p>
                    <p className="text-xs text-rose-700/80 mt-1">{stats.criticalPatients > 0 ? stats.criticalPatients : 3} patients need intervention</p>
                </div>
             </button>

             <button 
                onClick={() => setShowSurveyModal(true)}
                className="w-full text-left p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-start gap-3 cursor-pointer hover:bg-blue-100/50 transition group"
             >
                 <div className="bg-blue-100 text-blue-700 p-1.5 rounded-lg shrink-0 group-hover:scale-110 transition-transform">
                     <Mail size={16} />
                 </div>
                 <div>
                     <p className="font-semibold text-blue-900 text-sm">{t.pushSurvey}</p>
                     <p className="text-xs text-blue-700/80 mt-1">Collect feedback via AI email</p>
                 </div>
             </button>

             <button 
                onClick={() => setShowLoyaltyModal(true)}
                className="w-full text-left p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3 cursor-pointer hover:bg-slate-100 transition group"
             >
                <div className="bg-slate-200 text-slate-600 p-1.5 rounded-lg shrink-0 group-hover:scale-110 transition-transform">
                    <Gift size={16} />
                </div>
                <div>
                    <p className="font-semibold text-slate-900 text-sm">{t.manageLoyalty}</p>
                    <p className="text-xs text-slate-500 mt-1">{pendingRewards.length > 0 ? pendingRewards.length : 'No'} rewards pending approval</p>
                </div>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;