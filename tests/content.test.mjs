import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const content = JSON.parse(await readFile('public/content/site.json', 'utf8'));

test('required CMS sections exist', () => {
  for (const key of ['home', 'about', 'school', 'care', 'featuredStory', 'news', 'gallery', 'videos', 'ctas', 'contact']) {
    assert.ok(content[key] !== undefined, `missing ${key}`);
  }
});

test('managed links use safe public schemes', () => {
  const urls = [content.home.primaryCta.url, content.home.secondaryCta.url, ...content.ctas.map((item) => item.url), ...content.news.map((item) => item.url)];
  for (const url of urls) assert.match(url, /^(https?:\/\/|mailto:|tel:|#)/i);
});

test('videos are external links, not repository files', () => {
  for (const video of content.videos) assert.match(video.url, /^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//i);
});

test('images stay in the public assets directory', () => {
  const images = [content.home.image, content.featuredStory.image, ...content.news.map((item) => item.image), ...content.gallery.map((item) => item.image)].filter(Boolean);
  for (const image of images) assert.match(image, /^assets\//);
});
