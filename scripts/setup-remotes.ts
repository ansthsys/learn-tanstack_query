import { execSync } from "child_process"

const GITHUB_URL = "https://github.com/ansthsys/learn-tanstack_query"
const GITLAB_URL = "https://gitlab.aqi.co.id/azmiy.thufail/learn-tanstack_query.git"

const run = (cmd: string) => execSync(cmd, { stdio: "inherit" })

try {
  console.log("Configuring dual push remotes...\n")

  const pushUrls = execSync("git remote get-url --push --all origin", {
    encoding: "utf-8",
  })
    .trim()
    .split("\n")
    .filter(Boolean)
  for (const url of pushUrls) {
    execSync(`git remote set-url --delete --push origin "${url.trim()}"`)
  }

  run(`git remote set-url --push origin ${GITHUB_URL}`)
  console.log("GitHub push URL set")

  run(`git remote set-url --add --push origin ${GITLAB_URL}`)
  console.log("GitLab push URL added")

  console.log("\nDone! Run `git push origin main` to push to both repos.\n")

  execSync("git remote -v", { stdio: "inherit" })
} catch (err) {
  console.error("Failed:", err instanceof Error ? err.message : err)
  process.exit(1)
}
