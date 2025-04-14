import React, { useState, useRef, useEffect } from 'react';

const LiveConsole = () => {
  const [history, setHistory] = useState([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const consoleEndRef = useRef(null);
  
  // Available commands mapping to main.cpp functions
  const commands = {
    'load_csv': 'Load CSV file',
    'describe': 'Show dataset description',
    'mean': 'Calculate mean of a column',
    'median': 'Calculate median of a column',
    'plot': 'Create a plot',
    'scatter_plot': 'Create a scatter plot',
    'bar_chart': 'Create a bar chart',
    'histogram': 'Create a histogram',
    'train_model': 'Train a machine learning model',
    'predict': 'Make predictions',
    'help': 'Show available commands'
  };

  const scrollToBottom = () => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleCommand = async (e) => {
    e.preventDefault();
    
    if (!currentCommand.trim()) return;

    // Add command to history
    const newEntry = { type: 'command', content: currentCommand };
    setHistory(prev => [...prev, newEntry]);

    // Process command
    const args = currentCommand.split(' ');
    const cmd = args[0].toLowerCase();

    if (cmd === 'help') {
      const helpText = Object.entries(commands)
        .map(([cmd, desc]) => `${cmd}: ${desc}`)
        .join('\n');
      setHistory(prev => [...prev, { type: 'response', content: helpText }]);
    } else if (cmd === 'clear') {
      setHistory([]);
    } else {
      try {
        // Send command to backend
        const response = await fetch('/api/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ command: currentCommand }),
        });

        const result = await response.json();
        setHistory(prev => [...prev, { type: 'response', content: result.output }]);
      } catch (error) {
        setHistory(prev => [...prev, { 
          type: 'error', 
          content: `Error executing command: ${error.message}` 
        }]);
      }
    }

    setCurrentCommand('');
  };

  return (
    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg h-96 flex flex-col">
      <div className="flex-1 overflow-y-auto mb-4 font-mono">
        {history.map((entry, index) => (
          <div key={index} className={`mb-2 ${
            entry.type === 'command' ? 'text-green-400' : 
            entry.type === 'error' ? 'text-red-400' : 'text-gray-300'
          }`}>
            {entry.type === 'command' ? '> ' : ''}{entry.content}
          </div>
        ))}
        <div ref={consoleEndRef} />
      </div>
      <form onSubmit={handleCommand} className="flex">
        <span className="text-green-400 mr-2">{'>'}</span>
        <input
          type="text"
          value={currentCommand}
          onChange={(e) => setCurrentCommand(e.target.value)}
          className="flex-1 bg-transparent outline-none"
          placeholder="Type a command (or 'help' for available commands)"
        />
      </form>
    </div>
  );
};

export default LiveConsole;
