const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const cppTemplates = require('./templates/cpp_templates');

class CompilerEngine {
    constructor() {
        this.outputDir = path.join(__dirname, 'output');
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir);
        }
        this.functionMap = {
            // Data Loading/Saving
            load_csv: this.generateLoadCsvCall.bind(this),
            print: this.generatePrintCall.bind(this),
            
            // Basic Data Operations
            remove_nulls: this.generateRemoveNullsCall.bind(this),
            describe_data: this.generateDescribeDataCall.bind(this),
            fill_nulls: this.generateFillNullsCall.bind(this),
            rename_column: this.generateRenameColumnCall.bind(this),
            add_column: this.generateAddColumnCall.bind(this),
            drop_column: this.generateDropColumnCall.bind(this),
            filter_rows: this.generateFilterRowsCall.bind(this),
            sort_data: this.generateSortDataCall.bind(this),
            
            // Statistical Functions
            mean: this.generateMeanCall.bind(this),
            correlation: this.generateCorrelationCall.bind(this),
            standard_deviation: this.generateStandardDeviationCall.bind(this),
            median: this.generateMedianCall.bind(this),
            variance: this.generateVarianceCall.bind(this),
            
            // Visualization Functions
            plot: this.generatePlotCall.bind(this),
            scatter_plot: this.generateScatterPlotCall.bind(this),
            bar_chart: this.generateBarChartCall.bind(this),
            pie_chart: this.generatePieChartCall.bind(this),
            histogram: this.generateHistogramCall.bind(this),
            
            // Machine Learning Functions
            train_model: this.generateTrainModelCall.bind(this),
            predict: this.generatePredictCall.bind(this),
            save_model: this.generateSaveModelCall.bind(this),
            evaluate_model: this.generateEvaluateModelCall.bind(this),
            split_data: this.generateSplitDataCall.bind(this),
            
            // Data Preprocessing Functions
            normalize: this.generateNormalizeCall.bind(this),
            standardize: this.generateStandardizeCall.bind(this),
            scale_data: this.generateScaleDataCall.bind(this),
            
            // Text Processing Functions
            remove_stopwords: this.generateRemoveStopwordsCall.bind(this),
            stem_text: this.generateStemTextCall.bind(this),
            capitalize_words: this.generateCapitalizeWordsCall.bind(this),
            count_words: this.generateCountWordsCall.bind(this),
            
            // Time Series Functions
            rolling_mean: this.generateRollingMeanCall.bind(this),
            resample_data: this.generateResampleDataCall.bind(this),
            detect_trends: this.generateDetectTrendsCall.bind(this),
            seasonal_decompose: this.generateSeasonalDecomposeCall.bind(this),
            detect_anomalies: this.generateDetectAnomaliesCall.bind(this),
            
            // Analysis Functions
            get_shape: this.generateGetShapeCall.bind(this),
            data_quality_report: this.generateDataQualityReportCall.bind(this),
            get_column_profile: this.generateGetColumnProfileCall.bind(this),
            categorize_column: this.generateCategorizeColumnCall.bind(this),
            describe: this.generateDescribeCall.bind(this)
        };
    }

    parseLine(line) {
        console.log(`Parsing line: ${line}`); // Debugging log
        const match = line.match(/^(\w+)\((.*)\);?$/);
        if (!match) {
            throw new Error(`Invalid syntax: ${line}`);
        }

        const functionName = match[1];
        const args = match[2]
            .split(',')
            .map(arg => arg.trim().replace(/^"|"$/g, '')); // Remove quotes from arguments

        console.log(`Function name: ${functionName}, Arguments: ${args}`); // Debugging log

        if (!this.functionMap[functionName]) {
            throw new Error(`Unknown function: ${functionName}`);
        }

        return { functionName, args };
    }

    generateFunctionCall(functionName, args) {
        if (!this.functionMap[functionName]) {
            throw new Error(`Unknown function: ${functionName}`);
        }
        return this.functionMap[functionName](args);
    }

    generateDescribeDataCall(args) {
        return `describe_data();`;
    }

    generateLoadCsvCall(args) {
        if (args.length !== 1) {
            throw new Error(`load_csv expects 1 argument, got ${args.length}`);
        }
        return `load_csv("${args[0]}");`;
    }

    generatePrintCall(args) {
        if (args.length !== 1) {
            throw new Error(`print expects 1 argument, got ${args.length}`);
        }
        return `print("${args[0]}");`;
    }

    generateScatterPlotCall(args) {
        if (args.length !== 2) {
            throw new Error(`scatter_plot expects 2 arguments, got ${args.length}`);
        }
        return `scatter_plot("${args[0]}", "${args[1]}");`;
    }

    // Basic Data Operations
    generateRemoveNullsCall() {
        return `remove_nulls();`;
    }

    generateFillNullsCall(args) {
        if (args.length !== 1) throw new Error('fill_nulls expects 1 argument');
        return `fill_nulls("${args[0]}");`;
    }

    generateRenameColumnCall(args) {
        if (args.length !== 2) throw new Error('rename_column expects 2 arguments');
        return `rename_column("${args[0]}", "${args[1]}");`;
    }

    generateAddColumnCall(args) {
        if (args.length < 2) throw new Error('add_column expects at least 2 arguments');
        const [name, ...values] = args;
        return `add_column("${name}", {${values.join(', ')}});`;
    }

    generateDropColumnCall(args) {
        if (args.length !== 1) throw new Error('drop_column expects 1 argument');
        return `drop_column("${args[0]}");`;
    }

    generateFilterRowsCall(args) {
        if (args.length !== 2) throw new Error('filter_rows expects 2 arguments');
        return `filter_rows("${args[0]}", "${args[1]}");`;
    }

    generateSortDataCall(args) {
        if (args.length < 1 || args.length > 2) throw new Error('sort_data expects 1 or 2 arguments');
        const ascending = args[1] ? args[1].toLowerCase() === 'true' : true;
        return `sort_data("${args[0]}", ${ascending});`;
    }

    // Statistical Functions
    generateMeanCall(args) {
        if (args.length !== 1) throw new Error('mean expects 1 argument');
        return `mean("${args[0]}");`;
    }

    generateCorrelationCall(args) {
        if (args.length !== 2) throw new Error('correlation expects 2 arguments');
        return `correlation("${args[0]}", "${args[1]}");`;
    }

    generateStandardDeviationCall(args) {
        if (args.length !== 1) throw new Error('standard_deviation expects 1 argument');
        return `standard_deviation("${args[0]}");`;
    }

    generateMedianCall(args) {
        if (args.length !== 1) throw new Error('median expects 1 argument');
        return `median("${args[0]}");`;
    }

    generateVarianceCall(args) {
        if (args.length !== 1) throw new Error('variance expects 1 argument');
        return `variance("${args[0]}");`;
    }

    // Visualization Functions
    generatePlotCall(args) {
        if (args.length !== 2) throw new Error('plot expects 2 arguments');
        return `plot("${args[0]}", "${args[1]}");`;
    }

    generateBarChartCall(args) {
        if (args.length !== 1) throw new Error('bar_chart expects 1 argument');
        return `bar_chart("${args[0]}");`;
    }

    generatePieChartCall(args) {
        if (args.length !== 1) throw new Error('pie_chart expects 1 argument');
        return `pie_chart("${args[0]}");`;
    }

    generateHistogramCall(args) {
        if (args.length !== 1) throw new Error('histogram expects 1 argument');
        return `histogram("${args[0]}");`;
    }

    // Machine Learning Functions
    generateTrainModelCall(args) {
        if (args.length !== 2) throw new Error('train_model expects 2 arguments');
        return `train_model("${args[0]}", "${args[1]}");`;
    }

    generatePredictCall(args) {
        return `predict();`;
    }

    generateSaveModelCall(args) {
        if (args.length !== 1) throw new Error('save_model expects 1 argument');
        return `save_model("${args[0]}");`;
    }

    generateEvaluateModelCall(args) {
        return `evaluate_model();`;
    }

    generateSplitDataCall(args) {
        if (args.length !== 1) throw new Error('split_data expects 1 argument');
        return `split_data(${args[0]});`;
    }

    // Data Preprocessing Functions
    generateNormalizeCall(args) {
        if (args.length !== 1) throw new Error('normalize expects 1 argument');
        return `normalize("${args[0]}");`;
    }

    generateStandardizeCall(args) {
        if (args.length !== 1) throw new Error('standardize expects 1 argument');
        return `standardize("${args[0]}");`;
    }

    generateScaleDataCall(args) {
        if (args.length !== 3) throw new Error('scale_data expects 3 arguments');
        return `scale_data("${args[0]}", ${args[1]}, ${args[2]});`;
    }

    // Text Processing Functions
    generateRemoveStopwordsCall(args) {
        if (args.length !== 1) throw new Error('remove_stopwords expects 1 argument');
        return `remove_stopwords("${args[0]}");`;
    }

    generateStemTextCall(args) {
        if (args.length !== 1) throw new Error('stem_text expects 1 argument');
        return `stem_text("${args[0]}");`;
    }

    generateCapitalizeWordsCall(args) {
        if (args.length !== 1) throw new Error('capitalize_words expects 1 argument');
        return `capitalize_words("${args[0]}");`;
    }

    generateCountWordsCall(args) {
        if (args.length !== 1) throw new Error('count_words expects 1 argument');
        return `count_words("${args[0]}");`;
    }

    // Time Series Functions
    generateRollingMeanCall(args) {
        if (args.length !== 2) throw new Error('rolling_mean expects 2 arguments');
        return `rolling_mean("${args[0]}", ${args[1]});`;
    }

    generateResampleDataCall(args) {
        if (args.length !== 1) throw new Error('resample_data expects 1 argument');
        return `resample_data("${args[0]}");`;
    }

    generateDetectTrendsCall(args) {
        if (args.length !== 1) throw new Error('detect_trends expects 1 argument');
        return `detect_trends("${args[0]}");`;
    }

    generateSeasonalDecomposeCall(args) {
        if (args.length !== 1) throw new Error('seasonal_decompose expects 1 argument');
        return `seasonal_decompose("${args[0]}");`;
    }

    generateDetectAnomaliesCall(args) {
        if (args.length !== 1) throw new Error('detect_anomalies expects 1 argument');
        return `detect_anomalies("${args[0]}");`;
    }

    // Analysis Functions
    generateGetShapeCall(args) {
        return `get_shape();`;
    }

    generateDataQualityReportCall(args) {
        return `data_quality_report();`;
    }

    generateGetColumnProfileCall(args) {
        if (args.length !== 1) throw new Error('get_column_profile expects 1 argument');
        return `get_column_profile("${args[0]}");`;
    }

    generateCategorizeColumnCall(args) {
        if (args.length !== 1) throw new Error('categorize_column expects 1 argument');
        return `categorize_column("${args[0]}");`;
    }

    generateDescribeCall(args) {
        return `describe();`;
    }

    generateCppProgram(customCode) {
        const lines = customCode.split('\n').filter(line => line.trim());
        const functionCalls = [];

        for (const line of lines) {
            try {
                const { functionName, args } = this.parseLine(line);
                const cppCode = this.generateFunctionCall(functionName, args);
                functionCalls.push(cppCode);
            } catch (error) {
                throw new Error(`Error parsing line "${line}": ${error.message}`);
            }
        }

        const program = [
            cppTemplates.header.trim(), // Includes declarations
            cppTemplates.describe_data.trim(), // Includes implementation of describe_data
            'int main() {',
            functionCalls.join('\n'),
            '    return 0;',
            '}'
        ].join('\n\n');

        console.log(`Generated C++ Program:\n${program}`); // Debugging log

        return program;
    }

    saveCppFile(code) {
        const cppPath = path.join(this.outputDir, 'main.cpp');
        fs.writeFileSync(cppPath, code);
        return cppPath;
    }

    compileCpp(cppPath) {
        return new Promise((resolve, reject) => {
            const outputPath = path.join(this.outputDir, 'main');
            const command = `g++ \"${cppPath}\" -o \"${outputPath}\"`;
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`Compilation error: ${stderr}`));
                    return;
                }
                resolve(outputPath);
            });
        });
    }

    runCppBinary(binaryPath) {
        return new Promise((resolve, reject) => {
            exec(binaryPath, (error, stdout, stderr) => {
                if (error) return reject(`Execution error: ${error.message}`);
                if (stderr) return reject(`Runtime stderr: ${stderr}`);
                resolve(stdout);
            });
        });
    }

    async process(code) {
        try {
            const cppCode = this.generateCppProgram(code);
            const cppPath = this.saveCppFile(cppCode);
            const binaryPath = await this.compileCpp(cppPath);
            const output = await this.runCppBinary(binaryPath);
            return { success: true, message: "Compilation and execution successful", output };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = CompilerEngine;
