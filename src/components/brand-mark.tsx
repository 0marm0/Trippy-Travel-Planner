/* eslint-disable @next/next/no-img-element */

type BrandMarkProps = {
  alt?: string;
  className?: string;
};

/** The supplied TRIPPY mark; its source PNG is kept losslessly in public/brand. */
export default function BrandMark({ alt = "", className = "" }: BrandMarkProps) {
  return <img alt={alt} className={`trippy-brand-mark ${className}`.trim()} src="/brand/trippy-icon.png" />;
}
