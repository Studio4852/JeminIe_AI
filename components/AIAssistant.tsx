import React, { useState, useEffect, useRef } from 'react';
import { Patient, RegionTemplate } from '../types';
import { generatePatientMessage } from '../services/geminiService';
import { mockTemplates } from '../services/mockData';
import { Sparkles, Send, Copy, RefreshCw, MessageSquare, AlertOctagon, Mic, Square, Play, Pause, Trash2, Calendar, Globe, Download, Clock, Loader2, BookTemplate, Search, Filter, Plus, X, Check, CalendarX, ArrowRight } from 'lucide-react';

interface AIAssistantProps {
  selectedPatient: Patient | null;
  patients: Patient[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ selectedPatient, patients }) => {
  const [patientId, setPatientId] = useState<string>(selectedPatient?.id || (patients[0]?.id || ''));
  const [messageType, setMessageType] = useState<'reminder' | 'refill' | 'motivation'>('reminder');
  const [customContext, setCustomContext] = useState('');
  const [targetLanguage, setTargetLanguage] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Reminder Schedule State
  const [reminderFreq, setReminderFreq] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(''); // FREQ 002
  const [scheduleTime, setScheduleTime] = useState('09:00');
  
  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSendingAudio, setIsSendingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Manual Sending State
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  // Template Manager State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [localTemplates, setLocalTemplates] = useState<RegionTemplate[]>(mockTemplates);
  const [templateSearch, setTemplateSearch] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const currentPatient = patients.find(p => p.id === patientId);

  useEffect(() => {
    if (currentPatient) {
        setTargetLanguage(currentPatient.language);
    }
  }, [currentPatient]);

  // Reset audio player if URL changes
  useEffect(() => {
    if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
    }
    setIsPlaying(false);
  }, [audioUrl]);

  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Browser compatibility detection
        const mimeTypes = [
            'audio/webm',
            'audio/ogg',
            'audio/mp4',
            'audio/wav'
        ];
        const mimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';

        const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        mediaRecorderRef.current = mediaRecorder;
        
        const chunks: BlobPart[] = [];
        mediaRecorder.ondataavailable = (e) => {
             if (e.data.size > 0) chunks.push(e.data);
        };
        
        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: mimeType || 'audio/webm' });
            setAudioBlob(blob);
            setAudioUrl(URL.createObjectURL(blob));
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingTime(0);
        timerRef.current = window.setInterval(() => {
            setRecordingTime(prev => prev + 1);
        }, 1000);
    } catch (err) {
        alert("Microphone access denied. Please enable permissions in your browser.");
        console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const deleteRecording = () => {
      if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
      }
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingTime(0);
      setIsPlaying(false);
  };

  const togglePlayback = () => {
      if (!audioUrl) return;

      if (!audioPlayerRef.current) {
          audioPlayerRef.current = new Audio(audioUrl);
          audioPlayerRef.current.onended = () => setIsPlaying(false);
      }

      if (isPlaying) {
          audioPlayerRef.current.pause();
          setIsPlaying(false);
      } else {
          audioPlayerRef.current.play();
          setIsPlaying(true);
      }
  };

  const handleSendAudio = () => {
      if (!audioBlob) return;
      
      setIsSendingAudio(true);
      
      // Simulate API upload delay
      setTimeout(() => {
          setIsSendingAudio(false);
          alert(`Voice note sent successfully to ${currentPatient?.name}!`);
          deleteRecording();
      }, 2000);
  };

  const downloadRecording = () => {
      if(audioUrl) {
          const a = document.createElement('a');
          a.href = audioUrl;
          a.download = `voice_note_${new Date().toISOString()}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
      }
  }

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGenerate = async () => {
    if (!currentPatient) return;

    // FREQ 004: Validation for End Date
    if (messageType === 'reminder') {
        if (!endDate) {
            alert("Please set an end date for the reminder campaign.");
            return;
        }
        if (new Date(endDate) <= new Date(startDate)) {
            alert("End date must be after start date.");
            return;
        }
    }

    setIsLoading(true);
    setGeneratedContent('');

    let timeContext = '';
    if (messageType === 'reminder') {
        timeContext = `The reminder is scheduled for ${startDate} at ${scheduleTime}, repeating ${reminderFreq} until ${endDate}.`;
    }

    try {
      const result = await generatePatientMessage(
        currentPatient.name,
        currentPatient.condition,
        targetLanguage || currentPatient.language,
        messageType,
        `${customContext} ${timeContext}`
      );
      setGeneratedContent(result);
    } catch (e) {
      setGeneratedContent("Error generating content. Please check API Key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
      setIsSendingMessage(true);
      // SEND 008, 009: Simulate sending
      setTimeout(() => {
          setIsSendingMessage(false);
          alert(`Message sent successfully to ${currentPatient?.name}!`);
          setCustomContext(''); // SEND 004 reset
      }, 1500);
  };

  const isSendReady = () => {
      if (!customContext.trim()) return false;
      if (!patientId) return false;
      if (messageType === 'reminder') {
          // SEND 005 required fields
          if (!startDate || !scheduleTime || !endDate) return false;
      }
      return true;
  };

  const handleApplyTemplate = (content: string) => {
      setCustomContext(prev => {
          const prefix = prev ? prev + '\n\n' : '';
          return prefix + `[Use this template structure]: "${content}"`;
      });
      setIsTemplateModalOpen(false);
  };

  const filteredTemplates = localTemplates.filter(t => {
      const matchesRegion = selectedRegion === 'All' || t.region === selectedRegion;
      const matchesSearch = t.title.toLowerCase().includes(templateSearch.toLowerCase()) || t.content.toLowerCase().includes(templateSearch.toLowerCase());
      return matchesRegion && matchesSearch;
  });

  const uniqueRegions = ['All', ...Array.from(new Set(localTemplates.map(t => t.region)))];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full relative">
      {/* Template Manager Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-4xl w-full h-[80vh] flex flex-col overflow-hidden relative">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
                            <BookTemplate size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Regional Templates</h3>
                            <p className="text-sm text-slate-500">Manage culturally relevant communication standards.</p>
                        </div>
                    </div>
                    <button onClick={() => setIsTemplateModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={24}/></button>
                </div>
                
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Filters */}
                    <div className="w-64 bg-slate-50 border-r border-gray-100 p-6 flex flex-col gap-6 overflow-y-auto">
                         <div>
                             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Search</label>
                             <div className="relative">
                                 <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                                 <input 
                                    type="text" 
                                    placeholder="Filter templates..." 
                                    value={templateSearch}
                                    onChange={(e) => setTemplateSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                 />
                             </div>
                         </div>
                         
                         <div>
                             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Regions</label>
                             <div className="space-y-2">
                                 {uniqueRegions.map(region => (
                                     <button
                                        key={region}
                                        onClick={() => setSelectedRegion(region)}
                                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${selectedRegion === region ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-white hover:shadow-sm'}`}
                                     >
                                         {region}
                                     </button>
                                 ))}
                             </div>
                         </div>

                         <button className="mt-auto flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-slate-500 font-bold text-sm hover:border-indigo-400 hover:text-indigo-600 transition">
                             <Plus size={16} /> New Template
                         </button>
                    </div>

                    {/* Template List */}
                    <div className="flex-1 p-8 overflow-y-auto bg-slate-50/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredTemplates.map(template => (
                                <div key={template.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-shadow group flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg">{template.region}</span>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {/* Edit/Delete mocked */}
                                            <button className="text-slate-400 hover:text-slate-600"><BookTemplate size={14} /></button>
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-slate-900 mb-2">{template.title}</h4>
                                    <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-1 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        "{template.content}"
                                    </p>
                                    <button 
                                        onClick={() => handleApplyTemplate(template.content)}
                                        className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 transition flex items-center justify-center gap-2"
                                    >
                                        Use Template <Check size={14} />
                                    </button>
                                </div>
                            ))}
                            {filteredTemplates.length === 0 && (
                                <div className="col-span-full text-center py-12 text-slate-400">
                                    <Filter size={32} className="mx-auto mb-2 opacity-50" />
                                    <p>No templates found for this region.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col gap-6 overflow-y-auto">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <Sparkles size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Jemine Copilot</h2>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">Generate personalized, culturally relevant engagement messages. <span className="text-red-500 font-medium">Not for medical diagnosis.</span></p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Select Patient</label>
            <div className="relative">
                <select 
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none appearance-none font-medium text-gray-700"
                >
                {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} • {p.condition}</option>
                ))}
                </select>
                <div className="absolute right-3 top-3.5 pointer-events-none text-gray-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
            </div>
          </div>

          <div>
             <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Language</label>
             <div className="relative">
                 <Globe size={16} className="absolute left-3 top-3.5 text-gray-400" />
                 <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="w-full pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none appearance-none font-medium text-gray-700"
                 >
                     <option value="English">English</option>
                     <option value="Twi">Twi</option>
                     <option value="Ga">Ga</option>
                     <option value="Ewe">Ewe</option>
                     <option value="Hausa">Hausa</option>
                     <option value="French">French</option>
                     <option value="Swahili">Swahili</option>
                     <option value="Igbo">Igbo</option>
                     <option value="Yoruba">Yoruba</option>
                 </select>
             </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Message Goal</label>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => setMessageType('reminder')}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${messageType === 'reminder' ? 'bg-purple-50 border-purple-200 text-purple-700 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                Reminder
              </button>
              <button 
                onClick={() => setMessageType('refill')}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${messageType === 'refill' ? 'bg-purple-50 border-purple-200 text-purple-700 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                Refill
              </button>
              <button 
                onClick={() => setMessageType('motivation')}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${messageType === 'motivation' ? 'bg-purple-50 border-purple-200 text-purple-700 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                Motivation
              </button>
            </div>
          </div>

          {messageType === 'reminder' && (
              <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 space-y-4 animate-fade-in">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-purple-800 uppercase tracking-wider mb-2">
                        <RefreshCw size={14} /> Frequency
                    </label>
                    <div className="flex gap-2">
                        {['Daily', 'Weekly', 'Monthly'].map((freq) => (
                            <button
                                key={freq}
                                onClick={() => setReminderFreq(freq as any)}
                                className={`flex-1 py-2 text-xs rounded-lg font-medium border transition-colors ${reminderFreq === freq ? 'bg-white text-purple-700 border-purple-200 shadow-sm ring-1 ring-purple-100' : 'border-transparent text-gray-500 hover:bg-white/50'}`}
                            >
                                {freq}
                            </button>
                        ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                      <div>
                          <label className="flex items-center gap-2 text-xs font-bold text-purple-800 uppercase tracking-wider mb-2">
                              <Calendar size={14} /> Start Date
                          </label>
                          <input 
                              type="date"
                              value={startDate}
                              min={new Date().toISOString().split('T')[0]}
                              onChange={(e) => setStartDate(e.target.value)}
                              className="w-full bg-white border border-purple-200 rounded-xl p-2.5 text-xs font-medium text-gray-700 outline-none focus:ring-2 focus:ring-purple-500/20 shadow-sm"
                          />
                      </div>
                      <div>
                          <label className="flex items-center gap-2 text-xs font-bold text-purple-800 uppercase tracking-wider mb-2">
                              <CalendarX size={14} /> End Date
                          </label>
                          <input 
                              type="date"
                              value={endDate}
                              min={startDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              className="w-full bg-white border border-purple-200 rounded-xl p-2.5 text-xs font-medium text-gray-700 outline-none focus:ring-2 focus:ring-purple-500/20 shadow-sm"
                          />
                      </div>
                      <div className="col-span-2">
                          <label className="flex items-center gap-2 text-xs font-bold text-purple-800 uppercase tracking-wider mb-2">
                              <Clock size={14} /> Time
                          </label>
                          <input 
                              type="time"
                              value={scheduleTime}
                              onChange={(e) => setScheduleTime(e.target.value)}
                              className="w-full bg-white border border-purple-200 rounded-xl p-2.5 text-xs font-medium text-gray-700 outline-none focus:ring-2 focus:ring-purple-500/20 shadow-sm"
                          />
                      </div>
                  </div>
              </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Context</label>
                <button 
                    onClick={() => setIsTemplateModalOpen(true)}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg hover:bg-indigo-100 transition"
                >
                    <BookTemplate size={12} /> Templates
                </button>
            </div>
            <textarea 
              value={customContext}
              onChange={(e) => setCustomContext(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm h-24 resize-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none placeholder:text-gray-400"
              placeholder="Add specific details (e.g., 'Mention the upcoming holiday', 'Ask about side effects')..."
            />
            {/* SEND 002, 003, 004, 005: Conditional Send Button */}
            {customContext.length > 0 && (
                <button
                    onClick={handleSendMessage}
                    disabled={!isSendReady() || isSendingMessage}
                    className="mt-3 w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed animate-fade-in"
                >
                     {isSendingMessage ? (
                         <>
                            <Loader2 className="animate-spin" size={16} /> Sending...
                         </>
                     ) : (
                         <>
                            <Send size={16} /> Send Message
                         </>
                     )}
                </button>
            )}
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isLoading || !patientId}
            className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            Generate Draft
          </button>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        {/* Output Section */}
        <div className="bg-[#f0f2f5] border border-gray-200 rounded-[2rem] p-8 min-h-[400px] flex flex-col relative overflow-hidden">
            {generatedContent ? (
            <div className="w-full max-w-lg mx-auto animate-zoom-in">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                                <MessageSquare size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-bold">Draft Preview</p>
                                <p className="text-[10px] opacity-80">To: {currentPatient?.phone}</p>
                            </div>
                        </div>
                        <span className="text-[10px] bg-black/20 px-2 py-1 rounded-full font-medium backdrop-blur-sm">SMS • 1 Segment</span>
                    </div>
                    
                    <div className="p-6">
                        <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap font-medium font-sans">
                            {generatedContent}
                        </p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 flex justify-end gap-2 border-t border-gray-100">
                        <button 
                            onClick={() => navigator.clipboard.writeText(generatedContent)}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                            title="Copy text"
                        >
                            <Copy size={18} />
                        </button>
                    </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                <button className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2">
                    <Send size={18} /> Send Securely
                </button>
                <button className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2">
                    <span className="text-green-600"><MessageSquare size={18} /></span> WhatsApp
                </button>
                </div>
                
                <div className="mt-4 flex items-center gap-2 justify-center text-xs text-gray-400">
                    <AlertOctagon size={12} />
                    <span>Verify content before sending. Provider is responsible for accuracy.</span>
                </div>
            </div>
            ) : (
            <div className="text-center max-w-sm opacity-60 m-auto animate-fade-in">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 transform rotate-3">
                <Sparkles className="text-purple-300" size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">AI Companion Ready</h3>
                <p className="text-gray-500">Select a patient from the left panel to generate HPIA-compliant engagement messages instantly.</p>
            </div>
            )}
        </div>

        {/* Voice Recorder Section */}
        <div className="bg-white p-6 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 animate-fade-in-up">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Mic size={20} className="text-rose-500" /> Voice Message
            </h3>
            
            <div className="flex items-center gap-6">
                {!isRecording && !audioUrl && (
                    <button 
                        onClick={startRecording}
                        className="w-16 h-16 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition-all hover:scale-105 border-2 border-rose-200 shadow-sm"
                    >
                        <Mic size={28} />
                    </button>
                )}
                
                {isRecording && (
                    <div className="flex items-center gap-4 w-full">
                        <button 
                            onClick={stopRecording}
                            className="w-16 h-16 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-all animate-pulse shadow-lg shadow-rose-500/30 shrink-0"
                        >
                            <Square size={24} fill="currentColor" />
                        </button>
                        <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex justify-between items-center">
                            <div>
                                <span className="text-rose-500 font-bold text-xl font-mono block">{formatTime(recordingTime)}</span>
                                <span className="text-xs text-rose-400 font-semibold uppercase tracking-wider">Recording...</span>
                            </div>
                            <div className="flex gap-1 items-end h-8">
                                {[1,2,3,4,5].map(i => <div key={i} className="w-1 bg-rose-400 animate-pulse rounded-full" style={{height: `${Math.random() * 100}%`, animationDelay: `${i*0.1}s`}}></div>)}
                            </div>
                        </div>
                    </div>
                )}

                {audioUrl && !isRecording && (
                    <div className="flex-1 flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 animate-fade-in">
                        <button 
                            onClick={togglePlayback}
                            className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-black transition shrink-0"
                        >
                            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                        </button>
                        <div className="flex-1 min-w-0">
                            <div className="h-1 bg-slate-200 rounded-full w-full overflow-hidden">
                                <div className={`h-full bg-slate-900 ${isPlaying ? 'animate-pulse' : ''}`} style={{width: isPlaying ? '100%' : '50%'}}></div>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 truncate">{isPlaying ? 'Playing...' : 'Review Recording'}</p>
                        </div>
                        <button 
                            onClick={downloadRecording}
                            className="text-slate-400 hover:text-indigo-600 transition"
                            title="Download Audio"
                        >
                            <Download size={18} />
                        </button>
                        <button 
                            onClick={deleteRecording}
                            className="text-slate-400 hover:text-rose-500 transition"
                            title="Delete"
                        >
                            <Trash2 size={18} />
                        </button>
                        <button 
                            onClick={handleSendAudio}
                            disabled={isSendingAudio}
                            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSendingAudio ? (
                                <>
                                    <Loader2 className="animate-spin" size={14} /> Sending...
                                </>
                            ) : (
                                "Send Audio"
                            )}
                        </button>
                    </div>
                )}
                
                {!isRecording && !audioUrl && (
                     <p className="text-sm text-gray-500">Tap microphone to start recording a personalized voice note for the patient.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;