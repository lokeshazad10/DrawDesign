const Button = ({ title, icon = null, href, target, rel}) => {
  const content = (
    <span className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-linear-to-b from-stone-200/40 to-white/80 px-2 py-2 font-semibold`}>
      {title}
      {icon}
    </span>
  );
  const className =
    "group inline-flex items-center justify-center rounded-xl bg-linear-to-b from-white to-stone-200/40 p-1 no-underline shadow-[0_1px_3px_rgba(0,0,0,0.5)] active:scale-[0.995] active:shadow-[0_0px_1px_rgba(0,0,0,0.5)]";

  return (
    <div className="inline-flex rounded-2xl bg-linear-to-b from-stone-300/40 to-transparent p-1">
      {href ? (
        <a href={href} target={target} rel={rel} className={className}>
          {content}
        </a>
      ) : (
        <button type="button" className={className}>
          {content}
        </button>
      )}
    </div>
  );
};

export default Button;
