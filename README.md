

```markdown
# CSV Data Processing Tool

## Project Overview
The CSV Data Processing Tool is a C++ application designed for efficient manipulation, analysis, and visualization of CSV data files. It provides features for loading data, performing statistical analysis, creating graphical representations, and machine learning capabilities including model training and prediction. The tool enables users to execute a series of predefined functions through a simplified domain-specific language (DSL).

## Installation
To install the necessary components for the project, follow these steps:

1. Ensure that you have a C++ compiler (like g++) and `gnuplot` installed on your system.
2. Clone this repository to your local machine:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```
3. Compile the project using the following command:
   ```bash
   g++ -std=c++11 -o program main.cpp tokenizer_parser.cpp compiler_main.cpp
   ```
4. Ensure your input DSL files (e.g., `input.dsl`) and your CSV data files are in the appropriate directory.

## Usage
1. Create or modify an input DSL file (e.g., `input.dsl`) with the following structure:
   ```plaintext
   load_csv("data.csv");
   sort_data("Age", true);
   print("Processing complete");
   ```

2. Run the compiler to process the DSL:
   ```bash
   ./program
   ```

3. The tool will generate a C++ file based on the DSL and compile it before executing the resulting program.

## Features
- **Data Loading & Saving**: Load CSV files and save modified datasets.
- **Data Visualization**: Create scatter plots, bar charts, pie charts, and histograms.
- **Statistical Analysis**: Calculate mean, median, variance, standard deviation, and correlation.
- **Data Cleaning**: Remove null values, fill missing data, and drop specified columns.
- **Data Transformation**: Normalize, standardize, and categorize columns.
- **Machine Learning**:
  - Train linear regression models.
  - Make predictions based on trained models.
  - Evaluate model performance with metrics like Mean Squared Error.
  
## Dependencies
This project requires the following libraries:
- **C++ Standard Library**: Used for file handling, string manipulation, and data structure management.
- **g++**: Required to compile the C++ code.
- **gnuplot**: For generating plots; ensure it is installed and available in your PATH.

## Project Structure
```plaintext
.
├── main.cpp               # Main application logic and data processing functions
├── tokenizer_parser.cpp    # Tokenizer and parser for the DSL
├── compiler_main.cpp       # Entry point for compiling and running the generated C++ code
├── generated.cpp           # Output file generated from the user's DSL input
└── input.dsl               # Sample DSL input file for processing CSV data
```

## Contribution
Contributions are welcome! If you encounter any issues or have suggestions for improvements, please feel free to create an issue or submit a pull request.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
```