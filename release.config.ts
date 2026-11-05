import { defineConfig, GithubHosting, PnpmWorkspacesProject } from '@peiyanlu/release'


export default defineConfig({
  project: new PnpmWorkspacesProject({
    mode: 'independent',
  }),
  bump: {
    extraScopes: [ 'deps' ],
  },
  hosting: new GithubHosting(),
  releaser: {
    verbose: true,
  },
})
