import json
import sys

if len(sys.argv) < 3:
    print("Usage: python parser.py parse-table.json \"token1 token2 ...\"")
    sys.exit(1)

table_file = sys.argv[1]
tokens = sys.argv[2].split() + ["$"]

with open(table_file) as f:
    data = json.load(f)

parse_table = data["parseTable"]["_table"]
productions = {str(p["productionNumber"]): (p["lhs"], p["rhs"]) for p in data["productions"]}


stack = [1]
index = 0

while True:
    state = str(stack[-1])
    token = tokens[index]
    if state not in parse_table or token not in parse_table[state]:
        print("Syntax Error")
        print(f"State: {state}\nUnexpected token: {token}\nPosition: {index}")
        sys.exit(1)
    entry = parse_table[state][token]
    if isinstance(entry, list):
        print(f"Error: conflict in state {state} with token {token}")
        sys.exit(1)

    action_type = entry["type"]

    if action_type == "accept":
        print("Input Accepted")
        break

    elif action_type == "shift":
        stack.append(token)
        stack.append(entry["destination"])
        index += 1

    elif action_type == "reduce":
        rule_num = str(entry["ruleNumber"])
        lhs, rhs = productions[rule_num]
        for _ in range(len(rhs) * 2):
            stack.pop()
        top_state = str(stack[-1])
        goto = parse_table[top_state][lhs]
        stack.append(lhs)
        stack.append(goto["destination"])

    elif action_type == "shift_reduce":
        if "destination" in entry:
            stack.append(token)
            stack.append(entry["destination"])
            index += 1
        elif "ruleNumber" in entry:
            rule_num = str(entry["ruleNumber"])
            lhs, rhs = productions[rule_num]
            for _ in range(len(rhs) * 2):
                stack.pop()
            top_state = str(stack[-1])
            goto = parse_table[top_state][lhs]
            stack.append(lhs)
            stack.append(goto["destination"])
        else:
            print("Error: shift_reduce entry malformed")
            sys.exit(1)

    else:
        print(f"Unknown action type: {action_type}")
        sys.exit(1)