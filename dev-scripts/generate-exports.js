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
        } else if (path.extname(entry) === ".js") {
            const exportPath = `${base}/${entry.replace(".js", "")}`

            if (exportPath !== "/index") {
                const jsPath = `./dist${exportPath}.js`
                const dtsPath = `./dist${exportPath}.d.ts`

                exports[`.${exportPath.replace("/index", "")}`] = {
                    "import": jsPath,
                    "types": dtsPath
                }
            }
        }
    })

    return exports
}

const generatedExports = generateExports(distPath)

packageJson.exports = {
    ".": {
        "import": "./dist/index.js",
        "types": "./dist/index.d.ts"
    },
    ...generatedExports
}

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))

console.log("Exports gerados e adicionados ao package.json")
