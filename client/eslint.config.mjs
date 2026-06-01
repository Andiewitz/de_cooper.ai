import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';

const eslintConfig = tseslint.config(
    ...tseslint.configs.recommended,
    {
        plugins: {
            '@next/next': nextPlugin,
        },
        rules: {
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs['core-web-vitals'].rules,
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/no-explicit-any": "warn",
        },
    },
    {
        ignores: ['.next/', 'out/', 'build/', 'next-env.d.ts'],
    }
);

export default eslintConfig;
