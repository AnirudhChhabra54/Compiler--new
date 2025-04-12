#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <cstdlib>
#include "tokenizer_parser.h"
#include "main.h"
using namespace std;

int main() {
    try {
        // Read DSL input from a file
        ifstream file("input.dsl");
        if (!file.is_open()) {
            cerr << "❌ Could not open input.dsl\n";
            return 1;
        }

        stringstream buffer;
        buffer << file.rdbuf();
        string user_code = buffer.str();
        file.close();

        // Tokenize and parse
        std::vector<Token> tokens = tokenize(user_code);
        std::cout << "Debug: Tokenization complete. Tokens generated: " << tokens.size() << std::endl;

        parse_and_generate(tokens);
        cout << "Debug: Parsing and C++ code generation complete." << endl;

        // Compile the generated code
        string compile_command = "g++ -std=c++11 -o program generated.cpp main.cpp tokenizer_parser.cpp";
        if (system(compile_command.c_str()) != 0) {
            cerr << "\n❌ Compilation failed.\n";
            return 1;
        }

        cout << "\n🚀 Running generated program:\n";
        system("./program");
        return 0;

    } catch (const exception& e) {
        cerr << "Error: " << e.what() << endl;
        return 1;
    }
}
