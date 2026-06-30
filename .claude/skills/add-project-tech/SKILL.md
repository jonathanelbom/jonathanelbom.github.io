---
name: add-project-tech
description: Use when analyzing a project repo (local path or GitHub URL) to extract tech stack and write a compelling description for the jonathanelbom.github.io portfolio. User provides repo path or GitHub URL and project title.
---

# add-project-tech

## Overview

Analyzing a project for tech + description requires care: pull out **key** technologies (not every dependency), write a description that emphasizes what the project *does* (not what it's built with), format correctly as a pipe-delimited string, and update the portfolio without breaking the JavaScript object.

## Process

### 1. Detect Source Type and Read the Repository

**First, determine if the argument is a local path or a GitHub URL.**

**If local path** (e.g. `~/Workspace/jonathanelbom/factoring`):
Read these files in order using file reading tools (stop when you have enough signal):
1. `package.json`
2. `README.md`
3. Framework config files: `nuxt.config.*`, `vite.config.*`, `webpack.config.*`, `tsconfig.json`
4. Any `index.html`, `main.js`, or entry point

**If GitHub URL** (e.g. `https://github.com/owner/repo`):
Extract `owner` and `repo` from the URL. Fetch files via `gh api` using base64-decoded content:
```bash
gh api repos/{owner}/{repo}/contents/package.json --jq '.content' | base64 -d
gh api repos/{owner}/{repo}/contents/README.md --jq '.content' | base64 -d
```
To list files when you need to find an entry point:
```bash
gh api repos/{owner}/{repo}/git/trees/HEAD?recursive=1 --jq '.tree[].path'
```
Fetch additional files the same way as needed. Stop when you have enough signal.

**What you're looking for:**
- **Framework:** React, Vue, Nuxt, Next, Angular, etc. OR "Vanilla JS"
- **Language:** TypeScript, JavaScript, Python, etc. (skip if obvious from repo)
- **Notable libraries:** If listed as a key dependency (Redux, Tailwind, Three.js, etc.)

### 2. Read the Existing Portfolio Entry

Before writing anything, grep for the project title in `/Users/jonathan/Workspace/jonathanelbom/jonathanelbom.github.io/index.html` and read the existing `description` (and `tech` if present).

Use the existing description as **context only** — note what it captured, what tone it used, what it missed. Don't copy it; write something better. If it already nails the user experience, build on that angle.

### 3. Identify Key Technologies (1–3 Max)

**Key = visible to a user.** Skip dev tooling (ESLint, Babel, Webpack unless it's the main story).

**Decision rule:**
- Is it in the README's tech section? Include it.
- Did you see it as a top-level import in code? Probably include it.
- Is it a dev dependency only? Skip.
- Does someone using the app experience it? Include it.

**Format:** `Tech1 | Tech2 | Tech3` (pipe + space, max 3)

### 4. Write the Description

**Goal:** What does this project do/feel like? Not what it's built with.

**Rules:**
- 100–150 characters (count it)
- Action-focused: "Build", "Visualize", "Interact", "Create" — verb at the start or early
- Zero tech names (don't mention React, Vue, JavaScript, etc.)
- User experience first: "What does someone see/do when they use this?"
- No duplication with the tech field

### 5. Present for Approval

Show the user:
```
Project: [Title]
Tech: [your string]
Description: [your string]

Does this look good? Any changes needed?
```

**On approval:** Proceed to step 5. **On rejection:** Revise and re-present.

### 6. Update index.html

Open `/Users/jonathan/Workspace/jonathanelbom/jonathanelbom.github.io/index.html` and locate the matching project object in the `projects` array (search for the exact title).

Add or update the `tech` field. Replace the `description` field. Example:

```javascript
{
    image: './images/factorTHAT.png',
    title: 'FactorTHAT',
    tech: 'React | Vite | CSS',
    description: 'Build a prime factorization tree with draggable cards—see how numbers decompose into primes.',
    links: [
        { label: 'Launch FactorTHAT', url: '...', italic: false },
        { label: 'View source on github', url: '...', italic: true }
    ]
}
```

**After editing:**
- Verify the JavaScript object is still valid (matching braces, trailing commas only after middle items)
- Run a quick git diff to confirm you only changed what you meant to

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Listing every npm package | Pick 1–3 visible ones. Ask: would a visitor notice it? |
| Description repeats tech | Remove all tech names. Focus on what it *does*. |
| Description too long (250+ chars) | Cut to 100–150. Be specific, not verbose. |
| Breaking JavaScript syntax | Check: matching braces, commas only between items |

## Quick Checklist

- [ ] Detected source type (local path or GitHub URL)
- [ ] Read package.json, README, framework config (via file tools or `gh api`)
- [ ] Read existing portfolio entry for context
- [ ] Tech field: 1–3 items, pipe-delimited, NO tech names in description
- [ ] Description: 100–150 chars, action-focused, zero tech duplication
- [ ] User approves
- [ ] index.html updated
- [ ] Git diff reviewed
