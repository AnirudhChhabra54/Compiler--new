import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function MachineLearning({ onConsoleOutput, dataState, setIsProcessing }) {
  const [selectedModel, setSelectedModel] = useState('');
  const [modelConfig, setModelConfig] = useState({
    target: '',
    features: [],
    trainTestSplit: 0.8,
    hyperparameters: {}
  });
  const [modelMetrics, setModelMetrics] = useState(null);

  const models = [
    {
      id: 'linear-regression',
      name: 'Linear Regression',
      icon: 'fa-chart-line',
      type: 'regression',
      hyperparameters: []
    },
    {
      id: 'logistic-regression',
      name: 'Logistic Regression',
      icon: 'fa-percentage',
      type: 'classification',
      hyperparameters: [
        { key: 'C', type: 'number', label: 'Regularization', default: 1.0 }
      ]
    },
    {
      id: 'decision-tree',
      name: 'Decision Tree',
      icon: 'fa-tree',
      type: 'both',
      hyperparameters: [
        { key: 'max_depth', type: 'number', label: 'Max Depth', default: 5 },
        { key: 'min_samples_split', type: 'number', label: 'Min Samples Split', default: 2 }
      ]
    },
    {
      id: 'random-forest',
      name: 'Random Forest',
      icon: 'fa-trees',
      type: 'both',
      hyperparameters: [
        { key: 'n_estimators', type: 'number', label: 'Number of Trees', default: 100 },
        { key: 'max_depth', type: 'number', label: 'Max Depth', default: 5 }
      ]
    },
    {
      id: 'svm',
      name: 'Support Vector Machine',
      icon: 'fa-vector-square',
      type: 'both',
      hyperparameters: [
        { key: 'kernel', type: 'select', label: 'Kernel', options: ['linear', 'rbf', 'poly'], default: 'rbf' },
        { key: 'C', type: 'number', label: 'Regularization', default: 1.0 }
      ]
    }
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

  const handleTrainModel = async () => {
    if (!dataState.isDataLoaded) {
      toast.warning('Please load data first');
      return;
    }

    if (!modelConfig.target || modelConfig.features.length === 0) {
      toast.warning('Please select target and feature columns');
      return;
    }

    try {
      // Split the data
      await executeCommand(`split_data(${modelConfig.trainTestSplit})`);

      // Train the model
      const features = modelConfig.features.map(f => `"${f}"`).join(', ');
      const command = `train_model([${features}], "${modelConfig.target}")`;
      await executeCommand(command);

      // Evaluate the model
      const evalResult = await executeCommand('evaluate_model()');
      setModelMetrics(evalResult.metrics);

      toast.success('Model trained successfully');
    } catch (error) {
      console.error('Model training failed:', error);
    }
  };

  const handlePredict = async () => {
    try {
      const result = await executeCommand('predict()');
      toast.success('Predictions generated successfully');
    } catch (error) {
      console.error('Prediction failed:', error);
    }
  };

  const handleSaveModel = async () => {
    try {
      await executeCommand('save_model("model.pkl")');
      toast.success('Model saved successfully');
    } catch (error) {
      console.error('Failed to save model:', error);
    }
  };

  const handleLoadModel = async () => {
    try {
      await executeCommand('load_model("model.pkl")');
      toast.success('Model loaded successfully');
    } catch (error) {
      console.error('Failed to load model:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Machine Learning
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={handleSaveModel}
            disabled={!modelMetrics}
            className="btn btn-secondary"
          >
            <i className="fas fa-save mr-2"></i>
            Save Model
          </button>
          <button
            onClick={handleLoadModel}
            className="btn btn-secondary"
          >
            <i className="fas fa-upload mr-2"></i>
            Load Model
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Model Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">
            Select Model
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  setSelectedModel(model.id);
                  setModelConfig(prev => ({
                    ...prev,
                    hyperparameters: Object.fromEntries(
                      model.hyperparameters.map(h => [h.key, h.default])
                    )
                  }));
                }}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  selectedModel === model.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <i className={`fas ${model.icon} text-2xl ${
                    selectedModel === model.id
                      ? 'text-primary-500'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}></i>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                    {model.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Model Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">
            Configuration
          </h3>
          
          {/* Target Column Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Target Column
            </label>
            <select
              value={modelConfig.target}
              onChange={(e) => setModelConfig(prev => ({ ...prev, target: e.target.value }))}
              className="input w-full"
            >
              <option value="">Select target column</option>
              {dataState.columns?.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          {/* Feature Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Feature Columns
            </label>
            <div className="grid grid-cols-2 gap-2">
              {dataState.columns?.filter(col => col !== modelConfig.target).map((col) => (
                <div
                  key={col}
                  onClick={() => {
                    setModelConfig(prev => ({
                      ...prev,
                      features: prev.features.includes(col)
                        ? prev.features.filter(f => f !== col)
                        : [...prev.features, col]
                    }));
                  }}
                  className={`cursor-pointer p-2 rounded text-center transition-colors ${
                    modelConfig.features.includes(col)
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {col}
                </div>
              ))}
            </div>
          </div>

          {/* Train-Test Split */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Train-Test Split ({(modelConfig.trainTestSplit * 100).toFixed(0)}% train)
            </label>
            <input
              type="range"
              min="0.5"
              max="0.9"
              step="0.1"
              value={modelConfig.trainTestSplit}
              onChange={(e) => setModelConfig(prev => ({ 
                ...prev, 
                trainTestSplit: parseFloat(e.target.value)
              }))}
              className="w-full"
            />
          </div>

          {/* Hyperparameters */}
          {selectedModel && models.find(m => m.id === selectedModel).hyperparameters.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Hyperparameters
              </label>
              <div className="space-y-3">
                {models.find(m => m.id === selectedModel).hyperparameters.map(param => (
                  <div key={param.key}>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {param.label}
                    </label>
                    {param.type === 'select' ? (
                      <select
                        value={modelConfig.hyperparameters[param.key] || param.default}
                        onChange={(e) => setModelConfig(prev => ({
                          ...prev,
                          hyperparameters: {
                            ...prev.hyperparameters,
                            [param.key]: e.target.value
                          }
                        }))}
                        className="input w-full"
                      >
                        {param.options.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={param.type}
                        value={modelConfig.hyperparameters[param.key] || param.default}
                        onChange={(e) => setModelConfig(prev => ({
                          ...prev,
                          hyperparameters: {
                            ...prev.hyperparameters,
                            [param.key]: e.target.value
                          }
                        }))}
                        className="input w-full"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Training and Prediction Controls */}
      <div className="flex space-x-4">
        <button
          onClick={handleTrainModel}
          disabled={!selectedModel || !modelConfig.target || modelConfig.features.length === 0}
          className="flex-1 btn btn-primary"
        >
          <i className="fas fa-play mr-2"></i>
          Train Model
        </button>
        <button
          onClick={handlePredict}
          disabled={!modelMetrics}
          className="flex-1 btn btn-secondary"
        >
          <i className="fas fa-brain mr-2"></i>
          Make Predictions
        </button>
      </div>

      {/* Model Performance Metrics */}
      {modelMetrics && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Model Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(modelMetrics).map(([key, value]) => (
              <div key={key} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </div>
                <div className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                  {typeof value === 'number' ? value.toFixed(4) : value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MachineLearning;
