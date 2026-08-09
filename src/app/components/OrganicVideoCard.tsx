type OrganicVideoCardProps = {
  title: string;
  eyebrow?: string;
  description: string;
  src: string;
  poster: string;
  label: string;
  className?: string;
  dark?: boolean;
  wide?: boolean;
};

export default function OrganicVideoCard({
  title,
  description,
  src,
  poster,
  label,
  className = "",
  dark = false,
  wide = false,
}: OrganicVideoCardProps) {
  const surface = dark
    ? "border-white/12 bg-white/[0.07] text-white"
    : "border-[#d8cda9] bg-white/85 text-[#123a2a]";
  const body = dark ? "text-white/68" : "text-[#68746a]";
  const aspect = wide ? "aspect-video" : "aspect-[4/5]";

  return (
    <article className={`group overflow-hidden rounded-[2rem] border shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${surface} ${className}`}>
      <div className={`relative ${aspect} bg-black`}>
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
        <h3 className="text-xl font-black leading-tight">{title}</h3>
        <p className={`mt-3 text-sm leading-6 ${body}`}>{description}</p>
      </div>
    </article>
  );
}
