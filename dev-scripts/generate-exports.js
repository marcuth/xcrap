const fs = require("fs")
const path = require("path")

const distPath = path.join(__dirname, "..", "dist")

const packageJsonPath = path.join(__dirname, "..", "package.json")
const packageJson = require(packageJsonPath)

function generateExports(dir, base = "") {
    const entries = fs.readdirSync(dir)
    let exports = {}

    entries.forEach(entry => {
        const fullPath = path.join(dir, entry)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
            exports = {
                ...exports,
                ...generateExports(fullPath, `${base}/${entry}`)
            }
        } else if (path.extname(entry) === ".js" && entry !== "index.js") {
            const exportPath = `.${base}/${entry.replace(".js", "")}`
            exports[exportPath] = `${exportPath}.js`
        }
    })

    return exports
}

const generatedExports = generateExports(distPath)

packageJson.exports = {
    ...generatedExports
}

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))

console.log("Exports gerados e adicionados ao package.json")
