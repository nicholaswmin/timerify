# Guidelines

## Testing

unit tests should run in *milliseconds*.

## Versioning

follows [Semantic Versioning][semver]

## Code changes

follows [GitHub flow][github-flow]

### commit messages

follows [conventional commits][conv-comm]

### before commit

```bash
npm test
npm run checks
```
*must* pass locally

[semver]: https://semver.org/
[conv-comm]: https://www.conventionalcommits.org/en/v1.0.0/#summary
[github-flow]: https://docs.github.com/en/get-started/using-github/github-flow
