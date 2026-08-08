type OrganicVideoCardProps = {
  title: string;
  eyebrow: string;
  description: string;
  src: string;
  poster: string;
  label: string;
  className?: string;
  dark?: boolean;
};

export default function OrganicVideoCard({
  title,
  eyebrow,
  description,
  src,
  poster,
  label,
  className = "",
  dark = false,
}: OrganicVideoCardProps) {
  const surface = dark
    ? "border-white/10 bg-white/[0.06] text-white"
    : "border-[#d8cda9] bg-white/75 text-[#123a2a]";
  const body = dark ? "text-white/68" : "text-[#68746a]";

  return (
    <article className={`overflow-hidden rounded-[2rem] border shadow-sm ${surface} ${className}`}>
      <div className="relative aspect-[9/16] bg-black">
        <video
          className="h-full w-full object-cover"
          controls
          playsInline
          preload="metadata"
          poster={poster}
          aria-label={label}
        >
          <source src={src} type="video/mp4" />
          Your browser does not support embedded video. Contact Wild Spine Uganda for current field clips.
        </video>
      </div>
      <div className="p-5">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#b8860b]">{eyebrow}</p>
        <h3 className="mt-3 text-xl font-black">{title}</h3>
        <p className={`mt-3 text-sm leading-6 ${body}`}>{description}</p>
      </div>
    </article>
  );
}
