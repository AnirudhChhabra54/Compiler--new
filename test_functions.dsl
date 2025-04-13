// Load test data
load_csv("test_data.csv")

// Test Text Preprocessing Functions
remove_stopwords("Comments")
stem_text("Feedback")
capitalize_words("Name")
count_words("Reviews")

// Test Time Series & Trends Functions
rolling_mean("Sales", 3)
resample_data("monthly")
detect_trends("Sales")
seasonal_decompose("Sales")
detect_anomalies("Sales")

// Test Profiling & Meta Info Functions
get_shape()
data_quality_report()
get_column_profile("Age")
categorize_column("Income")
describe()
