/* eslint-disable react/prop-types */
/*
 * <ResponsiveImage> — picks AVIF where the browser supports it, falls back to
 * WebP, then the original PNG. Quality is preserved (AVIF q70, WebP q88) so
 * faces and photographic detail don't degrade visibly; bytes drop ~85-95%.
 *
 * Usage:
 *   <ResponsiveImage
 *     sources={heroPhotoSources}
 *     widths={[640, 1024]}
 *     sizes="(max-width: 768px) 100vw, 50vw"
 *     alt="…"
 *     fetchPriority="high"
 *   />
 */
const buildSrcSet = (map) =>
  Object.entries(map)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([w, url]) => `${url} ${w}w`)
    .join(", ");

const ResponsiveImage = ({
  sources,
  sizes = "100vw",
  alt = "",
  className = "",
  loading = "lazy",
  fetchPriority,
  ...imgProps
}) => {
  return (
    <picture>
      {sources.avif && (
        <source type="image/avif" srcSet={buildSrcSet(sources.avif)} sizes={sizes} />
      )}
      {sources.webp && (
        <source type="image/webp" srcSet={buildSrcSet(sources.webp)} sizes={sizes} />
      )}
      <img
        src={sources.png}
        alt={alt}
        className={className}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        {...imgProps}
      />
    </picture>
  );
};

export default ResponsiveImage;
