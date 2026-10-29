# Contributing to DrawDesign

Thanks for your interest in contributing! Issues, documentation improvements, code, tests,
design feedback, and translations are all welcome.

## Ways to contribute

- Report a reproducible bug or suggest a feature.
- Improve documentation, tests, accessibility, design, or translations.
- Fix an issue or implement an agreed feature.

For larger changes, open an issue first so we can discuss the approach.

## Development setup

1. Install Node.js 22.22.2+ (22.x), 24.15.0+ (24.x), or 26.0.0+, and npm.
2. Fork the repository and clone your fork.
3. Install dependencies with `npm ci`.
4. Start the app with `npm run dev`.

No application environment variables are required. See [`.env.example`](.env.example) for an
optional test-output setting.

## Branches and commits

Create a focused branch using a descriptive prefix, for example:

- `feature/add-login`
- `fix/navbar-crash`
- `docs/improve-setup`
- `test/cover-svg-export`

Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages where
possible, such as `feat: add shape grouping`, `fix: preserve selection on undo`, or
`docs: clarify local setup`.

## Code, formatting, and tests

- Follow the existing JavaScript, React, and CSS patterns in the files you touch.
- Keep changes focused and avoid adding dependencies without a clear need.
- Run `npm run lint` and `npm test` before submitting.
- Run `npm run build` for changes that affect the application build.
- Add or update tests for behavior changes; do not commit generated test output.
- Update relevant documentation when behavior or setup changes.

ESLint is the configured linting tool. The repository does not currently define a separate
formatter command.

## Reporting an issue

Search existing issues first to avoid duplicates. Use the
[bug report form](https://github.com/lokeshazad10/DrawDesign/issues/new?template=bug_report.yml)
for bugs, or the
[feature request form](https://github.com/lokeshazad10/DrawDesign/issues/new?template=feature_request.yml)
for ideas. Include steps to reproduce, expected and actual behavior, and relevant environment
details. Never include secrets or private information.

For security vulnerabilities, follow [SECURITY.md](SECURITY.md) instead of filing a public issue.

## Pull request workflow

1. Fork `lokeshazad10/DrawDesign` and clone your fork:

   ```sh
   git clone https://github.com/<your-github-username>/DrawDesign.git
   cd DrawDesign
   npm ci
   ```

2. Create a branch: `git switch -c feature/describe-your-change`.
3. Make and test your changes: `npm run lint`, `npm test`, and, when relevant, `npm run build`.
4. Commit with a clear Conventional Commit message.
5. Push your branch and open a pull request against the upstream default branch.
6. Fill in the pull request template and respond to review feedback.

### Pull request checklist

- [ ] The change has a clear description and links any related issue.
- [ ] Tests were added or updated where appropriate, and `npm test` passes.
- [ ] `npm run lint` passes.
- [ ] Documentation is updated where needed.
- [ ] `npm run build` passes for application changes.
- [ ] Breaking changes and their impact are clearly described.
- [ ] No secrets, generated output, or unrelated changes are included.

## Review process

Maintainers will review contributions for correctness, scope, tests, usability, and consistency
with the project. They may request changes or clarification. Please keep discussion constructive
and update the pull request in response to feedback.

## Good first issues

Look for issues labeled `good first issue` or `help wanted`. If you are unsure whether a change
fits an issue, leave a comment before starting work.
