#include "tokenizer_parser.h"
#include <sstream>
#include <iostream>
#include <fstream>
#include <regex>
#include <set>

// Set of valid function names
const std::set<std::string> valid_functions = {
    // File Operations
    "load_csv", "save_csv", "describe_data",
    
    // Data Cleaning
    "remove_nulls", "fill_nulls", "rename_column", "add_column",
    
    // Visualization
    "scatter_plot", "bar_chart", "pie_chart", "histogram", "plot",
    
    // Statistics
    "mean", "correlation", "standard_deviation", "median", "variance",
    
    // Machine Learning
    "train_model", "predict", "save_model", "evaluate_model",
    
    // Text Processing
    "remove_stopwords", "stem_text", "capitalize_words", "count_words",
    
    // Time Series
    "rolling_mean", "resample_data", "detect_trends", "seasonal_decompose",
    "detect_anomalies",
    
    // Data Transformation
    "normalize", "standardize", "split_data", "drop_column", "filter_rows",
    "sort_data", "group_by_data", "scale_data",
    
    // Profiling & Analysis
    "get_shape", "data_quality_report", "get_column_profile",
    "categorize_column", "pivot_table", "describe", "print"
};

// Check if a function name is valid
bool is_valid_function(const std::string& func_name) {
    return valid_functions.find(func_name) != valid_functions.end();
}

// Tokenize the input code into function calls and arguments
std::vector<Token> tokenize(const std::string& code) {
    std::vector<Token> tokens;
    std::stringstream ss(code);
    std::string line;
    int line_number = 0;

    while (std::getline(ss, line)) {
        line_number++;
        
        // Skip empty lines and comments
        if (line.empty() || line[0] == '#') continue;

        // Regular expression to match function calls with both string and numeric arguments
        std::regex func_pattern("(\\w+)\\s*\\((.*)\\)");
        std::smatch matches;

        if (std::regex_match(line, matches, func_pattern)) {
            std::string func_name = matches[1];
            std::string args_str = matches[2];

            // Validate function name
            if (!is_valid_function(func_name)) {
                throw SyntaxError("Invalid function name: " + func_name, line_number);
            }

            Token token;
            token.function_name = func_name;

            // Parse arguments if present
            if (!args_str.empty()) {
                // Split arguments by comma, handling both quoted strings and numbers
                std::string current_arg;
                bool in_quotes = false;
                
                for (char c : args_str) {
                    if (c == '"') {
                        in_quotes = !in_quotes;
                    } else if (c == ',' && !in_quotes) {
                        // End of argument
                        if (!current_arg.empty()) {
                            // Trim whitespace
                            current_arg.erase(0, current_arg.find_first_not_of(" \t"));
                            current_arg.erase(current_arg.find_last_not_of(" \t") + 1);
                            // Remove quotes if present
                            if (current_arg.front() == '"' && current_arg.back() == '"') {
                                current_arg = current_arg.substr(1, current_arg.length() - 2);
                            }
                            token.arguments.push_back(current_arg);
                            current_arg.clear();
                        }
                    } else {
                        current_arg += c;
                    }
                }
                
                // Handle last argument
                if (!current_arg.empty()) {
                    current_arg.erase(0, current_arg.find_first_not_of(" \t"));
                    current_arg.erase(current_arg.find_last_not_of(" \t") + 1);
                    if (current_arg.front() == '"' && current_arg.back() == '"') {
                        current_arg = current_arg.substr(1, current_arg.length() - 2);
                    }
                    token.arguments.push_back(current_arg);
                }
            }

            tokens.push_back(token);
        } else {
            throw SyntaxError("Invalid syntax at line: " + line, line_number);
        }
    }

    return tokens;
}

// Generate C++ code for a function call
bool is_numeric(const std::string& str) {
    try {
        std::stod(str);
        return true;
    } catch (...) {
        return false;
    }
}

void generate_function_call(std::ofstream& out, const Token& token) {
    out << "    " << token.function_name << "(";
    
    if (token.function_name == "add_column") {
        // First argument is column name
        out << "\"" << token.arguments[0] << "\", ";
        
        // Create a vector for the remaining arguments
        out << "{";
        for (std::size_t i = 1; i < token.arguments.size(); ++i) {
            out << "\"" << token.arguments[i] << "\"";
            if (i < token.arguments.size() - 1) {
                out << ", ";
            }
        }
        out << "}";
    } else {
        // Handle other function calls with proper type detection
        for (std::size_t i = 0; i < token.arguments.size(); ++i) {
            const std::string& arg = token.arguments[i];
            
            // Check if it's a boolean
            if (arg == "true" || arg == "false") {
                out << arg;
            }
            // Check if it's a number (integer or float)
            else if (std::all_of(arg.begin(), arg.end(), [](char c) {
                return std::isdigit(c) || c == '.' || c == '-';
            })) {
                out << arg;
            }
            // Otherwise treat as string
            else {
                out << "\"" << arg << "\"";
            }
            
            if (i < token.arguments.size() - 1) {
                out << ", ";
            }
        }
    }
    
    out << ");" << std::endl;
}

// Parse tokens and generate C++ code
void parse_and_generate(const std::vector<Token>& tokens) {
    std::ofstream out("generated.cpp");
    if (!out) {
        throw std::runtime_error("Failed to create output file");
    }

    // Write includes and using directive
    out << "#include \"main.h\"" << std::endl;
    out << "using namespace std;" << std::endl << std::endl;

    // Generate main function
    out << "int main() {" << std::endl;
    out << "    try {" << std::endl;

    // Generate function calls
    for (const auto& token : tokens) {
        generate_function_call(out, token);
    }

    // Close main function
    out << "        return 0;" << std::endl;
    out << "    } catch (const std::exception& e) {" << std::endl;
    out << "        std::cerr << \"Error: \" << e.what() << std::endl;" << std::endl;
    out << "        return 1;" << std::endl;
    out << "    }" << std::endl;
    out << "}" << std::endl;

    out.close();
}

void validate_syntax(const std::vector<Token>& tokens) {
    // Placeholder for syntax validation
    // Can be implemented to check argument counts, types, etc.
}
