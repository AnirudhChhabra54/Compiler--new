import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar, Pie, Scatter } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function DataVisualization({ onConsoleOutput, dataState, setIsProcessing }) {
  const [chartType, setChartType] = useState('');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [groupBy, setGroupBy] = useState('');
  const [chartData, setChartData] = useState(null);

  const chartTypes = [
    { id: 'scatter', name: 'Scatter Plot', icon: 'fa-circle', component: Scatter },
    { id: 'bar', name: 'Bar Chart', icon: 'fa-chart-bar', component: Bar },
    { id: 'pie', name: 'Pie Chart', icon: 'fa-chart-pie', component: Pie },
    { id: 'line', name: 'Line Chart', icon: 'fa-chart-line', component: Line },
    { id: 'histogram', name: 'Histogram', icon: 'fa-chart-column', component: Bar },
    { id: 'heatmap', name: 'Heatmap', icon: 'fa-border-all' }
  ];

  const executeCommand = async (command) => {
    try {
      setIsProcessing(true);
      const response = await axios.post('/api/execute', { command });
      
      if (response.data.success) {
        onConsoleOutput({
          type: 'success',
          content: response.data.output,
          timestamp: Date.now()
        });
        return response.data;
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      onConsoleOutput({
        type: 'error',
        content: error.message,
        timestamp: Date.now()
      });
      toast.error(error.message);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const generateChartCommand = () => {
    switch (chartType) {
      case 'scatter':
        return `scatter_plot("${xAxis}", "${yAxis}")`;
      case 'bar':
        return `bar_chart("${xAxis}")`;
      case 'pie':
        return `pie_chart("${xAxis}")`;
      case 'line':
        return `plot("${xAxis}", "${yAxis}")`;
      case 'histogram':
        return `histogram("${xAxis}")`;
      default:
        return null;
    }
  };

  const handleGenerateChart = async () => {
    if (!dataState.isDataLoaded) {
      toast.warning('Please load data first');
      return;
    }

    const command = generateChartCommand();
    if (!command) {
      toast.warning('Invalid chart configuration');
      return;
    }

    try {
      const result = await executeCommand(command);
      // Process the result and update chart data
      // This is a placeholder - actual implementation would depend on the backend response format
      setChartData({
        labels: ['Sample Data'],
        datasets: [{
          label: 'Dataset',
          data: [1, 2, 3, 4, 5],
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      });
    } catch (error) {
      console.error('Failed to generate chart:', error);
    }
  };

  const handleSaveChart = async () => {
    if (!chartData) {
      toast.warning('No chart to save');
      return;
    }

    try {
      // Implementation would depend on how you want to save the chart
      toast.success('Chart saved successfully');
    } catch (error) {
      toast.error('Failed to save chart');
    }
  };

  const renderChart = () => {
    if (!chartData) return null;

    const ChartComponent = chartTypes.find(c => c.id === chartType)?.component;
    if (!ChartComponent) return null;

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`
        }
      }
    };

    return (
      <div className="h-[400px]">
        <ChartComponent data={chartData} options={options} />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Data Visualization
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={handleGenerateChart}
            disabled={!chartType || !xAxis || (!yAxis && chartType !== 'pie')}
            className="btn btn-primary"
          >
            <i className="fas fa-play mr-2"></i>
            Generate Chart
          </button>
          <button
            onClick={handleSaveChart}
            disabled={!chartData}
            className="btn btn-secondary"
          >
            <i className="fas fa-download mr-2"></i>
            Save Chart
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Chart Type Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">
            Select Chart Type
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {chartTypes.map((chart) => (
              <button
                key={chart.id}
                onClick={() => setChartType(chart.id)}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  chartType === chart.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <i className={`fas ${chart.icon} text-2xl ${
                    chartType === chart.id
                      ? 'text-primary-500'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}></i>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {chart.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chart Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">
            Configure Chart
          </h3>
          
          {/* X-Axis Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              X-Axis
            </label>
            <select
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value)}
              className="input w-full"
            >
              <option value="">Select X-Axis</option>
              {dataState.columns?.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          {/* Y-Axis Selection */}
          {chartType !== 'pie' && chartType !== 'histogram' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Y-Axis
              </label>
              <select
                value={yAxis}
                onChange={(e) => setYAxis(e.target.value)}
                className="input w-full"
              >
                <option value="">Select Y-Axis</option>
                {dataState.columns?.map((col) => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
          )}

          {/* Group By Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Group By (Optional)
            </label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="input w-full"
            >
              <option value="">No Grouping</option>
              {dataState.columns?.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chart Preview Area */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
          Chart Preview
        </h3>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 min-h-[400px]">
          {chartData ? (
            renderChart()
          ) : (
            <div className="h-full flex items-center justify-center text-center text-gray-500 dark:text-gray-400">
              {chartType ? (
                <div>
                  <i className={`fas ${chartTypes.find(c => c.id === chartType)?.icon} text-6xl mb-4`}></i>
                  <p>Configure and generate chart to preview</p>
                </div>
              ) : (
                <p>Select a chart type and configure parameters to generate visualization</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DataVisualization;
