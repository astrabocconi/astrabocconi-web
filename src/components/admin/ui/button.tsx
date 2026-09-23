// Copied from astra-app apps/web/app/_ui so the backoffice matches its dashboard.
// `danger` and `buttonClass` are additions: the backoffice deletes things and
// styles <Link>s as buttons, which the app's dashboard handles ad hoc.
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  block?: boolean;
};

const STYLES: Record<Variant, string> = {
  primary: "bg-astra-primary text-white hover:bg-astra-dark active:bg-astra-dark",
  secondary: "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
  danger: "border border-red-200 bg-white text-red-600 hover:bg-red-50",
};

export function buttonClass(variant: Variant = "primary", block = false) {
  return `inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${STYLES[variant]} ${
    block ? "w-full" : ""
  }`;
}

export function Button({
  variant = "primary",
  block = false,
  className = "",
  type = "button",
  ...props
}: Props) {
  return (
    <button type={type} className={`${buttonClass(variant, block)} ${className}`} {...props} />
  );
}
