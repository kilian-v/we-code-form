"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StepOne } from "@/components/steps/step-one";
import { StepTwo } from "@/components/steps/step-two";
import { useAppSelector } from "@/lib/store/hooks";
import { findElemByName } from "@/lib/utils";
import { Overview } from "@/components/steps/overview";
import { useQuery } from "@tanstack/react-query";
import { getPhases } from "@/lib/notion-actions";
import { SuccessPage } from "@/components/steps/success-page";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

export function MultiStepForm() {
  const customStep = useAppSelector((state) => state.global.step);
  const currentProblem = useSelector(
    (state: RootState) => state.global.problem,
  );

  const { data: phases } = useQuery({
    queryKey: ["phases", currentProblem.name],
    queryFn: () =>
      getPhases({
        ...(currentProblem.id.length > 0 && {
          filter: {
            property: "Fillières",
            rollup: {
              any: {
                relation: {
                  contains: currentProblem.id,
                },
              },
            },
          },
        }),
      }),
    staleTime: 300000,
    enabled: true,
  });

  const stepElements = useMemo(() => {
    if (!phases)
      return [
        {
          step: 1,
          title: "Choisissez la problématique et le groupe à évalué",
          component: <StepOne />,
        },
      ];

    return [
      // Step 1 - Choose problem and group
      {
        step: 1,
        title: "Choisissez la problématique et le groupe à évalué",
        component: <StepOne />,
      },

      // Step 2 to n+1 - Phase evaluation steps
      ...phases
        .sort((a, b) => {
          return Number(a.position as number) - Number(b.position as number);
        })
        .map((elem, index) => ({
          step: index + 2,
          title: elem.name,
          component: (
            <StepTwo
              phase={findElemByName({
                name: elem.name,
                elems: phases,
              })}
              step={index + 2}
            />
          ),
        })),

      // Step n+2 - Overview
      {
        step: phases.length + 2,
        title: "Aperçu",
        component: <Overview />,
      },

      // Step n+3 - Success page
      {
        step: phases.length + 3,
        title: "Succès",
        component: <SuccessPage />,
      },
    ];
  }, [phases]);

  const currentStep = useMemo(() => {
    return stepElements.find((el) => el.step === customStep);
  }, [customStep, stepElements]);

  return (
    <Card className="w-full max-w-3xl mx-auto max-h-[80vh] overflow-auto ">
      <CardHeader>
        <CardTitle className="text-xl">
          {currentStep ? currentStep.title : ""}
        </CardTitle>
      </CardHeader>
      <CardContent>{customStep && currentStep?.component}</CardContent>
    </Card>
  );
}
