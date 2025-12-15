
import React, { useState, useEffect, useRef } from 'react';
import { Patient, AdherenceStatus, AppTranslations } from '../types';
import { Search, Filter, MoreVertical, ChevronRight, AlertCircle, CheckCircle, Eye, EyeOff, Plus, X, UploadCloud, UserX, UserCheck } from 'lucide-react';

interface PatientListProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onAddPatient: () => void;
  onImportPatients?: (patients: Patient[]) => void;
  initialFilter?: string;
  t: AppTranslations;
}

const PatientList: React.FC<PatientListProps> = ({ patients, onSelectPatient, onAddPatient, onImportPatients, initialFilter = 'All', t }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle deep linking / initial filter prop changes
  useEffect(() => {
    if (initialFilter) {
      setStatusFilter(initialFilter);
    }
  }, [initialFilter]);

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.condition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter || p.subscriptionStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleReveal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    const newRevealed = new Set(revealedIds);
    if (newRevealed.has(id)) {
        newRevealed.delete(id);
    } else {
        newRevealed.add(id);
    }
    setRevealedIds(newRevealed);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && onImportPatients) {
          // Simulate CSV Parsing
          setTimeout(() => {
              const newPatients: Patient[] = [
                  {
                      id: `IMP-${Date.now()}-1`,
                      name: "Imported User 1",
                      age: 45,
                      phone: "+234 80 000 0001",
                      email: "imported1@example.com",
                      language: "English",
                      condition: "Hypertension",
                      adherenceRate: 100,
                      status: AdherenceStatus.Excellent,
                      subscriptionStatus: 'Active',
                      communicationPreference: 'SMS',
                      loyaltyPoints: 0,
                      medications: [],
                      appointments: [],
                      vitals: [],
                      lastContact: new Date().toISOString().split('T')[0]
                  },
                  {
                    id: `IMP-${Date.now()}-2`,
                    name: "Imported User 2",
                    age: 62,
                    phone: "+234 80 000 0002",
                    email: "imported2@example.com",
                    language: "Hausa",
                    condition: "Diabetes",
                    adherenceRate: 90,
                    status: AdherenceStatus.Good,
                    subscriptionStatus: 'Active',
                    communicationPreference: 'SMS',
                    loyaltyPoints: 0,
                    medications: [],
                    appointments: [],
                    vitals: [],
                    lastContact: new Date().toISOString().split('T')[0]
                }
              ];
              onImportPatients(newPatients);
              alert(`Successfully imported ${newPatients.length} patients from ${file.name}`);
              if (fileInputRef.current) fileInputRef.current.value = '';
          }, 1000);
      }
  };

  const getStatusColor = (status: AdherenceStatus) => {
    switch (status) {
      case AdherenceStatus.Excellent: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case AdherenceStatus.Good: return 'bg-slate-50 text-slate-700 border-slate-200';
      case AdherenceStatus.AtRisk: return 'bg-amber-50 text-amber-700 border-amber-100';
      case AdherenceStatus.Critical: return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="space-y-6 relative animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t.patientDirectory}</h2>
            <p className="text-sm text-gray-500 mt-1">Confidential Patient Information • Do not share</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition shadow-sm"
            />
          </div>
          
          <div className="relative">
             <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
             <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition shadow-sm appearance-none cursor-pointer font-medium text-gray-600 text-sm h-full"
             >
                <option value="All">All Status</option>
                <optgroup label="Adherence">
                    {Object.values(AdherenceStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </optgroup>
                <optgroup label="Subscription">
                    <option value="Active">Subscribed</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Unsubscribed">Unsubscribed</option>
                </optgroup>
             </select>
             <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
             </div>
          </div>
          
          <div className="flex gap-2">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".csv,.xlsx" 
                className="hidden" 
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 bg-white border border-gray-200 text-slate-700 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 transition flex items-center justify-center gap-2 whitespace-nowrap"
                title="Import CSV"
            >
                <UploadCloud size={18} />
                <span>Import</span>
            </button>
            <button 
                onClick={onAddPatient}
                className="px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-black transition flex items-center justify-center gap-2 whitespace-nowrap"
            >
                <Plus size={18} /> <span className="hidden sm:inline">{t.addPatient}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Patient Details</th>
                <th className="px-6 py-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Condition</th>
                <th className="px-6 py-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Adherence</th>
                <th className="px-6 py-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Subscription</th>
                <th className="px-6 py-5 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPatients.map((patient) => (
                <tr 
                    key={patient.id} 
                    onClick={() => onSelectPatient(patient)}
                    className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">{patient.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                         <p className="text-xs text-gray-500 font-mono">
                            {revealedIds.has(patient.id) ? patient.phone : '•••-•••-' + patient.phone.slice(-4)}
                         </p>
                         <button onClick={(e) => toggleReveal(patient.id, e)} className="text-gray-300 hover:text-teal-600 transition">
                            {revealedIds.has(patient.id) ? <EyeOff size={12}/> : <Eye size={12}/>}
                         </button>
                         <span className="text-gray-300">•</span>
                         <span className="text-xs text-gray-500">{patient.language}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
                        {patient.condition}
                      </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${patient.adherenceRate > 80 ? 'bg-emerald-600' : patient.adherenceRate > 50 ? 'bg-amber-500' : 'bg-rose-600'}`} 
                          style={{ width: `${patient.adherenceRate}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-gray-700">{patient.adherenceRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(patient.status)}`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                           {patient.subscriptionStatus === 'Active' ? (
                               <UserCheck size={14} className="text-emerald-500" />
                           ) : (
                               <UserX size={14} className="text-gray-400" />
                           )}
                           <span className={`text-xs font-medium ${patient.subscriptionStatus === 'Active' ? 'text-emerald-700' : 'text-gray-500'}`}>
                               {patient.subscriptionStatus || 'Active'}
                           </span>
                       </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-gray-300">
                        <span className="text-xs font-medium group-hover:text-slate-600 transition">View Profile</span>
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPatients.length === 0 && (
              <div className="p-12 text-center text-gray-400">
                  <div className="inline-flex p-4 bg-gray-50 rounded-full mb-3">
                      <Search size={24} className="opacity-50" />
                  </div>
                  <p className="font-medium">No patients found.</p>
                  <p className="text-xs mt-1">Try adjusting your filters or search terms.</p>
                  {statusFilter !== 'All' && (
                      <button onClick={() => setStatusFilter('All')} className="mt-4 text-xs font-bold text-slate-600 hover:underline">
                          Clear Filters
                      </button>
                  )}
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientList;
