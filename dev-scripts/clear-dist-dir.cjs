const path = require("path")
const fs = require("fs")

const directory = path.join(__dirname, "..", "dist")

fs.rm(directory, { recursive: true, force: true }, (err) => {
    if (err) {
        console.error(`Erro ao remover o diretório: ${err}`)
    } else {
        console.log("Diretório removido com sucesso!")
    }
})