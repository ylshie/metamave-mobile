const apiDrawMe = "/api/drawme";
const base = 'https://wezan.arwaexchange.com'

function options(body) {
    return {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    }
}

export const drawMe = async (code, qrimage) => {
    console.log('drawMe', 'call')
    const data = await fetch(base + apiDrawMe, options({code}))
    console.log('drawMe', 'done', data)
    return await data.json();
}
