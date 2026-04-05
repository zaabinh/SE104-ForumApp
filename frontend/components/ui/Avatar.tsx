type AvatarProps = {
  src?: string | null;
  alt: string;
  size?: number;
};

export default function Avatar({ src, alt, size = 40 }: AvatarProps) {
  return (
    <img
      src={src || `https://ui-avatars.com/api/?background=e2e8f0&color=0f172a&name=${encodeURIComponent(alt || 'User')}`}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full border border-white/70 object-cover shadow-sm"
    />
  );
}
