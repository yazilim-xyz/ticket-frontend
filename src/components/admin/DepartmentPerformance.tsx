import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DepartmentStats } from '../../types';

interface DepartmentPerformanceProps {
  isDarkMode?: boolean;
  departments?: DepartmentStats[];
  loading?: boolean;
}

const DepartmentPerformance: React.FC<DepartmentPerformanceProps> = ({
  isDarkMode = false,
  departments = [],
  loading = false,
}) => {
  const navigate = useNavigate();
  // Calculate completion percentage
  const getCompletionRate = (resolved: number, total: number) => {
    return total > 0 ? Math.round((resolved / total) * 100) : 0;
  };

  // Navigate to Performance page
  const handleDetailsClick = () => {
    navigate('/performance');
  };

  // Loading state
  if (loading) {
    return (
      <div className={`
        rounded-lg border h-[400px] flex items-center justify-center
        ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-zinc-200'}
      `}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-2"></div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      rounded-lg border
      ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-zinc-200'}
    `}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-zinc-200'} flex items-center justify-between`}>
        <div>
          <h3 className={`text-lg font-semibold font-['Inter'] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Department Performance
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Overview of all departments
          </p>
        </div>

        {/* Details Button with Navigation */}
        <button 
          onClick={handleDetailsClick}
          className={`text-sm font-medium ${
            isDarkMode 
              ? 'text-cyan-400 hover:text-cyan-300' 
              : 'text-cyan-600 hover:text-cyan-700'
            }`}
        >
          Details
        </button>
      </div>

      {/* Departments List */}
      <div className="p-6 space-y-6">
        {departments.length === 0 ? (
          <div className="text-center py-8">
            <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              No department data available
            </p>
          </div>
        ) : (
          departments.map((dept) => {
            const completionRate = getCompletionRate(dept.resolvedTickets, dept.totalTickets);
            
            return (
              <div key={dept.id} className="space-y-3">
                {/* Department Name & Stats */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {dept.name}
                    </h4>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {dept.totalTickets} total tickets • Avg: {dept.avgResolutionTime}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {completionRate}%
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Completion
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className="h-full bg-gradient-to-r from-cyan-300 to-sky-400 transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>

                {/* Ticket Breakdown */}
                <div className="grid grid-cols-4 gap-4">
                  <div className={`text-center p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-sm font-bold text-emerald-500`}>
                      {dept.resolvedTickets}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Resolved
                    </p>
                  </div>
                  <div className={`text-center p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-sm font-bold text-violet-600`}>
                      {dept.pendingTickets}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Pending
                    </p>
                  </div>
                  <div className={`text-center p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-sm font-bold text-rose-600`}>
                      {dept.overdueTickets}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Overdue
                    </p>
                  </div>
                  <div className={`text-center p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {dept.totalTickets}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Total
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DepartmentPerformance;