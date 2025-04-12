#include "tokenizer_parser.h"
#include <sstream>
#include <iostream>
#include <fstream>
#include <regex>
#include <set>

// Set of valid function names
const std::set<std::string> valid_functions = {
    "load_csv", "save_csv", "describe_data", "remove_nulls", "fill_nulls",
    "rename_column", "add_column", "scatter_plot", "bar_chart", "pie_chart",
    "histogram", "mean", "correlation", "standard_deviation", "median",
    "variance", "train_model", "predict", "save_model", "evaluate_model",
    "remove_stopwords", "detect_trends", "seasonal_decompose", "normalize",
    "standardize", "split_data", "drop_column", "filter_rows", "sort_data",
    "group_by_data", "scale_data", "get_shape", "data_quality_report",
    "get_column_profile", "categorize_column", "pivot_table", "print"
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

        // Regular expression to match function calls
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

            // Parse arguments
            if (!args_str.empty()) {
                std::regex arg_pattern("\"([^\"]*)\"");
                auto args_begin = std::sregex_iterator(args_str.begin(), args_str.end(), arg_pattern);
                auto args_end = std::sregex_iterator();

                for (auto i = args_begin; i != args_end; ++i) {
                    token.arguments.push_back(i->str(1));
                }

                // For boolean arguments (like in sort_data)
                if (func_name == "sort_data" && token.arguments.size() == 1) {
                    if (args_str.find("true") != std::string::npos) {
                        token.arguments.push_back("true");
                    } else if (args_str.find("false") != std::string::npos) {
                        token.arguments.push_back("false");
                    }
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
void generate_function_call(std::ofstream& out, const Token& token) {
    out << "    " << token.function_name << "(";
    
    for (std::size_t i = 0; i < token.arguments.size(); ++i) {
        if (token.arguments[i] == "true" || token.arguments[i] == "false") {
            out << token.arguments[i];  // Boolean arguments
        } else {
            out << "\"" << token.arguments[i] << "\"";  // String arguments
        }
        
        if (i < token.arguments.size() - 1) {
            out << ", ";
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
