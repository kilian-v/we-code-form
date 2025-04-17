"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetAll } from "@/lib/store/slices/global";
import { useDispatch } from "react-redux";

export function SuccessPage() {
  const dispatch = useDispatch();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center mb-8">
        <Check className="h-10 w-10 text-black" />
      </div>

      <h1 className="text-5xl font-bold text-[#1e2a4a] mb-4">Merci</h1>

      <p className="text-xl text-gray-500 mb-10">
        Votre évaluation a bien été enregistrée
      </p>

      <Button
        onClick={() => {
          dispatch(resetAll());
        }}
        className="rounded-full px-8 py-6 text-lg font-medium"
      >
        Démarrer une nouvelle évaluation
      </Button>
    </div>
  );
}
