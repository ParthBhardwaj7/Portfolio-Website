# ASSET LICENSES

Every external astronomical asset used by the 3D scene, with source, license, and where it is used. All runtime files live in `public/textures/`.

| Asset | Source | URL | License | Local file(s) | Where used |
|---|---|---|---|---|---|
| Earth surface (day) | NASA Visible Earth — Blue Marble Next Generation w/ topography & bathymetry | https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200412.3x2700x1350.jpg | NASA imagery — public domain (attribution appreciated) | `earth_day.jpg` (4096×2048), `earth_day-1024.jpg` (mobile) | Earth surface shader (day map) |
| Earth night lights | NASA Visible Earth — Black Marble 2012 (Suomi NPP VIIRS) | https://eoimages.gsfc.nasa.gov/images/imagerecords/79000/79765/dnb_land_ocean_ice.2012.3600x1800.jpg | NASA imagery — public domain | `earth_night.jpg`, `earth_night-1024.jpg` (mobile) | Earth surface shader (city lights) |
| Earth clouds | NASA Visible Earth cloud composite (via three-globe asset bundle) | https://unpkg.com/three-globe/example/img/earth-clouds.png | NASA-derived — public domain | `earth_clouds.jpg`, `earth_clouds-1024.jpg` (mobile) | Earth cloud layer shader |
| Earth topology (bump) | NASA-derived elevation (via three-globe asset bundle) | https://unpkg.com/three-globe/example/img/earth-topology.png | NASA-derived — public domain | `earth_topology.jpg` | Earth surface bump/terrain relief |
| Earth ocean mask | three-globe asset bundle (NASA-derived) | https://unpkg.com/three-globe/example/img/earth-water.png | NASA-derived — public domain | `earth_water.jpg` | Earth ocean specular map |
| Moon | NASA Scientific Visualization Studio — LROC/WAC color mosaic | https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_poles_1k.jpg | NASA imagery — public domain | `moon.jpg`, `moon-1024.jpg` (mobile) | Moon mesh (map + bump) |
| Sun surface | Solar System Scope texture (based on NASA SDO solar imagery) | https://www.solarsystemscope.com/textures/download/2k_sun.jpg | CC BY 4.0 — © Solar System Scope | `sun.jpg`, `sun-1024.jpg` (mobile) | Sun shader base + animated granulation |
| Mars | Solar System Scope | https://www.solarsystemscope.com/textures/download/2k_mars.jpg | CC BY 4.0 — © Solar System Scope | `mars.jpg`, `mars-1024.jpg` (mobile) | Mars mesh |
| Jupiter | Solar System Scope | https://www.solarsystemscope.com/textures/download/2k_jupiter.jpg | CC BY 4.0 — © Solar System Scope | `jupiter.jpg`, `jupiter-1024.jpg` (mobile) | Jupiter mesh |
| Saturn | Solar System Scope | https://www.solarsystemscope.com/textures/download/2k_saturn.jpg | CC BY 4.0 — © Solar System Scope | `saturn.jpg`, `saturn-1024.jpg` (mobile) | Saturn mesh |
| Saturn ring | Solar System Scope | https://www.solarsystemscope.com/textures/download/2k_saturn_ring_alpha.png | CC BY 4.0 — © Solar System Scope | `saturn_ring.png` | Saturn ring geometry |
| Milky Way panorama | ESO — Serge Brunier, "Milky Way panorama" (eso0932a) | https://www.eso.org/public/images/eso0932a/ | CC BY 4.0 — © ESO / Serge Brunier | `milkyway_4096.jpg` (desktop), `milkyway_2048.jpg` (mobile) | Galaxy photographic base layer |

## Attribution (also shown in the site footer)

- Earth day/night & lunar imagery: **NASA Visible Earth / NASA Black Marble / NASA LROC** (public domain).
- Solar & planetary textures: **© Solar System Scope, CC BY 4.0**.
- Milky Way panorama: **ESO / Serge Brunier, CC BY 4.0**.

## Honesty note

The starfield, spiral-arm particle layer, nebulae, and distant-galaxy sprites are a
**scientifically inspired simulation** used for depth and parallax — they do not
represent measured individual stars. The photographic layers above are real
astronomical imagery. The UI labels this as "real astronomical imagery +
scientifically inspired simulation."

## Optimization

`scripts/optimize-textures.mjs` regenerates the compressed/mobile variants.
Budgets: desktop texture set ≈ 7.7 MB; mobile set ≈ 0.6 MB.
