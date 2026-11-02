# Contributing to DrawDesign

Thank you for considering a contribution! Contributions of all sizes are welcome, including
bug reports, feature ideas, code, tests, documentation, accessibility improvements, design
feedback, and translations. This guide walks through the process from setting up the project
to opening a pull request.

## Before you start

- For a small fix or documentation change, you can get started right away.
- For a new feature or a large change, open a
  [feature request](https://github.com/lokeshazad10/DrawDesign/issues/new?template=feature_request.yml)
  first. This gives maintainers and contributors a chance to agree on the approach before you
  spend time implementing it.
- If you plan to work on an existing issue, check its discussion first. If you are unsure
  whether someone is already working on it, leave a comment before starting.
- For a security vulnerability, do not open a public issue. Follow the private reporting
  instructions in [SECURITY.md](SECURITY.md).

## 1. Set up your development environment

You will need:

- Node.js 22.22.2 or newer in the 22.x line, 24.15.0 or newer in the 24.x line, or 26.0.0+
- npm (included with Node.js)
- Git
- A modern web browser

Check that Node.js and npm are installed:

```sh
node --version
npm --version
git --version
```

### Fork and clone the repository

If you do not have write access to this repository, first click **Fork** on the
[DrawDesign GitHub page](https://github.com/lokeshazad10/DrawDesign). This creates your own
copy of the repository under your GitHub account.

Clone your fork, replacing `<your-github-username>` with your GitHub username:

```sh
git clone https://github.com/<your-github-username>/DrawDesign.git
cd DrawDesign
```

If you have write access and are not using a fork, you can clone the main repository instead:

```sh
git clone https://github.com/lokeshazad10/DrawDesign.git
cd DrawDesign
```

Install the project's dependencies:

```sh
npm ci
```

`npm ci` installs the exact dependency versions recorded in `package-lock.json`. You do not
need to create an environment file to run the application.

### Run the application

Start the local development server:

```sh
npm run dev
```

Open the local URL printed in your terminal (usually <http://localhost:5173>). Leave this
command running while you work; the page reloads when you change files. Press `Ctrl+C` in
the terminal when you want to stop the server.

## 2. Create a branch

Create a separate branch for your change so it is easy to review:

```sh
git switch -c docs/describe-your-change
```

Choose a prefix that describes the work, such as `fix/`, `feature/`, `test/`, or `docs/`.
For example:

```sh
git switch -c fix/undo-after-delete
```

If you already created the branch, do not run the branch-creation command again.

## 3. Make your changes

- Keep each change focused on one issue or improvement.
- Follow the existing JavaScript, React, and CSS patterns in the files you edit.
- Add or update tests when changing application behavior.
- Update relevant documentation when setup or behavior changes.
- Avoid adding dependencies unless the change needs them.
- Do not commit credentials, private information, local environment files, or generated
  output such as `dist/` or `node_modules/`.

There is no separate formatter command configured in this repository. ESLint is used to
check the code.

## 4. Check your changes

Before opening a pull request, run the tests and lint check from the repository directory:

```sh
npm test
npm run lint
```

For application changes, also create a production build:

```sh
npm run build
```

If you changed how the app looks or behaves, start it with `npm run dev` and check the
affected workflow in a browser as well. If a check fails, review the output, fix the
relevant problem, and run the check again. Pull requests should say which checks you ran;
if you could not run a relevant check, briefly explain why.

The test command uses Node.js's built-in test runner. For optional rendered test output,
see the instructions in [`.env.example`](.env.example); the test runner does not load that
file automatically.

## 5. Commit and push your work

Review which files have changed:

```sh
git status
git diff
```

Stage only the files that belong to your change, then commit them:

```sh
git add path/to/changed-file
git commit -m "docs: describe your change"
```

Use a short, descriptive commit message. Conventional Commit prefixes are encouraged:

- `feat:` for a feature
- `fix:` for a bug fix
- `docs:` for documentation
- `test:` for tests
- `refactor:` for code restructuring without a behavior change

Push your branch. For a fork, `origin` is usually your fork:

```sh
git push -u origin docs/describe-your-change
```

Replace the example branch with the name of your branch.

## 6. Open a pull request

On GitHub, open a pull request from your branch to the default branch of
`lokeshazad10/DrawDesign`. GitHub may show a prompt to create the pull request after you
push your branch.

Fill in the pull request template. Describe what changed and why, link any related issue,
and list the checks you ran with their results. Include screenshots for visual changes when
they help reviewers understand the result. If your change has a breaking effect, explain
who is affected and what they may need to do.

Before submitting, check that:

- [ ] The change and its motivation are clearly described, with a related issue linked when
  applicable.
- [ ] Tests were added or updated where appropriate, and `npm test` passes.
- [ ] `npm run lint` passes.
- [ ] Documentation is updated where needed.
- [ ] `npm run build` passes for application changes.
- [ ] Breaking changes are identified and described.
- [ ] The pull request contains no secrets or unrelated changes.

After opening the pull request, respond to review questions and make requested updates on
the same branch. New commits pushed to that branch are added to the pull request
automatically.

## Reporting bugs and suggesting features

Before opening an issue, search existing issues to see if the topic has already been
reported. Use the
[bug report form](https://github.com/lokeshazad10/DrawDesign/issues/new?template=bug_report.yml)
to report a bug, or the
[feature request form](https://github.com/lokeshazad10/DrawDesign/issues/new?template=feature_request.yml)
to suggest an improvement.

For a bug report, include steps that someone else can follow, what you expected to happen,
what actually happened, and relevant environment details. Add screenshots or error messages
when useful. Do not include passwords, tokens, or other private information.

## Review and community

Maintainers review contributions for correctness, scope, tests, usability, and consistency
with the project. They may ask questions or request changes before merging; thank you for
your patience while they review. Keep discussion constructive and follow the project's
[Code of Conduct](CODE_OF_CONDUCT.md).

If you are looking for a place to begin, check issues labeled `good first issue` or
`help wanted`.
