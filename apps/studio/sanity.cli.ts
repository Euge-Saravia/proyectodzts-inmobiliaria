import { defineCliConfig } from 'sanity/cli'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET
const studioHost = process.env.SANITY_STUDIO_HOSTNAME
const appId = process.env.SANITY_STUDIO_APP_ID

export default defineCliConfig({
  api: {
    projectId: projectId,
    dataset: dataset || 'production',
  },
  studioHost,
  deployment: {
    appId,
    autoUpdates: true,
  },
  typegen: {
    path: "../frontend/src/**/*.{ts,tsx,js,jsx}",
    schema: "./schema.json",
    generates: "../frontend/src/sanity/types.ts",
  },
})
