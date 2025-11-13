# GitHub Pages Deployment Guide

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name your repository (e.g., `daihoi-image-generator`)
5. Choose **Public** (required for free GitHub Pages)
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

## Step 2: Push Your Code to GitHub

After creating the repository, GitHub will show you commands. Use these commands in your terminal:

```bash
cd /Users/s0icodocslashdot/code/DTT

# Add your GitHub repository as remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push your code
git push -u origin main
```

**Example:**
If your username is `johndoe` and repository name is `daihoi-image-generator`:
```bash
git remote add origin https://github.com/johndoe/daihoi-image-generator.git
git push -u origin main
```

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** (top menu)
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**

## Step 4: Access Your Website

After a few minutes, your site will be available at:
```
https://YOUR_USERNAME.github.io/REPO_NAME/
```

**Example:**
```
https://johndoe.github.io/daihoi-image-generator/
```

## Important Notes

- **File Paths**: Make sure all your file paths in `index.html` are relative (they already are: `assets/css/style.css`, `img/template.png`, etc.)
- **HTTPS**: GitHub Pages automatically provides HTTPS
- **Updates**: After pushing changes, wait 1-2 minutes for the site to update
- **Custom Domain**: You can add a custom domain later in the Pages settings if needed

## Troubleshooting

If your site doesn't load:
1. Check that the repository is **Public**
2. Verify `index.html` is in the root directory
3. Check the Actions tab for any build errors
4. Wait a few minutes for changes to propagate

