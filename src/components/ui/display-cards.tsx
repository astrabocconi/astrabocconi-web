"use client";

import { cn } from "@/lib/utils";
import { AstraLogo } from "@/components/ui/logo";

interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  iconClassName?: string;
  titleClassName?: string;
}

function DisplayCard({
  className,
  icon = <AstraLogo className="size-3.5 text-white" />,
  title = "ASTRA",
  description = "Risorse per gli studenti",
  iconClassName = "text-astra-primary",
  titleClassName = "text-astra-primary",
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-32 w-[22rem] -skew-y-[8deg] select-none flex-col justify-between rounded-xl border-2 border-astra-primary/10 bg-white/70 px-4 py-3 backdrop-blur-sm transition-all duration-700 after:absolute after:-right-1 after:top-[-5%] after:h-[110%] after:w-[20rem] after:bg-gradient-to-l after:from-white after:to-transparent after:content-[''] hover:border-astra-accent/40 hover:bg-white [&>*]:flex [&>*]:items-center [&>*]:gap-2",
        className,
      )}
    >
      <div>
        <span className="relative inline-block rounded-full bg-astra-primary p-1.5">
          {icon}
        </span>
        <p className={cn("text-lg font-medium", titleClassName)}>{title}</p>
      </div>
      <p className="truncate text-[0.95rem] text-gray-600">{description}</p>
    </div>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards = [
    {
      className:
        "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-astra-primary/10 before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-white/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className:
        "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-astra-primary/10 before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-white/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className:
        "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
    },
  ];

  const displayCards = cards || defaultCards;

  return (
    <div className="animate-in fade-in-0 grid place-items-center opacity-100 duration-700 [grid-template-areas:'stack']">
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}
