import { IFetchedArticle, IFetchedSection } from './fetch';

export interface IParsedArticle {
  type: ParsedArticleType;
  id: number;
  url: string;
  title: string;
  categories: string[];
  sections: IParsedSection[];
  image: string | false;
}

export interface IParsedSection {
  title: string;
  paragraphs: IParsedParagraph[];
}

export interface IParsedParagraph {
  title: string | false;
  type: ParsedParagraphType;
  text: string;
}

export enum ParsedParagraphType {
  Codeblock = 'Codeblock',
  Text = 'Text',
}

export enum ParsedArticleType {
  SharedFunction = 'Shared Function',
  ClientFunction = 'Client Function',
  ServerFunction = 'Server Function',
  ClientEvent = 'Client Event',
  ServerEvent = 'Server Event',
  UsefulFunction = 'Useful Function',
  GenericPage = 'Page',
}

export class Parser {
  static parse(article: IFetchedArticle): IParsedArticle {
    const parsedArticle: IParsedArticle = {
      type: getArticleType(article),
      id: article.id,
      url: article.url,
      title: article.title,
      sections: parseSections(article.rawText, article.sections),
      categories: article.categories,
      image: article.image,
    };
    return parsedArticle;
  }
}

function parseSections(text: string, sections: IFetchedSection[]) {
  let startByte: number = 0;
  let endByte: number | undefined;
  const parsedSections: IParsedSection[] = [];
  for (const [index, section] of sections.entries()) {
    let parsedSection: IParsedSection;
    if (index === 0) {
      // First section doesnt get returned by wiki api. Parse it under "Description"
      parsedSection = {
        title: 'Description',
        paragraphs: parseParagraphs(text.substring(startByte, section.byteoffset)),
      };
      parsedSections.push(parsedSection);
    }
    startByte = section.byteoffset;
    endByte = sections.length > index + 1 ? sections[index + 1].byteoffset : undefined;
    parsedSection = {
      title: section.line,
      paragraphs: parseParagraphs(text.substring(startByte, endByte)),
    };
    parsedSections.push(parsedSection);
  }
  return parsedSections;
}

function parseParagraphs(text: string): IParsedParagraph[] {
  const paragraphs: IParsedParagraph[] = [];

  // Remove first line
  text = text.substring(text.indexOf('\n') + 1);
  // Remove magic words
  text = removeMagicWords(text);
  // Replace styling
  text = replaceStyling(text);

  // Convert <section ="name".. /> to ==Name==, Remove </section>
  text = text.replace(/<section name="([\s\S]*?)"[\s\S]*?>/g, '==$1==').replace(/<\/section>/g, '');
  // Parse templates
  text = parseTemplates(text);
  // Remove templates
  text = removeTemplates(text);
  // Parse codeblocks
  text = parseCodeblock(text);
  // Limit blank lines to 1 in a row
  text = text.replace(/^\s*$(?:\r\n?|\n){2,}/gm, '');

  // Loop ==Name== to named paragraph
  const split = text.split(/(==.*?==)/g);
  let lastParagraphName: string | false = false;
  for (const i in split) {
    if (/(==.*?==)/.test(split[i])) {
      // Is a section name
      lastParagraphName = split[i].replace(/=/g, '');
    } else {
      // Split by =.=codeblock=.= to set codeblock type
      const splitParagraphText = split[i].split('=.=codeblock=.=');
      for (let field of splitParagraphText) {
        field = field.trim();
        if (field.length === 0) {
          continue;
        }
        let type: ParsedParagraphType = ParsedParagraphType.Text;
        if (field.startsWith('```')) {
          type = ParsedParagraphType.Codeblock;
        }
        const parsedParagraph: IParsedParagraph = {
          title: lastParagraphName,
          type,
          text: field,
        };
        paragraphs.push(parsedParagraph);
      }
      if (typeof lastParagraphName === 'string') {
        lastParagraphName = false;
      }
    }
  }
  return paragraphs;
}

// Templates parse
import { parse as parseOOP } from './templates/oopTemplate';
import { parse as parseNote } from './templates/Note';
import { parse as parseWarning } from './templates/Warning';
import { parse as parseDeprecated } from './templates/Deprecated';
import { parse as parseNewFeatureItem } from './templates/NewFeatureItem';
import { parse as parseDoubleBracketLinks } from './templates/DoubleBracketLinks';
import { parse as parseHtmlComments } from './templates/HtmlComments';
const templateParsers = [
  (text: string) => {
    return parseHtmlComments(text);
  },
  (text: string) => {
    return parseNewFeatureItem(text);
  },
  (text: string) => {
    return parseOOP(text);
  },
  (text: string) => {
    return parseNote(text);
  },
  (text: string) => {
    return parseWarning(text);
  },
  (text: string) => {
    return parseDeprecated(text);
  },
  (text: string) => {
    return parseDoubleBracketLinks(text);
  },
];

function parseTemplates(text: string): string {
  for (const fn of templateParsers) {
    text = fn(text);
  }
  return text;
}

function removeTemplates(text: string): string {
  return text.replace(/{{[\s\S]+?}}/g, '');
}

function replaceStyling(text: string): string {
  return text
    .replace(/\*/g, '\u2022') // * to Unicode Character 'BULLET'
    .replace(/'''''(.*?)'''''/g, '***$1***') // Bold and italic
    .replace(/''''(.*?)''''/g, "**'$1'**") // 'bold'
    .replace(/'''(.*?)'''/g, '**$1**') // bold
    .replace(/''(.*?)''/g, '*$1*'); // italic
}

function removeMagicWords(text: string): string {
  return text.replace(/__.*?__/g, '');
}

function parseCodeblock(text: string): string {
  return text.replace(
    /<syntaxhighlight lang="(.*?)">([\s\S]+?)<\/syntaxhighlight>/g,
    '=.=codeblock=.=\n```$1\n$2\n```\n=.=codeblock=.=',
  );
}

function getArticleType(article: IFetchedArticle): ParsedArticleType {
  // We determine type from categories
  // Because of this, it may return false positives based on how well the wiki articles are organized
  const cats: string[] = [];
  for (const cat of article.categories) {
    cats.push(cat.toLowerCase());
  }

  if (cats.includes('server_functions') && cats.includes('client_functions')) {
    return ParsedArticleType.SharedFunction;
  } else if (cats.includes('useful_functions')) {
    return ParsedArticleType.UsefulFunction;
  } else if (cats.includes('client_functions')) {
    return ParsedArticleType.ClientFunction;
  } else if (cats.includes('server_functions')) {
    return ParsedArticleType.ServerFunction;
  } else if (cats.includes('client_events')) {
    return ParsedArticleType.ClientEvent;
  } else if (cats.includes('server_events')) {
    return ParsedArticleType.ServerEvent;
  }
  return ParsedArticleType.GenericPage;
}
