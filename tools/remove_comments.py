import os


FRONTEND_ROOT = "frontend"
BACKEND_ROOT = "backend"

JS_EXTENSIONS = {".js", ".jsx", ".ts", ".tsx"}
PY_EXTENSION = ".py"


def remove_js_comments(content: str) -> str:
    result = []
    i = 0
    n = len(content)
    in_single = False
    in_double = False
    in_template = False
    in_line_comment = False
    in_block_comment = False

    while i < n:
        c = content[i]
        nxt = content[i + 1] if i + 1 < n else ""

        if in_line_comment:
            if c == "\n":
                in_line_comment = False
                result.append(c)
            i += 1
            continue

        if in_block_comment:
            if c == "*" and nxt == "/":
                in_block_comment = False
                i += 2
            else:
                i += 1
            continue

        if in_single:
            result.append(c)
            if c == "\\":
                if i + 1 < n:
                    result.append(content[i + 1])
                    i += 2
                else:
                    i += 1
            elif c == "'":
                in_single = False
                i += 1
            else:
                i += 1
            continue

        if in_double:
            result.append(c)
            if c == "\\":
                if i + 1 < n:
                    result.append(content[i + 1])
                    i += 2
                else:
                    i += 1
            elif c == '"':
                in_double = False
                i += 1
            else:
                i += 1
            continue

        if in_template:
            result.append(c)
            if c == "\\":
                if i + 1 < n:
                    result.append(content[i + 1])
                    i += 2
                else:
                    i += 1
            elif c == "`":
                in_template = False
                i += 1
            else:
                i += 1
            continue

        if c == "/" and nxt:
            if nxt == "/":
                in_line_comment = True
                i += 2
                continue
            if nxt == "*":
                in_block_comment = True
                i += 2
                continue

        if c == "'":
            in_single = True
            result.append(c)
            i += 1
            continue

        if c == '"':
            in_double = True
            result.append(c)
            i += 1
            continue

        if c == "`":
            in_template = True
            result.append(c)
            i += 1
            continue

        result.append(c)
        i += 1

    return "".join(result)


def remove_empty_object_lines(content: str) -> str:
    lines = content.splitlines(keepends=True)
    new_lines = []
    changed = False
    for line in lines:
        if line.strip() == "{}":
            changed = True
            continue
        new_lines.append(line)
    return "".join(new_lines) if changed else content


def remove_python_comments(content: str) -> str:
    result = []
    in_string = False
    string_delim = ""
    i = 0
    n = len(content)

    while i < n:
        c = content[i]
        nxt = content[i + 1] if i + 1 < n else ""
        nxt2 = content[i + 2] if i + 2 < n else ""

        if in_string:
            result.append(c)
            if c == "\\":
                if i + 1 < n:
                    result.append(content[i + 1])
                    i += 2
                else:
                    i += 1
            else:
                if string_delim in {"'", '"'}:
                    if c == string_delim:
                        in_string = False
                else:
                    if c == string_delim[0] and nxt == string_delim[1] and nxt2 == string_delim[2]:
                        result.append(nxt)
                        result.append(nxt2)
                        in_string = False
                        i += 3
                        continue
                i += 1
            continue

        if c == "#":
            while i < n and content[i] != "\n":
                i += 1
            continue

        if c in {"'", '"'}:
            if nxt == c and nxt2 == c:
                in_string = True
                string_delim = c * 3
                result.append(c)
                result.append(nxt)
                result.append(nxt2)
                i += 3
                continue
            else:
                in_string = True
                string_delim = c
                result.append(c)
                i += 1
                continue

        result.append(c)
        i += 1

    return "".join(result)


def remove_env_comments(content: str) -> str:
    result = []
    in_single = False
    in_double = False

    for line in content.splitlines(keepends=True):
        stripped = line.lstrip()
        if stripped.startswith("#"):
            continue

        new_line_chars = []
        for ch in line:
            if ch in ("\n", "\r"):
                new_line_chars.append(ch)
                break

            if in_single:
                new_line_chars.append(ch)
                if ch == "\\":
                    continue
                if ch == "'":
                    in_single = False
                continue

            if in_double:
                new_line_chars.append(ch)
                if ch == "\\":
                    continue
                if ch == '"':
                    in_double = False
                continue

            if ch == "'":
                in_single = True
                new_line_chars.append(ch)
                continue

            if ch == '"':
                in_double = True
                new_line_chars.append(ch)
                continue

            if ch == "#":
                break

            new_line_chars.append(ch)

        result.append("".join(new_line_chars))

    return "".join(result)


def process_file(path: str) -> None:
    base = os.path.basename(path)
    _, ext = os.path.splitext(path)

    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    if ext in JS_EXTENSIONS:
        new_content = remove_js_comments(content)
        new_content = remove_empty_object_lines(new_content)
    elif ext == PY_EXTENSION:
        new_content = remove_python_comments(content)
    elif base == ".env.example":
        new_content = remove_env_comments(content)
    else:
        return

    if new_content != content:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)


def main() -> None:
    for root, _, files in os.walk(FRONTEND_ROOT):
        if "node_modules" in root or os.path.join("frontend", "dist") in root:
            continue
        for name in files:
            _, ext = os.path.splitext(name)
            if ext in JS_EXTENSIONS:
                process_file(os.path.join(root, name))

    for root, _, files in os.walk(BACKEND_ROOT):
        if "__pycache__" in root:
            continue
        for name in files:
            if name.endswith(".py"):
                process_file(os.path.join(root, name))


if __name__ == "__main__":
    main()
