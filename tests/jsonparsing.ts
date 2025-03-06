import { JsonParser } from "../src/parsing"

const json = `
    {
        "name": "John Doe",
        "age": 30,
        "city": "New York",
        "hobbies": ["reading", "painting", "cooking"]
    }`

type People = {
    name: string
    age: string
    city: string
    hobbies: string[]
}

const jsonParser = new JsonParser<People>(json)

const parsedItem = jsonParser.parseItem({
    people: {
        model: {
            name: {
                path: "name"
            },
            age: {
                path: "age"
            },
            city: {
                path: "city"
            },
            hobbies: {
                path: "hobbies"
            }
        }
    }
})

console.log(parsedItem)