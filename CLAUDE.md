# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a GitHub Pages portfolio site showcasing UX/interaction design projects. It's a static site with no build process—work directly with HTML, CSS, and JavaScript.

## Architecture

**Main Portfolio Page** (`index.html`):
- Single-file design with config-driven rendering
- `projects` array at the top of the `<script>` block defines all projects (title, description, image, links)
- `renderProjects()` function converts the array into HTML using template literals and inserts into the DOM
- Includes scroll-based parallax effect on the header (35% translate speed)
- CSS classes follow BEM naming convention (`Portfolio__*`)

**Project Subdirectories**:
- Each subdirectory (e.g., `uxprototyper/`, `tictactoe/`, `oggopus/`) contains independent demos with their own `index.html` files
- These are self-contained and don't depend on the main portfolio logic

**Styling**:
- Primary stylesheet: `css/styles.css` (hand-written)
- Minified variants: `css/styles-0.min.css`, `css/styles-1.min.css` (appears to be legacy or utility-specific)
- Google Fonts: Roboto and Roboto Condensed

## Common Tasks

**Adding a new project to the portfolio**:
1. Add a new object to the `projects` array in `index.html` (lines 52–126)
2. Provide: `image`, `title`, `description`, `tech` (optional), `links` array with `label` and `url`
3. Images go in the `images/` directory
4. The render function automatically handles formatting

**Testing locally**:
- Open `index.html` directly in a browser (no server needed)
- For projects with subdirectories, navigate to the subdirectory's `index.html`

**Deploying**:
- Push to the `master` branch; GitHub Pages auto-deploys to `jonathanelbom.github.io`
- No build step required

## Key Implementation Details

- **Dynamic rendering**: The projects array is the single source of truth. Changes to it update the page immediately.
- **Template literals**: Used for HTML generation (`\`...\`` syntax in the render function) to avoid string concatenation
- **Scroll parallax**: Header content moves at 35% of scroll speed for a subtle depth effect
- **Link styling**: Links can be marked with `italic: true` to render in `<i>` tags for visual distinction
- **Image alt text**: Images lack alt text; add them when updating for accessibility
