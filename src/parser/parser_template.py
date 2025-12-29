import json
import sys


def load_json(path):
    with open(path, "r") as f:
        return json.load(f)


def terminate_with_error(state, token, pos):
    print("Syntax Error")
    print(f"State: {state}\nUnexpected token: {token}\nPosition: {pos}")
    sys.exit(1)


def apply_reduce(stack, rule_id, prod_map, table):
    lhs, rhs = prod_map[rule_id]

    pop_count = len(rhs) * 2
    for _ in range(pop_count):
        stack.pop()

    current_state = str(stack[-1])
    goto_entry = table[current_state][lhs]

    stack.extend([lhs, goto_entry["destination"]])


def main():
    if len(sys.argv) < 3:
        print('Usage: python parser.py parse-table.json "token1 token2 ..." [override.json]')
        sys.exit(1)

    table_path = sys.argv[1]
    input_tokens = sys.argv[2].split()
    override_path = sys.argv[3] if len(sys.argv) > 3 else None

    input_tokens.append("$")

    grammar_data = load_json(table_path)

    table = grammar_data["parseTable"]["_table"]
    production_rules = {
        str(p["productionNumber"]): (p["lhs"], p["rhs"])
        for p in grammar_data["productions"]
    }

    overrides = load_json(override_path) if override_path else {}

    parse_stack = [1]
    cursor = 0

    while True:
        current_state = str(parse_stack[-1])
        current_token = input_tokens[cursor]

        if current_state in overrides and current_token in overrides[current_state]:
            action = overrides[current_state][current_token]
        else:
            if current_state not in table or current_token not in table[current_state]:
                terminate_with_error(current_state, current_token, cursor)

            action = table[current_state][current_token]

            if isinstance(action, list):
                print(f"Error: conflict in state {current_state} with token {current_token}")
                sys.exit(1)

        kind = action["type"]

        if kind == "accept":
            print("Input Accepted")
            break

        if kind == "shift":
            parse_stack.extend([current_token, action["destination"]])
            cursor += 1
            continue

        if kind == "reduce":
            rule_key = str(action["ruleNumber"])
            apply_reduce(parse_stack, rule_key, production_rules, table)
            continue

        if kind == "shift_reduce":
            if "destination" in action:
                parse_stack.extend([current_token, action["destination"]])
                cursor += 1
            elif "ruleNumber" in action:
                rule_key = str(action["ruleNumber"])
                apply_reduce(parse_stack, rule_key, production_rules, table)
            else:
                print("Error: shift_reduce entry malformed")
                sys.exit(1)
            continue

        print(f"Unknown action type: {kind}")
        sys.exit(1)


if __name__ == "__main__":
    main()
