#ifndef MAIN_H
#define MAIN_H

#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <sstream>
#include <cstdlib>
#include <numeric>
#include <algorithm>
#include <cmath>
#include <set>
#include <map>
#include "tokenizer_parser.h"

using namespace std;

// CSV Row structure
struct CSVRow {
    vector<string> data;
};

// Global data storage
extern vector<CSVRow> dataset;
extern double model_slope;
extern double model_intercept;

// Function declarations
bool is_numeric(const string& str);
void load_csv(const string& filename);
void print(const string& message);
void scatter_plot(const string& col1, const string& col2);
void remove_nulls();
void describe_data();
void save_csv(const string& filename);
void load_json(const string& filename);
void save_json(const string& filename);
void load_excel(const string& filename);
void fill_nulls(const string& value);
void rename_column(const string& old_name, const string& new_name);
void add_column(const string& column_name, const vector<string>& values);
void group_by_data(const string& column);
void merge_data(const vector<CSVRow>& other_dataset);
void pivot_table(const string& index, const string& columns, const string& values);
void mean(const string& column);
void correlation(const string& col1, const string& col2);
void standard_deviation(const string& column);
void median(const string& column);
void variance(const string& column);
void plot(const string& col1, const string& col2);
void bar_chart(const string& column);
void pie_chart(const string& column);
void histogram(const string& column);
void train_model();
void predict();
void save_model(const string& filename);
void evaluate_model();
void split_data(double train_ratio);
void normalize(const string& column);
void standardize(const string& column);
void scale_data(const string& column, double new_min, double new_max);
void encode_categorical(const string& column);
void log_transform(const string& column);
void remove_stopwords(const string& text_column);
void stem_text(const string& text_column);
void capitalize_words(const string& text_column);
void count_words(const string& text_column);
void rolling_mean(const string& column, int window_size);
void resample_data(const string& frequency);
void detect_trends(const string& column);
void seasonal_decompose(const string& column);
void detect_anomalies(const string& column);
void get_shape();
void data_quality_report();
void get_column_profile(const string& column);
void categorize_column(const string& column);
void drop_column(const string& column_name);
void filter_rows(const string& column_name, const string& value);
void sort_data(const string& column_name, bool ascending = true);
void train_model(const string& feature, const string& target);
void describe();
void execute_generated_code();
void process_custom_code(const string& custom_code_file);

#endif // MAIN_H
