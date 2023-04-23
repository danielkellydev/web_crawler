const { JSDOM } = require('jsdom')

async function crawlPage(currentURL){
    console.log(`crawling ${currentURL}`)

    try {
    const resp = await fetch(currentURL)

    if (resp.status > 399){
        console.log (`error in fetch with status code: ${resp.status} for ${currentURL}`)
        return
    }

    const contentType = resp.headers.get('content-type')
    if (!contentType.includes('text/html')) {
        console.log(`skipping ${currentURL} because content-type is ${contentType}`)
        return
    }

    console.log (await resp.text())
    } catch (err) {
        console.log(`error fetching ${currentURL}: ${err.message}`)
    }
}

function getURLsFromHTML (htmlBody, baseURL){
    const urls = []
    const dom = new JSDOM(htmlBody)
    const linkElements = dom.window.document.querySelectorAll('a')
    for (const linkElement of linkElements) {
        if (linkElement.href.slice(0, 1)=== '/') {
            // relative URL
            try {
            const urlObj = new URL (`${baseURL}${linkElement.href}`)
            urls.push(urlObj.href)
            } catch (err) {
                // invalid URL
                console.log(`error with relative url: ${err.message}`)
            }
        }else{
            // absolute URL
            try {
                const urlObj = new URL(linkElement.href)
            urls.push(linkElement.href)
            } catch (err) {
                // invalid URL
                console.log(`error with absolute url: ${err.message}`)
            }
        }
        
    }
    return urls
}

function normalizeURL(urlString) {
    const urlObj = new URL(urlString)
    const hostPath = `${urlObj.hostname}${urlObj.pathname}`
    if (hostPath.length > 0 && hostPath.slice(-1) === '/') {
        return hostPath.slice(0, -1)
    }
    return hostPath
}

module.exports = {
    normalizeURL, getURLsFromHTML, crawlPage
}