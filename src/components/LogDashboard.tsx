import { useState, useEffect } from 'react';
import { gymLogger, LogEntry } from '../services/logger';
import { Download, Trash2, RefreshCw, Eye, Search } from 'lucide-react';

interface LogDashboardProps {
  onClose: () => void;
}

export default function LogDashboard({ onClose }: LogDashboardProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [filters, setFilters] = useState({
    level: '',
    category: '',
    search: '',
    startDate: '',
    endDate: ''
  });
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 50;

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  const loadLogs = () => {
    const allLogs = gymLogger.getLogs();
    setLogs(allLogs);
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Level filter
    if (filters.level) {
      filtered = filtered.filter(log => log.level === filters.level);
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(log => log.category === filters.category);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchLower) ||
        JSON.stringify(log.details || {}).toLowerCase().includes(searchLower)
      );
    }

    // Date filters
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(log => new Date(log.timestamp) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(log => new Date(log.timestamp) <= endDate);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredLogs(filtered);
    setCurrentPage(1);
  };

  const getUniqueValues = (key: 'level' | 'category') => {
    const values = logs.map(log => log[key]).filter(Boolean);
    return [...new Set(values)].sort();
  };

  const exportLogs = () => {
    gymLogger.exportLogs();
  };

  const clearLogs = () => {
    if (window.confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
      gymLogger.clearLogs();
      loadLogs();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'warn':
        return 'text-yellow-600 bg-yellow-100';
      case 'info':
        return 'text-blue-600 bg-blue-100';
      case 'debug':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'DATABASE': 'text-purple-600 bg-purple-100',
      'USER_INTERACTION': 'text-green-600 bg-green-100',
      'NAVIGATION': 'text-indigo-600 bg-indigo-100',
      'PERFORMANCE': 'text-orange-600 bg-orange-100',
      'ERROR': 'text-red-600 bg-red-100',
      'FEATURE': 'text-teal-600 bg-teal-100'
    };
    return colors[category as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const startIndex = (currentPage - 1) * logsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + logsPerPage);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Log Dashboard</h2>
              <p className="text-gray-600 mt-1">
                Total: {logs.length} logs | Filtered: {filteredLogs.length} logs
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadLogs}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
              <button
                onClick={exportLogs}
                className="flex items-center gap-2 px-4 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
              >
                <Download size={16} />
                Export
              </button>
              <button
                onClick={clearLogs}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
                Clear
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-4">
            <select
              value={filters.level}
              onChange={(e) => setFilters({ ...filters, level: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">All Levels</option>
              {getUniqueValues('level').map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>

            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">All Categories</option>
              {getUniqueValues('category').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search logs..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="border border-gray-300 rounded-lg px-10 py-2 w-full"
              />
            </div>

            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />

            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        {/* Logs Table */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedLogs.map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(log.category)}`}>
                        {log.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-md truncate">
                      {log.message}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {log.duration ? `${log.duration}ms` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => {
                          setSelectedLog(log);
                          setShowDetails(true);
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(startIndex + logsPerPage, filteredLogs.length)} of {filteredLogs.length} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* Log Details Modal */}
        {showDetails && selectedLog && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Log Details</h3>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Timestamp</label>
                    <p className="text-sm text-gray-900">{formatTimestamp(selectedLog.timestamp)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Level</label>
                    <p className="text-sm text-gray-900">{selectedLog.level}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <p className="text-sm text-gray-900">{selectedLog.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Message</label>
                    <p className="text-sm text-gray-900">{selectedLog.message}</p>
                  </div>
                  {selectedLog.duration && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Performance</label>
                      <p className="text-sm text-gray-900">{selectedLog.duration}ms</p>
                    </div>
                  )}
                  {selectedLog.details && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Data</label>
                      <pre className="text-xs bg-gray-100 p-3 rounded mt-1 overflow-auto">
                        {JSON.stringify(selectedLog.details, null, 2)}
                      </pre>
                    </div>
                  )}
                  {selectedLog.metadata && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Metadata</label>
                      <pre className="text-xs bg-gray-100 p-3 rounded mt-1 overflow-auto">
                        {JSON.stringify(selectedLog.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}