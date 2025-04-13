#include "main.h"
#include "tokenizer_parser.h"
#include <iostream>
#include <iomanip>
#include <fstream>
#include <sstream>
#include <vector>
#include <map>
#include <set>
#include <algorithm>
#include <cmath>
#include <regex>

using namespace std;

// Global data storage
vector<CSVRow> dataset;
double model_slope = 0.0, model_intercept = 0.0;

// Helper functions
void tokenize_column(const string& text_column) {
    cout << "Tokenizing column: " << text_column << endl;
}

bool is_numeric_strict(const string& s) {
    if (s.empty()) return false;

    try {
        size_t idx;
        stod(s, &idx);
        return idx == s.length();
    } catch (...) {
        return false;
    }
}

double safe_stod(const string& s) {
    try {
        return stod(s);
    } catch (const std::invalid_argument&) {
        return 0.0;
    } catch (const std::out_of_range&) {
        return 0.0;
    }
}

// Additional functions that were missing
void remove_nulls() {
    vector<CSVRow> cleaned;

    if (!dataset.empty()) {
        cleaned.push_back(dataset[0]);
    }

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

    cout << "Dataset Summary:" << endl;
    cout << "Number of rows: " << dataset.size() - 1 << endl;
    cout << "Number of columns: " << dataset[0].data.size() << endl;
    cout << "\nColumns:" << endl;

    for (size_t col = 0; col < dataset[0].data.size(); col++) {
        cout << "\n" << dataset[0].data[col] << ":" << endl;

        vector<double> numeric_values;
        bool is_numeric = true;

        for (size_t row = 1; row < dataset.size(); row++) {
            try {
                numeric_values.push_back(stod(dataset[row].data[col]));
            } catch (...) {
                is_numeric = false;
                break;
            }
        }

        if (is_numeric && !numeric_values.empty()) {
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
            set<string> unique_values;
            for (size_t row = 1; row < dataset.size(); row++) {
                unique_values.insert(dataset[row].data[col]);
            }
            cout << "  Type: Categorical" << endl;
            cout << "  Unique values: " << unique_values.size() << endl;
        }
    }
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

void plot(const string& col1, const string& col2) {
    cout << "Plotting " << col1 << " vs " << col2 << " (Placeholder for actual plotting)" << endl;
    
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
            continue;
        }
    }
    plotData.close();

    // Create gnuplot script
    ofstream script("plot_script.plt");
    script << "set terminal png" << endl;
    script << "set output 'plot.png'" << endl;
    script << "set title 'Plot: " << col1 << " vs " << col2 << "'" << endl;
    script << "set xlabel \"" << col1 << "\"" << endl;
    script << "set ylabel \"" << col2 << "\"" << endl;
    script << "plot 'plot_data.txt' using 1:2 with lines title 'Data'" << endl;
    script.close();

    // Execute gnuplot
    system("gnuplot plot_script.plt");
    cout << "Plot generated as plot.png" << endl;
}

void train_model(const string& feature, const string& target) {
    cout << "Training model with feature: " << feature << " and target: " << target << endl;
    
    // Find column indices
    int feature_idx = -1, target_idx = -1;
    for (size_t i = 0; i < dataset[0].data.size(); i++) {
        if (dataset[0].data[i] == feature) feature_idx = i;
        if (dataset[0].data[i] == target) target_idx = i;
    }

    if (feature_idx == -1 || target_idx == -1) {
        cerr << "Error: Feature or target column not found" << endl;
        return;
    }

    vector<double> X, Y;
    for (size_t i = 1; i < dataset.size(); i++) {
        try {
            X.push_back(stod(dataset[i].data[feature_idx]));
            Y.push_back(stod(dataset[i].data[target_idx]));
        } catch (...) {
            continue;
        }
    }

    if (X.empty() || Y.empty()) {
        cerr << "Error: No valid numeric data found" << endl;
        return;
    }

    // Simple linear regression
    double sum_x = 0, sum_y = 0, sum_xy = 0, sum_xx = 0;
    size_t n = X.size();

    for (size_t i = 0; i < n; i++) {
        sum_x += X[i];
        sum_y += Y[i];
        sum_xy += X[i] * Y[i];
        sum_xx += X[i] * X[i];
    }

    model_slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
    model_intercept = (sum_y - model_slope * sum_x) / n;

    cout << "Model trained successfully" << endl;
    cout << "Equation: y = " << model_slope << "x + " << model_intercept << endl;
}

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

void scatter_plot(const string& col1, const string& col2) {
    // Find column indices
    int idx1 = -1, idx2 = -1;
    for (size_t i = 0; i < dataset[0].data.size(); i++) {
        if (dataset[0].data[i] == col1) idx1 = i;
        if (dataset[0].data[i] == col2) idx2 = i;
    }

    if (idx1 == -1 || idx2 == -1) {
        cerr << "Error: One or both columns not found" << endl;
        return;
    }

    // Create a temporary file for gnuplot
    ofstream plotData("scatter_data.txt");
    for (size_t i = 1; i < dataset.size(); i++) {
        try {
            double x = stod(dataset[i].data[idx1]);
            double y = stod(dataset[i].data[idx2]);
            plotData << x << " " << y << endl;
        } catch (...) {
            continue;
        }
    }
    plotData.close();

    // Create gnuplot script
    ofstream script("scatter_script.plt");
    script << "set terminal png" << endl;
    script << "set output 'scatter_plot.png'" << endl;
    script << "set title 'Scatter Plot: " << col1 << " vs " << col2 << "'" << endl;
    script << "set xlabel \"" << col1 << "\"" << endl;
    script << "set ylabel \"" << col2 << "\"" << endl;
    script << "plot 'scatter_data.txt' using 1:2 with points title 'Data Points'" << endl;
    script.close();

    // Execute gnuplot
    system("gnuplot scatter_script.plt");
    cout << "Scatter plot generated as scatter_plot.png" << endl;
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

    // Create data file for gnuplot
    ofstream plotData("bar_data.txt");
    int count = 0;
    for (const auto& p : freq) {
        plotData << count << " " << p.second << " \"" << p.first << "\"" << endl;
        count++;
    }
    plotData.close();

    // Create gnuplot script
    ofstream script("bar_script.plt");
    script << "set terminal png" << endl;
    script << "set output 'bar_chart.png'" << endl;
    script << "set title 'Bar Chart: " << column << "'" << endl;
    script << "set style data histogram" << endl;
    script << "set style fill solid" << endl;
    script << "set xtics rotate by -45" << endl;
    script << "plot 'bar_data.txt' using 2:xtic(3) title '" << column << "'" << endl;
    script.close();

    // Execute gnuplot
    system("gnuplot bar_script.plt");
    cout << "Bar chart generated as bar_chart.png" << endl;
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

    // Create data file for gnuplot
    ofstream plotData("pie_data.txt");
    double cumsum = 0;
    for (const auto& p : freq) {
        double percentage = (double)p.second / total * 100;
        plotData << cumsum << " " << percentage << " \"" << p.first << " (" << percentage << "%)\"" << endl;
        cumsum += percentage;
    }
    plotData.close();

    // Create gnuplot script
    ofstream script("pie_script.plt");
    script << "set terminal png" << endl;
    script << "set output 'pie_chart.png'" << endl;
    script << "set title 'Pie Chart: " << column << "'" << endl;
    script << "set size square" << endl;
    script << "set style data histogram" << endl;
    script << "set style fill solid" << endl;
    script << "unset xtics" << endl;
    script << "unset ytics" << endl;
    script << "set angles degrees" << endl;
    script << "plot 'pie_data.txt' using 1:2:3 with labels center offset 0,1 title '', '' using 1:2 smooth cumulative with circles lc rgb 'blue' notitle" << endl;
    script.close();

    // Execute gnuplot
    system("gnuplot pie_script.plt");
    cout << "Pie chart generated as pie_chart.png" << endl;
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
        cerr << "No numeric data found in column." << endl;
        return;
    }

    // Create data file for gnuplot
    ofstream plotData("hist_data.txt");
    for (double value : values) {
        plotData << value << endl;
    }
    plotData.close();

    // Create gnuplot script
    ofstream script("hist_script.plt");
    script << "set terminal png" << endl;
    script << "set output 'histogram.png'" << endl;
    script << "set title 'Histogram: " << column << "'" << endl;
    script << "set style data histogram" << endl;
    script << "set style fill solid" << endl;
    script << "binwidth = " << (values.back() - values.front()) / 10 << endl;
    script << "bin(x,width)=width*floor(x/width)" << endl;
    script << "plot 'hist_data.txt' using (bin($1,binwidth)):(1.0) smooth freq with boxes title '" << column << "'" << endl;
    script.close();

    // Execute gnuplot
    system("gnuplot hist_script.plt");
    cout << "Histogram generated as histogram.png" << endl;
}

void split_data(double train_ratio) {
    if (train_ratio <= 0 || train_ratio >= 1) {
        cerr << "Error: Train ratio must be between 0 and 1." << endl;
        return;
    }

    size_t train_size = static_cast<size_t>((dataset.size() - 1) * train_ratio);
    cout << "Split data with train ratio: " << train_ratio << endl;
    cout << "Training set size: " << train_size << " samples" << endl;
    cout << "Test set size: " << (dataset.size() - 1 - train_size) << " samples" << endl;
}

void normalize(const string& column) {
    int index = -1;
    for (size_t i = 0; i < dataset[0].data.size(); ++i)
        if (dataset[0].data[i] == column) index = i;

    if (index == -1) {
        cerr << "Error: Column " << column << " not found." << endl;
        return;
    }

    // Collect numeric values
    vector<double> values;
    for (size_t i = 1; i < dataset.size(); ++i) {
        try {
            values.push_back(stod(dataset[i].data[index]));
        } catch (...) {
            continue;
        }
    }

    if (values.empty()) {
        cerr << "Error: No numeric data found in column " << column << endl;
        return;
    }

    // Find min and max
    double min_val = *min_element(values.begin(), values.end());
    double max_val = *max_element(values.begin(), values.end());
    double range = max_val - min_val;

    if (range == 0) {
        cerr << "Warning: Column has zero range, skipping normalization" << endl;
        return;
    }

    // Normalize values between 0 and 1
    size_t value_index = 0;
    for (size_t i = 1; i < dataset.size(); ++i) {
        try {
            double original = stod(dataset[i].data[index]);
            double normalized = (original - min_val) / range;
            dataset[i].data[index] = to_string(normalized);
            value_index++;
        } catch (...) {
            continue;
        }
    }

    cout << "Column " << column << " normalized successfully" << endl;
}

void evaluate_model() {
    if (model_slope == 0.0 && model_intercept == 0.0) {
        cerr << "Error: No trained model found. Please train the model first." << endl;
        return;
    }

    // Calculate R-squared and Mean Squared Error
    double ss_total = 0.0;  // Total sum of squares
    double ss_residual = 0.0;  // Residual sum of squares
    double y_mean = 0.0;
    vector<double> actual_values;
    vector<double> predicted_values;

    // First pass: calculate mean of actual values
    for (size_t i = 1; i < dataset.size(); ++i) {
        try {
            double actual = stod(dataset[i].data[dataset[0].data.size() - 1]);  // Assuming target is last column
            actual_values.push_back(actual);
            y_mean += actual;
        } catch (...) {
            continue;
        }
    }
    y_mean /= actual_values.size();

    // Second pass: calculate R-squared and MSE
    for (size_t i = 0; i < actual_values.size(); ++i) {
        double predicted = model_slope * i + model_intercept;
        predicted_values.push_back(predicted);
        
        ss_total += pow(actual_values[i] - y_mean, 2);
        ss_residual += pow(actual_values[i] - predicted, 2);
    }

    double r_squared = 1 - (ss_residual / ss_total);
    double mse = ss_residual / actual_values.size();

    cout << "Model Evaluation Metrics:" << endl;
    cout << "R-squared: " << r_squared << endl;
    cout << "Mean Squared Error: " << mse << endl;
    cout << "Root Mean Squared Error: " << sqrt(mse) << endl;
}

void save_model(const string& filename) {
    ofstream model_file(filename);
    if (!model_file.is_open()) {
        cerr << "Error: Could not open file " << filename << " for writing" << endl;
        return;
    }

    // Save model parameters
    model_file << "model_type: linear_regression" << endl;
    model_file << "slope: " << model_slope << endl;
    model_file << "intercept: " << model_intercept << endl;

    model_file.close();
    cout << "Model saved successfully to " << filename << endl;
}

void predict() {
    if (model_slope == 0.0 && model_intercept == 0.0) {
        cerr << "Error: No trained model found. Please train the model first." << endl;
        return;
    }

    cout << "Making predictions using the trained model:" << endl;
    cout << "Model equation: y = " << model_slope << "x + " << model_intercept << endl;
    
    // Make predictions for the test set
    cout << "\nPredictions:" << endl;
    cout << "X\tPredicted Y" << endl;
    cout << "-------------------" << endl;
    
    for (size_t i = 1; i < dataset.size(); ++i) {
        try {
            double x = stod(dataset[i].data[0]);  // Assuming feature is first column
            double predicted_y = model_slope * x + model_intercept;
            cout << x << "\t" << predicted_y << endl;
        } catch (...) {
            continue;
        }
    }
}

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

void get_shape() {
    if (dataset.empty()) {
        cout << "Dataset is empty." << endl;
        return;
    }

    cout << "Dataset shape: " << dataset.size() - 1 << " rows x " << dataset[0].data.size() << " columns" << endl;
}

void data_quality_report() {
    if (dataset.empty()) {
        cout << "Dataset is empty." << endl;
        return;
    }

    cout << "Data Quality Report:\n";
    for (size_t col = 0; col < dataset[0].data.size(); ++col) {
        int missing_count = 0;
        for (size_t row = 1; row < dataset.size(); ++row) {
            if (dataset[row].data[col].empty() || dataset[row].data[col] == "null" || 
                dataset[row].data[col] == "NA" || dataset[row].data[col] == "NaN") {
                missing_count++;
            }
        }
        cout << "Column: " << dataset[0].data[col] << " | Missing: " << missing_count 
             << " | Total: " << dataset.size() - 1 << endl;
    }
}

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

void categorize_column(const string& column) {
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

    set<string> categories;
    for (size_t i = 1; i < dataset.size(); ++i) {
        categories.insert(dataset[i].data[index]);
    }

    cout << "Categories in column " << column << ":\n";
    for (const auto& category : categories) {
        cout << "- " << category << "\n";
    }
}

void pivot_table(const string& index, const string& columns, const string& values) {
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

    map<string, map<string, double>> pivot;
    set<string> allColumns;

    for (size_t i = 1; i < dataset.size(); ++i) {
        string rowIndex = dataset[i].data[indexCol];
        string colIndex = dataset[i].data[colCol];
        allColumns.insert(colIndex);

        try {
            double val = stod(dataset[i].data[valCol]);
            pivot[rowIndex][colIndex] += val;
        } catch (...) {
            continue;
        }
    }

    cout << index;
    for (const auto& colVal : allColumns)
        cout << "\t" << colVal;
    cout << endl;

    for (const auto& rowPair : pivot) {
        cout << rowPair.first;
        for (const auto& colVal : allColumns) {
            if (rowPair.second.find(colVal) != rowPair.second.end()) {
                cout << "\t" << rowPair.second.at(colVal);
            } else {
                cout << "\t0";
            }
        }
        cout << endl;
    }
}

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

void sort_data(const string& column_name, bool ascending) {
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

    // Validate each row's data
    for (size_t i = 1; i < dataset.size(); ++i) {
        if (dataset[i].data.size() != dataset[0].data.size()) {
            cerr << "Error: Row " << i << " has an incorrect number of columns." << endl;
            return;
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
}

void standardize(const string& column) {
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

    double mean_val = accumulate(values.begin(), values.end(), 0.0) / values.size();
    double sum_sq = 0;
    for (double val : values) {
        sum_sq += (val - mean_val) * (val - mean_val);
    }
    double std_dev = sqrt(sum_sq / values.size());

    for (size_t i = 1; i < dataset.size(); ++i) {
        try {
            double val = stod(dataset[i].data[index]);
            dataset[i].data[index] = to_string((val - mean_val) / std_dev);
        } catch (...) {}
    }

    cout << "Standardized column: " << column << endl;
}

// Text Preprocessing Functions
void remove_stopwords(const string& column) {
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

    // Common English stopwords
    set<string> stopwords = {"a", "an", "and", "are", "as", "at", "be", "by", "for", "from", 
                           "has", "he", "in", "is", "it", "its", "of", "on", "that", "the", 
                           "to", "was", "were", "will", "with"};

    for (size_t i = 1; i < dataset.size(); ++i) {
        string text = dataset[i].data[index];
        transform(text.begin(), text.end(), text.begin(), ::tolower);
        
        stringstream ss(text);
        string word;
        string result;
        
        while (ss >> word) {
            if (stopwords.find(word) == stopwords.end()) {
                result += word + " ";
            }
        }
        
        if (!result.empty()) {
            result.pop_back(); // Remove trailing space
        }
        
        dataset[i].data[index] = result;
    }
    
    cout << "Removed stopwords from column: " << column << endl;
}

void stem_text(const string& column) {
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

    // Simple stemming rules
    vector<pair<string, string>> rules = {
        {"ing$", ""}, {"ly$", ""}, {"ed$", ""}, {"ation$", "ate"},
        {"ness$", ""}, {"ment$", ""}, {"ful$", ""}, {"est$", ""},
        {"ity$", ""}, {"ies$", "y"}
    };

    for (size_t i = 1; i < dataset.size(); ++i) {
        string text = dataset[i].data[index];
        stringstream ss(text);
        string word;
        string result;

        while (ss >> word) {
            // Apply stemming rules
            for (const auto& rule : rules) {
                std::regex pattern(rule.first);
                word = std::regex_replace(word, pattern, rule.second);
            }
            result += word + " ";
        }

        if (!result.empty()) {
            result.pop_back(); // Remove trailing space
        }

        dataset[i].data[index] = result;
    }

    cout << "Applied stemming to column: " << column << endl;
}

void capitalize_words(const string& column) {
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
        string& text = dataset[i].data[index];
        bool new_word = true;
        
        for (size_t j = 0; j < text.length(); ++j) {
            if (isspace(text[j])) {
                new_word = true;
            } else if (new_word) {
                text[j] = toupper(text[j]);
                new_word = false;
            } else {
                text[j] = tolower(text[j]);
            }
        }
    }

    cout << "Capitalized words in column: " << column << endl;
}

void count_words(const string& column) {
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

    cout << "Word counts in column " << column << ":" << endl;
    for (size_t i = 1; i < dataset.size(); ++i) {
        stringstream ss(dataset[i].data[index]);
        string word;
        int count = 0;
        while (ss >> word) {
            count++;
        }
        cout << "Row " << i << ": " << count << " words" << endl;
    }
}

// Time Series Functions
void rolling_mean(const string& column, int window_size) {
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
        } catch (...) {
            cerr << "Error: Non-numeric value found in row " << i << endl;
            return;
        }
    }

    if (window_size > static_cast<int>(values.size())) {
        cerr << "Error: Window size larger than data size" << endl;
        return;
    }

    vector<double> rolling_means;
    for (size_t i = 0; i <= values.size() - window_size; ++i) {
        double sum = 0;
        for (int j = 0; j < window_size; ++j) {
            sum += values[i + j];
        }
        rolling_means.push_back(sum / window_size);
    }

    cout << "Rolling mean (window size " << window_size << ") for " << column << ":" << endl;
    for (size_t i = 0; i < rolling_means.size(); ++i) {
        cout << "Position " << (i + window_size) << ": " << rolling_means[i] << endl;
    }
}

void resample_data(const string& frequency) {
    cout << "Resampling data to " << frequency << " frequency" << endl;
    // Implementation would require actual date/time handling
    cout << "Note: This is a placeholder. Full implementation requires datetime processing" << endl;
}

void detect_trends(const string& column) {
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
        } catch (...) {
            cerr << "Error: Non-numeric value found in row " << i << endl;
            return;
        }
    }

    if (values.size() < 2) {
        cerr << "Error: Insufficient data for trend detection" << endl;
        return;
    }

    // Simple trend detection using linear regression
    double sum_x = 0, sum_y = 0, sum_xy = 0, sum_xx = 0;
    int n = values.size();

    for (int i = 0; i < n; ++i) {
        sum_x += i;
        sum_y += values[i];
        sum_xy += i * values[i];
        sum_xx += i * i;
    }

    double slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
    
    cout << "Trend analysis for " << column << ":" << endl;
    if (slope > 0.1) {
        cout << "Upward trend detected (slope: " << slope << ")" << endl;
    } else if (slope < -0.1) {
        cout << "Downward trend detected (slope: " << slope << ")" << endl;
    } else {
        cout << "No significant trend detected (slope: " << slope << ")" << endl;
    }
}

void seasonal_decompose(const string& column) {
    cout << "Performing seasonal decomposition for column: " << column << endl;
    cout << "Note: Full implementation requires seasonal decomposition algorithms" << endl;
}

void detect_anomalies(const string& column) {
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
        } catch (...) {
            cerr << "Error: Non-numeric value found in row " << i << endl;
            return;
        }
    }

    if (values.size() < 2) {
        cerr << "Error: Insufficient data for anomaly detection" << endl;
        return;
    }

    // Calculate mean and standard deviation
    double sum = accumulate(values.begin(), values.end(), 0.0);
    double mean = sum / values.size();

    double sq_sum = 0;
    for (double val : values) {
        sq_sum += (val - mean) * (val - mean);
    }
    double std_dev = sqrt(sq_sum / values.size());

    // Detect anomalies using 3-sigma rule
    cout << "Anomalies detected in " << column << " (using 3-sigma rule):" << endl;
    for (size_t i = 0; i < values.size(); ++i) {
        if (abs(values[i] - mean) > 3 * std_dev) {
            cout << "Row " << (i + 1) << ": " << values[i] << " (anomaly)" << endl;
        }
    }
}

void describe() {
    if (dataset.empty()) {
        cout << "Dataset is empty" << endl;
        return;
    }

    cout << "\nDataset Description:" << endl;
    cout << "===================" << endl;
    cout << "Number of rows: " << dataset.size() - 1 << endl;
    cout << "Number of columns: " << dataset[0].data.size() << endl;

    for (size_t col = 0; col < dataset[0].data.size(); col++) {
        vector<double> numeric_values;
        bool is_numeric = true;

        // Try to convert all values to numbers
        for (size_t row = 1; row < dataset.size(); row++) {
            try {
                numeric_values.push_back(stod(dataset[row].data[col]));
            } catch (...) {
                is_numeric = false;
                break;
            }
        }

        cout << "\nColumn: " << dataset[0].data[col] << endl;
        if (is_numeric && !numeric_values.empty()) {
            // Calculate statistics for numeric columns
            double sum = accumulate(numeric_values.begin(), numeric_values.end(), 0.0);
            double mean = sum / numeric_values.size();

            vector<double> sorted_values = numeric_values;
            sort(sorted_values.begin(), sorted_values.end());
            double median = sorted_values[sorted_values.size() / 2];

            double sq_sum = 0;
            for (double val : numeric_values) {
                sq_sum += (val - mean) * (val - mean);
            }
            double std_dev = sqrt(sq_sum / numeric_values.size());

            cout << "Type: Numeric" << endl;
            cout << "Count: " << numeric_values.size() << endl;
            cout << "Mean: " << mean << endl;
            cout << "Median: " << median << endl;
            cout << "Std Dev: " << std_dev << endl;
            cout << "Min: " << sorted_values.front() << endl;
            cout << "Max: " << sorted_values.back() << endl;
        } else {
            // For non-numeric columns, show unique values and frequencies
            map<string, int> value_counts;
            for (size_t row = 1; row < dataset.size(); row++) {
                value_counts[dataset[row].data[col]]++;
            }

            cout << "Type: Categorical" << endl;
            cout << "Unique Values: " << value_counts.size() << endl;
            cout << "Value Counts:" << endl;
            for (const auto& pair : value_counts) {
                cout << "  " << pair.first << ": " << pair.second << endl;
            }
        }
    }
}

void print(const string& message) {
    cout << message << endl;
}
