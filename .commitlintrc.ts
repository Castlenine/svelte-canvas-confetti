const CONFIGURATION = {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'body-leading-blank': [2, 'always'],
		'body-max-line-length': [2, 'always', 720],
		'footer-leading-blank': [2, 'always'],
		'footer-max-line-length': [2, 'always', 120],
		'header-max-length': [2, 'always', 120],
		'header-trim': [2, 'always'],
		'scope-case': [1, 'always', 'lower-case'],
		'subject-case': [
			1,
			'always',
			[
				'lower-case', // lower case
				'upper-case', // UPPERCASE
				'camel-case', // camelCase
				'kebab-case', // kebab-case
				'pascal-case', // PascalCase
				'sentence-case', // Sentence case
				'snake-case', // snake_case
				'start-case', // Start Case
			],
		],
		'subject-empty': [2, 'never'],
		'subject-full-stop': [2, 'never', '.'],
		'type-case': [2, 'always', 'lower-case'],
		'type-empty': [2, 'never'],
		'type-enum': [
			2,
			'always',
			[
				'BREAKING-CHANGE',
				'build',
				'cherry-pick',
				'chore',
				'ci',
				'comment',
				'config',
				'docs',
				'feat',
				'fix',
				'hotfix',
				'merge',
				'perf',
				'prune',
				'refactor',
				'revert',
				'security',
				'style',
				'temp',
				'test',
				'translation',
				'version',
				'wip',
			],
		],
	},
	prompt: {
		questions: {
			type: {
				description: 'Choose the type of change for your commit',
				enum: {
					'BREAKING-CHANGE': {
						description: 'A significant change that breaks backward compatibility',
						title: 'BREAKING-CHANGE',
						emoji: '💥',
					},
					build: {
						description: 'Modifications to build systems or processes (e.g., vite.js, etc.)',
						title: 'Build',
						emoji: '👷',
					},
					'cherry-pick': {
						description: 'A commit that cherry-picks a specific commit',
						title: 'Cherry-pick',
						emoji: '🍒',
					},
					chore: {
						description:
							'Routine maintenance tasks that do not modify the source code (e.g., dependency management, project setup, tooling updates)',
						title: 'Chore',
						emoji: '🧹',
					},
					ci: {
						description:
							'Updates to continuous integration and deployment configuration, including workflow scripts and automation tools',
						title: 'CI',
						emoji: '🎡',
					},
					comment: {
						description: 'A commit that exclusively modifies or adds comments within the code',
						title: 'Comment',
						emoji: '💬',
					},
					config: {
						description:
							'Modifications to project configuration files, including linters, formatters, and compiler settings',
						title: 'Config',
						emoji: '⚙️',
					},
					docs: {
						description: 'Changes to documentation files or inline code documentation',
						title: 'Documentation',
						emoji: '📝',
					},
					feat: {
						description: 'A new feature or improvement',
						title: 'Feature',
						emoji: '✨',
					},
					fix: {
						description: 'A bug fix or issue resolution',
						title: 'Fix',
						emoji: '🐛',
					},
					hotfix: {
						description: 'An urgent fix for a critical production issue that requires immediate attention',
						title: 'Hotfix',
						emoji: '🚑️',
					},
					merge: {
						description: 'Merges changes from one branch into another',
						title: 'Merge',
						emoji: '🔀',
					},
					perf: {
						description: 'Performance optimization or code improvement that enhances system efficiency',
						title: 'Performance',
						emoji: '⚡',
					},
					prune: {
						description: 'Removes unnecessary files, directories, or clean up',
						title: 'Prune',
						emoji: '🪓',
					},
					refactor: {
						description:
							'Restructuring or improving existing code without changing its behavior or adding new features',
						title: 'Refactor',
						emoji: '🔧',
					},
					revert: {
						description: 'Undoes or rolls back a previous commit to restore the codebase to a prior state',
						title: 'Revert',
						emoji: '⏪',
					},
					security: {
						description: 'Addresses security vulnerabilities or implements security enhancements',
						title: 'Security',
						emoji: '🔒',
					},
					style: {
						description:
							"Code formatting changes that do not alter the code's logic or functionality, such as adjusting whitespace, indentation, semicolons, or code style",
						title: 'Style',
						emoji: '🎨',
					},
					temp: {
						description: 'A provisional commit marked for cleanup prior to final merge',
						title: 'Temp',
						emoji: '⏰',
					},
					test: {
						description: 'Adds or improves test coverage by adding new tests or fixing existing test cases',
						title: 'Test',
						emoji: '🧪',
					},
					translation: {
						description: 'Adds or updates translations for the website',
						title: 'Translation',
						emoji: '🌐',
					},
					version: {
						description: 'Updates project version or version-related metadata',
						title: 'Version',
						emoji: '🔖',
					},
					wip: {
						description: 'A work in progress commit',
						title: 'WIP',
						emoji: '🚧',
					},
				},
			},
			scope: {
				description:
					'Specify the scope of the change, such as the affected component, module, or file.\nOptionally include a task or issue identifier in square brackets (e.g., "scope[FRONTEND-123]").\nNote: The scope will be automatically enclosed in parentheses.',
			},
			subject: {
				description: 'Provide a concise, imperative mood summary of the change in the present tense',
			},
			body: {
				description:
					'Provide a comprehensive explanation of the change, detailing the motivation, implementation approach, and any additional context that helps understand the modification',
			},
			isBreaking: {
				description:
					'Indicate whether this commit introduces any breaking changes to the existing codebase (true or false)',
			},
			breakingBody: {
				description:
					"A 'BREAKING-CHANGE' commit requires a comprehensive explanation detailing the nature of the breaking changes, their impact on the codebase, and any necessary migration steps or considerations",
			},
			isIssueAffected: {
				description: 'Indicate whether this commit resolves or relates to any existing issues or tasks (true or false)',
			},
			issues: {
				description:
					'Reference related issues or tasks using their identifier (e.g., "fix #FRONTEND-123", "closes #FRONTEND-456")',
			},
			issuesBody: {
				description:
					'When issues are resolved, provide a comprehensive explanation detailing the changes, their impact, and the specific resolution',
			},
		},
	},
} as const;

export default CONFIGURATION;
