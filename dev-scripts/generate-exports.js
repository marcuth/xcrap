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

            const jsPath = `./dist${exportPath}.js`
            const mjsPath = `./dist${exportPath}.mjs`
            const dtsPath = `./dist${exportPath}.d.ts`

            fs.copyFileSync(jsPath, mjsPath)

            if (exportPath !== "/index") {
                exports[`.${exportPath.replace("/index", "")}`] = {
                    import: {
                        default: jsPath,
                        types: dtsPath
                    },
                    require: {
                        default: mjsPath,
                        types: dtsPath
                    }
                }
            }
        }
    })

    return exports
}

const generatedExports = generateExports(distPath)

packageJson.exports = {
    ".": {
        import: {
            default: "./dist/index.js",
            types: "./dist/index.d.ts"
        },
        require: {
            default: "./dist/index.js",
            types: "./dist/index.d.ts"
        }
    },
    ...generatedExports
}

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))

console.log("Exports gerados e adicionados ao package.json")
