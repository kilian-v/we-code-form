"use client";

import { useForm, UseFormReturn } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useMemo } from "react";
import { getCriteria } from "@/lib/notion-actions";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { changeStep, updateAllSection } from "@/lib/store/slices/global";
import { QueryClient, useQuery } from "@tanstack/react-query";

// Define the schema for a single criteria evaluation
const criteriaEvaluationSchema = z.object({
  criteriaId: z.string().min(1),
  name: z.string().min(1),
  note: z.coerce
    .number()

    .min(0, {
      message: "Rating must be at least 1",
    })
    .default(0),
  comment: z
    .string()
    .max(500, {
      message: "Comment must be at most 500 characters",
    })
    .refine((val) => val.length === 0 || val.length >= 3, {
      message: "Comment must be at least 3 characters if not empty",
    }),
});

// Define the schema for the whole form
const formSchema = z.object({
  evaluations: z.array(criteriaEvaluationSchema),
});

//type CriteriaEvaluation = z.infer<typeof criteriaEvaluationSchema>;
type FormValues = z.infer<typeof formSchema>;

const CriteriaForm = ({
  criteria,
  index,
  form,
}: {
  criteria: { id: any; name: any; phase: any; maxNote: any };
  index: number;
  form: UseFormReturn<FormValues>;
}) => {
  return (
    <div className="flex flex-col p-4 border rounded-lg">
      <h3 className="text-md font-medium">{criteria.name}</h3>
      <div className="flex flex-col space-y-3 mt-3">
        {/* Hidden field for criteria ID */}
        <FormField
          control={form.control as any}
          name={`evaluations.${index}.criteriaId`}
          render={({ field }) => (
            <Input type="hidden" {...field} value={criteria.id} />
          )}
        />

        <FormField
          control={form.control as any}
          name={`evaluations.${index}.name`}
          render={({ field }) => (
            <Input type="hidden" {...field} value={criteria.name} />
          )}
        />

        <FormField
          control={form.control}
          name={`evaluations.${index}.note`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{`Note ( 1 - ${criteria.maxNote} )`}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={criteria.maxNote}
                  placeholder={`Mettez une note entre 1 et ${criteria.maxNote}`}
                  defaultValue={0}
                  {...field}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);

                    if (value <= criteria.maxNote || isNaN(value)) {
                      // Update the field
                      field.onChange(isNaN(value) ? "" : value);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`evaluations.${index}.comment`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Commentaire</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Entrez un commentaire"
                  className="min-h-[100px]"
                  defaultValue={""}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export function StepTwo({
  phase,
  step,
}: {
  phase?: { id: string; name: string };
  step: number;
}) {
  const dispatch = useDispatch();
  const queryClient = new QueryClient();
  const sections = useSelector((state: RootState) => state.global.sections);

  const currentProblem = useSelector(
    (state: RootState) => state.global.problem,
  );
  const currentSection = useMemo(() => {
    const section = sections.find((item) => item.step === step);

    return section ? section.questions : [];
  }, [sections, step]);
  const { data: criteria = [], isLoading: loadingCriteria } = useQuery({
    queryKey: ["criteria", phase?.id], // Include phase ID in the query key
    queryFn: () =>
      getCriteria({
        filter: {
          and: [
            {
              property: "Catégorie de critère",
              relation: {
                contains: phase?.id ?? "",
              },
            },
            {
              property: "Fillière",
              relation: {
                contains: currentProblem?.id ?? "",
              },
            },
          ],
        },
      }),

    enabled: !!phase?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Initialize the form with default values for all criteria
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      evaluations: [],
    },
  });

  // Update the form's default values when criteria are loaded
  useEffect(() => {
    if ((criteria ?? []).length > 0) {
      // Map existing data from Redux store if available
      const defaultEvaluations = criteria?.map((item) => {
        // Look for existing evaluation in Redux store
        const existingEval = currentSection.find(
          (el) => el.criteria === item.id,
        );

        if (existingEval) {
          // Use existing data
          return {
            criteriaId: item.id,
            name: item.name,
            note: existingEval ? existingEval.note : 0,
            comment: existingEval.comment || "",
          };
        } else {
          // Create default empty evaluation
          return {
            criteriaId: item.id,
            name: item.name,
            note: 0,
            comment: "",
          };
        }
      });

      form.reset({ evaluations: defaultEvaluations });
    }
  }, [criteria, currentSection, form]);

  const onSubmit = (data: FormValues) => {
    const errors = [];

    data.evaluations.forEach((evaluation, index) => {
      const data = criteria.find((c) => c.id === evaluation.criteriaId);
      const maxNote = data?.maxNote || 5;

      if (evaluation.note > maxNote) {
        form.setError(`evaluations.${index}.note`, {
          type: "manual",
          message: `Rating must be at most ${maxNote}`,
        });
        errors.push(`Invalid note for ${evaluation.name}`);
      }
    });

    if (errors.length > 0) {
      return;
    }

    const values = data.evaluations.map((item) => {
      return {
        criteria: item.criteriaId,
        name: item.name,
        note: item.note,
        comment: item.comment,
      };
    });

    dispatch(
      updateAllSection({
        data: values,
        sectionStep: step,
        phase: phase?.name ?? "",
      }),
    );
    form.reset();
    queryClient.invalidateQueries({ queryKey: ["criteria", phase?.id] });
    dispatch(changeStep(step + 1));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6">
          {loadingCriteria ? (
            <div className="w-full flex justify-center text-center py-4">
              <Loader2 className="animate-spin h-20 w-20" />
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {criteria.map((item, index) => (
                  <CriteriaForm
                    key={item.id}
                    criteria={item}
                    index={index}
                    form={form}
                  />
                ))}
              </div>

              <div className="grid grid-cols-2 w-full space-x-2">
                <Button
                  type="button"
                  className=""
                  onClick={() => {
                    const values = form.getValues().evaluations.map((item) => {
                      return {
                        criteria: item.criteriaId,
                        name: item.name,
                        note: item.note,
                        comment: item.comment,
                      };
                    });
                    dispatch(
                      updateAllSection({
                        data: values,
                        sectionStep: step,
                        phase: phase?.name ?? "",
                      }),
                    );
                    /*                    dispatch(
                                                                                                                                                                                                                                                  updateSection({ data: values, sectionName: section }),
                                                                                                                                                                                                                                                );*/
                    dispatch(changeStep(step - 1));
                  }}
                >
                  Précédent
                </Button>
                <Button type="submit" className="">
                  Suivant
                </Button>
              </div>
            </>
          )}
        </div>
      </form>
    </Form>
  );
}
