const fs = require("fs")
const path = require("path")

const distPath = path.join(__dirname, "..", "src")

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
        } else if (path.extname(entry) === ".ts") {
            const exportPath = `${base}/${entry.replace(".ts", "")}`

            const cjsPath = `./dist/cjs${exportPath}.js`
            const esmPath = `./dist/esm${exportPath}.js`
            const dtsPath = `./dist/types${exportPath}.d.ts`

            if (exportPath !== "/index") {
                exports[`.${exportPath.replace("/index", "")}`] = {
                    import: esmPath,
                    require: cjsPath,
                    default: esmPath,
                    types: dtsPath
                }
            }
        }
    })

    return exports
}

const generatedExports = generateExports(distPath)

packageJson.exports = {
    ".": {
        import: "./dist/esm/index.js",
        require: "./dist/esm/index.js",
        default: "./dist/esm/index.js",
        types: "./dist/types/index.d.ts",
    },
    ...generatedExports
}

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))

console.log("Exports gerados e adicionados ao package.json")
