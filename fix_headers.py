import re

HEADER_CSS = """
       .header {
    position: fixed; top: 0; left: 0; right: 0;    background:  rgba(20,42,30,0.96);
    backdrop-filter: blur(14px);
    z-index: 1000;
    transition: transform .4s ease, background .4s ease, box-shadow .4s ease;
}
.header.hidden { transform: translateY(-100%); }
.header.scrolled {
    background: rgba(20,42,30,0.97);
    box-shadow: 0 4px 40px rgba(30,61,43,0.02);
}
        .header-container {
            max-width: 1400px; margin: 0 auto;
            padding: 14px 40px;
            display: flex; align-items: center; justify-content: space-between
        }
        .logo-wrap { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .logo-img { height: 80px; width: auto; display: block; }
        .logo-img-light { display: none; }
        .logo-img-dark { display: block; }
        .header.hero-mode .logo-img-dark { display: none; }
        .header.hero-mode .logo-img-light { display: block; }
        .logo-text-block { display: flex; flex-direction: column; }
        .logo-name {
            font-family: 'Cormorant Garamond', serif;
            font-size: 1.4rem;
            font-weight: 600;
            letter-spacing: 5px;
            text-transform: uppercase;
            line-height: 1;
            color: white
        }
        .header.hero-mode .logo-name { color: white; }
        .header.hero-mode .logo-tagline { color: var(--gold-light); }
        .logo-tagline {
            font-size: 0.55rem; letter-spacing: 2px;
            color: var(--gold); text-transform: uppercase;
            font-weight: 500; margin-top: 3px;
        }
        .nav-menu {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .nav-item {
            font-size: 0.72rem;
            font-weight: 500;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color:  rgba(255,255,255,0.85);
            text-decoration: none;
            padding: 8px 14px;
            border-radius: 4px;
            border: 1px solid transparent;
            transition: all .3s;
        }
        .nav-item:hover, .nav-item.active {
   background: rgba(255,255,255,0.1);
   border-color: rgba(255,255,255,0.25);
}
.nav-item.green-link:hover,
.nav-item.green-link.active {
    color: var(--emerald);
    border-bottom: 2px solid var(--emerald);
}
        .nav-toggle {
            display: none;
            width: 38px;
            height: 30px;
            margin-left: 16px;
            border: none;
            background: var(--emerald-light);
            cursor: pointer;
            position: relative;
            z-index: 1100;
        }
        .nav-toggle span {
            position: absolute;
            left: 4px;
            right: 4px;
            height: 2px;
            background: var(--emerald);
            transition: transform .3s ease, opacity .3s ease, top .3s ease, background .3s ease;
        }
        .nav-toggle span:nth-child(1) { top: 8px; }
        .nav-toggle span:nth-child(2) { top: 18px; }"""

HEADER_CSS_RESPONSIVE = """
        @media (max-width: 768px) {
            .header-container { padding: 10px 16px; }
            .logo-img { height: 56px; }
            .nav-toggle { display: block; }
            .nav-menu {
                position: fixed;
                left: 0;
                right: 0;
                top: 64px;
                padding: 16px 20px 24px;
                background: rgba(252,250,247,0.98);
                backdrop-filter: blur(18px);
                flex-direction: column;
                gap: 6px;
                transform: translateY(-110%);
                opacity: 0;
                pointer-events: none;
                transition: transform .35s ease, opacity .35s ease;
            }
            .header.nav-open .nav-menu {
                transform: translateY(0);
                opacity: 1;
                pointer-events: auto;
            }
            .header.nav-open .nav-item { color: var(--charcoal); }
            .header.nav-open .nav-item:hover,
            .header.nav-open .nav-item.active {
                background: rgba(30,61,43,0.06);
                border-color: rgba(30,61,43,0.12);
            }
            .nav-item { width: 100%; text-align: left; padding-block: 10px; }
        }
        @media (max-width: 480px) {
            .header-container { padding-inline: 12px; }
            .logo-img { height: 50px; }
        }"""

TARGET_FILES = [
    "index.html", "services.html", "projects.html",
    "reviews.html", "contact.html", "subcontractor.html"
]

BLOCK_PATTERN = re.compile(
    r'(\.header\b|\.header-container\b|\.logo-wrap\b|\.logo-img\b|'
    r'\.logo-text-block\b|\.logo-name\b|\.logo-tagline\b|'
    r'\.nav-menu\b|\.nav-item\b|\.nav-toggle\b)'
)

def replace_header_css(content, new_css, new_responsive):
    style_match = re.search(r'(<style>)([\s\S]*?)(</style>)', content, re.IGNORECASE)
    if not style_match:
        return content, False

    style_body = style_match.group(2)
    lines = style_body.split('\n')
    start_idx = end_idx = None

    for i, line in enumerate(lines):
        if BLOCK_PATTERN.search(line):
            if start_idx is None:
                start_idx = i
            end_idx = i

    if start_idx is None:
        return content, False

    while start_idx > 0 and lines[start_idx - 1].strip() == '':
        start_idx -= 1

    brace_depth = 0
    for j in range(end_idx, len(lines)):
        brace_depth += lines[j].count('{') - lines[j].count('}')
        if brace_depth <= 0 and lines[j].strip() != '':
            end_idx = j
            break

    new_lines = lines[:start_idx] + [new_css] + lines[end_idx + 1:]
    new_style_body = '\n'.join(new_lines)

    new_style_body = re.sub(
        r'@media \(max-width: 768px\)\s*\{[\s\S]*?\n        \}',
        new_responsive.strip(),
        new_style_body,
        count=1
    )

    new_style = style_match.group(1) + new_style_body + style_match.group(3)
    updated = content[:style_match.start()] + new_style + content[style_match.end():]
    return updated, True


for filename in TARGET_FILES:
    try:
        with open(filename, "r", encoding="utf-8") as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Skipped (not found): {filename}")
        continue

    updated, changed = replace_header_css(content, HEADER_CSS, HEADER_CSS_RESPONSIVE)
    if changed:
        with open(filename, "w", encoding="utf-8") as f:
            f.write(updated)
        print(f"Updated: {filename}")
    else:
        print(f"No header CSS found in: {filename} - skipped")

print("\nDone.")
