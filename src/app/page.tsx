/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Users, TrendingUp, TrendingDown, Minus, Activity, AlertTriangle, AlertOctagon,
  Search, Filter, Download, Upload, ChevronLeft, ChevronRight, X, Sparkles, Sliders,
  Target, ArrowRight, BrainCircuit, ArrowUpRight, CheckCircle2
} from "lucide-react";
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  ScatterChart, Scatter, ZAxis, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { initialStudents, ScoredStudent, scoreStudent } from "@/lib/analyticsEngine";

export default function SmartCampusDashboard() {
  const [students, setStudents] = useState<ScoredStudent[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [segmentFilter, setSegmentFilter] = useState("All");
  const [presetFilter, setPresetFilter] = useState<"All" | "AttendanceDrop" | "UrgentPlacement" | "UntappedPotential">("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Modal State
  const [selectedStudent, setSelectedStudent] = useState<ScoredStudent | null>(null);
  const [modalTab, setModalTab] = useState<"Overview" | "AICounselor">("Overview");
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<{role: "system" | "user", text: string}[]>([]);
  const [isChatGenerating, setIsChatGenerating] = useState(false);

  // Intervention Form State
  const [interventionType, setInterventionType] = useState("Assign Remedial Lab");
  const [interventionNotes, setInterventionNotes] = useState("");
  const [actionLogs, setActionLogs] = useState<Array<{ id: string, type: string, notes: string, date: string }>>([]);

  // Simulator & AI State
  const [simAttendance, setSimAttendance] = useState<number>(0);
  const [simCoding, setSimCoding] = useState<number>(0);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState("");

  useEffect(() => {
    setStudents(initialStudents);
    setIsClient(true);
  }, []);

  const simulatedStudent = useMemo(() => {
    if (!selectedStudent) return null;
    return scoreStudent({
      ...selectedStudent,
      attendancePct: simAttendance,
      codingScore: simCoding
    });
  }, [selectedStudent, simAttendance, simCoding]);

  useEffect(() => {
    if (selectedStudent) {
      setSimAttendance(selectedStudent.attendancePct);
      setSimCoding(selectedStudent.codingScore);
      setGeneratedEmail("");
    }
  }, [selectedStudent]);

  const handleGenerateEmail = () => {
    setIsGeneratingEmail(true);
    setGeneratedEmail("");
    setTimeout(() => {
      if (!selectedStudent) return;
      const issues = selectedStudent.negativeDrivers.map(d => d.feature).join(" and ");
      setGeneratedEmail(`Dear ${selectedStudent.name},\n\nI hope this email finds you well. I'm writing to you today because we want to ensure you have all the support you need to succeed here at KPMG Campus.\n\nWe've noticed some recent challenges regarding your ${issues}. Our goal is to proactively help you overcome these hurdles. I'd like to schedule a quick 15-minute sync to discuss some resources, such as ${selectedStudent.recommendedInterventions[0].toLowerCase()}.\n\nPlease let me know your availability this week.\n\nBest,\nAcademic Success Team`);
      setIsGeneratingEmail(false);
    }, 1500);
  };

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = s.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept = deptFilter === "All" || s.department === deptFilter;
      const matchYear = yearFilter === "All" || s.year.toString() === yearFilter;
      
      let matchRisk = true;
      if (riskFilter === "Academic High") matchRisk = s.academicRisk === "High";
      if (riskFilter === "Placement High") matchRisk = s.placementRisk === "High";
      if (riskFilter === "Compound Risk") matchRisk = s.compoundRisk;

      const matchSegment = segmentFilter === "All" || s.segment === segmentFilter;

      let matchPreset = true;
      if (presetFilter === "AttendanceDrop") {
        matchPreset = s.attendancePct < 75 && s.trajectory === "Declining";
      } else if (presetFilter === "UrgentPlacement") {
        matchPreset = s.placementRisk === "High" && s.year >= 3;
      } else if (presetFilter === "UntappedPotential") {
        matchPreset = s.tier === "Thriving" && !s.techClubMember;
      }

      return matchSearch && matchDept && matchYear && matchRisk && matchSegment && matchPreset;
    });
  }, [students, searchQuery, deptFilter, yearFilter, riskFilter, segmentFilter, presetFilter]);

  // KPIs
  const totalEnrolled = students.length;
  const avgSuccessScore = students.reduce((acc, s) => acc + s.compositeSuccessScore, 0) / (totalEnrolled || 1);
  const academicRiskCount = students.filter(s => s.academicRisk === "High").length;
  const compoundRiskCount = students.filter(s => s.compoundRisk).length;

  // Pie Chart Data (Tiers)
  const tierDistribution = useMemo(() => {
    const counts = { Thriving: 0, "On Track": 0, "Moderate Risk": 0, "Critical Risk": 0 };
    students.forEach(s => counts[s.tier]++);
    return [
      { name: "Thriving", value: counts["Thriving"], color: "#10b981" },
      { name: "On Track", value: counts["On Track"], color: "#f59e0b" },
      { name: "Moderate", value: counts["Moderate Risk"], color: "#f97316" },
      { name: "Critical", value: counts["Critical Risk"], color: "#f43f5e" }
    ];
  }, [students]);

  // Scatter Chart Data
  const scatterData = useMemo(() => {
    return filteredStudents.map(s => ({
      id: s.id,
      name: s.name,
      cgpa: s.cgpa,
      attendance: s.attendancePct,
      tier: s.tier,
      fill: s.tier === 'Thriving' ? '#10b981' : 
            s.tier === 'On Track' ? '#f59e0b' : 
            s.tier === 'Moderate Risk' ? '#f97316' : '#f43f5e'
    }));
  }, [filteredStudents]);

  // Radar Data for selected student
  const studentRadarData = useMemo(() => {
    if (!selectedStudent) return [];
    return [
      { subject: 'Coding', A: selectedStudent.codingScore, fullMark: 100 },
      { subject: 'Aptitude', A: selectedStudent.aptitudeScore, fullMark: 100 },
      { subject: 'Soft Skills', A: (selectedStudent.softSkillsRating / 5) * 100, fullMark: 100 },
      { subject: 'Interview', A: (selectedStudent.mockInterviewRating / 5) * 100, fullMark: 100 },
      { subject: 'Core Tech', A: selectedStudent.coreTechnicalScore > 100 ? 100 : selectedStudent.coreTechnicalScore, fullMark: 100 },
      { subject: 'LMS', A: selectedStudent.lmsIndex, fullMark: 100 },
    ];
  }, [selectedStudent]);

  // Action Center Alerts
  const actionAlerts = useMemo(() => {
    const alerts = [];
    const droppingAttendance = students.filter(s => s.attendancePct < 75 && s.trajectory === "Declining").length;
    if (droppingAttendance > 0) {
      alerts.push({
        id: 1,
        title: "Attendance Drop Detected",
        description: `${droppingAttendance} students have <75% attendance with a declining trajectory.`,
        priority: "high",
        icon: <TrendingDown className="text-rose-500" size={18} />,
        border: "border-rose-500/30",
        bg: "bg-rose-500/5",
        onClick: () => { setPresetFilter("AttendanceDrop"); setCurrentPage(1); }
      });
    }

    const criticalPlacements = students.filter(s => s.placementRisk === "High" && s.year >= 3).length;
    if (criticalPlacements > 0) {
      alerts.push({
        id: 2,
        title: "Urgent Placement Risk",
        description: `${criticalPlacements} final/pre-final year students have high placement risk.`,
        priority: "high",
        icon: <Target className="text-orange-500" size={18} />,
        border: "border-orange-500/30",
        bg: "bg-orange-500/5",
        onClick: () => { setPresetFilter("UrgentPlacement"); setCurrentPage(1); }
      });
    }

    const thrivingStudents = students.filter(s => s.tier === "Thriving" && !s.techClubMember).length;
    if (thrivingStudents > 0) {
      alerts.push({
        id: 3,
        title: "Untapped Potential",
        description: `${thrivingStudents} thriving students are not part of any tech clubs.`,
        priority: "medium",
        icon: <Sparkles className="text-emerald-500" size={18} />,
        border: "border-emerald-500/30",
        bg: "bg-emerald-500/5",
        onClick: () => { setPresetFilter("UntappedPotential"); setCurrentPage(1); }
      });
    }
    return alerts;
  }, [students]);

  const handleExportCSV = () => {
    const headers = ["ID,Name,Department,Year,CGPA,Attendance,Success Score,Tier,Academic Risk,Placement Risk,Compound Risk,Segment"];
    const rows = filteredStudents.map(s => 
      `${s.id},${s.name},${s.department},${s.year},${s.cgpa},${s.attendancePct},${s.compositeSuccessScore.toFixed(2)},${s.tier},${s.academicRisk},${s.placementRisk},${s.compoundRisk},"${s.segment}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_analytics_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudent) {
      setActionLogs(prev => [
        { id: selectedStudent.id, type: interventionType, notes: interventionNotes, date: new Date().toLocaleString() },
        ...prev
      ]);
      setInterventionNotes("");
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, deptFilter, yearFilter, riskFilter, segmentFilter, presetFilter]);

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                <BrainCircuit size={24} className="text-zinc-100" />
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-white">
                Campus Intelligence
              </h1>
            </div>
            <p className="text-zinc-400 text-sm">Actionable analytics and predictive interventions</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 px-4 py-2 rounded-md transition-colors text-sm font-medium cursor-pointer shadow-sm">
              <Upload size={16} /> Upload Data
              <input type="file" accept=".csv,.json" className="hidden" onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  alert("Success! The mock file was parsed and the analytics engine has updated the dashboard data.");
                  e.target.value = '';
                }
              }} />
            </label>
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-zinc-100 text-zinc-900 hover:bg-white px-4 py-2 rounded-md transition-colors text-sm font-medium shadow-sm"
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
        </header>

        {/* Action Center Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actionAlerts.map(alert => (
            <div key={alert.id} className={`flex gap-4 p-4 rounded-xl border ${alert.border} ${alert.bg} backdrop-blur-sm shadow-sm transition-all hover:-translate-y-0.5`}>
              <div className="mt-0.5">{alert.icon}</div>
              <div>
                <h3 className="text-sm font-medium text-zinc-100 mb-1">{alert.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{alert.description}</p>
                <button 
                  onClick={alert.onClick}
                  className="mt-2 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1 transition-colors"
                >
                  Review <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Executive KPI Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-5 shadow-sm hover:border-zinc-700/80 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Total Enrolled</p>
                <p className="text-2xl font-semibold tracking-tight text-zinc-100">{totalEnrolled}</p>
              </div>
              <div className="p-2.5 bg-zinc-800/50 rounded-lg text-zinc-400 border border-zinc-700/50">
                <Users size={20} />
              </div>
            </div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-5 shadow-sm hover:border-zinc-700/80 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Avg Success Score</p>
                <p className="text-2xl font-semibold tracking-tight text-emerald-400">{avgSuccessScore.toFixed(1)}</p>
              </div>
              <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                <TrendingUp size={20} />
              </div>
            </div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-5 shadow-sm hover:border-zinc-700/80 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Academic Risk</p>
                <p className="text-2xl font-semibold tracking-tight text-amber-500">{academicRiskCount}</p>
              </div>
              <div className="p-2.5 bg-amber-500/10 rounded-lg text-amber-500 border border-amber-500/20">
                <AlertTriangle size={20} />
              </div>
            </div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-5 shadow-sm hover:border-zinc-700/80 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Compound Risk</p>
                <p className="text-2xl font-semibold tracking-tight text-rose-500">{compoundRiskCount}</p>
              </div>
              <div className="p-2.5 bg-rose-500/10 rounded-lg text-rose-500 border border-rose-500/20">
                <AlertOctagon size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-5 shadow-sm lg:col-span-1 flex flex-col">
            <h2 className="text-sm font-medium text-zinc-100 mb-6">Success Tier Distribution</h2>
            <div className="flex-1 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tierDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    isAnimationActive={false}
                    stroke="none"
                  >
                    {tierDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#f4f4f5', fontSize: '13px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-5 shadow-sm lg:col-span-2 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-medium text-zinc-100">CGPA vs Attendance Profiler</h2>
              <span className="text-xs text-zinc-500">Color mapped by Success Tier</span>
            </div>
            <div className="flex-1 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: -10, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis 
                    type="number" 
                    dataKey="attendance" 
                    name="Attendance" 
                    unit="%" 
                    stroke="#71717a" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                    domain={[40, 100]}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="cgpa" 
                    name="CGPA" 
                    stroke="#71717a" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                    domain={[3, 10]}
                  />
                  <ZAxis type="number" range={[40, 40]} />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }} 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any, name: any) => [value, name === 'attendance' ? 'Attendance %' : 'CGPA']}
                  />
                  <Scatter data={scatterData} isAnimationActive={false}>
                    {scatterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} opacity={0.7} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Global Filtering & Search */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input
              type="text"
              placeholder="Search by ID or Name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all shadow-inner"
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 shadow-inner">
              <Filter size={14} className="text-zinc-500" />
              <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="bg-transparent text-zinc-300 outline-none text-sm cursor-pointer">
                <option value="All" className="bg-zinc-900">All Depts</option>
                <option value="CSE" className="bg-zinc-900">CSE</option>
                <option value="ECE" className="bg-zinc-900">ECE</option>
                <option value="MECH" className="bg-zinc-900">MECH</option>
                <option value="IT" className="bg-zinc-900">IT</option>
              </select>
            </div>
            
            <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-300 outline-none text-sm cursor-pointer shadow-inner">
              <option value="All" className="bg-zinc-900">All Years</option>
              <option value="1" className="bg-zinc-900">Year 1</option>
              <option value="2" className="bg-zinc-900">Year 2</option>
              <option value="3" className="bg-zinc-900">Year 3</option>
              <option value="4" className="bg-zinc-900">Year 4</option>
            </select>

            <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-300 outline-none text-sm cursor-pointer shadow-inner">
              <option value="All" className="bg-zinc-900">All Risks</option>
              <option value="Academic High" className="bg-zinc-900">Academic High</option>
              <option value="Placement High" className="bg-zinc-900">Placement High</option>
              <option value="Compound Risk" className="bg-zinc-900">Compound Risk</option>
            </select>

            <button 
              onClick={() => { setSearchQuery(""); setDeptFilter("All"); setYearFilter("All"); setRiskFilter("All"); setSegmentFilter("All"); setPresetFilter("All"); }}
              className="px-3 py-2 text-sm text-zinc-500 hover:text-zinc-200 transition-colors whitespace-nowrap font-medium"
            >
              Reset Filters
            </button>
            <button
              onClick={() => alert(`AI Intervention workflows successfully queued for ${filteredStudents.length} students in the current view.`)}
              className="flex items-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ml-auto whitespace-nowrap"
            >
              <BrainCircuit size={16} /> Bulk Intervention
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-900/80 text-zinc-400 text-xs font-medium border-b border-zinc-800/80">
                <tr>
                  <th className="px-6 py-4 font-medium">Student Profile</th>
                  <th className="px-6 py-4 font-medium">Dept & Year</th>
                  <th className="px-6 py-4 font-medium">Trajectory</th>
                  <th className="px-6 py-4 font-medium">Attendance</th>
                  <th className="px-6 py-4 font-medium">Success Index</th>
                  <th className="px-6 py-4 font-medium">Risk Flags</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {paginatedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                      No students found matching current filters.
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map(student => (
                    <tr key={student.id} className="hover:bg-zinc-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-zinc-100">{student.name}</div>
                        <div className="text-xs text-zinc-500 font-mono mt-0.5">{student.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center bg-zinc-800 text-zinc-300 px-2 py-1 rounded-md text-xs font-medium border border-zinc-700/50">
                          {student.department} • Y{student.year}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs font-medium">
                            {student.trajectory === "Improving" ? <TrendingUp size={14} className="text-emerald-400" /> : 
                             student.trajectory === "Declining" ? <TrendingDown size={14} className="text-rose-400" /> :
                             <Minus size={14} className="text-zinc-500" />}
                            <span className={student.trajectory === "Improving" ? "text-emerald-400" : student.trajectory === "Declining" ? "text-rose-400" : "text-zinc-400"}>{student.trajectory}</span>
                          </div>
                          <span className="text-xs text-zinc-500">CGPA {student.cgpa.toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-xs font-medium border ${student.attendancePct >= 85 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : student.attendancePct < 75 ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                          {student.attendancePct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${student.tier === 'Thriving' ? 'bg-emerald-500' : student.tier === 'On Track' ? 'bg-amber-500' : student.tier === 'Moderate Risk' ? 'bg-orange-500' : 'bg-rose-500'}`}
                              style={{ width: `${student.compositeSuccessScore}%` }}
                            />
                          </div>
                          <span className="font-medium text-zinc-200 text-xs">{student.compositeSuccessScore.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5">
                          {student.academicRisk === "High" && <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" title="High Academic Risk"></span>}
                          {student.placementRisk === "High" && <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" title="High Placement Risk"></span>}
                          {student.compoundRisk && <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" title="Compound Risk"></span>}
                          {student.academicRisk !== "High" && student.placementRisk !== "High" && !student.compoundRisk && <span className="text-xs text-zinc-600">-</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => { setSelectedStudent(student); setModalTab("Overview"); setChatLog([]); }}
                          className="text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-md transition-all border border-zinc-700/50 hover:border-zinc-600 shadow-sm opacity-80 group-hover:opacity-100"
                        >
                          Deep Dive
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-4 border-t border-zinc-800/50 flex items-center justify-between bg-zinc-900/30">
            <div className="text-xs text-zinc-500">
              Showing <span className="font-medium text-zinc-300">{Math.min((currentPage - 1) * rowsPerPage + 1, filteredStudents.length)}</span> to <span className="font-medium text-zinc-300">{Math.min(currentPage * rowsPerPage, filteredStudents.length)}</span> of <span className="font-medium text-zinc-300">{filteredStudents.length}</span> students
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md bg-zinc-800 border border-zinc-700/50 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 disabled:opacity-50 disabled:hover:bg-zinc-800 disabled:hover:text-zinc-400 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1.5 rounded-md bg-zinc-800 border border-zinc-700/50 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 disabled:opacity-50 disabled:hover:bg-zinc-800 disabled:hover:text-zinc-400 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Flyout Modal - Deep Dive */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm transition-opacity" onClick={() => { setSelectedStudent(null); setModalTab("Overview"); setChatLog([]); }} />
          <div className="relative w-full max-w-2xl h-full bg-zinc-950 border-l border-zinc-800/80 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right-8 duration-300">
            
            <div className="p-6 border-b border-zinc-800/80 flex justify-between items-start bg-zinc-900/30">
              <div>
                <h2 className="text-2xl font-semibold text-zinc-50 tracking-tight">{selectedStudent.name}</h2>
                <p className="text-sm text-zinc-400 mb-4 font-mono">{selectedStudent.id} <span className="font-sans">• {selectedStudent.department} (Y{selectedStudent.year})</span></p>
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium border bg-zinc-900/50 ${
                    selectedStudent.tier === 'Thriving' ? 'text-emerald-400 border-emerald-500/20' : 
                    selectedStudent.tier === 'On Track' ? 'text-amber-400 border-amber-500/20' : 
                    selectedStudent.tier === 'Moderate Risk' ? 'text-orange-400 border-orange-500/20' : 'text-rose-400 border-rose-500/20'
                  }`}>
                    {selectedStudent.tier} Status
                  </span>
                  {selectedStudent.compoundRisk && (
                    <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-rose-500/10 border border-rose-500/20 text-rose-400 items-center gap-1.5">
                      <AlertOctagon size={12} /> Compound Risk
                    </span>
                  )}
                  <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium items-center gap-1.5 border ${
                    selectedStudent.trajectory === 'Improving' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    selectedStudent.trajectory === 'Declining' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-zinc-800 text-zinc-400 border-zinc-700/50'
                  }`}>
                    <Activity size={12} /> {selectedStudent.trajectory} Trend
                  </span>
                </div>
              </div>
              <button onClick={() => { setSelectedStudent(null); setModalTab("Overview"); setChatLog([]); }} className="text-zinc-500 hover:text-zinc-200 p-1.5 rounded-md hover:bg-zinc-800 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex px-6 border-b border-zinc-800/80 bg-zinc-900/10">
              <button 
                onClick={() => setModalTab("Overview")}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${modalTab === "Overview" ? "border-zinc-100 text-zinc-100" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
              >
                Overview & Interventions
              </button>
              <button 
                onClick={() => {
                  setModalTab("AICounselor");
                  if (chatLog.length === 0 && selectedStudent) {
                     setChatLog([{role: "system", text: `Hi! I'm the Campus AI Counselor. I noticed ${selectedStudent.name} is currently in the "${selectedStudent.tier}" tier. How can I help you support them today?`}]);
                  }
                }}
                className={`py-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${modalTab === "AICounselor" ? "border-zinc-100 text-zinc-100" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
              >
                <BrainCircuit size={14} /> AI Counselor
              </button>
            </div>

            {modalTab === "Overview" ? (
              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {/* Radar Chart (Skills Profiler) & Drivers Grid */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Target size={14} /> Skills Profiler
                  </h3>
                  <div className="h-56 bg-zinc-900/30 rounded-xl border border-zinc-800/80 flex items-center justify-center p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={studentRadarData}>
                        <PolarGrid stroke="#3f3f46" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Student" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Explainable Score Drivers</h3>
                  <div className="space-y-2.5">
                    {[...selectedStudent.positiveDrivers, ...selectedStudent.negativeDrivers]
                      .sort((a, b) => b.impact - a.impact)
                      .map((driver, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-zinc-900/40 border border-zinc-800/50 p-2.5 rounded-lg">
                        <span className="text-sm text-zinc-300">{driver.feature}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${driver.impact > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                          {driver.impact > 0 ? "+" : ""}{driver.impact.toFixed(1)} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Longitudinal Trend Timeline */}
              <section>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Activity size={14} /> Historical Success Trend
                </h3>
                <div className="h-48 w-full bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedStudent.historicalScores} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="semester" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#71717a" fontSize={11} domain={[0, 100]} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }}
                        itemStyle={{ color: '#f4f4f5', fontSize: '13px' }}
                      />
                      <Line type="monotone" dataKey="score" stroke="#fafafa" strokeWidth={2} dot={{ fill: '#fafafa', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#6366f1', stroke: '#18181b', strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* What-If Simulator */}
              <section className="bg-zinc-900/50 p-5 rounded-xl border border-zinc-800/80 shadow-inner">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                    <Sliders size={16} className="text-zinc-400" /> What-If Predictive Simulator
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Simulate Attendance</label>
                      <span className="text-xs font-mono text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded">{simAttendance}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" 
                      value={simAttendance} 
                      onChange={(e) => setSimAttendance(Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Simulate Coding Score</label>
                      <span className="text-xs font-mono text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded">{simCoding}/100</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" 
                      value={simCoding} 
                      onChange={(e) => setSimCoding(Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                  </div>
                </div>

                {simulatedStudent && (
                  <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 flex justify-between items-center shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1">Predicted Success Outcome</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xl font-semibold tracking-tight ${simulatedStudent.compositeSuccessScore > selectedStudent.compositeSuccessScore ? "text-emerald-400" : simulatedStudent.compositeSuccessScore < selectedStudent.compositeSuccessScore ? "text-rose-400" : "text-zinc-200"}`}>
                          {simulatedStudent.compositeSuccessScore.toFixed(1)} 
                        </span>
                        {simulatedStudent.compositeSuccessScore !== selectedStudent.compositeSuccessScore && (
                          <span className={`text-xs font-medium ${simulatedStudent.compositeSuccessScore > selectedStudent.compositeSuccessScore ? "text-emerald-500" : "text-rose-500"}`}>
                            ({simulatedStudent.compositeSuccessScore > selectedStudent.compositeSuccessScore ? "+" : ""}{(simulatedStudent.compositeSuccessScore - selectedStudent.compositeSuccessScore).toFixed(1)})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                       <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium border bg-zinc-900/50 ${
                        simulatedStudent.tier === 'Thriving' ? 'text-emerald-400 border-emerald-500/20' : 
                        simulatedStudent.tier === 'On Track' ? 'text-amber-400 border-amber-500/20' : 
                        simulatedStudent.tier === 'Moderate Risk' ? 'text-orange-400 border-orange-500/20' : 'text-rose-400 border-rose-500/20'
                      }`}>
                        {simulatedStudent.tier}
                      </span>
                    </div>
                  </div>
                )}
              </section>

              {/* Interventions & Actions */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">AI Prescriptive Actions</h3>
                  </div>
                  
                  <ul className="space-y-2 mb-4">
                    {selectedStudent.recommendedInterventions.map((action, idx) => (
                      <li key={idx} className="bg-zinc-900/50 border border-zinc-800/80 p-3 rounded-lg text-sm text-zinc-300 flex items-start gap-2.5">
                        <ArrowUpRight size={16} className="text-zinc-500 mt-0.5 shrink-0" />
                        <span className="leading-snug">{action}</span>
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={handleGenerateEmail}
                    disabled={isGeneratingEmail}
                    className="w-full flex items-center justify-center gap-2 text-sm bg-zinc-100 text-zinc-900 hover:bg-white py-2.5 rounded-lg transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                  >
                    <Sparkles size={16} /> Draft Intervention Email
                  </button>

                  {isGeneratingEmail ? (
                    <div className="mt-4 p-4 bg-zinc-900/30 border border-zinc-800/80 rounded-lg animate-pulse">
                      <div className="h-2.5 bg-zinc-800 rounded w-3/4 mb-3"></div>
                      <div className="h-2.5 bg-zinc-800 rounded w-full mb-3"></div>
                      <div className="h-2.5 bg-zinc-800 rounded w-5/6"></div>
                    </div>
                  ) : generatedEmail ? (
                    <div className="mt-4 p-4 bg-zinc-900/50 border border-zinc-700/50 rounded-lg relative group">
                      <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{generatedEmail}</p>
                      <button className="absolute top-2 right-2 p-1.5 bg-zinc-800 rounded text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white" title="Copy to clipboard">
                        <CheckCircle2 size={14} />
                      </button>
                    </div>
                  ) : null}
                </div>

                {/* Logger */}
                <div className="bg-zinc-900/30 p-5 rounded-xl border border-zinc-800/80">
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Log Interaction</h3>
                  <form onSubmit={handleLogAction} className="space-y-3">
                    <select 
                      value={interventionType}
                      onChange={(e) => setInterventionType(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600 shadow-inner"
                    >
                      <option>Assign Remedial Lab</option>
                      <option>Academic Counseling</option>
                      <option>Placement Training</option>
                      <option>Parent Contact</option>
                      <option>General Sync</option>
                    </select>
                    <textarea
                      placeholder="Add specific notes about the intervention..."
                      value={interventionNotes}
                      onChange={(e) => setInterventionNotes(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-200 h-24 focus:outline-none focus:border-zinc-600 resize-none shadow-inner"
                      required
                    />
                    <button type="submit" className="w-full bg-zinc-800 border border-zinc-700/50 text-zinc-200 hover:bg-zinc-700 hover:text-white py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
                      Save Log Entry
                    </button>
                  </form>

                  {actionLogs.filter(log => log.id === selectedStudent.id).length > 0 && (
                    <div className="mt-5 space-y-2.5 border-t border-zinc-800/50 pt-5">
                      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-3">Previous Logs</p>
                      {actionLogs.filter(log => log.id === selectedStudent.id).map((log, idx) => (
                        <div key={idx} className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80 shadow-sm">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs font-semibold text-zinc-200">{log.type}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">{log.date.split(',')[0]}</span>
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed">{log.notes}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              </div>
            ) : (
               <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
                 <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {chatLog.map((msg, idx) => (
                      <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'system' && (
                          <div className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-900 flex flex-shrink-0 items-center justify-center border border-zinc-300 shadow-sm">
                            <BrainCircuit size={16} />
                          </div>
                        )}
                        <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm leading-relaxed ${msg.role === 'user' ? 'bg-zinc-800 text-zinc-100 border border-zinc-700' : 'bg-zinc-900/50 text-zinc-300 border border-zinc-800/80 shadow-sm'}`}>
                          {msg.text}
                        </div>
                        {msg.role === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-zinc-800 flex flex-shrink-0 items-center justify-center border border-zinc-700">
                            <Users size={16} className="text-zinc-400" />
                          </div>
                        )}
                      </div>
                    ))}
                    {isChatGenerating && (
                      <div className="flex gap-3">
                         <div className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-900 flex flex-shrink-0 items-center justify-center border border-zinc-300 shadow-sm">
                            <BrainCircuit size={16} />
                          </div>
                          <div className="px-4 py-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 flex items-center gap-1.5 h-11">
                             <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                             <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                             <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                      </div>
                    )}
                 </div>
                  <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/30">
                   <form onSubmit={async (e) => {
                     e.preventDefault();
                     if(!chatInput.trim()) return;
                     const query = chatInput.trim();
                     
                     // Add user message to UI immediately
                     const newChatLog = [...chatLog, {role: "user" as const, text: query}];
                     setChatLog(newChatLog);
                     setChatInput("");
                     setIsChatGenerating(true);
                     
                     try {
                        const res = await fetch('/api/chat', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            student: selectedStudent,
                            query: query,
                            chatHistory: chatLog // Send previous log history
                          })
                        });
                        
                        const data = await res.json();
                        setChatLog([...newChatLog, {role: "system", text: data.reply}]);
                     } catch (err) {
                        setChatLog([...newChatLog, {role: "system", text: "Connection error. Please try again."}]);
                     } finally {
                        setIsChatGenerating(false);
                     }
                   }} className="flex gap-2">
                     <input 
                       type="text" 
                       value={chatInput}
                       onChange={e => setChatInput(e.target.value)}
                       placeholder={`Ask AI about ${selectedStudent?.name}...`}
                       className="flex-1 bg-zinc-900 border border-zinc-700/50 rounded-lg px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors shadow-inner"
                     />
                     <button 
                       type="submit"
                       disabled={isChatGenerating || !chatInput.trim()}
                       className="bg-zinc-100 text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2"
                     >
                       <BrainCircuit size={16} /> Ask
                     </button>
                   </form>
                 </div>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
