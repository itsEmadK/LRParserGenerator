#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <unordered_map>
#include "json.hpp"

using json = nlohmann::json;
using namespace std;

int main(int argc, char* argv[]) {
    if (argc < 3) {
        cout << "Usage: parser parse-table.json \"token1 token2 ...\" [override.json]\n";
        return 1;
    }

    string table_file = argv[1];
    string token_string = argv[2];
    string override_file = (argc > 3) ? argv[3] : "";

    /* tokenize input */
    vector<string> tokens;
    string temp;
    for (char c : token_string) {
        if (c == ' ') {
            if (!temp.empty()) {
                tokens.push_back(temp);
                temp.clear();
            }
        } else {
            temp += c;
        }
    }
    if (!temp.empty()) tokens.push_back(temp);
    tokens.push_back("$");

    /* load parse table */
    ifstream f(table_file);
    if (!f.is_open()) {
        cout << "Cannot open " << table_file << endl;
        return 1;
    }

    json data;
    f >> data;

    auto parse_table = data["parseTable"]["_table"];

    unordered_map<string, pair<string, vector<string>>> productions;
    for (auto& p : data["productions"]) {
        string num = to_string((int)p["productionNumber"]);
        string lhs = p["lhs"];
        vector<string> rhs = p["rhs"].get<vector<string>>();
        productions[num] = { lhs, rhs };
    }

    /* load override table if exists */
    json override_table;
    if (!override_file.empty()) {
        ifstream of(override_file);
        if (!of.is_open()) {
            cout << "Cannot open override file\n";
            return 1;
        }
        of >> override_table;
    }

    vector<string> stack;
    stack.push_back("1");
    int index = 0;

    while (true) {
        string state = stack.back();
        string token = tokens[index];

        json entry;

        if (!override_file.empty() &&
            override_table.contains(state) &&
            override_table[state].contains(token)) {
            entry = override_table[state][token];
        } else {
            if (!parse_table.contains(state) ||
                !parse_table[state].contains(token)) {
                cout << "Syntax Error\n";
                cout << "State: " << state
                     << "\nUnexpected token: " << token
                     << "\nPosition: " << index << endl;
                return 1;
            }
            entry = parse_table[state][token];
            if (entry.is_array()) {
                cout << "Error: conflict in state "
                     << state << " with token " << token << endl;
                return 1;
            }
        }

        string action_type = entry["type"];

        if (action_type == "accept") {
            cout << "Input Accepted\n";
            break;
        }

        else if (action_type == "shift") {
            stack.push_back(token);
            stack.push_back(to_string((int)entry["destination"]));
            index++;
        }

        else if (action_type == "reduce") {
            string rule_num = to_string((int)entry["ruleNumber"]);
            auto [lhs, rhs] = productions[rule_num];

            for (size_t i = 0; i < rhs.size() * 2; i++)
                stack.pop_back();

            string top_state = stack.back();
            auto go = parse_table[top_state][lhs];
            stack.push_back(lhs);
            stack.push_back(to_string((int)go["destination"]));
        }

        else if (action_type == "shift_reduce") {
            if (entry.contains("destination")) {
                stack.push_back(token);
                stack.push_back(to_string((int)entry["destination"]));
                index++;
            }
            else if (entry.contains("ruleNumber")) {
                string rule_num = to_string((int)entry["ruleNumber"]);
                auto [lhs, rhs] = productions[rule_num];

                for (size_t i = 0; i < rhs.size() * 2; i++)
                    stack.pop_back();

                string top_state = stack.back();
                auto go = parse_table[top_state][lhs];
                stack.push_back(lhs);
                stack.push_back(to_string((int)go["destination"]));
            }
            else {
                cout << "Error: shift_reduce entry malformed\n";
                return 1;
            }
        }

        else {
            cout << "Unknown action type: " << action_type << endl;
            return 1;
        }
    }

    return 0;
}
