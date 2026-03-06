import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

export default function globalSetup() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const buildPath = path.resolve(__dirname, '../build')
  const manifestPath = path.join(buildPath, 'manifest.json')

  if (!fs.existsSync(buildPath) || !fs.existsSync(manifestPath)) {
    throw new Error(
      `Build folder not found or incomplete at: ${buildPath}\nRun "npm run build" before running tests.`,
    )
  }
}
