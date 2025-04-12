#ifndef TOKENIZER_PARSER_H
#define TOKENIZER_PARSER_H

#include <vector>
#include <string>
#include <fstream>
#include <exception>

// Token structure
struct Token {
    std::string function_name;
    std::vector<std::string> arguments;
};

// Custom exception class
class SyntaxError : public std::exception {
public:
    SyntaxError(const std::string& msg, int line) 
        : message(msg), line_number(line) {}
    
    const char* what() const noexcept override {
        return message.c_str();
    }
    
    int getLine() const { return line_number; }
    
private:
    std::string message;
    int line_number;
};

// Function declarations
std::vector<Token> tokenize(const std::string& code);
void parse_and_generate(const std::vector<Token>& tokens);
bool is_valid_function(const std::string& func_name);
void validate_syntax(const std::vector<Token>& tokens);
void generate_function_call(std::ofstream& out, const Token& token);

#endif // TOKENIZER_PARSER_H
