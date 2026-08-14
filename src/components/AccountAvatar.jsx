import { useEffect, useState } from "react";
import {
  buildInitialAvatarDataUrl,
  getAvatarSrc,
  userToProfile,
} from "../lib/avatar.js";

export default function AccountAvatar({
  user,
  username,
  profile: profileProp,
  size = 32,
  className = "h-8 w-8 shrink-0 overflow-hidden rounded-full",
}) {
  const profile = profileProp ?? userToProfile(user);
  const trimmed = (username || user?.nickname || "").trim();
  const fallback = buildInitialAvatarDataUrl(trimmed || "?");
  const [src, setSrc] = useState(fallback);

  useEffect(() => {
    let cancelled = false;
    const placeholder = buildInitialAvatarDataUrl(trimmed || "?");
    setSrc(placeholder);

    const load = async () => {
      try {
        const next = profile
          ? await getAvatarSrc(profile, placeholder, size)
          : placeholder;
        if (!cancelled) setSrc(next);
      } catch {
        if (!cancelled) setSrc(placeholder);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [
    trimmed,
    size,
    profile?.nickname,
    profile?.ely_username,
    profile?.ely_uuid,
    profile?.mc_uuid,
  ]);

  return (
    <span className={`relative ring-1 ring-white/10 ${className}`}>
      <img
        src={src}
        alt=""
        draggable={false}
        width={size}
        height={size}
        className="aspect-square h-full w-full object-cover object-center [image-rendering:pixelated]"
        onError={() => setSrc(fallback)}
      />
    </span>
  );
}
