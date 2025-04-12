#include "main.h"
#include "tokenizer_parser.h"
#include <iostream>
#include <iomanip>
void tokenize_column(const string& text_column) {
    // Example implementation for tokenizing a text column
    cout << "Tokenizing column: " << text_column << endl;
}

// Global data storage
vector<CSVRow> dataset;
double model_slope = 0.0, model_intercept = 0.0;


void load_csv(const string& filename) {
    ifstream file(filename);
    string line;

    if (!file.is_open()) {
        cerr << "Error: Could not open file " << filename << endl;
        return;
    }

    dataset.clear();

    // Read header
    if (getline(file, line)) {
        CSVRow header;
        stringstream ss(line);
        string cell;
        while (getline(ss, cell, ',')) {
            header.data.push_back(cell);
        }
        dataset.push_back(header);
    }

    // Read remaining rows
    size_t num_cols = dataset[0].data.size(); // Expected columns based on header
    while (getline(file, line)) {
        CSVRow row;
        stringstream ss(line);
        string cell;
        while (getline(ss, cell, ',')) {
            row.data.push_back(cell);
        }

        // Skip empty rows and rows with column count mismatch
        if (row.data.size() == num_cols) {
            dataset.push_back(row);
        } else if (!line.empty()) {
            cerr << "Warning: Skipping malformed row: " << line << endl;
        }
    }

    cout << "Loaded " << dataset.size() - 1 << " rows from " << filename << endl;
    file.close();
}

// For IS NUMERIC


bool is_numeric_strict(const string& s) {
    if (s.empty()) return false;  // ❗ Handles empty string safely

    try {
        size_t idx;
        stod(s, &idx);
        return idx == s.length();  // Ensure entire string was parsed
    } catch (...) {
        return false;
    }
}

double safe_stod(const string& s) {
    try {
        return stod(s);
    } catch (const std::invalid_argument&) {
        return 0.0; // Return 0.0 for invalid input
    } catch (const std::out_of_range&) {
        return 0.0; // Return 0.0 for out-of-range input
    }
}

void scatter_plot(const string& col1, const string& col2) {
    // Create a temporary file for gnuplot
    ofstream plotData("plot_data.txt");

    // Find column indices
    int idx1 = -1, idx2 = -1;
    for (size_t i = 0; i < dataset[0].data.size(); i++) {
        if (dataset[0].data[i] == col1) idx1 = i;
        if (dataset[0].data[i] == col2) idx2 = i;
    }

    if (idx1 == -1 || idx2 == -1) {
        cerr << "Error: Columns not found" << endl;
        return;
    }

    // Write data points
    for (size_t i = 1; i < dataset.size(); i++) {
        try {
            double x = stod(dataset[i].data[idx1]);
            double y = stod(dataset[i].data[idx2]);
            plotData << x << " " << y << endl;
        } catch (...) {
            // Skip invalid numbers
            continue;
        }
    }
    plotData.close();

    // Create gnuplot script
    ofstream script("plot_script.plt");
    script << "set terminal png" << endl;
    script << "set output 'scatter_plot.png'" << endl;
    script << "set title 'Scatter Plot: " << col1 << " vs " << col2 << "'" << endl;
    script << "set xlabel \"" << col1 << "\"" << endl;
    script << "set ylabel \"" << col2 << "\"" << endl;
    script << "plot 'plot_data.txt' using 1:2 with points title 'Data Points'" << endl;
    script.close();

    // Execute gnuplot
    system("gnuplot plot_script.plt");
    cout << "Scatter plot generated as scatter_plot.png" << endl;
}

void remove_nulls() {
    vector<CSVRow> cleaned;

    // Keep header
    if (!dataset.empty()) {
        cleaned.push_back(dataset[0]);
    }

    // Filter rows with null values
    for (size_t i = 1; i < dataset.size(); i++) {
        bool hasNull = false;
        for (const auto& cell : dataset[i].data) {
            if (cell.empty() || cell == "null" || cell == "NA" || cell == "NaN") {
                hasNull = true;
                break;
            }
        }
        if (!hasNull) {
            cleaned.push_back(dataset[i]);
        }
    }

    int removed = dataset.size() - cleaned.size();
    dataset = cleaned;
    cout << "Removed " << removed << " rows containing null values" << endl;
}

void describe_data() {
    if (dataset.empty()) {
        cout << "Dataset is empty" << endl;
        return;
    }

    // Print column names
    cout << "Dataset Summary:" << endl;
    cout << "Number of rows: " << dataset.size() - 1 << endl;
    cout << "Number of columns: " << dataset[0].data.size() << endl;
    cout << "\nColumns:" << endl;

    // Analyze each column
    for (size_t col = 0; col < dataset[0].data.size(); col++) {
        cout << "\n" << dataset[0].data[col] << ":" << endl;

        vector<double> numeric_values;
        bool is_numeric = true;

        // Try to convert values to numbers
        for (size_t row = 1; row < dataset.size(); row++) {
            try {
                numeric_values.push_back(stod(dataset[row].data[col]));
            } catch (...) {
                is_numeric = false;
                break;
            }
        }

        if (is_numeric && !numeric_values.empty()) {
            // Calculate statistics for numeric columns
            double sum = accumulate(numeric_values.begin(), numeric_values.end(), 0.0);
            double mean = sum / numeric_values.size();

            sort(numeric_values.begin(), numeric_values.end());
            double median = numeric_values[numeric_values.size() / 2];
            double min = numeric_values.front();
            double max = numeric_values.back();

            cout << "  Type: Numeric" << endl;
            cout << "  Mean: " << mean << endl;
            cout << "  Median: " << median << endl;
            cout << "  Min: " << min << endl;
            cout << "  Max: " << max << endl;
        } else {
            // For non-numeric columns, show unique values count
            set<string> unique_values;
            for (size_t row = 1; row < dataset.size(); row++) {
                unique_values.insert(dataset[row].data[col]);
            }
            cout << "  Type: Categorical" << endl;
            cout << "  Unique values: " << unique_values.size() << endl;
        }
    }
}

void save_csv(const string& filename) {
    ofstream file(filename);
    if (!file.is_open()) {
        cerr << "Error: Could not open file " << filename << endl;
        return;
    }
    for (const auto& row : dataset) {
        for (size_t i = 0; i < row.data.size(); ++i) {
            file << row.data[i];
            if (i < row.data.size() - 1) file << ",";
        }
        file << endl;
    }
    file.close();
    cout << "Dataset saved to " << filename << endl;
}

void load_json(const string& filename) {
    // Placeholder for JSON loading logic
    cout << "Loading JSON from " << filename << endl;
}

void save_json(const string& filename) {
    // Placeholder for JSON saving logic
    cout << "Saving JSON to " << filename << endl;
}

void load_excel(const string& filename) {
    // Placeholder for Excel loading logic
    cout << "Loading Excel file from " << filename << endl;
}

void fill_nulls(const string& value) {
    for (auto& row : dataset) {
        for (auto& cell : row.data) {
            if (cell.empty() || cell == "null" || cell == "NA" || cell == "NaN") {
                cell = value;
            }
        }
    }
    cout << "Filled null values with " << value << endl;
}

void rename_column(const string& old_name, const string& new_name) {
    for (auto& col : dataset[0].data) {
        if (col == old_name) {
            col = new_name;
            cout << "Renamed column " << old_name << " to " << new_name << endl;
            return;
        }
    }
    cerr << "Error: Column not found.\n";
}

void add_column(const string& column_name, const vector<string>& values) {
    if (dataset.empty() || values.size() != dataset.size() - 1) {
        cerr << "Error: Row mismatch for new column.\n";
        return;
    }
    dataset[0].data.push_back(column_name);
    for (size_t i = 1; i < dataset.size(); i++) {
        dataset[i].data.push_back(values[i - 1]);
    }
    cout << "Added column: " << column_name << endl;
}

void bar_chart(const string& column) {
    int index = -1;
    for (size_t i = 0; i < dataset[0].data.size(); ++i)
        if (dataset[0].data[i] == column) index = i;

    if (index == -1) {
        cerr << "Column not found: " << column << endl;
        return;
    }

    map<string, int> freq;
    for (size_t i = 1; i < dataset.size(); ++i)
        freq[dataset[i].data[index]]++;

    cout << "\nBar Chart for '" << column << "':\n";
    for (const auto& p : freq) {
        cout << p.first << " | ";
        for (int i = 0; i < p.second; ++i) cout << "█";
        cout << " (" << p.second << ")\n";
    }
}

void pie_chart(const string& column) {
    int index = -1;
    for (size_t i = 0; i < dataset[0].data.size(); ++i)
        if (dataset[0].data[i] == column) index = i;

    if (index == -1) {
        cerr << "Column not found: " << column << endl;
        return;
    }

    map<string, int> freq;
    int total = 0;
    for (size_t i = 1; i < dataset.size(); ++i) {
        freq[dataset[i].data[index]]++;
        total++;
    }

    cout << "\nPie Chart (Text-based) for '" << column << "':\n";
    for (const auto& p : freq) {
        double percent = (double)p.second / total * 100;
        cout << p.first << " : " << fixed << setprecision(2) << percent << "% ";
        int bar_len = percent / 2; // Scale for display
        for (int i = 0; i < bar_len; ++i) cout << "*";
        cout << "\n";
    }
}

void histogram(const string& column) {
    int index = -1;
    for (size_t i = 0; i < dataset[0].data.size(); ++i)
        if (dataset[0].data[i] == column) index = i;

    if (index == -1) {
        cerr << "Column not found: " << column << endl;
        return;
    }

    vector<double> values;
    for (size_t i = 1; i < dataset.size(); ++i) {
        try {
            values.push_back(stod(dataset[i].data[index]));
        } catch (...) {}
    }

    if (values.empty()) {
        cerr << "No numeric data found in column.\n";
        return;
    }

    double min_val = *min_element(values.begin(), values.end());
    double max_val = *max_element(values.begin(), values.end());
    int bins = 10;
    double bin_size = (max_val - min_val) / bins;

    vector<int> freq(bins, 0);
    for (double v : values) {
        int bin = min((int)((v - min_val) / bin_size), bins - 1);
        freq[bin]++;
    }

    cout << "\nHistogram for '" << column << "':\n";
    for (int i = 0; i < bins; ++i) {
        double bin_start = min_val + i * bin_size;
        double bin_end = bin_start + bin_size;
        cout << fixed << setprecision(2);
        cout << "[" << bin_start << " - " << bin_end << ") | ";
        for (int j = 0; j < freq[i]; ++j) cout << "#";
        cout << " (" << freq[i] << ")\n";
    }
}

void mean(const string& column) {
    int index = -1;
    for (size_t i = 0; i < dataset[0].data.size(); i++)
        if (dataset[0].data[i] == column) index = i;
    if (index == -1) {
        cerr << "Error: Column " << column << " not found." << endl;
        return;
    }

    double sum = 0;
    int count = 0;
    for (size_t i = 1; i < dataset.size(); i++) {
        try {
            sum += stod(dataset[i].data[index]);
            count++;
        } catch (...) {}
    }
    cout << "Mean of " << column << ": " << (count ? sum / count : 0) << endl;
}

void correlation(const string& col1, const string& col2) {
    int i1 = -1, i2 = -1;
    for (size_t i = 0; i < dataset[0].data.size(); ++i) {
        if (dataset[0].data[i] == col1) i1 = i;
        if (dataset[0].data[i] == col2) i2 = i;
    }

    if (i1 == -1 || i2 == -1) {
        cerr << "Error: One or both columns not found." << endl;
        return;
    }

    vector<double> x, y;
    for (size_t i = 1; i < dataset.size(); ++i) {
        try {
            x.push_back(stod(dataset[i].data[i1]));
            y.push_back(stod(dataset[i].data[i2]));
        } catch (...) {}
    }

    if (x.size() != y.size() || x.empty()) {
        cerr << "Error: Insufficient data for correlation calculation." << endl;
        return;
    }

    double mean_x = accumulate(x.begin(), x.end(), 0.0) / x.size();
    double mean_y = accumulate(y.begin(), y.end(), 0.0) / y.size();

    double num = 0, den_x = 0, den_y = 0;
    for (size_t i = 0; i < x.size(); ++i) {
        num += (x[i] - mean_x) * (y[i] - mean_y);
        den_x += pow(x[i] - mean_x, 2);
        den_y += pow(y[i] - mean_y, 2);
    }

    double corr = num / sqrt(den_x * den_y);
    cout << "Correlation between " << col1 << " and " << col2 << ": " << corr << endl;
}

void standard_deviation(const string& column) {
    int index = -1;
    for (size_t i = 0; i < dataset[0].data.size(); ++i)
        if (dataset[0].data[i] == column) index = i;
    if (index == -1) {
        cerr << "Error: Column " << column << " not found." << endl;
        return;
    }

    vector<double> values;
    for (size_t i = 1; i < dataset.size(); i++) {
        try {
            values.push_back(stod(dataset[i].data[index]));
        } catch (...) {}
    }

    if (values.empty()) {
        cerr << "Error: No numeric data found in column " << column << "." << endl;
        return;
    }

    double mean_val = accumulate(values.begin(), values.end(), 0.0) / values.size();
    double sum_sq = 0;
    for (double val : values) sum_sq += (val - mean_val) * (val - mean_val);
    cout << "Standard Deviation of " << column << ": " << sqrt(sum_sq / values.size()) << endl;
}

void median(const string& column) {
    int index = -1;
    for (size_t i = 0; i < dataset[0].data.size(); ++i)
        if (dataset[0].data[i] == column) index = i;
    if (index == -1) {
        cerr << "Error: Column " << column << " not found." << endl;
        return;
    }

    vector<double> values;
    for (size_t i = 1; i < dataset.size(); ++i) {
        try {
            values.push_back(stod(dataset[i].data[index]));
        } catch (...) {}
    }

    if (values.empty()) {
        cerr << "Error: No numeric data found in column " << column << "." << endl;
        return;
    }

    sort(values.begin(), values.end());
    size_t n = values.size();
    double med = (n % 2 == 0) ? (values[n / 2 - 1] + values[n / 2]) / 2 : values[n / 2];
    cout << "Median of " << column << ": " << med << endl;
}

void variance(const string& column) {
    int index = -1;
    for (size_t i = 0; i < dataset[0].data.size(); ++i)
        if (dataset[0].data[i] == column) index = i;
    if (index == -1) {
        cerr << "Error: Column " << column << " not found." << endl;
        return;
    }

    vector<double> values;
    for (size_t i = 1; i < dataset.size(); ++i) {
        try {
            values.push_back(stod(dataset[i].data[index]));
        } catch (...) {}
    }

    if (values.empty()) {
        cerr << "Error: No numeric data found in column " << column << "." << endl;
        return;
    }

    double mean_val = accumulate(values.begin(), values.end(), 0.0) / values.size();
    double sum_sq = 0;
    for (double val : values) sum_sq += pow(val - mean_val, 2);
    cout << "Variance of " << column << ": " << (sum_sq / values.size()) << endl;
}

void train_model() {
    if (dataset.size() < 2 || dataset[0].data.size() < 2) {
        cerr << "Not enough data to train.\n";
        return;
    }

    vector<double> X, Y;
    for (size_t i = 1; i < dataset.size(); ++i) {
        try {
            X.push_back(stod(dataset[i].data[0])); // First column = Feature
            Y.push_back(stod(dataset[i].data.back())); // Last column = Target
        } catch (...) {}
    }

    if (X.size() != Y.size() || X.empty()) {
        cerr << "Invalid numeric data for training.\n";
        return;
    }

    double sum_x = 0, sum_y = 0, sum_xx = 0, sum_xy = 0;
    size_t n = X.size();

    for (size_t i = 0; i < n; ++i) {
        sum_x += X[i];
        sum_y += Y[i];
        sum_xx += X[i] * X[i];
        sum_xy += X[i] * Y[i];
    }

    model_slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
    model_intercept = (sum_y - model_slope * sum_x) / n;

    cout << "Model trained successfully.\n";
    cout << "Equation: y = " << model_slope << " * x + " << model_intercept << "\n";
}

void predict() {
    if (dataset.size() < 2 || dataset[0].data.size() < 1) {
        cerr << "Not enough data to predict.\n";
        return;
    }

    cout << "Predictions:\n";
    for (size_t i = 1; i < dataset.size(); ++i) {
        try {
            double x = stod(dataset[i].data[0]); // First column
            double y_pred = model_slope * x + model_intercept;
            cout << "Input: " << x << " -> Prediction: " << y_pred << "\n";
        } catch (...) {
            cout << "Skipping invalid data at row " << i << "\n";
        }
    }
}

void save_model(const string& filename) {
    ofstream file(filename);
    if (!file) {
        cerr << "Failed to open file " << filename << endl;
        return;
    }

    file << model_slope << "," << model_intercept << endl;
    file.close();

    cout << "Model saved to " << filename << "\n";
}

void evaluate_model() {
    vector<double> X, Y;
    for (size_t i = 1; i < dataset.size(); ++i) {
        try {
            X.push_back(stod(dataset[i].data[0]));
            Y.push_back(stod(dataset[i].data.back()));
        } catch (...) {}
    }

    if (X.size() != Y.size() || X.empty()) {
        cerr << "Invalid data for evaluation.\n";
        return;
    }

    double mse = 0;
    for (size_t i = 0; i < X.size(); ++i) {
        double pred = model_slope * X[i] + model_intercept;
        mse += (Y[i] - pred) * (Y[i] - pred);
    }
    mse /= X.size();

    cout << "Model evaluation complete.\n";
    cout << "Mean Squared Error: " << mse << "\n";
}

// void tokenize(const string& text_column) {
//     // Placeholder for tokenization logic
//     cout << "Tokenizing text in column " << text_column << endl;
// }

void remove_stopwords(const string& text_column) {
    // Placeholder for stopword removal logic
    cout << "Removing stopwords from column " << text_column << endl;
}

void detect_trends(const string& column) {
    // Placeholder for trend detection logic
    cout << "Detecting trends in column " << column << endl;
}

void seasonal_decompose(const string& column) {
    // Placeholder for seasonal decomposition logic
    cout << "Performing seasonal decomposition on column " << column << endl;
}

void normalize(const string& column) {
    int index = -1;
    for (size_t i = 0; i < dataset[0].data.size(); ++i)
        if (dataset[0].data[i] == column) index = i;

    if (index == -1) {
        cerr << "Error: Column not found: " << column << endl;
        return;
    }

    vector<double> values;
    for (size_t i = 1; i < dataset.size(); ++i) {
        try {
            values.push_back(stod(dataset[i].data[index]));
        } catch (...) {}
    }

    if (values.empty()) {
        cerr << "Error: No numeric data found in column " << column << "." << endl;
        return;
    }

    double min_val = *min_element(values.begin(), values.end());
    double max_val = *max_element(values.begin(), values.end());

    for (size_t i = 1; i < dataset.size(); ++i) {
        try {
            double val = stod(dataset[i].data[index]);
            dataset[i].data[index] = to_string((val - min_val) / (max_val - min_val));
        } catch (...) {}
    }

    cout << "Normalized column: " << column << endl;
}

void standardize(const string& column) {
    int index = -1;
    for (size_t i = 0; i < dataset[0].data.size(); ++i)
        if (dataset[0].data[i] == column) index = i;

    if (index == -1) {
        cerr << "Error: Column not found: " << column << endl;
        return;
    }

    vector<double> values;
    for (size_t i = 1; i < dataset.size(); ++i) {
        try {
            values.push_back(stod(dataset[i].data[index]));
        } catch (...) {}
    }

    if (values.empty()) {
        cerr << "Error: No numeric data found in column " << column << "." << endl;
        return;
    }

    double mean_val = accumulate(values.begin(), values.end(), 0.0) / values.size();
    double sum_sq = 0;
    for (double val : values) sum_sq += (val - mean_val) * (val - mean_val);
    double std_dev = sqrt(sum_sq / values.size());

    for (size_t i = 1; i < dataset.size(); ++i) {
        try {
            double val = stod(dataset[i].data[index]);
            dataset[i].data[index] = to_string((val - mean_val) / std_dev);
        } catch (...) {}
    }

    cout << "Standardized column: " << column << endl;
}

void split_data(double train_ratio) {
    if (train_ratio <= 0 || train_ratio >= 1) {
        cerr << "Error: Train ratio must be between 0 and 1." << endl;
        return;
    }

    size_t train_size = static_cast<size_t>((dataset.size() - 1) * train_ratio);
    vector<CSVRow> train_data, test_data;

    train_data.push_back(dataset[0]); // Add header to training data
    test_data.push_back(dataset[0]);  // Add header to testing data

    for (size_t i = 1; i <= train_size; ++i) {
        train_data.push_back(dataset[i]);
    }
    for (size_t i = train_size + 1; i < dataset.size(); ++i) {
        test_data.push_back(dataset[i]);
    }

    cout << "Training data size: " << train_data.size() - 1 << " rows" << endl;
    cout << "Testing data size: " << test_data.size() - 1 << " rows" << endl;

    // Optionally save the split data to files
    ofstream train_file("train_data.csv"), test_file("test_data.csv");
    for (const auto& row : train_data) {
        for (size_t i = 0; i < row.data.size(); ++i) {
            train_file << row.data[i];
            if (i < row.data.size() - 1) train_file << ",";
        }
        train_file << endl;
    }
    for (const auto& row : test_data) {
        for (size_t i = 0; i < row.data.size(); ++i) {
            test_file << row.data[i];
            if (i < row.data.size() - 1) test_file << ",";
        }
        test_file << endl;
    }
    train_file.close();
    test_file.close();
}

//drop column
void drop_column(const string& column_name) {
    int index = -1;
    for (size_t i = 0; i < dataset[0].data.size(); ++i) {
        if (dataset[0].data[i] == column_name) {
            index = i;
            break;
        }
    }

    if (index == -1) {
        cerr << "Error: Column not found: " << column_name << endl;
        return;
    }

    for (auto& row : dataset) {
        row.data.erase(row.data.begin() + index);
    }

    cout << "Dropped column: " << column_name << endl;
}



//filter rowss

void filter_rows(const string& column_name, const string& value) {
    int index = -1;
    for (size_t i = 0; i < dataset[0].data.size(); ++i) {
        if (dataset[0].data[i] == column_name) {
            index = i;
            break;
        }
    }

    if (index == -1) {
        cerr << "Error: Column not found: " << column_name << endl;
        return;
    }

    vector<CSVRow> filtered_data;
    filtered_data.push_back(dataset[0]); // Keep header

    for (size_t i = 1; i < dataset.size(); ++i) {
        if (dataset[i].data[index] == value) {
            filtered_data.push_back(dataset[i]);
        }
    }

    dataset = filtered_data;
    cout << "Filtered rows where " << column_name << " = " << value << endl;
}

//sort_data
void sort_data(const string& column_name, bool ascending) {
    cout << "Debug: Entering sort_data for column: " << column_name << endl;

    // Check if the dataset is empty
    if (dataset.empty() || dataset[0].data.empty()) {
        cerr << "Error: Dataset is empty or invalid." << endl;
        return;
    }

    // Find the column index
    int index = -1;
    for (size_t i = 0; i < dataset[0].data.size(); ++i) {
        if (dataset[0].data[i] == column_name) {
            index = i;
            break;
        }
    }

    if (index == -1) {
        cerr << "Error: Column not found: " << column_name << endl;
        return;
    }

    cout << "Debug: Column index for sorting: " << index << endl;

    // Debug: Print dataset before sorting
    cout << "Debug: Dataset before sorting:" << endl;
    for (size_t i = 0; i < dataset.size(); ++i) {
        for (const auto& cell : dataset[i].data) {
            cout << cell << " ";
        }
        cout << endl;
    }

    // Validate each row's data
    for (size_t i = 1; i < dataset.size(); ++i) {
        if (dataset[i].data.size() != dataset[0].data.size()) {
            cerr << "Error: Row " << i << " has an incorrect number of columns." << endl;
            return;
        }
        if (!is_numeric_strict(dataset[i].data[index])) {
            cerr << "Invalid data in row " << i << ": " << dataset[i].data[index] << endl;
        }
    }

    // Sort the data
    sort(dataset.begin() + 1, dataset.end(), [index, ascending](const CSVRow& a, const CSVRow& b) {
        try {
            double val_a = stod(a.data[index]);
            double val_b = stod(b.data[index]);
            return ascending ? val_a < val_b : val_a > val_b;
        } catch (...) {
            return ascending ? a.data[index] < b.data[index] : a.data[index] > b.data[index];
        }
    });

    cout << "Sorted data by column: " << column_name << (ascending ? " (ascending)" : " (descending)") << endl;

    // Debug: Print dataset after sorting
    cout << "Debug: Dataset after sorting:" << endl;
    for (size_t i = 0; i < dataset.size(); ++i) {
        for (const auto& cell : dataset[i].data) {
            cout << cell << " ";
        }
        cout << endl;
    }
}


// Group_by_data

void group_by_data(const string& column_name) {
    int index = -1;
    for (size_t i = 0; i < dataset[0].data.size(); ++i) {
        if (dataset[0].data[i] == column_name) {
            index = i;
            break;
        }
    }

    if (index == -1) {
        cerr << "Error: Column not found: " << column_name << endl;
        return;
    }

    map<string, int> group_counts;
    for (size_t i = 1; i < dataset.size(); ++i) {
        group_counts[dataset[i].data[index]]++;
    }

    cout << "Group by " << column_name << ":\n";
    for (const auto& group : group_counts) {
        cout << group.first << ": " << group.second << endl;
    }
}

//merging data

void merge_data(const vector<CSVRow>& other_dataset) {
    if (dataset.empty() || other_dataset.empty()) {
        cerr << "Error: One or both datasets are empty." << endl;
        return;
    }

    if (dataset[0].data != other_dataset[0].data) {
        cerr << "Error: Datasets have different column structures." << endl;
        return;
    }

    for (size_t i = 1; i < other_dataset.size(); ++i) {
        dataset.push_back(other_dataset[i]);
    }

    cout << "Merged datasets successfully." << endl;
}

// scale data 

void scale_data(const string& column, double new_min, double new_max) {
    int index = -1;
    for (size_t i = 0; i < dataset[0].data.size(); ++i) {
        if (dataset[0].data[i] == column) {
            index = i;
            break;
        }
    }

    if (index == -1) {
        cerr << "Error: Column not found: " << column << endl;
        return;
    }

    vector<double> values;
    for (size_t i = 1; i < dataset.size(); ++i) {
        try {
            values.push_back(stod(dataset[i].data[index]));
        } catch (...) {}
    }

    if (values.empty()) {
        cerr << "Error: No numeric data found in column " << column << "." << endl;
        return;
    }

    double old_min = *min_element(values.begin(), values.end());
    double old_max = *max_element(values.begin(), values.end());

    for (size_t i = 1; i < dataset.size(); ++i) {
        try {
            double val = stod(dataset[i].data[index]);
            dataset[i].data[index] = to_string(((val - old_min) / (old_max - old_min)) * (new_max - new_min) + new_min);
        } catch (...) {}
    }

    cout << "Scaled column: " << column << " to range [" << new_min << ", " << new_max << "]" << endl;
}

//get_shape
void get_shape() {
    if (dataset.empty()) {
        cout << "Dataset is empty." << endl;
        return;
    }

    cout << "Dataset shape: " << dataset.size() - 1 << " rows x " << dataset[0].data.size() << " columns" << endl;
}
// data quality report
void data_quality_report() {
    if (dataset.empty()) {
        cout << "Dataset is empty." << endl;
        return;
    }

    cout << "Data Quality Report:\n";
    for (size_t col = 0; col < dataset[0].data.size(); ++col) {
        int missing_count = 0;
        for (size_t row = 1; row < dataset.size(); ++row) {
            if (dataset[row].data[col].empty() || dataset[row].data[col] == "null" || dataset[row].data[col] == "NA" || dataset[row].data[col] == "NaN") {
                missing_count++;
            }
        }
        cout << "Column: " << dataset[0].data[col] << " | Missing: " << missing_count << " | Total: " << dataset.size() - 1 << endl;
    }
}
// string cpp_code = parse(tokens);
// get column profile 

void get_column_profile(const string& column) {
    int index = -1;
    for (size_t i = 0; i < dataset[0].data.size(); ++i) {
        if (dataset[0].data[i] == column) {
            index = i;
            break;
        }
    }

    if (index == -1) {
        cerr << "Error: Column not found: " << column << endl;
        return;
    }

    cout << "Column Profile for: " << column << "\n";
    set<string> unique_values;
    for (size_t i = 1; i < dataset.size(); ++i) {
        unique_values.insert(dataset[i].data[index]);
    }

    cout << "Unique Values: " << unique_values.size() << "\n";
    for (const auto& value : unique_values) {
        cout << value << "\n";
    }
}

// categorize column
void categorize_column(const string& column, const vector<string>& categories) {
    int index = -1;
    for (size_t i = 0; i < dataset[0].data.size(); ++i) {
        if (dataset[0].data[i] == column) {
            index = i;
            break;
        }
    }

    if (index == -1) {
        cerr << "Error: Column not found: " << column << endl;
        return;
    }

    for (size_t i = 1; i < dataset.size(); ++i) {
        if (find(categories.begin(), categories.end(), dataset[i].data[index]) == categories.end()) {
            dataset[i].data[index] = "Other";
        }
    }

    cout << "Categorized column: " << column << endl;
}

// pivot table 

void pivot_table(const string& index, const string& columns, const string& values) {
    cout << "Debug: Entering pivot_table with index: " << index << ", columns: " << columns << ", values: " << values << endl;

    // Find column indices
    int indexCol = -1, colCol = -1, valCol = -1;
    for (size_t i = 0; i < dataset[0].data.size(); ++i) {
        if (dataset[0].data[i] == index) indexCol = i;
        if (dataset[0].data[i] == columns) colCol = i;
        if (dataset[0].data[i] == values) valCol = i;
    }

    if (indexCol == -1 || colCol == -1 || valCol == -1) {
        cerr << "Error: One or more columns not found in dataset." << endl;
        return;
    }

    cout << "Debug: Column indices - indexCol: " << indexCol << ", colCol: " << colCol << ", valCol: " << valCol << endl;

    // Nested map: map<indexVal, map<colVal, sum>>
    map<string, map<string, double> > pivot;

    set<string> allColumns;

    for (size_t i = 1; i < dataset.size(); ++i) {
        cout << "Debug: Processing row " << i << endl;
        string rowIndex = dataset[i].data[indexCol];
        string colIndex = dataset[i].data[colCol];
        allColumns.insert(colIndex);

        try {
            double val = stod(dataset[i].data[valCol]);
            pivot[rowIndex][colIndex] += val;
        } catch (...) {
            cerr << "Warning: Skipping invalid value in row " << i << endl;
            continue;
        }
    }

    cout << "Debug: Finished processing rows" << endl;

    // Print header
    cout << index;
    for (const auto& colVal : allColumns)
        cout << "\t" << colVal;
    cout << endl;

    // Print pivot rows
    for (const auto& rowPair : pivot) {
        cout << rowPair.first;
        for (const auto& colVal : allColumns) {
            if (rowPair.second.find(colVal) != rowPair.second.end()) {
                cout << "\t" << rowPair.second.at(colVal);
            } else {
                cout << "\t0";  // Default value if key is missing
            }
        }
        cout << endl;
    }
}
// // Function to parse tokens and generate C++ code
// string parse_and_generate_cpp(const vector<string>& tokens) {
//     // Placeholder implementation for parsing and generating C++ code
//     string generated_code = "// Generated C++ code\n";
//     for (const auto& token : tokens) {
//         generated_code += "// Token: " + token + "\n";
//     }
//     return generated_code;
// }

void process_custom_code(const string& custom_code_file) {
    try {
        ifstream file(custom_code_file);
        if (!file.is_open()) {
            cerr << "Error: Could not open custom code file: " << custom_code_file << endl;
            return;
        }

        stringstream buffer;
        buffer << file.rdbuf();
        string input_code = buffer.str();
        file.close();

        cout << "Debug: Custom code loaded successfully." << endl;

        std::vector<Token> tokens = tokenize(input_code);
        std::cout << "Debug: Tokenization complete. Tokens generated: " << tokens.size() << std::endl;

        parse_and_generate(tokens);
        cout << "Debug: Parsing and C++ code generation complete." << endl;

        string compile_command = "g++ -std=c++11 -o program generated.cpp main.cpp tokenizer_parser.cpp";
        if (system(compile_command.c_str()) != 0) {
            cerr << "Error: Compilation failed." << endl;
            return;
        }

        cout << "\n🚀 Running generated program:\n";
        system("./program");
    }
    catch (const exception& e) {
        cerr << "Error in process_custom_code: " << e.what() << endl;
    }
}

// Add this function if it's not already defined
void print(const string& message) {
    cout << message << endl;
}
