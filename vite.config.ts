import { sites } from '@openai/sites-vite-plugin';

// Sites packaging marker. Angular owns the browser build; the deployment
// wrapper serves the generated static assets through the Sites runtime.
export const sitesPlugins = [sites()];
