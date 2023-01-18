import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: ['**/*.cy.{js,jsx,ts,tsx}'],
  },
});
