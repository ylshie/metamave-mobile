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
    const trace = []
    trace.push({enter: Date.now()})
    const ret  = await fetch(base + apiDrawMe, options({trace, code}))
    const data = await ret.json();
    //console.log('data', data)
    if (data.trace) { data.trace.push({done: Date.now()})}
    //trace.push({done: Date.now()})
    //console.log('drawMe', 'done', trace, await data.json())
    if (data.trace) {
        console.log('trace', data.trace)
    }
    return data;
}
