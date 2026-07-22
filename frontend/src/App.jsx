import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Play, Loader2, Search, Zap, CheckCircle2, ShieldCheck, Layers, Cpu, BrainCircuit, ArrowRightLeft } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('agents'); // 'agents', 'arbitrage', 'backtest'
  
  // Agent Swarm States
  const [marketQuery, setMarketQuery] = useState("Will Federal Reserve cut rates by 25bps next month?");
  const [marketOdds, setMarketOdds] = useState(0.46);
  const [agentResult, setAgentResult] = useState(null);
  const [loadingAgent, setLoadingAgent] = useState(false);

  // Arbitrage States
  const [arbData, setArbData] = useState(null);
  const [loadingArb, setLoadingArb] = useState(false);
  const [executingArb, setExecutingArb] = useState(false);
  const [arbStatus, setArbStatus] = useState(null);

  // Backtest States
  const [ticker, setTicker] = useState('AAPL');
  const [query, setQuery] = useState('AAPL');
  const [suggestions, setSuggestions] = useState([]);
  const [backtestData, setBacktestData] = useState(null);
  const [loadingBacktest, setLoadingBacktest] = useState(false);
  const [tradingStatus, setTradingStatus] = useState(null);
  const [executingTrade, setExecutingTrade] = useState(false);

  useEffect(() => {
    runAgentSwarm();
    fetchArbScanner();
    runBacktest('AAPL');
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length > 1 && query !== ticker) {
        try {
          const res = await axios.get(`http://127.0.0.1:8000/search?query=${query}`);
          setSuggestions(res.data);
        } catch (e) {
          console.error(e);
        }
      } else {
        setSuggestions([]);
      }
    };
    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [query, ticker]);

  const runAgentSwarm = async () => {
    setLoadingAgent(true);
    try {
      const res = await axios.get(`http://127.0.0.1:8000/agent/analyze?market=${encodeURIComponent(marketQuery)}&odds=${marketOdds}`);
      setAgentResult(res.data.agent_decision);
    } catch (e) {
      alert("Failed to reach LLM Agent backend.");
    }
    setLoadingAgent(false);
  };

  const fetchArbScanner = async () => {
    setLoadingArb(true);
    try {
      const res = await axios.get('http://127.0.0.1:8000/arbitrage/live-scan');
      setArbData(res.data.live_arbitrage);
    } catch (e) {
      console.error("Failed to fetch arbitrage scanner data");
    }
    setLoadingArb(false);
  };

  const triggerArbitrageExecution = async () => {
    if (!arbData) return;
    setExecutingArb(true);
    try {
      const res = await axios.post(`http://127.0.0.1:8000/arbitrage/execute-arb?poly_price=${arbData.poly_price}&probo_price=${arbData.probo_price}`);
      setArbStatus(res.data.message);
    } catch (e) {
      setArbStatus("Execution failed.");
    }
    setExecutingArb(false);
  };

  const runBacktest = async (targetTicker = ticker) => {
    setLoadingBacktest(true);
    setTradingStatus(null);
    try {
      const res = await axios.get(`http://127.0.0.1:8000/backtest?ticker=${targetTicker}`);
      setBacktestData(res.data);
      setSuggestions([]);
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to fetch backtest. Verify backend connection.");
    }
    setLoadingBacktest(false);
  };

  const executeLiveTrade = async (action, targetTicker = ticker) => {
    setExecutingTrade(true);
    try {
      const res = await axios.post(`http://127.0.0.1:8000/trade/execute?ticker=${targetTicker}&action=${action}`);
      setTradingStatus(res.data.message);
    } catch (e) {
      setTradingStatus("Failed to execute paper trade.");
    }
    setExecutingTrade(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Main Terminal Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800/80 pb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/20 p-2.5 rounded-2xl border border-blue-500/30 shadow-lg">
              <Activity className="text-blue-400 w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                The FinTech Anchor 
                <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full uppercase tracking-widest font-mono">v7.0 Pro</span>
              </h1>
              <p className="text-slate-400 text-xs md:text-sm mt-0.5">Autonomous Agentic Reasoning, Prediction Market Arbitrage & Multi-Model Quant Suite</p>
            </div>
          </div>

          {/* Navigation Tab Switcher */}
          <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-xl">
            <button 
              onClick={() => setActiveTab('agents')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'agents' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <BrainCircuit className="w-4 h-4" /> AI Agent Swarm
            </button>
            <button 
              onClick={() => { setActiveTab('arbitrage'); fetchArbScanner(); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'arbitrage' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <Layers className="w-4 h-4" /> Polymarket x Probo Arb
            </button>
            <button 
              onClick={() => setActiveTab('backtest')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'backtest' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <Cpu className="w-4 h-4" /> Quant Backtester
            </button>
          </div>
        </div>

        {/* TAB 1: AI AGENT SWARM DECK */}
        {activeTab === 'agents' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Agent Task Config */}
              <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800/80 shadow-2xl space-y-4 backdrop-blur">
                <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <BrainCircuit className="text-purple-400 w-5 h-5" /> Configure Agent Swarm Task
                </h2>
                <p className="text-slate-400 text-xs">Set up a binary market prediction thesis for multi-model LLM reasoning consensus.</p>
                
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Market Question / Thesis</label>
                    <textarea 
                      rows={3}
                      value={marketQuery}
                      onChange={(e) => setMarketQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 font-sans resize-none shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Market Implied Odds (0.01 - 0.99)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0.01" 
                      max="0.99"
                      value={marketOdds}
                      onChange={(e) => setMarketOdds(parseFloat(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-purple-500 shadow-inner"
                    />
                  </div>

                  <button 
                    onClick={runAgentSwarm}
                    disabled={loadingAgent}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 px-5 rounded-2xl text-xs transition-all shadow-lg shadow-purple-900/30 cursor-pointer flex items-center justify-center gap-2 mt-4"
                  >
                    {loadingAgent ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                    <span>Dispatch LLM Swarm Debate</span>
                  </button>
                </div>
              </div>

              {/* Swarm Consensus Output Display */}
              <div className="lg:col-span-2 bg-slate-900/90 p-6 md:p-8 rounded-3xl border border-slate-800/80 shadow-2xl space-y-6 backdrop-blur">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
                  <Cpu className="text-indigo-400 w-5 h-5" /> Multi-Model Bayesian Consensus & Action Plan
                </h3>

                {loadingAgent ? (
                  <div className="py-24 text-center space-y-3">
                    <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto" />
                    <p className="text-slate-400 text-xs font-mono">LLM nodes (GPT-4o, Claude 3.5, Qwen) evaluating thesis vectors...</p>
                  </div>
                ) : agentResult ? (
                  <div className="space-y-6 animate-fadeIn">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 text-center shadow-inner">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Agent Probability</span>
                        <span className="text-xl font-black text-purple-400 mt-1 block font-mono">
                          {(agentResult.agent_consensus_probability * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 text-center shadow-inner">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Statistical Edge</span>
                        <span className={`text-xl font-black mt-1 block font-mono ${agentResult.calculated_edge_percent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {agentResult.calculated_edge_percent > 0 ? `+${agentResult.calculated_edge_percent}%` : `${agentResult.calculated_edge_percent}%`}
                        </span>
                      </div>
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 text-center shadow-inner">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Kelly Position Size</span>
                        <span className="text-xs font-black text-indigo-400 mt-2 block font-mono">
                          {agentResult.suggested_kelly_position_size}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 flex justify-between items-center shadow-inner">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Evaluated Asset / Market</span>
                        <span className="text-white font-bold text-xs font-mono mt-0.5 block">{agentResult.market}</span>
                      </div>
                      <span className={`px-4 py-2 rounded-xl text-xs font-extrabold font-mono tracking-wider ${agentResult.recommendation.includes('BUY') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                        {agentResult.recommendation}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Node Debate Logs</h4>
                      <div className="space-y-2">
                        {Object.entries(agentResult.swarm_debate_logs).map(([modelName, data], idx) => (
                          <div key={idx} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 shadow-inner">
                            <div>
                              <span className="text-purple-400 font-mono font-bold text-xs">{modelName}</span>
                              <p className="text-slate-300 text-xs mt-0.5">{data.reason}</p>
                            </div>
                            <span className="text-slate-400 font-mono text-xs bg-slate-900 px-3 py-1 rounded-xl border border-slate-800 shrink-0">
                              Est: {(data.prob * 100).toFixed(0)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                ) : null}
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: POLYMARKET X PROBO ARBITRAGE TERMINAL */}
        {activeTab === 'arbitrage' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 bg-slate-900/90 p-6 md:p-8 rounded-3xl border border-slate-800/80 shadow-2xl space-y-6 backdrop-blur">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="text-indigo-400 w-5 h-5" /> Cross-Platform Order Book Spread Monitor
                    </h2>
                    <p className="text-slate-400 text-xs mt-0.5">Evaluating Polymarket CLOB and Probo OMS real-time order depth.</p>
                  </div>
                  <button 
                    onClick={fetchArbScanner}
                    disabled={loadingArb}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer border border-slate-700"
                  >
                    {loadingArb ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5 text-indigo-400" />}
                    <span>Refresh Feed</span>
                  </button>
                </div>

                {arbData ? (
                  <div className="space-y-6">
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-3 shadow-inner">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-xs uppercase font-bold">Contract Market</span>
                        <span className="text-white font-bold text-xs font-mono">{arbData.market_name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-xs uppercase font-bold">Polymarket Ask Price</span>
                        <span className="text-blue-400 font-bold text-sm font-mono">${arbData.poly_price} USD</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-xs uppercase font-bold">Probo Ask Price</span>
                        <span className="text-purple-400 font-bold text-sm font-mono">₹{arbData.probo_price} INR</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-800 pt-3">
                        <span className="text-slate-300 text-xs uppercase font-bold">Effective Combined Cost</span>
                        <span className={`text-base font-black font-mono ${arbData.arbitrage_found ? 'text-emerald-400' : 'text-rose-400'}`}>
                          ${arbData.combined_cost} / $1.00
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 text-center shadow-inner">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Arbitrage Opportunity</span>
                        <span className={`text-lg font-black mt-1 block ${arbData.arbitrage_found ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {arbData.arbitrage_found ? 'ARB DETECTED' : 'SPREAD EQUALIZED'}
                        </span>
                      </div>
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 text-center shadow-inner">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Spread Edge</span>
                        <span className="text-lg font-black text-indigo-400 mt-1 block font-mono">
                          +{arbData.edge_percent}%
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="bg-linear-to-br from-slate-900 to-indigo-950 p-6 md:p-8 rounded-3xl border border-indigo-900/50 shadow-2xl flex flex-col justify-between space-y-6 backdrop-blur">
                <div>
                  <h3 className="text-indigo-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4 fill-current" /> Dual-Leg Smart Router
                  </h3>
                  <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                    Synchronously executes cross-platform orders matching capital-balanced sizing parameters across Polymarket & Probo.
                  </p>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={triggerArbitrageExecution}
                    disabled={executingArb || !arbData?.arbitrage_found}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-6 rounded-2xl text-xs transition-all shadow-lg shadow-emerald-900/40 cursor-pointer disabled:opacity-40"
                  >
                    {executingArb ? 'Routing Dual Legs...' : 'Execute Arbitrage Trade'}
                  </button>

                  {arbStatus && (
                    <div className="text-xs text-emerald-300 font-mono flex items-center gap-2 bg-slate-950 p-3.5 rounded-xl border border-emerald-900/60 shadow-inner">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{arbStatus}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: QUANT BACKTESTER */}
        {activeTab === 'backtest' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur">
              <div className="relative flex-1 min-w-70">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Target Asset Ticker</label>
                <div className="flex items-center bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-2 focus-within:border-blue-500 shadow-inner">
                  <Search className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="e.g. AAPL, TSLA, BTC-USD, RELIANCE.NS"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setTicker(e.target.value.toUpperCase());
                    }}
                    className="bg-transparent text-white font-mono font-bold focus:outline-none uppercase w-full text-sm"
                  />
                </div>

                {suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    {suggestions.map((item, idx) => (
                      <div 
                        key={idx}
                        onClick={() => {
                          setTicker(item.symbol);
                          setQuery(item.symbol);
                          setSuggestions([]);
                          runBacktest(item.symbol);
                        }}
                        className="px-4 py-3 hover:bg-slate-800 cursor-pointer flex justify-between items-center text-xs border-b border-slate-800/50 last:border-none transition-colors"
                      >
                        <span className="font-bold text-white font-mono">{item.symbol}</span>
                        <span className="text-slate-400 truncate max-w-50">{item.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 self-end">
                <button 
                  onClick={() => runBacktest(ticker)}
                  disabled={loadingBacktest}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-2xl transition-all flex items-center gap-2.5 disabled:opacity-50 shadow-lg shadow-blue-900/30 cursor-pointer text-xs"
                >
                  {loadingBacktest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>Run Multi-Model Simulation</span>
                </button>
              </div>
            </div>

            {loadingBacktest && (
              <div className="flex flex-col items-center justify-center h-72 bg-slate-900/40 rounded-3xl border border-slate-800/80 animate-pulse">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-300 font-medium text-sm">Crunching vectorized indicators & multi-strategy paths...</p>
              </div>
            )}

            {backtestData && !loadingBacktest && (
              <div className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800/80 shadow-xl backdrop-blur relative overflow-hidden">
                    <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Buy & Hold Market</h3>
                    <p className={`text-3xl font-black mt-2 font-mono ${backtestData.returns.Market >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {backtestData.returns.Market}%
                    </p>
                    <p className="text-slate-500 text-[11px] mt-1.5">5-Year Benchmark Return</p>
                  </div>

                  <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800/80 shadow-xl backdrop-blur relative overflow-hidden">
                    <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">MA Crossover (20/50)</h3>
                    <p className={`text-3xl font-black mt-2 font-mono ${backtestData.returns.MA_Crossover >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
                      {backtestData.returns.MA_Crossover}%
                    </p>
                    <p className="text-slate-500 text-[11px] mt-1.5">Sharpe Ratio: <span className="text-slate-300 font-semibold">{backtestData.sharpe_ratio}</span></p>
                  </div>

                  <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800/80 shadow-xl backdrop-blur relative overflow-hidden">
                    <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">RSI Mean Reversion</h3>
                    <p className={`text-3xl font-black mt-2 font-mono ${backtestData.returns.RSI_Strategy >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
                      {backtestData.returns.RSI_Strategy}%
                    </p>
                    <p className="text-slate-500 text-[11px] mt-1.5">Max Drawdown: <span className="text-rose-400 font-semibold">{backtestData.max_drawdown}%</span></p>
                  </div>

                  <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800/80 shadow-xl backdrop-blur relative overflow-hidden">
                    <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Linear Regression Trend</h3>
                    <p className={`text-3xl font-black mt-2 font-mono ${backtestData.returns.Linear_Regression >= 0 ? 'text-purple-400' : 'text-rose-400'}`}>
                      {backtestData.returns.Linear_Regression}%
                    </p>
                    <p className="text-slate-500 text-[11px] mt-1.5">Active Trend Following Model</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <h3 className="text-white font-bold text-sm tracking-wide">Alpaca Live Paper Sandbox Execution</h3>
                    </div>
                    <p className="text-slate-400 text-xs">Instantly send live automated orders for <span className="text-blue-400 font-mono font-bold">{backtestData.ticker}</span> using virtual risk-free capital.</p>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full lg:w-auto">
                    <button 
                      onClick={() => executeLiveTrade('buy')}
                      disabled={executingTrade}
                      className="flex-1 lg:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-2xl text-xs transition-all shadow-lg shadow-emerald-900/30 cursor-pointer disabled:opacity-50"
                    >
                      {executingTrade ? 'Processing...' : `Paper Buy (${backtestData.ticker})`}
                    </button>
                    <button 
                      onClick={() => executeLiveTrade('sell')}
                      disabled={executingTrade}
                      className="flex-1 lg:flex-none bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-6 rounded-2xl text-xs transition-all shadow-lg shadow-rose-900/30 cursor-pointer disabled:opacity-50"
                    >
                      {executingTrade ? 'Processing...' : `Paper Sell (${backtestData.ticker})`}
                    </button>
                  </div>
                </div>

                {tradingStatus && (
                  <div className="text-xs text-emerald-300 font-mono flex items-center gap-2 bg-slate-900 p-4 rounded-2xl border border-emerald-900/60 shadow-lg">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>{tradingStatus}</span>
                  </div>
                )}

                <div className="bg-slate-900/90 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-2xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                    <h3 className="text-slate-200 font-bold text-sm flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-500 shadow-md shadow-blue-500/50"></span>
                      Multi-Model Portfolio Growth Simulation ($100 Capital Base)
                    </h3>
                    <span className="text-xs font-mono bg-slate-950 px-3.5 py-1.5 rounded-xl text-blue-400 border border-slate-800 shadow-inner">
                      Asset: {backtestData.ticker} ({backtestData.data_points} Candles)
                    </span>
                  </div>
                  
                  <div className="h-[460px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={backtestData.chart_data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="Date" stroke="#64748b" tick={{fontSize: 11}} minTickGap={60} />
                        <YAxis stroke="#64748b" tickFormatter={(val) => `$${Math.round(val)}`} tick={{fontSize: 11}} domain={['auto', 'auto']} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', color: '#f8fafc', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.7)' }} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Line type="monotone" dataKey="Market" stroke="#10b981" strokeWidth={2} dot={false} name="Market Benchmark" />
                        <Line type="monotone" dataKey="MA Crossover" stroke="#3b82f6" strokeWidth={2.5} dot={false} name="MA Crossover (20/50)" />
                        <Line type="monotone" dataKey="RSI Reversion" stroke="#8b5cf6" strokeWidth={2} dot={false} name="RSI Mean Reversion" />
                        <Line type="monotone" dataKey="Linear Regression" stroke="#ec4899" strokeWidth={2} dot={false} name="Linear Regression" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default App;