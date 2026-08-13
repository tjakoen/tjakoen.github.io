# Shot (portfolio)

A framed screenshot of a real running interface, with a caption underneath. Used on project pages
where the argument is "here is the thing actually working", so the capture has to stay unretouched.

Distinct from the figures in FIGURES: those are tokenized inline SVG and must survive the static
export with no external assets. A shot is a raster capture of a live app, served from /media.

Always set `loading="lazy"` plus `width` and `height` on the image, so the page reserves the space
and a screenshot never blocks first paint.

## Shot
```html
<figure class="shot">
  <img class="shot__img" src="/media/greenroom/run-matrix.jpg" width="1440" height="900"
       loading="lazy" alt="A run dashboard showing six passed and two failed checks across two environments.">
  <figcaption class="shot__cap">One run, two environments, per-environment health.</figcaption>
</figure>
```

Add `data-lightbox` to the image when the capture carries UI text a reader has to be able to read.
GRAIN's viewer (`scripts/lightbox.js`) then opens it full size on a click, and the alt text becomes
the viewer's caption. A note's content column is narrower than a project page's, so a dense console
screenshot needs it there and a single wide dashboard usually does not.

There is no side-by-side variant on purpose. The board's content column is around 688px, so a two-up
grid renders each capture near 340px wide, and the UI text a screenshot exists to show stops being
readable at that size. Stack them full width and let the captions do the pairing.
