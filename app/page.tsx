import { MultiStepForm } from "@/components/steps/multi-step-form";
import Image from "next/image";

export default function Home() {
  return (
    <main className="relative h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/background-image.jpeg" // Path to your image in the public folder
          alt="Background"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto py-10 px-4  ">
        <h1 className="text-3xl font-bold mb-8 text-white text-center">
          {"Formulaire D'Évaluation"}
        </h1>
        <MultiStepForm />
      </div>
    </main>
  );
}
