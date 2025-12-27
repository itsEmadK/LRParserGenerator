#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <unordered_map>
#include <vector>
using namespace std;
unordered_map<string, string> parse_json(const string& filename) {
    unordered_map<string, string> json_data;
    ifstream file(filename);
    if (!file.is_open()) {
        cout << "Unable to open file: " << filename << endl;
        return json_data;
    }
    string line;
    while (getline(file, line)) {
        size_t key_start = line.find("\"");
        size_t key_end = line.find("\"", key_start + 1);
        size_t value_start = line.find(":", key_end) + 1;
        size_t value_end = line.find("\n", value_start);
        if (key_start != string::npos && key_end != string::npos) {
            string key = line.substr(key_start + 1, key_end - key_start - 1);
            string value = line.substr(value_start, value_end - value_start);
            size_t first = value.find_first_not_of(" \t");
            size_t last = value.find_last_not_of(" \t");
            value = value.substr(first, (last - first + 1));
            json_data[key] = value;
        }
    }
    file.close();
    return json_data;
}
int main() {
    string filename = "parse-table.json";
    unordered_map<string, string> data = parse_json(filename);
    for (const auto& pair : data) {
        cout << pair.first << ": " << pair.second << endl;
    }
    return 0;
}
