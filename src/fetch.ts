import util from 'util';
import axios, { AxiosResponse } from 'axios';

export interface IFetchedArticle {
  title: string;
  url: string;
  id: number;
  categories: string[];
  templates: string[];
  image: string | false;
  rawText: string;
  sections: IFetchedSection[];
}

export interface IFetchedSection {
  toclevel: number;
  level: number;
  line: string;
  number: number;
  index: number;
  fromtitle: string;
  byteoffset: number;
  anchor: string;
}

export class Fetcher {
  static async fetch(query: string, userAgent?: string) {
    query = encodeURI(query.replace(/\s+/g, '_')); // Convert space to _ and encode
    const res: AxiosResponse = await axios.get('https://wiki.multitheftauto.com/api.php', {
      headers: {
        'User-Agent': userAgent || 'mtasa-wiki-parser @ https://github.com/AfuSensi/mtasa-wiki-parser',
      },
      params: {
        action: 'parse',
        page: query,
        format: 'json',
        prop: 'wikitext|images|templates|sections|categories',
        redirects: 'true',
        disabletoc: 'true',
        disablelimitreport: 'true',
      },
    });
    if (res.data.error) {
      throw Error(`${res.data.error.code}: ${res.data.error.info}`);
    }

    // Image
    const imageUrl: string | false =
      res.data.parse.images.length > 0 && typeof res.data.parse.images[0] === 'string'
        ? await Fetcher.getImageUrl(res.data.parse.images[0], userAgent)
        : false;

    // Templates
    const templates: string[] = [];
    res.data.parse.templates.forEach((element: { [x: string]: string }) => {
      templates.push(element['*']);
    });
    // Categories
    const categories: string[] = [];
    res.data.parse.categories.forEach((element: { [x: string]: string }) => {
      categories.push(element['*']);
    });
    // Sections
    const sections: IFetchedSection[] = [];
    res.data.parse.sections.forEach((element: IFetchedSection) => {
      sections.push(element);
    });

    const fetchedArticle: IFetchedArticle = {
      id: res.data.parse.pageid,
      url: `https://wiki.multitheftauto.com/wiki/${res.data.parse.title.replace(/\s+/g, '_')}`,
      title: res.data.parse.title,
      categories,
      templates,
      sections,
      image: imageUrl,
      rawText: res.data.parse.wikitext['*'],
    };
    return fetchedArticle;
  }
  static async getImageUrl(imageName: string, userAgent?: string): Promise<string | false> {
    try {
      const res: AxiosResponse = await axios.get('https://wiki.multitheftauto.com/api.php', {
        headers: {
          'User-Agent': userAgent || 'mtasa-wiki-parser @ https://github.com/AfuSensi/mtasa-wiki-parser',
        },
        params: {
          action: 'query',
          prop: 'imageinfo',
          iiprop: 'url',
          titles: `File:${imageName}`,
          format: 'json',
        },
      });
      const pages: string[] = Object.keys(res.data.query.pages);
      for (const id of pages) {
        if (res.data.query.pages[id].hasOwnProperty('missing') || res.data.query.pages[id].hasOwnProperty('invalid')) {
          return false;
        } else {
          return res.data.query.pages[id].imageinfo[0].url;
        }
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}
