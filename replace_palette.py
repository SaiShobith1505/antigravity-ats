import os, re, sys

# Define mapping of old colors to new colors
color_map = {
    "#006039": "#0B2E33",  # primary green -> calm dark green
    "#C6A769": "#4F7C82",  # gold accent -> secondary teal
    "#FAF8F3": "#B8E3E9",  # warm bg -> light pastel
    "#FFFFFF": "#93B1B5",  # white cards -> muted card background
    "#e7e5e4": "#93B1B5",  # stone-200 border color to card bg maybe
    "#d6d3d1": "#93B1B5",
    "#e5e5e5": "#93B1B5"
}

# File extensions to process
extensions = (".tsx", ".ts", ".js", ".jsx", ".css", ".html")

project_root = r"c:\\Project"

for root, dirs, files in os.walk(project_root):
    for fname in files:
        if fname.lower().endswith(extensions):
            path = os.path.join(root, fname)
            try:
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                new_content = content
                for old, new in color_map.items():
                    new_content = new_content.replace(old, new)
                if new_content != content:
                    with open(path, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    print(f"Updated {path}")
            except Exception as e:
                print(f"Error processing {path}: {e}", file=sys.stderr)
print("Palette replacement complete.")
