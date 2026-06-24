# Planet Texture Credits

The realistic planet textures used in this portfolio are originally from
**James Hastings-Trew's Planet Pixel Emporium**, released for personal use.

Source mirror: [jeromeetienne/threex.planets](https://github.com/jeromeetienne/threex.planets)
(MIT-licensed wrapper around the same texture set).

Earth night-lights and cloud overlay come from the
[three.js examples](https://github.com/mrdoob/three.js/tree/dev/examples/textures/planets)
texture pack, MIT-licensed.

## Files

| File | Used for | Source |
|------|----------|--------|
| sunmap.jpg | Sol | planetpixelemporium.com |
| mercurymap.jpg | Mercury / About | planetpixelemporium.com |
| venusmap.jpg | Venus / Fun Facts | planetpixelemporium.com |
| earth_atmos.jpg | Earth day map | three.js examples |
| earth_lights.png | Earth night lights | three.js examples |
| earthcloudmap.jpg | Earth cloud overlay | planetpixelemporium.com |
| marsmap1k.jpg | Mars / Projects | planetpixelemporium.com |
| jupitermap.jpg | Jupiter / Skills | planetpixelemporium.com |
| saturnmap.jpg | Saturn / Notes | planetpixelemporium.com |
| saturnringcolor.jpg | Saturn rings | planetpixelemporium.com |
| uranusmap.jpg | Uranus / Education | planetpixelemporium.com |
| neptunemap.jpg | Neptune / Hobbies | planetpixelemporium.com |
| moonmap1k.jpg | (available, unused) | planetpixelemporium.com |
| ceres.jpg | Ceres / Achievements | NASA/JPL-Caltech/UCLA/MPS/DLR/IDA (Dawn) |
| pluto.jpg | Pluto / Testimonials | NASA/JHU-APL/SwRI (New Horizons) |

## NASA dwarf-planet maps (public domain)

`ceres.jpg` and `pluto.jpg` are real mission photomosaics, both **public
domain** (NASA imagery), resized to 2048-wide equirectangular JPGs:

- **Ceres** — Dawn Framing Camera grayscale global mosaic (PIA19625, survey
  orbit): the real cratered surface incl. Occator and its bright spots.
- **Pluto** — New Horizons enhanced-color global mosaic (the famous "heart",
  Sputnik Planitia / Tombaugh Regio). The south-polar latitudes were in
  darkness during the 2015 flyby (genuinely unimaged); that no-data band is
  filled with each column's nearest valid tone so the sphere has no black cap.

Sourced via Wikimedia Commons (which mirrors the NASA PIA originals).

Total footprint: ~4.5 MB across all textures. Cached aggressively at the
edge per `vercel.json` headers.
