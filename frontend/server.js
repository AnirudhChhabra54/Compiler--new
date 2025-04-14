const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const CompilerEngine = require('./compiler_engine');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const compiler = new CompilerEngine();

// API endpoint for command execution
app.post('/api/execute', async (req, res) => {
    try {
        const { command } = req.body;
        
        if (!command) {
            return res.status(400).json({ 
                success: false, 
                error: 'Command is required' 
            });
        }

        // Process the command through the compiler engine
        const result = await compiler.process(command);

        if (result.success) {
            res.json({ 
                success: true, 
                output: result.output 
            });
        } else {
            res.status(400).json({ 
                success: false, 
                error: result.error 
            });
        }
    } catch (error) {
        console.error('Error executing command:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        error: 'Something broke!' 
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
