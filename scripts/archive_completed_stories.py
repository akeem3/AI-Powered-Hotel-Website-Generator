import os
import re
import shutil

FILES_TO_ARCHIVE = [
    # Stories
    "docs/stories/1.1.story.md",
    "docs/stories/1.2.story.md",
    "docs/stories/1.3.story.md",
    "docs/stories/1.4.story.md",
    "docs/stories/1.5.story.md",
    "docs/stories/1.6.story.md",
    "docs/stories/1.7.story.md",
    "docs/stories/1.8.story.md",
    "docs/stories/1.9.story.md",
    "docs/stories/1.10.story.md",
    "docs/stories/1.11.story.md",
    "docs/stories/2.1.story.md",
    "docs/stories/2.2.story.md",
    "docs/stories/2.3.story.md",
    "docs/stories/2.4.story.md",
    "docs/stories/2.5.story.md",
    "docs/stories/2.6.story.md",
    "docs/stories/2.7.story.md",
    "docs/stories/7.12.story.md",
    # Epics
    "docs/epics/epic-11.content_json-content-system_ready_2026-01-14.md",
    "docs/epics/epic-12-visual-excellence_design-system_storybook_needs-review_2025-01-14.md",
    "docs/epics/epic-13.production-foundation_technical-debt_ready_2026-01-28.md",
    "docs/epics/epic-15.design-system_algorithmic-typography_ready_2026-02-03.md"
]

def ensure_dir(file_path):
    directory = os.path.dirname(file_path)
    if not os.path.exists(directory):
        os.makedirs(directory)

def extract_section(content, section_names):
    for name in section_names:
        # Find the header
        pattern = re.compile(r"^(#+)\s*" + re.escape(name), re.MULTILINE | re.IGNORECASE)
        match = pattern.search(content)
        if match:
            level = len(match.group(1))
            start = match.end()

            # Find next header of same level or higher (less #'s)
            # Regex: ^#{1,level}\s
            next_header_pattern = re.compile(r"^#{1," + str(level) + r"}\s", re.MULTILINE)
            next_match = next_header_pattern.search(content[start:])

            if next_match:
                return content[start:start+next_match.start()].strip()
            return content[start:].strip()
    return ""

def extract_files(content):
    files = set()

    # 1. Regex for paths with src/ or web-app/
    path_pattern = re.compile(r"(?:web-app|src)/[\w\-\./]+\.\w+")
    files.update(path_pattern.findall(content))

    # 2. Regex for filenames in backticks (e.g. `package.json`)
    code_pattern = re.compile(r"`([\w\-\./]+\.\w+)`")
    matches = code_pattern.findall(content)
    for m in matches:
        if '.' in m and not m.endswith('.'):
            files.add(m)

    # 3. Regex for tree structures (lines starting with ├── or └──)
    tree_pattern = re.compile(r"[├└]──\s*([\w\-\./]+\.\w+)")
    files.update(tree_pattern.findall(content))

    cleaned_files = set()
    for f in files:
        f = f.replace("src/", "web-app/")

        # Add prefix if missing and it's a source file
        # Simple heuristic: map common root files
        if f in ["package.json", "tsconfig.json", "tailwind.config.ts", "tailwind.config.js", "components.json", "README.md", ".gitignore", ".eslintrc.json", ".prettierrc", "jest.config.js", "next.config.mjs"]:
             f = "web-app/" + f if f != "README.md" else f # most are in web-app/ except README
             if f == "web-app/README.md" and not os.path.exists("web-app/README.md"):
                 f = "README.md" # Revert if not found (root readme)

        # Filtering
        if f.startswith("web-app/") or f.startswith("docs/") or f.startswith("scripts/") or f == "README.md":
             cleaned_files.add(f)
        elif f.endswith(('.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.md')):
             cleaned_files.add(f)

    return sorted(list(cleaned_files))

def process_story(filepath, content):
    header = ""
    if content.startswith("---"):
        end_fm = content.find("---", 3)
        if end_fm != -1:
            header = content[:end_fm+3]
            h1_match = re.search(r"^#\s.*$", content[end_fm+3:], re.MULTILINE)
            if h1_match:
                header += "\n\n" + h1_match.group(0)
    else:
        lines = content.split('\n')
        header_lines = []
        for line in lines:
            if line.startswith('# ') or line.startswith('> ') or line.strip() == "":
                header_lines.append(line)
            else:
                if line.startswith('## '):
                    break
                if any(x in line for x in ["User Story", "Business Value"]):
                    break
        header = "\n".join(header_lines).strip()

    rationale = extract_section(content, ["Business Value", "Rationale", "Why"])
    description = extract_section(content, ["User Story", "Description", "What"])
    acs = extract_section(content, ["Acceptance Criteria", "The How", "Technical Requirements"])

    files = extract_files(content)

    implemented = [f for f in files if f.endswith(('.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.sh')) and 'test' not in f and 'spec' not in f]
    tests = [f for f in files if 'test' in f or 'spec' in f]
    refs = [f for f in files if f.endswith('.md')]

    impact_section = "## 4. The \"Where\" (Impact Analysis)\n"
    if implemented:
        impact_section += "*   *Implemented Files:*\n" + "\n".join([f"    *   `{f}`" for f in implemented]) + "\n"
    if tests:
        impact_section += "*   *Test Files:*\n" + "\n".join([f"    *   `{f}`" for f in tests]) + "\n"
    if refs:
        impact_section += "*   *Reference Files:*\n" + "\n".join([f"    *   `{f}`" for f in refs]) + "\n"

    if not implemented and not tests and not refs:
        impact_section += "*   *No specific files identified in extraction.*\n"

    new_content = f"{header}\n\n"
    new_content += f"## 1. The \"Why\" (Rationale)\n{rationale}\n\n"
    new_content += f"## 2. The \"What\" (Description)\n{description}\n\n"
    new_content += f"## 3. The \"How\" (Acceptance Criteria)\n{acs}\n\n"
    new_content += impact_section

    return new_content

def process_epic(filepath, content):
    header = ""
    if content.startswith("---"):
        end_fm = content.find("---", 3)
        if end_fm != -1:
            header = content[:end_fm+3]
            h1_match = re.search(r"^#\s.*$", content[end_fm+3:], re.MULTILINE)
            if h1_match:
                header += "\n\n" + h1_match.group(0)
    else:
        lines = content.split('\n')
        header_lines = []
        for line in lines:
            if line.startswith('# ') or line.startswith('> '):
                header_lines.append(line)
            elif line.startswith('## '):
                break
        header = "\n".join(header_lines).strip()

    overview = extract_section(content, ["Executive Summary", "Overview", "Business Context", "High-Level Overview"])
    rationale = extract_section(content, ["Business Value", "Global Rationale", "User Value Statement"])

    story_links = re.findall(r"\[.*?\]\((.*?story.*?)\)", content)
    story_list = []
    for link in story_links:
        story_list.append(link)

    if not story_list:
        stories_section = extract_section(content, ["Stories"])
        if stories_section:
             story_list = re.findall(r"-\s+(.*?)\n", stories_section)

    new_content = f"{header}\n\n"
    new_content += f"## 1. High-Level Overview\n{overview}\n\n"
    new_content += f"## 2. Global Rationale\n{rationale}\n\n"
    new_content += f"## 3. Completed Stories\n"
    if story_list:
        for s in set(story_list):
            new_content += f"- {s}\n"
    else:
        new_content += "See original epic for detailed story list (extraction failed or no links found).\n"

    return new_content

def main():
    for filepath in FILES_TO_ARCHIVE:
        if not os.path.exists(filepath):
            print(f"Skipping {filepath} (not found)")
            continue

        print(f"Processing {filepath}...")
        with open(filepath, 'r') as f:
            content = f.read()

        if "/stories/" in filepath:
             new_content = process_story(filepath, content)
             dest_dir = "docs/stories/completed/"
        else:
             new_content = process_epic(filepath, content)
             dest_dir = "docs/epics/completed/"

        filename = os.path.basename(filepath)
        dest_path = os.path.join(dest_dir, filename)

        ensure_dir(dest_path)

        with open(dest_path, 'w') as f:
            f.write(new_content)

        os.remove(filepath)
        print(f"Moved to {dest_path}")

if __name__ == "__main__":
    main()
