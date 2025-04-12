#!/bin/bash

# Set compiler and flags
CXX="g++"
CXXFLAGS="-std=c++11 -Wall -I."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -f *.o compiler_main program generated.cpp

# Compile object files separately with verbose output
echo "🔨 Compiling object files..."
${CXX} ${CXXFLAGS} -c tokenizer_parser.cpp -o tokenizer_parser.o
${CXX} ${CXXFLAGS} -c main.cpp -o main.o
${CXX} ${CXXFLAGS} -c compiler_main.cpp -o compiler_main.o

# Link object files with verbose output
echo "🔗 Linking..."
${CXX} ${CXXFLAGS} -v tokenizer_parser.o main.o compiler_main.o -o compiler_main

if [ $? -eq 0 ]; then
    echo "✅ Compilation successful!"
    echo "🚀 Running compiler..."
    ./compiler_main
else
    echo "❌ Compilation failed!"
    exit 1
fi
