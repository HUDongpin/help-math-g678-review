import React from 'react';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {p050Intro} from '../packages/demos/src/nms-l02-p050-intro-v1';
import {P050IntroView} from '../packages/demos/src/nms-l02-p050-intro-view-v1';
import {P050_TEXT} from '../packages/demos/src/nms-l02-p050-text-v1';

const HELD_X = 1787, HELD_Y = -672, TRAVEL_X = 6554, TRAVEL_Y = 2755;
const percent = (matrixX: number) => 8 + 2.7 * (21 + (matrixX - HELD_X) / 382);
const attr = (tag: string, name: string) => tag.match(new RegExp(name + '="([^"]*)"'))?.[1];
const styleOpacity = (tag: string) => Number(attr(tag, 'style')?.match(/opacity:([^;]+)/)?.[1]);
const first = (html: string, pattern: RegExp) => html.match(pattern)?.[0] ?? '';

let cases = 0;
for (const language of ['en', 'es'] as const) {
  for (const reducedMotion of [false, true]) {
    for (let frame = 1; frame <= 208; frame += 1) {
      const source = p050Intro(frame);
      const html = renderToStaticMarkup(<P050IntroView frame={frame} language={language} reducedMotion={reducedMotion} />);
      const text = P050_TEXT[language];
      const object = (id: number) => source.objects.find(item => item.characterId === id);
      const question = first(html, /<h2\b[^>]*>/);
      const paragraphs = [...html.matchAll(/<p\b[^>]*>/g)].map(match => match[0]);
      assert.equal(paragraphs.length, 2);
      assert.equal(styleOpacity(question), object(50)?.alpha ?? 0);
      assert.equal(styleOpacity(paragraphs[0]!), object(48)?.alpha ?? 0);
      assert.equal(styleOpacity(paragraphs[1]!), object(54)?.alpha ?? 0);
      assert.ok(html.includes(text.question));
      assert.ok(html.includes(text.instruction));
      assert.ok(html.includes(text.helpInstruction));
      const axis = object(56) ?? object(46);
      const axisAlpha = axis?.alpha ?? 0;
      const scroll = first(html, /<div class="p050-line-scroll"[^>]*>/);
      const axisSvg = first(html, /<svg[^>]*>/);
      assert.equal(styleOpacity(axisSvg), axisAlpha);
      assert.equal(scroll.includes('tabindex="0"'), axisAlpha > 0);
      assert.equal(scroll.includes('tabindex="-1"'), axisAlpha === 0);
      assert.equal(scroll.includes('aria-hidden="true"'), axisAlpha === 0);
      const lineOpen = html.indexOf('<div class="p050-line"');
      const lineClose = html.indexOf('</div>', lineOpen);
      const demoOpen = html.indexOf('<span class="p050-demo-value"');
      const pointerOpen = html.indexOf('<span aria-hidden="true" class="p050-demo-pointer"');
      if (demoOpen >= 0) assert.ok(demoOpen > lineOpen && demoOpen < lineClose);
      if (pointerOpen >= 0) assert.ok(pointerOpen > lineOpen && pointerOpen < lineClose);
      assert.equal(html.includes('p050-intro-axis'), false);
      const red = source.objects.some(item => item.characterId >= 57 && item.characterId <= 62 && item.alpha > 0);
      assert.equal(html.includes('stroke="#c02920"'), red);
      const wholeTags = [...html.matchAll(/<span class="p050-whole"[^>]*>[^<]*<\/span>/g)].map(match => match[0]);
      const wholes = wholeTags.map(tag => tag.replace(/<[^>]+>/g, ''));
      assert.deepEqual(wholes, ['0', '1', '2', '3']);
      wholeTags.forEach(tag => {
        assert.equal(styleOpacity(tag), axisAlpha);
        assert.equal(tag.includes('aria-hidden="true"'), axisAlpha === 0);
      });
      const decimals = [...html.matchAll(/<div class="p050-items p050-demo-items"[\s\S]*?<\/div>/g)][0]![0].match(/<span\b[^>]*>[\s\S]*?<\/span>/g)!;
      assert.deepEqual(decimals.map(item => item.replace(/<[^>]+>/g, '')), [41,42,43,44,45].map(id => object(id)?.text ?? ''));
      [41, 42, 43, 44, 45].forEach((id, index) => assert.equal(styleOpacity(decimals[index]!), object(id)?.alpha ?? 0));
      const demo = object(40);
      const demoTag = first(html, /<span class="p050-demo-value"[^>]*>/);
      if (!demo) assert.equal(demoTag, '');
      else {
        const moving = reducedMotion && frame >= 120 && frame < 127;
        const matrixX = moving ? HELD_X - TRAVEL_X : demo.matrix[4];
        const matrixY = moving ? HELD_Y + TRAVEL_Y : demo.matrix[5];
        const expectedTop = .5 + 9 * Math.max(0, Math.min(1, (matrixY - HELD_Y) / TRAVEL_Y));
        assert.equal(styleOpacity(demoTag), demo.alpha);
        assert.ok(attr(demoTag, 'style')?.includes('left:' + percent(matrixX) + '%'));
        assert.ok(attr(demoTag, 'style')?.includes('top:' + expectedTop + 'rem'));
        assert.equal(demoTag.includes('aria-hidden="true"'), demo.alpha === 0);
        assert.equal(attr(demoTag, 'data-p050-demo-placed'), frame >= 127 ? 'true' : 'false');
        if (moving) assert.notEqual(percent(matrixX), percent(HELD_X));
      }
      const pointer = object(64);
      const pointerTag = first(html, /<span aria-hidden="true" class="p050-demo-pointer"[^>]*>/);
      assert.equal(Boolean(pointerTag), Boolean(pointer && pointer.alpha > 0 && !reducedMotion));
      if (pointerTag) assert.equal(styleOpacity(pointerTag), pointer!.alpha);
      cases += 1;
    }
  }
}
for (const frame of [0, 209, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
  assert.throws(() => renderToStaticMarkup(<P050IntroView frame={frame} />), /P050_INTRO_FRAME/);
}
console.log(JSON.stringify({status:'PASS', cases, frames:208, languages:['en','es'], reducedMotion:true, invalidFrames:5, scope:'SSR tree, independent alpha, and real focus/visibility attributes only. Browser geometry was not run.'}));
