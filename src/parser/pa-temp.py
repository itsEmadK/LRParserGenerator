import json
import sys


def die(msg):
    print(msg)
    sys.exit(1)


def load_inputs():
    if len(sys.argv) < 3:
        die('Usage: python parser.py parse-table.json "token1 token2 ..."')

    with open(sys.argv[1]) as f:
        raw = json.load(f)

    tokens = sys.argv[2].split()
    tokens.append("$")

    table = raw["parseTable"]["_table"]
    prods = {
        str(p["productionNumber"]): (p["lhs"], p["rhs"])
        for p in raw["productions"]
    }

    return table, prods, tokens


def pop_rhs(stack, rhs):
    for _ in range(len(rhs) * 2):
        if not stack:
            die("Parser stack underflow during reduce")
        stack.pop()


def apply_reduce(stack, table, prods, rule):
    lhs, rhs = prods[rule]
    pop_rhs(stack, rhs)

    if not stack:
        die("Parser stack empty after reduce")

    top = str(stack[-1])
    goto = table[top][lhs]

    stack.append(lhs)
    stack.append(goto["destination"])


def main():
    parse_table, productions, tokens = load_inputs()

    stack = [1]
    pos = 0

    while True:
        state = str(stack[-1])
        lookahead = tokens[pos]

        row = parse_table.get(state)
        if row is None or lookahead not in row:
            die(f"Syntax Error\nState: {state}\nUnexpected token: {lookahead}\nPosition: {pos}")

        entry = row[lookahead]

        if isinstance(entry, list):
            die(f"Error: conflict in state {state} with token {lookahead}")

        kind = entry["type"]

        if kind == "accept":
            print("Input Accepted")
            return

        if kind == "shift":
            stack.extend([lookahead, entry["destination"]])
            pos += 1
            continue

        if kind == "reduce":
            apply_reduce(stack, parse_table, productions, str(entry["ruleNumber"]))
            continue

        if kind == "shift_reduce":
            if "destination" in entry:
                stack.extend([lookahead, entry["destination"]])
                pos += 1
            elif "ruleNumber" in entry:
                apply_reduce(stack, parse_table, productions, str(entry["ruleNumber"]))
            else:
                die("Error: shift_reduce entry malformed")
            continue

        die(f"Unknown action type: {kind}")


if __name__ == "__main__":
    main()
