const express = require('express')
const axios = require('axios')
const app = express()
app.use(express.json())

const url = 'https://damp-reef-75685.herokuapp.com/task'

const getInfo = async () => {
    return await axios.get(url).then(response => response.data)
}
const sendAnswer = async (answer) => {
    const data = { "answer": answer }
    const response = await axios.post(url, data)
    return response
}

app.get('/', async (request, response) => {
    const data = await getInfo()
    const key = data.key
    const nodes = data.nodes
    let answer = ''

    let parentAsKey = new Map();
    nodes.forEach(node => {
        if (parentAsKey.get(node.parent) === undefined) {
            parentAsKey.set(node.parent, [node])
        } else {
            parentAsKey.set(node.parent, parentAsKey.get(node.parent).concat(node))
        }
    })

    let root = parentAsKey.get('')
    let queue = []
    queue.push(root[0])

    while (queue.length > 0) {
        let node = queue.shift()
        answer += key[node.value]

        let children = parentAsKey.get(node.id)
        if (children === undefined) {
            continue
        }
        if (children.length === 2) {
            if (children[0].weight % 2 === 0) {
                queue.push(children[0])
                queue.push(children[1])
            } else {
                queue.push(children[1])
                queue.push(children[0])
            }
        } else if (children.length === 1) {
            queue.push(children[0])
        }
    }

    console.log('answer is:', answer)
    const res = await sendAnswer(answer)

    console.log('response status is:', res.status)
    console.log('statusText is:', res.statusText)

    const info = {
        'answer': answer,
        'key': key,
        'nodes': nodes,
    }
    response.json(info)
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})