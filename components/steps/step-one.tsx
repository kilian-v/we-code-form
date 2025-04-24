"use client";

import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight, Loader2 } from "lucide-react";
import * as React from "react";
import { getJury, getProblems, getStartups } from "@/lib/notion-actions";
import { useDispatch } from "react-redux";
import {
  changeJury,
  changeProblem,
  changeStartup,
  changeStep,
} from "@/lib/store/slices/global";
import { useAppSelector } from "@/lib/store/hooks";
import { cn, findElemById } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Define the form schema with Zod
const formSchema = z.object({
  jury: z.object({
    id: z
      .string({
        message: "Veuillez sélectionner un jury",
      })
      .min(1, { message: "Veuillez sélectionner un jury" }),
    name: z
      .string({
        message: "Veuillez sélectionner un jury",
      })
      .min(1, { message: "Veuillez sélectionner un jury" }),
  }),
  startup: z.object({
    id: z
      .string({
        message: "Veuillez sélectionner une solution",
      })
      .min(1, { message: "Veuillez sélectionner une solution" }),
    name: z
      .string({
        message: "Veuillez sélectionner une solution",
      })
      .min(1, { message: "Veuillez sélectionner une solution" }),
  }),
  problem: z.object({
    id: z
      .string({
        message: "Veuillez sélectionner un problème",
      })
      .min(1, { message: "Veuillez sélectionner un problème" }),
    name: z
      .string({
        message: "Veuillez sélectionner un problème",
      })
      .min(1, { message: "Veuillez sélectionner un problème" }),
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function StepOne() {
  const dispatch = useDispatch();
  const currentJury = useAppSelector((state) => state.global.jury);
  const currentStartup = useAppSelector((state) => state.global.startup);
  const currentProblem = useAppSelector((state) => state.global.problem);

  const [openJury, setOpenJury] = React.useState(false);
  const [openStartup, setOpenStartup] = React.useState(false);
  const [openProblems, setOpenProblems] = React.useState(false);

  const [jurySearch, setJurySearch] = React.useState("");
  const [startupSearch, setStartupSearch] = React.useState("");
  const [problemSearch, setProblemSearch] = React.useState("");

  const { data: problems, isLoading: loadingProblems } = useQuery({
    queryKey: ["problems", problemSearch],
    queryFn: () =>
      getProblems({
        ...(problemSearch.length > 0 && {
          filter: {
            or: [
              {
                property: "Nom",
                rich_text: {
                  contains: problemSearch,
                },
              },
            ],
          },
        }),
      }),
    staleTime: 300000,
  });

  const { data: juries, isLoading: loadingJuries } = useQuery({
    queryKey: ["juries", jurySearch],
    queryFn: () =>
      getJury({
        ...(jurySearch.length > 0 && {
          filter: {
            or: [
              {
                property: "Nom",
                rich_text: {
                  contains: jurySearch,
                },
              },
              {
                property: "Prénoms",
                rich_text: {
                  contains: jurySearch,
                },
              },
              {
                property: "Email",
                rich_text: {
                  contains: jurySearch,
                },
              },
            ],
          },
        }),
      }),
    staleTime: 300000, // Data stays fresh for 5 minutes
  });

  // Initialize the form with both id and name values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jury: currentJury || { id: "", name: "" },
      startup: currentStartup || { id: "", name: "" },
      problem: currentProblem || { id: "", name: "" },
    },
  });

  const problem =
    form.getValues("problem").id.length > 0
      ? findElemById({
          id: form.getValues("problem").id,
          elems: problems,
        })
      : undefined;

  const { data: startups, isLoading: loadingStartups } = useQuery({
    queryKey: ["startups", startupSearch, problem?.id],
    queryFn: () =>
      getStartups({
        ...(problem?.id.length > 0 &&
          startupSearch.length === 0 && {
            filter: {
              property: "Fillières",
              relation: {
                contains: problem?.id,
              },
            },
          }),
        ...(startupSearch.length > 0 && {
          filter: {
            and: [
              {
                or: [
                  {
                    property: "Nom",
                    rich_text: {
                      contains: startupSearch,
                    },
                  },
                  {
                    property: "Description",
                    rich_text: {
                      contains: startupSearch,
                    },
                  },
                ],
              },
            ],
          },
        }),
      }),
    staleTime: 300000,
  });

  const onSubmit = (data: FormValues) => {
    dispatch(changeJury(data.jury));
    dispatch(changeStartup(data.startup));
    dispatch(changeProblem(data.problem));
    dispatch(changeStep(2));
  };

  const handleProblemChange = (problemId: string) => {
    const selectedProblem = problems?.find(
      (problem) => problem.id === problemId,
    );
    if (selectedProblem) {
      form.setValue("problem", {
        id: problemId,
        name: selectedProblem.name,
      });
      dispatch(
        changeProblem({
          id: problemId,
          name: selectedProblem.name,
        }),
      );
    }
  };
  const handleJuryChange = (juryId: string) => {
    const selectedJury = juries?.find((jury) => jury.id === juryId);
    if (selectedJury) {
      form.setValue("jury", {
        id: juryId,
        name: selectedJury.lastName,
      });
    }
  };

  // Update the name field when the id changes for startup
  const handleStartupChange = (startupId: string) => {
    const selectedStartup = startups?.find(
      (startup) => startup.id === startupId,
    );
    if (selectedStartup) {
      form.setValue("startup", {
        id: startupId,
        name: selectedStartup.name as string,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6">
          {/* Jury selection with Combobox */}
          <FormField
            control={form.control}
            name="jury.id"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Jury</FormLabel>
                <Popover open={openJury} onOpenChange={setOpenJury}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openJury}
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground",
                        )}
                        disabled={loadingJuries}
                      >
                        {field.value && juries
                          ? (() => {
                              const jury = findElemById({
                                id: field.value,
                                elems: juries,
                              });

                              return jury ? (
                                <span className="overflow-hidden text-ellipsis">
                                  {jury.lastName} {jury.fistName}
                                </span>
                              ) : (
                                "Sélectionnez un jury"
                              );
                            })()
                          : "Sélectionnez un jury"}
                        {loadingJuries ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <ChevronRight className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Rechercher un jury..."
                        value={jurySearch}
                        onValueChange={setJurySearch}
                      />
                      <CommandEmpty>
                        {loadingJuries ? (
                          <div className="flex justify-center">
                            <Loader2 className="animate-spin" />
                          </div>
                        ) : (
                          "Aucun jury trouvé."
                        )}
                      </CommandEmpty>
                      <CommandGroup className="max-h-96 overflow-auto">
                        {juries?.map((jury) => (
                          <CommandItem
                            key={jury.id}
                            value={jury.id}
                            onSelect={() => {
                              handleJuryChange(jury.id);
                              setOpenJury(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                jury.id === field.value
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <div className="flex flex-col font-medium">
                              <span>
                                {jury.lastName} {jury.fistName}
                              </span>
                              <span className="text-xs text-gray-500">
                                {jury.email}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Problem selection with Combobox */}
          <FormField
            control={form.control}
            name="problem.id"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Problématique</FormLabel>
                <Popover open={openProblems} onOpenChange={setOpenProblems}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between ",
                          !field.value && "text-muted-foreground",
                        )}
                        disabled={loadingProblems}
                      >
                        {field.value && problems
                          ? (() => {
                              const problem = findElemById({
                                id: field.value,
                                elems: problems,
                              });
                              return problem ? (
                                <span className="overflow-hidden text-ellipsis">{`${problem.name}`}</span>
                              ) : (
                                "Sélectionnez une problématique"
                              );
                            })()
                          : "Sélectionnez une problématique"}
                        {loadingProblems ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <ChevronRight className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className=" p-0 w-[var(--radix-popover-trigger-width)] overflow-auto">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Rechercher une problématique..."
                        value={problemSearch}
                        onValueChange={setProblemSearch}
                      />
                      <CommandEmpty>
                        {loadingProblems ? (
                          <div className="flex justify-center">
                            <Loader2 className="animate-spin" />
                          </div>
                        ) : (
                          "Aucune problématique trouvée."
                        )}
                      </CommandEmpty>
                      <CommandGroup className="max-h-96 overflow-auto">
                        {problems?.map((problem) => (
                          <CommandItem
                            key={problem.id}
                            value={problem.id}
                            onSelect={() => {
                              handleProblemChange(problem.id);
                              setOpenProblems(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                problem.id === field.value
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <div className="flex flex-col font-medium">
                              <span>{problem.name}</span>
                              <span>{problem.problem}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Startup selection with Combobox */}
          <FormField
            control={form.control}
            name="startup.id"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Solution</FormLabel>
                <Popover open={openStartup} onOpenChange={setOpenStartup}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openStartup}
                        className={cn(
                          "w-full justify-between ",
                          !field.value && "text-muted-foreground",
                        )}
                        disabled={loadingStartups}
                      >
                        {field.value && startups
                          ? (() => {
                              const startup = findElemById({
                                id: field.value,
                                elems: startups,
                              });
                              return startup ? (
                                <span className="overflow-hidden text-ellipsis">{`${startup.name}`}</span>
                              ) : (
                                "Sélectionnez une solution"
                              );
                            })()
                          : "Sélectionnez une solution"}
                        {loadingStartups ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <ChevronRight className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className=" p-0 w-[var(--radix-popover-trigger-width)] overflow-auto">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Rechercher une solution..."
                        value={startupSearch}
                        onValueChange={setStartupSearch}
                      />
                      <CommandEmpty>
                        {loadingStartups ? (
                          <div className="flex justify-center">
                            <Loader2 className="animate-spin" />
                          </div>
                        ) : (
                          "Aucune solution trouvée."
                        )}
                      </CommandEmpty>
                      <CommandGroup className="max-h-96 overflow-auto">
                        {startups?.map((startup) => (
                          <CommandItem
                            key={startup.id}
                            value={startup.id}
                            onSelect={() => {
                              handleStartupChange(startup.id);
                              setOpenStartup(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                startup.id === field.value
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <div className="flex flex-col font-medium">
                              <span>{startup.name as string}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="cursor-pointer">
            Suivant
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
