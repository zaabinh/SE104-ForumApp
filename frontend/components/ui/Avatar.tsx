import Image from 'next/image';

type AvatarProps = {
  src: string;
  alt: string;
  size?: number;
};

export default function Avatar({ src, alt, size = 40 }: AvatarProps) {
  return <Image src={src} alt={alt} width={size} height={size} className="rounded-full object-cover" />;
}
