import type { Language } from '../i18n/translations';

interface SEOConfig {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
}

export function updateSEO(language: Language, seoConfig: SEOConfig) {
  // Update document language
  document.documentElement.lang = language;

  // Update title
  document.title = seoConfig.title;

  // Update meta description
  const descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta) {
    descriptionMeta.setAttribute('content', seoConfig.description);
  }

  // Update meta keywords
  const keywordsMeta = document.querySelector('meta[name="keywords"]');
  if (keywordsMeta) {
    keywordsMeta.setAttribute('content', seoConfig.keywords);
  }

  // Update Open Graph title
  const ogTitleMeta = document.querySelector('meta[property="og:title"]');
  if (ogTitleMeta) {
    ogTitleMeta.setAttribute('content', seoConfig.ogTitle);
  }

  // Update Open Graph description
  const ogDescriptionMeta = document.querySelector('meta[property="og:description"]');
  if (ogDescriptionMeta) {
    ogDescriptionMeta.setAttribute('content', seoConfig.ogDescription);
  }

  // Update Twitter title
  const twitterTitleMeta = document.querySelector('meta[property="twitter:title"]');
  if (twitterTitleMeta) {
    twitterTitleMeta.setAttribute('content', seoConfig.ogTitle);
  }

  // Update Twitter description
  const twitterDescriptionMeta = document.querySelector('meta[property="twitter:description"]');
  if (twitterDescriptionMeta) {
    twitterDescriptionMeta.setAttribute('content', seoConfig.ogDescription);
  }

  // Update canonical and hreflang links
  updateHreflangLinks(language);
}

function updateHreflangLinks(currentLanguage: Language) {
  const baseUrl = 'https://vidtill.app';
  const languages: Language[] = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko'];

  // Update or create hreflang links
  languages.forEach((lang) => {
    const linkSelector = `link[hreflang="${lang}"]`;
    let link = document.querySelector(linkSelector) as HTMLLinkElement;

    const url = lang === 'zh-CN' ? baseUrl : `${baseUrl}?lang=${lang}`;

    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', lang);
      document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  });

  // Update x-default
  let xDefaultLink = document.querySelector('link[hreflang="x-default"]') as HTMLLinkElement;
  if (!xDefaultLink) {
    xDefaultLink = document.createElement('link');
    xDefaultLink.setAttribute('rel', 'alternate');
    xDefaultLink.setAttribute('hreflang', 'x-default');
    document.head.appendChild(xDefaultLink);
  }
  xDefaultLink.setAttribute('href', baseUrl);

  // Update canonical link
  const canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (canonicalLink) {
    const canonicalUrl = currentLanguage === 'zh-CN' ? baseUrl : `${baseUrl}?lang=${currentLanguage}`;
    canonicalLink.setAttribute('href', canonicalUrl);
  }
}
