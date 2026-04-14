/**
 * Google Material Symbols (Outlined). Requires font link in index.html.
 * @see https://fonts.google.com/icons
 */
export function MaterialSymbol({ name, size = 24, className = '', style = {}, filled = false }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`.trim()}
      aria-hidden
      style={{
        fontSize: size,
        width: size,
        height: size,
        fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      {name}
    </span>
  );
}
