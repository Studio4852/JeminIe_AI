
import React from 'react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Patient, AdherenceStatus, ChartDataPoint } from '../types';
import { Database, TrendingUp, Users, AlertCircle, Star, MessageSquare } from 'lucide-react';
import { mockSurveyResponses } from '../services/mockData';

interface AnalyticsProps {
  patients: Patient[];
  adherenceHistory: ChartDataPoint[];
}

const Analytics: React.FC<AnalyticsProps> = ({ patients, adherenceHistory }) => {
  // Process Data for Charts
  
  // 1. Condition Distribution
  const conditionMap = new Map<string, number>();
  patients.forEach(p => {
      conditionMap.set(p.condition, (conditionMap.get(p.condition) || 0) + 1);
  });
  const conditionData = Array.from(conditionMap).map(([name, value]) => ({ name, value }));
  
  // 2. Risk Status Distribution
  const statusMap = new Map<string, number>();
  patients.forEach(p => {
      statusMap.set(p.status, (statusMap.get(p.status) || 0) + 1);
  });
  const statusData = Array.from(statusMap).map(([name, value]) => ({ name, value }));

  // 3. Language Demographics
  const languageMap = new Map<string, number>();
  patients.forEach(p => {
      languageMap.set(p.language, (languageMap.get(p.language) || 0) + 1);
  });
  const languageData = Array.from(languageMap).map(([name, value]) => ({ name, value }));

  // 4. Subscription Status
  const subMap = new Map<string, number>();
  patients.forEach(p => {
      const status = p.subscriptionStatus || 'Active'; // Default for mock data safety
      subMap.set(status, (subMap.get(status) || 0) + 1);
  });
  const subData = Array.from(subMap).map(([name, value]) => ({ name, value }));

  // 5. Satisfaction Ratings (Mocked from Survey Responses)
  const ratings = [0, 0, 0, 0, 0]; // Index 0 = 1 star, Index 4 = 5 stars
  mockSurveyResponses.forEach(r => {
      if(r.rating >= 1 && r.rating <= 5) {
          ratings[r.rating - 1]++;
      }
  });
  const satisfactionData = ratings.map((count, i) => ({ name: `${i+1} Stars`, value: count }));

  const COLORS = ['#334155', '#10b981', '#f59e0b', '#e11d48', '#8b5cf6', '#0ea5e9']; // Slate, Emerald, Amber, Rose, Violet, Sky
  const STATUS_COLORS: Record<string, string> = {
      [AdherenceStatus.Excellent]: '#10b981', // Emerald
      [AdherenceStatus.Good]: '#64748b', // Slate (Professional neutral)
      [AdherenceStatus.AtRisk]: '#f59e0b', // Amber
      [AdherenceStatus.Critical]: '#e11d48' // Rose
  };

  return (
    <div className="space-y-8 animate-fade-in">
        <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Analytics Suite</h2>
            <p className="text-sm text-gray-500 mt-1">Real-time population health & satisfaction insights.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Adherence Overview Chart */}
            <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><TrendingUp size={20} /></div>
                    <h3 className="font-bold text-slate-900">Adherence Trends (Last 5 Weeks)</h3>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={adherenceHistory}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                            <Bar dataKey="value" fill="#334155" radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Risk Stratification */}
            <div className="bg-white p-8 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-xl"><AlertCircle size={20} /></div>
                    <h3 className="font-bold text-slate-900">Risk Stratification</h3>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={statusData} 
                                innerRadius={60} 
                                outerRadius={80} 
                                paddingAngle={5} 
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

             {/* Patient Satisfaction (CSAT) */}
            <div className="bg-white p-8 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-yellow-50 text-yellow-600 rounded-xl"><Star size={20} /></div>
                    <h3 className="font-bold text-slate-900">Patient Satisfaction</h3>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={satisfactionData} layout="vertical">
                             <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                             <XAxis type="number" hide />
                             <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={60} tick={{fill: '#64748b', fontSize: 12}} />
                             <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                             <Bar dataKey="value" fill="#fbbf24" radius={[0, 6, 6, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Subscription Status */}
             <div className="bg-white p-8 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Users size={20} /></div>
                    <h3 className="font-bold text-slate-900">Subscription Status</h3>
                </div>
                 <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={subData} 
                                innerRadius={0} 
                                outerRadius={80} 
                                paddingAngle={2} 
                                dataKey="value"
                            >
                                {subData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.name === 'Active' ? '#10b981' : entry.name === 'Inactive' ? '#cbd5e1' : '#f43f5e'} />
                                ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Language Demographics */}
             <div className="bg-white p-8 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><MessageSquare size={20} /></div>
                    <h3 className="font-bold text-slate-900">Demographics</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 h-64 overflow-y-auto">
                    {languageData.map((item, index) => (
                        <div key={index} className="flex flex-col justify-center items-center p-2 bg-slate-50 rounded-xl border border-slate-100 text-center">
                            <span className="text-xl font-bold text-slate-800">{item.value}</span>
                            <span className="text-[10px] font-semibold text-slate-500 uppercase">{item.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        
        {/* Survey Detailed Response Table */}
        <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
             <div className="p-8 border-b border-gray-100">
                <h3 className="font-bold text-slate-900 text-lg">Recent Survey Feedback</h3>
                <p className="text-sm text-slate-500">Comments from latest email campaign.</p>
             </div>
             <table className="w-full text-left border-collapse">
                 <thead className="bg-slate-50">
                     <tr>
                         <th className="px-8 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Patient</th>
                         <th className="px-8 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Date</th>
                         <th className="px-8 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Rating</th>
                         <th className="px-8 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Comment</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                     {mockSurveyResponses.map(resp => (
                         <tr key={resp.id} className="hover:bg-slate-50/50 transition">
                             <td className="px-8 py-4 font-medium text-slate-900">{resp.patientName}</td>
                             <td className="px-8 py-4 text-slate-500 text-sm">{resp.date}</td>
                             <td className="px-8 py-4">
                                 <div className="flex gap-1">
                                     {[...Array(5)].map((_, i) => (
                                         <Star key={i} size={14} className={i < resp.rating ? 'text-yellow-400' : 'text-gray-200'} fill="currentColor" />
                                     ))}
                                 </div>
                             </td>
                             <td className="px-8 py-4 text-slate-600 text-sm italic">"{resp.comment}"</td>
                         </tr>
                     ))}
                 </tbody>
             </table>
        </div>
    </div>
  );
};

export default Analytics;
