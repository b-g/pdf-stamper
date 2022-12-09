pdf-stamper
===========

Tiny command line tool to stamp pdfs with a signature image

## Usage

```bash
$ pdf-stamper --in invoice.pdf --out invoice_checked.pdf --signature signature.pdf --text "lorem ipsum"

$ for i in *.pdf; do pdf-stamper --in "${i}" --out "signed_${i}" --signature signature.pdf --text "lorem ipsum" --x 230 --y 180 --page 0; done
```

 ## Install pdf-stamper globally

```bash
$ npm i -g
```
