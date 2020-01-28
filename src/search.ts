import axios, { AxiosResponse } from 'axios';
export interface ISearchResults {
    query : string
    hits : number
    results : ISearchResult[]
}

export interface ISearchResult {
    title : string
    pageid : number
    size : number
    wordcount : number
    url : string
}

export class Searcher {
    static async search(query: string, maxResults : number, userAgent?: string) : Promise<ISearchResults> {
        query = encodeURI(query)
        const res : AxiosResponse = await axios.get('https://wiki.multitheftauto.com/api.php', {
            headers: {
                'User-Agent': userAgent || 'mtasa-wiki-parser @ https://github.com/AfuSensi/mtasa-wiki-parser',
            },
            params: {
                action: 'query',
                format: 'json',
                list: 'search',
                srenablerewrites: 'true',
                srsearch: query,
                srlimit: maxResults
            },
        });
        const results : ISearchResult[] = []
        for (const rawResult of res.data.query.search) {
            const result : ISearchResult = {
                title: rawResult.title,
                pageid: rawResult.pageid,
                size: rawResult.size,
                wordcount: rawResult.wordcount,
                url: `https://wiki.multitheftauto.com/wiki/${rawResult.title.replace(/\s+/g, '_')}`
            }
            results.push(result)
        }
        const returnResults : ISearchResults = {
            query,
            hits: res.data.query.searchinfo.totalhits,
            results
        }
        return returnResults
    }
}