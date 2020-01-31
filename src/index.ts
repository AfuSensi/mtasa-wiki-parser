import { Fetcher } from './fetch';
import { Searcher, ISearchResults } from './search';
import { Parser, IParsedArticle } from './parse';

export class MTAWikiParser {
  static async fetch(title: string, customUserAgent?: string): Promise<IParsedArticle> {
    const fetchedArticle = await Fetcher.fetch(title, customUserAgent);
    const parsedArticle = Parser.parse(fetchedArticle);
    return parsedArticle;
  }
  static async search(query: string, maxResults: number = 5, customUserAgent?: string): Promise<ISearchResults> {
    const results = await Searcher.search(query, maxResults, customUserAgent);
    return results;
  }
}

// import util from "util"
// async function test() {
//   const e = await MTAWikiParser.fetch("isElementWaitingForGroundToLoad")
//   console.log(util.inspect(e, false, null, true /* enable colors */))
// }
// test()
