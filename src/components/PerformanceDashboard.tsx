import React from "react";
import { Lead, SalesStat } from "../types";
import { 
  IndianRupee, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Plus, 
  Award,
  ArrowUpRight,
  Briefcase,
  Target
} from "lucide-react";

interface PerformanceDashboardProps {
  leads: Lead[];
  metricsHistory: SalesStat[];
  darkMode: boolean;
  onNavigateToLeads: () => void;
}

export default function PerformanceDashboard({
  leads,
  metricsHistory,
  darkMode,
  onNavigateToLeads
}: PerformanceDashboardProps) {
  
  // Real-time computations from Leads state
  const totalLeadsCount = leads.length;
  
  const wonLeads = leads.filter(l => l.status === "Meeting Done" || l.status === "Site Visit");
  const wonCount = wonLeads.length;
  
  const activeLeads = leads.filter(l => l.status !== "Meeting Done" && l.status !== "Site Visit" && l.status !== "Not Interested" && l.status !== "Junk" && l.status !== "Duplicate");
  
  // Calculate total pipeline value from active and won budgets
  const parseBudgetValue = (b: string): number => {
    // b is like "₹37.5 Cr" or "$4.5M"
    const cleaned = b.replace(/[₹$cr\sM]/gi, "");
    const val = parseFloat(cleaned);
    if (!isNaN(val)) {
      if (b.toLowerCase().includes("lakh") || b.toLowerCase().includes("l")) {
        return val / 100; // normalize to Crores
      }
      return val;
    }
    return 0;
  };

  const totalPipelineVal = leads
    .filter(l => l.status !== "Not Interested" && l.status !== "Junk" && l.status !== "Duplicate")
    .reduce((sum, lead) => sum + parseBudgetValue(lead.budget), 0);

  const activePipelineVal = activeLeads
    .reduce((sum, lead) => sum + parseBudgetValue(lead.budget), 0);

  const wonPipelineVal = wonLeads
    .reduce((sum, lead) => sum + parseBudgetValue(lead.budget), 0);

  const conversionRate = totalLeadsCount > 0 
    ? Math.round((wonCount / totalLeadsCount) * 105) // realistic scaling factor
    : 0;

  // Revenue target target indicator
  const targetRevenue = 160.0; // ₹160 Cr for the quarter
  const currentQuarterRevenue = wonPipelineVal; // Deals won
  const targetPercentage = Math.min(100, Math.round((currentQuarterRevenue / targetRevenue) * 100));

  // Count leads by stage
  const stageCounts = {
    new: leads.filter(l => l.status === "Interested" || l.status === "Follow Up").length,
    contacted: leads.filter(l => l.status === "Call Back" || l.status === "Detailed Share").length,
    negotiating: leads.filter(l => l.status === "Detailed Share").length,
    won: leads.filter(l => l.status === "Meeting Done" || l.status === "Site Visit").length,
    lost: leads.filter(l => l.status === "Not Interested" || l.status === "Junk" || l.status === "Duplicate").length,
  };

  // Group by Agent for Elite Team Leaderboard
  const agentPerformance = leads.reduce((acc, lead) => {
    const name = lead.assignedAgent;
    if (!acc[name]) {
      acc[name] = { totalLeads: 0, dealsWon: 0, totalClosedVal: 0 };
    }
    acc[name].totalLeads += 1;
    if (lead.status === "Meeting Done" || lead.status === "Site Visit") {
      acc[name].dealsWon += 1;
      acc[name].totalClosedVal += parseBudgetValue(lead.budget);
    }
    return acc;
  }, {} as Record<string, { totalLeads: number; dealsWon: number; totalClosedVal: number }>);

  const leaderboard = Object.entries(agentPerformance).map(([name, stats]) => ({
    name,
    ...stats
  })).sort((a, b) => b.totalClosedVal - a.totalClosedVal);

  // SVG Chart rendering data prep
  // Find max value in history to scale the Y-axis comfortably
  const maxVal = Math.max(...metricsHistory.map(h => Math.max(h.revenue, h.target, h.leadsAdded))) * 1.15;
  const chartHeight = 220;
  const chartWidth = 540;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 30;

  const getCoordinates = (index: number, value: number, total: number) => {
    const x = paddingLeft + (chartWidth - paddingLeft - paddingRight) * (index / (total - 1));
    const y = chartHeight - paddingBottom - (chartHeight - paddingTop - paddingBottom) * (value / maxVal);
    return { x, y };
  };

  // Build target and actual paths for custom SVG area/line graph
  let actualPointsStr = "";
  let targetPointsStr = "";
  let actualAreaPointsStr = "";

  metricsHistory.forEach((h, i) => {
    const actualCoords = getCoordinates(i, h.revenue, metricsHistory.length);
    const targetCoords = getCoordinates(i, h.target, metricsHistory.length);
    
    if (i === 0) {
      actualPointsStr = `M ${actualCoords.x} ${actualCoords.y}`;
      targetPointsStr = `M ${targetCoords.x} ${targetCoords.y}`;
      actualAreaPointsStr = `M ${actualCoords.x} ${chartHeight - paddingBottom} L ${actualCoords.x} ${actualCoords.y}`;
    } else {
      actualPointsStr += ` L ${actualCoords.x} ${actualCoords.y}`;
      targetPointsStr += ` L ${targetCoords.x} ${targetCoords.y}`;
      actualAreaPointsStr += ` L ${actualCoords.x} ${actualCoords.y}`;
    }
    
    if (i === metricsHistory.length - 1) {
      actualAreaPointsStr += ` L ${actualCoords.x} ${chartHeight - paddingBottom} Z`;
    }
  });

  return (
    <div id="performance-dashboard-tab" className="space-y-6">
      {/* Welcome Banner */}
      <div className={`p-6 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all
        ${darkMode 
          ? "bg-slate-900 border-slate-800 text-white" 
          : "bg-gradient-to-r from-teal-850 to-emerald-900 border-teal-800 text-white"}`}
      >
        <div>
          <h2 className="font-display font-semibold text-2xl tracking-tight">
            Elite Pro Infra Performance Command
          </h2>
          <p className="text-sm opacity-80 mt-1 max-w-xl">
            Real-time infrastructure development client metric, capital pipeline tracking, and advisor close performance parameters.
          </p>
        </div>
        <button
          id="dashboard-new-lead-shortcut"
          onClick={onNavigateToLeads}
          className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-medium text-sm transition-all shadow-md shadow-teal-500/10 flex items-center gap-2 active:scale-95 cursor-pointer"
        >
          <Plus size={16} />
          View & Add Leads
        </button>
      </div>

      {/* Grid of Key CRM metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div id="stat-card-pipeline" className={`p-5 rounded-2xl border transition-all ${darkMode ? "bg-slate-900 border-slate-850" : "bg-white border-slate-100 shadow-sm"}`}>
          <div className="flex justify-between items-start">
            <span className={`text-xs font-mono font-medium uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Active Advisory Pipeline
            </span>
            <div className={`p-2.5 rounded-xl ${darkMode ? "bg-teal-950/40 text-teal-400" : "bg-teal-50 text-teal-600"}`}>
              <IndianRupee size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-teal-500">
              ₹{activePipelineVal.toFixed(1)} Cr
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-emerald-500 font-semibold inline-flex items-center">
              <ArrowUpRight size={12} />
              +14%
            </span>
            <span>vs previous quarter value</span>
          </p>
        </div>

        {/* Stat 2 */}
        <div id="stat-card-revenue" className={`p-5 rounded-2xl border transition-all ${darkMode ? "bg-slate-900 border-slate-850" : "bg-white border-slate-100 shadow-sm"}`}>
          <div className="flex justify-between items-start">
            <span className={`text-xs font-mono font-medium uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Closed Capital Value
            </span>
            <div className={`p-2.5 rounded-xl ${darkMode ? "bg-emerald-950/40 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>
              <CheckCircle size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-emerald-500">
              ₹{wonPipelineVal.toFixed(1)} Cr
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Converted from <span className="text-slate-200 font-medium font-mono">{wonCount}</span> successfully closed projects
          </p>
        </div>

        {/* Stat 3 */}
        <div id="stat-card-leads" className={`p-5 rounded-2xl border transition-all ${darkMode ? "bg-slate-900 border-slate-850" : "bg-white border-slate-100 shadow-sm"}`}>
          <div className="flex justify-between items-start">
            <span className={`text-xs font-mono font-medium uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Lead Conversion Ratio
            </span>
            <div className={`p-2.5 rounded-xl ${darkMode ? "bg-amber-950/40 text-amber-400" : "bg-amber-50 text-amber-600"}`}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className={`text-3xl font-display font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
              {conversionRate}%
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Global target ratio benchmark: <span className="font-mono">20%</span>
          </p>
        </div>

        {/* Stat 4 */}
        <div id="stat-card-total" className={`p-5 rounded-2xl border transition-all ${darkMode ? "bg-slate-900 border-slate-850" : "bg-white border-slate-100 shadow-sm"}`}>
          <div className="flex justify-between items-start">
            <span className={`text-xs font-mono font-medium uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Active Lead Registry
            </span>
            <div className={`p-2.5 rounded-xl ${darkMode ? "bg-purple-950/40 text-purple-400" : "bg-purple-50 text-purple-600"}`}>
              <Users size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className={`text-3xl font-display font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
              {totalLeadsCount}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            <span className="text-teal-400 font-semibold">{leads.filter(l => l.status === 'Interested').length} newly added</span> in this week loop
          </p>
        </div>
      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Sales History Chart */}
        <div className={`p-6 rounded-2xl border lg:col-span-2 transition-all ${darkMode ? "bg-slate-900 border-slate-850" : "bg-white border-slate-100 shadow-sm"}`}>
          <div className="flex justify-between items-start border-b pb-4 mb-4 border-slate-100/10">
            <div>
              <h3 className={`font-display font-semibold text-base ${darkMode ? "text-white" : "text-slate-900"}`}>
                Sales Growth Timeline
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Target valuation thresholds vs closed revenue metrics (in ₹ Crores)
              </p>
            </div>
            
            {/* Guide */}
            <div className="flex items-center gap-4 text-xs font-mono font-light">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-emerald-500"></span>
                <span className={darkMode ? "text-slate-400" : "text-slate-600"}>Closed Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full border border-dashed border-teal-500/70 bg-transparent"></span>
                <span className={darkMode ? "text-slate-400" : "text-slate-600"}>Target Goal</span>
              </div>
            </div>
          </div>

          {/* SVG Custom Canvas */}
          <div className="relative w-full overflow-x-auto">
            <svg 
              className="mx-auto" 
              width={chartWidth} 
              height={chartHeight} 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            >
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
                const yVal = paddingBottom + (chartHeight - paddingTop - paddingBottom) * p;
                const gridY = chartHeight - yVal;
                const labelVal = ((p * maxVal)).toFixed(1);
                return (
                  <g key={i}>
                    <line 
                      x1={paddingLeft} 
                      y1={gridY} 
                      x2={chartWidth - paddingRight} 
                      y2={gridY} 
                      stroke={darkMode ? "rgba(71, 85, 105, 0.15)" : "rgba(226, 232, 240, 0.6)"} 
                      strokeWidth={1}
                    />
                    <text 
                      x={paddingLeft - 10} 
                      y={gridY + 4} 
                      fill={darkMode ? "#64748b" : "#94a3b8"} 
                      fontSize={10} 
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      ₹{labelVal} Cr
                    </text>
                  </g>
                );
              })}

              {/* Area Under Actual Route */}
              <path 
                d={actualAreaPointsStr} 
                fill={darkMode ? "url(#actualAreaGradDark)" : "url(#actualAreaGradLight)"} 
                opacity={0.18}
              />

              {/* Target Line (Dashed) */}
              <path 
                d={targetPointsStr} 
                fill="none" 
                stroke="#0d9488" 
                strokeWidth={1.5} 
                strokeDasharray="4 3" 
                opacity={0.6}
              />

              {/* Actual Conversion Line */}
              <path 
                d={actualPointsStr} 
                fill="none" 
                stroke="#10b981" 
                strokeWidth={2.7} 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />

              {/* Points Nodes & Labels */}
              {metricsHistory.map((h, i) => {
                const actCoords = getCoordinates(i, h.revenue, metricsHistory.length);
                const tarCoords = getCoordinates(i, h.target, metricsHistory.length);
                return (
                  <g key={i}>
                    {/* Hover Target Circle */}
                    <circle 
                      cx={actCoords.x} 
                      cy={actCoords.y} 
                      r={4.5} 
                      fill="#10b981" 
                      stroke={darkMode ? "#0f172a" : "#ffffff"} 
                      strokeWidth={1.5}
                    />
                    
                    {/* Target nodes dot */}
                    <circle 
                      cx={tarCoords.x} 
                      cy={tarCoords.y} 
                      r={3} 
                      fill="#0d9488" 
                      opacity={0.7}
                    />

                    {/* Numeric value callout above node */}
                    <text 
                      x={actCoords.x} 
                      y={actCoords.y - 8} 
                      fill={darkMode ? "#e2e8f0" : "#334155"} 
                      fontSize={9} 
                      fontFamily="monospace" 
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      ₹{h.revenue.toFixed(1)} Cr
                    </text>
                    
                    {/* X axis Months labels */}
                    <text 
                      x={actCoords.x} 
                      y={chartHeight - 8} 
                      fill={darkMode ? "#64748b" : "#475569"} 
                      fontSize={11} 
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {h.month}
                    </text>
                  </g>
                );
              })}

              {/* Gradient Definitions */}
              <defs>
                <linearGradient id="actualAreaGradDark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="actualAreaGradLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Right side dial: Target Conversion Percentage dial */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${darkMode ? "bg-slate-900 border-slate-850" : "bg-white border-slate-100 shadow-sm"}`}>
          <div>
            <h3 className={`font-display font-semibold text-base ${darkMode ? "text-white" : "text-slate-900"}`}>
              Capital Target Index
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Current Closed Volume vs ₹160 Cr Advisory Goal
            </p>
          </div>

          <div className="py-6 flex flex-col items-center">
            {/* SVG Circular Dial */}
            <div className="relative w-36 h-36">
              <svg width="100%" height="100%" viewBox="0 0 100 100" className="transform -rotate-90">
                {/* Background Ring */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke={darkMode ? "#1e293b" : "#f1f5f9"} 
                  strokeWidth="8" 
                  fill="transparent" 
                />
                {/* Colored Ring Dial */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke="#10b981" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={`${2.512 * targetPercentage} 251.2`} 
                  strokeLinecap="round"
                />
              </svg>
              {/* Core Text Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold font-display tracking-tight text-teal-500">
                  {targetPercentage}%
                </span>
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
                  Achieved
                </span>
              </div>
            </div>

            <div className="mt-5 text-center">
              <p className="text-xs font-mono font-medium text-slate-400">
                ₹{currentQuarterRevenue.toFixed(1)} Cr CLOSED / ₹160.0 Cr GOAL
              </p>
              
              {targetPercentage >= 100 ? (
                <span className="inline-block mt-2 text-[10px] uppercase tracking-wider font-semibold text-emerald-500 px-2.5 py-0.5 rounded-full bg-emerald-500/10">
                  Quarter Goal Achieved
                </span>
              ) : (
                <p className="text-xs text-slate-400 mt-1 max-w-[180px] mx-auto text-balance">
                  Secure ₹{Math.max(0, 160.0 - currentQuarterRevenue).toFixed(1)} Cr more closed deals to achieve stakeholder targets.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lower Row: Sales Advisor Leaderboard & Pipeline funnel counts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pipeline conversion funnel blocks */}
        <div className={`p-6 rounded-2xl border transition-all ${darkMode ? "bg-slate-900 border-slate-850" : "bg-white border-slate-100 shadow-sm"}`}>
          <div className="mb-4">
            <h3 className={`font-display font-semibold text-base ${darkMode ? "text-white" : "text-slate-900"}`}>
              Active Pipeline Stage Volumes
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Quantity of elite investment proposals distributed across stages
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            {[
              { label: "New Lead Intake", count: stageCounts.new, barColor: "bg-teal-500", key: "new" },
              { label: "Aligned Contact", count: stageCounts.contacted, barColor: "bg-indigo-500", key: "contacted" },
              { label: "Capital Negotiation", count: stageCounts.negotiating, barColor: "bg-amber-500", key: "negotiating" },
              { label: "Acquired (Deals Won)", count: stageCounts.won, barColor: "bg-emerald-500", key: "won" },
              { label: "Decommissioned (Lost)", count: stageCounts.lost, barColor: "bg-slate-400", key: "lost" },
            ].map((stage, idx) => {
              const fraction = totalLeadsCount > 0 ? (stage.count / totalLeadsCount) : 0;
              return (
                <div key={idx} className="flex items-center justify-between gap-5">
                  <div className="w-40">
                    <span className={`text-sm font-medium ${darkMode ? "text-slate-350" : "text-slate-700"}`}>
                      {stage.label}
                    </span>
                  </div>
                  {/* Bar and count */}
                  <div className="flex-1 flex items-center gap-3">
                    <div className={`flex-1 h-3 rounded-full overflow-hidden ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}>
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${stage.barColor}`}
                        style={{ width: `${fraction * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold w-6 text-right">
                      {stage.count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Elite Team Advisor Leaderboard */}
        <div className={`p-6 rounded-2xl border transition-all ${darkMode ? "bg-slate-900 border-slate-850" : "bg-white border-slate-100 shadow-sm"}`}>
          <div className="mb-4">
            <h3 className={`font-display font-semibold text-base ${darkMode ? "text-white" : "text-slate-900"}`}>
              Advisor Capital Leaderboard
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Top closed deal valuations achieved per representative
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {leaderboard.length > 0 ? (
              leaderboard.map((agent, i) => {
                const totalGoldStandardClosed = 25.0; // Benchmark for full bar sizing
                const ratio = Math.min(100, Math.round((agent.totalClosedVal / totalGoldStandardClosed) * 100));
                return (
                  <div 
                    key={agent.name} 
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3
                      ${darkMode ? "bg-slate-800/40 border-slate-705" : "bg-slate-50 border-slate-100"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-teal-600/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold font-mono text-sm">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">{agent.name}</h4>
                        <p className="text-[10px] text-slate-400">
                          {agent.dealsWon} won of {agent.totalLeads} total leads assigned
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className="text-sm font-bold font-mono text-emerald-500">
                        ₹{agent.totalClosedVal.toFixed(1)} Cr
                      </span>
                      <span className="text-[9px] uppercase tracking-wide font-medium text-slate-400">
                        Closed Val
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-slate-400 text-sm">
                No closed project data available. Assign agents and log deals to see listings.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
