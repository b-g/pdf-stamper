#!/usr/bin/env node
'use strict';

const minimist = require('minimist');
const argv = minimist(process.argv.slice(2));
const fs = require('fs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');


(async function main() {

  if (!process.argv.slice(2)[0]) {
    help();
    return process.exit(1);
  }

  if (argv.in && argv.out && argv.signature) {
    await stampSignature(argv.in, argv.out, argv.signature, argv.text);
  }

})();

async function stampSignature(srcPath, outPath, signaturePath, text) {
  const existingPdfBytes = await fs.promises.readFile(srcPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  const lastPage = pages[pages.length-1];
  const { width, height } = lastPage.getSize();

  const blue = rgb(0.05, 0.2, 1.0);
  const pos = { x: width / 2, y: 40 };

  const signaturePdfBytes = await fs.promises.readFile(signaturePath);
  const [signature] = await pdfDoc.embedPdf(signaturePdfBytes);
  const signatureDims = signature.scale(1.1);
  lastPage.drawPage(signature, {
    ...signatureDims,
    x: pos.x,
    y: pos.y,
  });

  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const textSize = 12;
  // line break hack
  const textParsed = text.replace('<br/>','\n');
  lastPage.drawText(textParsed, {
    x: pos.x,
    y: pos.y - 14,
    size: textSize,
    font: helveticaFont,
    lineHeight: 14,
    color: blue
  });

  lastPage.drawLine({
    start: { x: pos.x, y: pos.y },
    end: { x: pos.x + 140, y: pos.y },
    thickness: 1.5,
    color: blue
  });

  const pdfBytes = await pdfDoc.save();
  await fs.promises.writeFile(outPath, pdfBytes);
}

function help() {
  console.log('usage: node pdf-stamper.js --in invoice.pdf --out output.pdf --signature signature.pdf --text "hello"');
};
