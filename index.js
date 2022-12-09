#!/usr/bin/env node
'use strict';

const defaults = {
  x: 297,
  y: 40,
  text: '',
  page: -1
};

const minimist = require('minimist');
const argv = minimist(process.argv.slice(2), { 'default': defaults });
const fs = require('fs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');


(async function main() {

  if (!process.argv.slice(2)[0]) {
    help();
    return process.exit(1);
  }

  if (argv.in && argv.out && argv.signature) {
    await stampSignature(argv);
  }

})();

async function stampSignature(argv) {
  const existingPdfBytes = await fs.promises.readFile(argv.in);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  const pageIndex = parseInt(argv.page);
  const page = pageIndex === -1 ? pages[pages.length - 1] : pages[pageIndex];
  const { width, height } = page.getSize();

  const blue = rgb(0.05, 0.2, 1.0);
  const pos = { x: argv.x, y: argv.y };

  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const textSize = 12;
  // line break hack
  const textParsed = argv.text.replace('<br/>','\n');
  page.drawText(textParsed, {
    x: pos.x,
    y: pos.y - 14,
    size: textSize,
    font: helveticaFont,
    lineHeight: 14,
    color: blue
  });

  page.drawLine({
    start: { x: pos.x, y: pos.y },
    end: { x: pos.x + 140, y: pos.y },
    thickness: 1.5,
    color: blue
  });

  const signaturePdfBytes = await fs.promises.readFile(argv.signature);
  const [signature] = await pdfDoc.embedPdf(signaturePdfBytes);
  const signatureDims = signature.scale(0.85);
  page.drawPage(signature, {
    ...signatureDims,
    x: pos.x,
    y: pos.y,
  });

  const pdfBytes = await pdfDoc.save();
  await fs.promises.writeFile(argv.out, pdfBytes);
}

function help() {
  console.log('usage: node pdf-stamper.js --in invoice.pdf --out output.pdf --signature signature.pdf --text "hello"');
};
