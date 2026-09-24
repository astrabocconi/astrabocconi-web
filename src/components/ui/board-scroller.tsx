import { User } from "lucide-react";

// Continuous horizontal scroll of board member photos, replacing the old
// hover-expand panel. Same marquee keyframes as BrandScroller (pure CSS, no
// animation library) and the same edge fade via mask-image.

export type BoardMember = {
  name?: string;
  /** Until real photos land, entries render as a placeholder avatar. */
  photo?: string;
};

const TRACK_COPIES = 3;

function Portrait({ member }: { member: BoardMember }) {
  return (
    <div className="flex w-40 shrink-0 flex-col items-center gap-3">
      {member.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={member.photo}
          alt={member.name ?? ""}
          className="h-40 w-40 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-40 w-40 items-center justify-center rounded-full bg-astra-light">
          <User className="h-14 w-14 text-astra-primary/40" />
        </div>
      )}
      {member.name && (
        <p className="text-sm font-semibold text-astra-primary">{member.name}</p>
      )}
    </div>
  );
}

export function BoardScroller({ members }: { members: BoardMember[] }) {
  return (
    <div className="group flex max-w-full flex-row overflow-hidden py-1 [--duration:36s] [--gap:1.75rem] [gap:var(--gap)] [mask-image:linear-gradient(to_right,_rgba(0,_0,_0,_0),rgba(0,_0,_0,_1)_10%,rgba(0,_0,_0,_1)_90%,rgba(0,_0,_0,_0))]">
      {Array(TRACK_COPIES)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            aria-hidden={i > 0}
            className="animate-marquee flex shrink-0 flex-row justify-around [gap:var(--gap)]"
          >
            {members.map((member, j) => (
              <Portrait key={j} member={member} />
            ))}
          </div>
        ))}
    </div>
  );
}

export default BoardScroller;
