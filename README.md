# Datashare Plugin : Sentence Case

[![](https://img.shields.io/github/actions/workflow/status/icij/datashare-plugin-sentence-case/main.yml)](https://github.com/ICIJ/datashare-plugin-sentence-case/actions)

A Datashare plugin to add a sentence case button to the extracted text view.


## 🤸 New release

This guide will help you publish a new release by following a few simple steps. We'll ensure your environment is updated, customize your commit message, and create a version tag. Let's get started!

### Step 1: Update Your Local Environment

Before making any changes, ensure that your local repository is synchronized with the latest updates from the remote repository:

```bash
git pull origin main --rebase --tags
```

### Step 2: Customize the Commit Message Format

To keep track of version changes, customize the commit message format for bumping the version. This step ensures that every version bump commit is clearly labeled using semantic commit:

```bash
yarn config set version-git-message "bump: %s"
```

### Step 3: Create a Release Tag

For a **major** version bump (significant changes or backward-incompatible changes), use:

```bash
yarn version --major
```

For a **minor** version bump (backward-compatible new features), use:

```bash
yarn version --minor
```

For a **patch** version bump (backward-compatible bug fixes), use:

```bash
yarn version --patch
```

### Step 4: Push Your Changes to Remote

Finally, push the new version tag to the remote repository. This step triggers the GitHub Action to publish the new release:

```bash
git push origin main --tags
```

Your new release is now published!