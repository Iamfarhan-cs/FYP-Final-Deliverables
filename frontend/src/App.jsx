import { useState, useCallback, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import AlgorithmSelector from './components/AlgorithmSelector';
import MetricsDisplay from './components/MetricsDisplay';
import ComparisonTable from './components/ComparisonTable';
import LiveExecutionTable from './components/LiveExecutionTable';
import ExportButton from './components/ExportButton';
import Icon from './components/Icon';
import Toast from './components/Toast';
import { runExperiment, getMetrics, resetSystem } from './api';
import WorkerStats from './components/WorkerStats';
import DatasetInsights from './components/DatasetInsights';
import ArchitectureInfo from './components/ArchitectureInfo';
import LogsPanel from './components/LogsPanel';

const STORAGE_KEY = 'scheduler_state';

function loadState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveState(state) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export default function App() {
  const saved = loadState();
  const [taskCount, setTaskCount] = useState(saved?.taskCount ?? 0);
  const [algorithm, setAlgorithm] = useState(saved?.algorithm ?? 'FCFS');
  const [quantum, setQuantum] = useState(saved?.quantum ?? 2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [latestId, setLatestId] = useState(saved?.latestId ?? null);
  const [metrics, setMetrics] = useState(saved?.metrics ?? null);
  const [results, setResults] = useState(saved?.results ?? []);
  const [insights, setInsights] = useState(saved?.insights ?? null);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resetMsg, setResetMsg] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'error' });

  const showToast = (message, type = 'error') => setToast({ message, type });
  const clearToast = () => setToast({ message: '', type: 'error' });

  useEffect(() => {
    saveState({ taskCount, algorithm, quantum, latestId, metrics, results, insights });
  }, [taskCount, algorithm, latestId, metrics, results]);

  const handleRun = useCallback(async () => {
    if (taskCount === 0) {
      showToast('Please upload a dataset before running an experiment.', 'error');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { experiment_id } = await runExperiment(algorithm, quantum);
      setLatestId(experiment_id);

      const m = await getMetrics(experiment_id);
      setMetrics(m);

      setResults((prev) => [
        ...prev,
        { experiment_id, algorithm, ...m },
      ]);
      showToast('Experiment completed successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [taskCount, algorithm, quantum]);

  const clearResults = () => {
    setResults([]);
    setMetrics(null);
    setLatestId(null);
  };

  const handleRefresh = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setTaskCount(0);
    setAlgorithm('FCFS');
    setQuantum(2);
    setInsights(null);
    setLatestId(null);
    setMetrics(null);
    setResults([]);
    setError('');
    setResetMsg('');
  };

  const handleReset = async () => {
    if (!window.confirm('Reset the entire system? This will delete all tasks, experiments, and results.')) return;
    try {
      await resetSystem();
      handleRefresh();
      showToast('System reset successfully.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleNav = (id) => {
    setActiveNav(id);
    setSidebarOpen(false);
    requestAnimationFrame(() => {
      const el = document.getElementById(`section-${id}`);
      const wrapper = document.querySelector('.main-wrapper');
      if (el && wrapper) {
        const topbar = document.querySelector('.topbar');
        const offset = topbar ? topbar.offsetHeight + 16 : 64;
        const elRect = el.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();
        const y = elRect.top - wrapperRect.top + wrapper.scrollTop - offset;
        wrapper.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  };

  const navItems = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { id: 'upload', icon: 'upload', label: 'Upload Dataset' },
    { id: 'experiments', icon: 'experiment', label: 'Experiments' },
    { id: 'comparison', icon: 'comparison', label: 'Comparison' },
    { id: 'export', icon: 'export', label: 'Export Results' },
  ];

  return (
    <div className="layout">
      {/* ── Toast Notification ── */}
      <Toast message={toast.message} type={toast.type} onClose={clearToast} />

      {/* ── Mobile Overlay ── */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo"><Icon name="scheduler" size={22} /></div>
          <div>
            <div className="sidebar-title">Task Scheduler</div>
            <div className="sidebar-subtitle">Cloud Simulation Platform</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-link ${activeNav === item.id ? 'sidebar-link-active' : ''}`}
              onClick={() => handleNav(item.id)}
            >
              <span className="sidebar-link-icon"><Icon name={item.icon} size={18} /></span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">FA</div>
            <div>
              <div className="sidebar-user-name">Farhan Anjum</div>
              <div className="sidebar-user-role">Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="main-wrapper">
        {/* ── Top Bar ── */}
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Icon name="menu" size={20} />
            </button>
            <h1 className="page-title">Scheduling Dashboard</h1>
            <span className="page-breadcrumb">Home / Dashboard</span>
          </div>
          <div className="topbar-right">
            <button
              className="btn btn-outline"
              onClick={handleReset}
              title="Reset System"
              style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem', color: 'var(--error)', borderColor: 'var(--error)' }}
            >
              Reset System
            </button>
            <button className="btn-icon" onClick={handleRefresh} title="Reset Dashboard">
              <Icon name="refresh" size={18} />
            </button>
            {taskCount > 0 && (
              <div className="status-pill status-pill-success">
                <span className="status-dot" />
                {taskCount} tasks loaded
              </div>
            )}
            {latestId && (
              <div className="status-pill status-pill-info">
                Experiment #{latestId}
              </div>
            )}
          </div>
        </header>

        {/* ── Content ── */}
        <main className="content">
          {/* Info Cards Row */}
          <div id="section-dashboard" className="info-strip">
            <div className="info-card">
              <div className="info-card-label">Dataset Status</div>
              <div className={`info-card-value ${taskCount > 0 ? 'text-success' : 'text-muted'}`}>
                {taskCount > 0 ? 'Loaded' : 'Not Loaded'}
              </div>
            </div>
            <div className="info-card">
              <div className="info-card-label">Tasks Count</div>
              <div className="info-card-value text-primary">{taskCount || '—'}</div>
            </div>
            <div className="info-card">
              <div className="info-card-label">Experiments Run</div>
              <div className="info-card-value text-purple">{results.length}</div>
            </div>
            <div className="info-card">
              <div className="info-card-label">Selected Algorithm</div>
              <div className="info-card-value text-orange">{algorithm}</div>
            </div>
          </div>

          {/* Upload + Experiment Panel */}
          <div id="section-upload" className="panel-grid">
            <FileUpload onUploaded={setTaskCount} onInsights={setInsights} onError={(msg) => showToast(msg, 'error')} />

            <div id="section-experiments" className="panel">
              <div className="panel-header">
                <h2>Run Experiment</h2>
                {results.length > 0 && (
                  <button className="btn-text" onClick={clearResults}>Clear All</button>
                )}
              </div>
              <div className="panel-body">
                <AlgorithmSelector selected={algorithm} onChange={setAlgorithm} quantum={quantum} onQuantumChange={setQuantum} />
                <div className="panel-actions">
                  <button
                    className={`btn btn-primary ${loading ? 'btn-loading' : ''}`}
                    onClick={handleRun}
                    disabled={loading || taskCount === 0}
                  >
                    {loading ? (
                      <><span className="spinner" /> Running...</>
                    ) : (
                      'Run Experiment'
                    )}
                  </button>
                  <ExportButton experimentId={latestId} />
                </div>
                {error && (
                  <div className="alert alert-error">
                    <span>✕</span> {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dataset Insights */}
          {insights && <DatasetInsights insights={insights} />}

          {/* Metrics */}
          <div id="section-export">
            <MetricsDisplay metrics={metrics} algorithm={algorithm} />
          </div>

          {/* Live Execution */}
          <LiveExecutionTable />

          {/* Execution Logs */}
          <LogsPanel />

          {/* Worker Stats */}
          <WorkerStats />

          {/* Architecture */}
          <ArchitectureInfo />

          {/* Comparison Table */}
          <div id="section-comparison">
            <ComparisonTable results={results} />
          </div>
        </main>
      </div>
    </div>
  );
}
