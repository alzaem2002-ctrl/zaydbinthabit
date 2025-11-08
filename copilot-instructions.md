# Copilot Instructions for Osint-lab-pro

This document provides guidance for GitHub Copilot coding agent when working on this repository.

## Project Overview

Osint-lab-pro is an OSINT (Open Source Intelligence) lab application built as a hybrid Progressive Web App (PWA).

## Repository Structure

- `.github/`: GitHub-specific configurations and workflows
- `.github/agents/`: Custom agent profiles (if any)
- `README.md`: Main project documentation

## Coding Standards and Conventions

### General Guidelines

1. **Code Style**: Follow best practices for the technology stack used in this project
2. **Documentation**: Keep documentation up to date when making changes
3. **Testing**: Write tests for new features and ensure existing tests pass
4. **Security**: Be mindful of security best practices, especially for OSINT applications

### Commit Messages

- Use clear, descriptive commit messages
- Start with a verb in the present tense (e.g., "Add", "Fix", "Update")
- Keep the first line concise (50 characters or less)
- Add detailed explanation in the body if needed

## Working with Issues

### Issue Guidelines

- **Scope**: Keep tasks well-scoped and specific
- **Clarity**: Provide clear descriptions and acceptance criteria
- **Context**: Include relevant file paths and code references
- **Labels**: Use appropriate labels to categorize issues

### Best Practices for Copilot

1. **Start Small**: Begin with routine tasks like bug fixes, documentation updates, or test coverage
2. **Review Changes**: Always review pull requests carefully before merging
3. **Iterative Feedback**: Provide specific feedback if changes are needed
4. **Security First**: Ensure no sensitive data or credentials are committed

## Development Workflow

### Before Making Changes

1. Understand the current codebase structure
2. Review existing tests and documentation
3. Ensure build and test infrastructure is working

### During Development

1. Make minimal, focused changes
2. Test changes frequently
3. Update documentation as needed
4. Follow existing code patterns and conventions

### After Changes

1. Run all tests to ensure nothing breaks
2. Update relevant documentation
3. Ensure commit messages are clear
4. Request review from maintainers

## Security Considerations

- Never commit sensitive data (API keys, passwords, tokens)
- Be careful with OSINT data handling and privacy
- Follow secure coding practices
- Validate all user inputs
- Use environment variables for configuration

## Resources

- [GitHub Copilot Best Practices](https://docs.github.com/en/copilot/tutorials/coding-agent/get-the-best-results)
- [GitHub Copilot Coding Agent Documentation](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent)

## Custom Agents

Custom agent profiles can be added in `.github/agents/` directory to provide specialized guidance for specific types of tasks.

## Notes

- This is a PWA (Progressive Web App) project, so consider offline functionality and service workers
- OSINT applications require careful handling of data sources and user privacy
- Keep the application lightweight and performant for various devices
