import { AstraLogo } from "@/components/ui/logo";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-linear-to-b from-astra-light to-white px-6">
      <AstraLogo className="h-16 w-16 text-astra-primary" />
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-astra-primary sm:text-4xl">
        ASTRA Bocconi
      </h1>
      <p className="mt-3 max-w-md text-center text-gray-600">
        Il nuovo sito è in costruzione.
      </p>
    </main>
  );
}
