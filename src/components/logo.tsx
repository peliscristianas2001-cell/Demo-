import Link from 'next/link';
import Image from 'next/image';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" prefetch={false}>
      <Image
        src="https://instagram.fepa9-2.fna.fbcdn.net/v/t51.2885-19/478145482_2050373918705456_5085497722998866930_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fepa9-2.fna.fbcdn.net&_nc_cat=108&_nc_oc=Q6cZ2QFzjVvSlHCf0Z2hstJHws97y0Q1b3iIKZskWlJOzKkzsXA5d7w5jeqV3MF8EUnkXK0&_nc_ohc=0kFfIMnvmBwQ7kNvwHJGNkB&_nc_gid=9W3okjmGr8DgZuyMHj14tg&edm=AEYEu-QBAAAA&ccb=7-5&oh=00_AfSWH7AGXQ1um0uq2Vfz-d6jjRHQIyOiIFf90fiE8TXyiA&oe=687DAD20&_nc_sid=ead929"
        alt="YO TE LLEVO Logo"
        width={36}
        height={36}
        className="rounded-full"
      />
      <span className="text-2xl font-bold tracking-tight text-foreground font-headline">
        YO TE LLEVO
      </span>
    </Link>
  );
}
