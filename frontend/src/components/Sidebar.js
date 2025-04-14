import React, { useState } from 'react';

function Sidebar({ activeModule, setActiveModule }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const moduleGroups = [
    {
      title: 'Data Management',
      modules: [
        { id: 'file-handling', name: 'File Handling', icon: 'fa-file-import', description: 'Load and save data files' },
        { id: 'preprocessing', name: 'Preprocessing', icon: 'fa-filter', description: 'Clean and prepare data' },
      ]
    },
    {
      title: 'Analysis',
      modules: [
        { id: 'analysis', name: 'Data Analysis', icon: 'fa-chart-line', description: 'Statistical analysis tools' },
        { id: 'visualization', name: 'Visualization', icon: 'fa-chart-bar', description: 'Create data visualizations' },
      ]
    },
    {
      title: 'Advanced',
      modules: [
        { id: 'machine-learning', name: 'Machine Learning', icon: 'fa-brain', description: 'Train and evaluate models' },
        { id: 'text-processing', name: 'Text Processing', icon: 'fa-font', description: 'Process text data' },
        { id: 'time-series', name: 'Time Series', icon: 'fa-clock', description: 'Analyze time series data' },
      ]
    },
    {
      title: 'Tools',
      modules: [
        { id: 'utilities', name: 'Utilities', icon: 'fa-tools', description: 'Additional tools and utilities' },
      ]
    }
  ];

  return (
    <aside 
      className={`bg-white dark:bg-gray-800 border-r border-gray-200 
                dark:border-gray-700 transition-all duration-300 ease-in-out
                ${isCollapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Collapse Toggle */}
      <div className="p-4 flex justify-end">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-500 hover:text-gray-600 dark:text-gray-400 
                   dark:hover:text-gray-300 focus:outline-none"
        >
          <i className={`fas fa-${isCollapsed ? 'expand' : 'compress'}-alt`}></i>
        </button>
      </div>

      <nav className="mt-2">
        {moduleGroups.map((group, groupIndex) => (
          <div key={group.title} className={`mb-6 ${isCollapsed ? 'px-2' : 'px-4'}`}>
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 
                           uppercase tracking-wider mb-2">
                {group.title}
              </h3>
            )}
            
            <div className="space-y-1">
              {group.modules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center px-2' : 'px-3'
                  } py-2 text-sm font-medium rounded-lg transition-colors duration-150 
                  group relative ${
                    activeModule === module.id
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-100'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <i className={`fas ${module.icon} ${isCollapsed ? 'text-xl' : 'w-5 h-5 mr-3'}`}></i>
                  {!isCollapsed && <span>{module.name}</span>}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 w-48 px-2 py-1 bg-gray-800 
                                  text-white text-sm rounded-md opacity-0 group-hover:opacity-100 
                                  transition-opacity duration-300 pointer-events-none z-50">
                      <div className="font-medium">{module.name}</div>
                      <div className="text-xs text-gray-300">{module.description}</div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      {!isCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t 
                      border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 
                            flex items-center justify-center">
                <i className="fas fa-user text-primary-600 dark:text-primary-400"></i>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                User Session
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Connected to Server
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
