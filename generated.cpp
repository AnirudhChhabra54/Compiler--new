#include "main.h"
using namespace std;

int main() {
    try {
    load_csv("data.csv");
    sort_data("Age", true);
    print("Processing complete");
        return 0;
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
}
