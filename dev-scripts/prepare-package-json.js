const path = require("path")
const fs = require("fs")

const distDir = path.join(__dirname, "..", "dist")

function createEsmModulePackageJson() {
    fs.readdirSync(distDir)
        .forEach((dir) => {
            if (dir === "esm") {
                const packageJsonFile = path.join(distDir, dir, "/package.json")

                if (!fs.existsSync(packageJsonFile)) {
                    fs.writeFileSync(
                        packageJsonFile,
                        new Uint8Array(Buffer.from('{"type": "module"}')),
                    )
                }
            } else if (dir == "cjs") {
                const packageJsonFile = path.join(distDir, dir, "/package.json")

                if (!fs.existsSync(packageJsonFile)) {
                    fs.writeFileSync(
                        packageJsonFile,
                        new Uint8Array(Buffer.from('{"type": "commonjs"}')),
                    )
                }
            }
        })
}

createEsmModulePackageJson()