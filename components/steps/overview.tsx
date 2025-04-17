"use client";

import { useAppSelector } from "@/lib/store/hooks";
import { useDispatch } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { changeStep } from "@/lib/store/slices/global";
import { notionApiHandler } from "@/lib/notion-handler";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { createGrille, createScore } from "@/lib/notion-actions";

const EvaluationsSection = ({
  title,
  section,
}: {
  title: string;
  section: { criteria: string; name: string; note: number; comment?: string }[];
}) => {
  return (
    <div className="mb-6 bg-gray-50 p-4">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="rounded-md space-y-4">
        {section.map((item, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="text-base font-semibold">{item.name}</h3>

                <div>
                  <h4 className="font-medium text-base text-muted-foreground">
                    Note
                  </h4>
                  <p className="text-lg">{item.note}</p>
                </div>

                <div>
                  <h4 className="font-medium text-base text-muted-foreground">
                    Commentaire
                  </h4>
                  <p className="text-lg whitespace-pre-wrap">{item.comment}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export function Overview() {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Find the jury and startup names based on their IDs
  const currentJury = useAppSelector((state) => state.global.jury);
  const currentStartup = useAppSelector((state) => state.global.startup);

  const sections = useAppSelector((state) => state.global.sections);

  const sortedSections = useMemo(() => {
    if (!sections || sections.length === 0) {
      return sections;
    }

    return [...sections].sort((a, b) => Number(a.step) - Number(b.step));
  }, [sections]);

  // Helper function to render section evaluations
  const onClickSubmit = async () => {
    setIsSubmitting(true);

    const propertiesGrille: any = {
      Nom: notionApiHandler.transformNotionProperty(
        "title",
        `${currentJury.name} - ${currentStartup.name}`,
      ),
    };

    propertiesGrille["🌙 Jury"] = notionApiHandler.transformNotionProperty(
      "relation",
      currentJury.id,
    );

    propertiesGrille["🥎 Groupe"] = notionApiHandler.transformNotionProperty(
      "relation",
      currentStartup.id,
    );

    try {
      const newGrille = await createGrille({
        properties: propertiesGrille,
      });

      const allSections = sortedSections.map((section) => {
        return section.questions;
      });

      const scorePromises = allSections.flatMap((section) =>
        section.map((evalItem) =>
          createScore({
            properties: {
              "🌇 Critères d’évaluation":
                notionApiHandler.transformNotionProperty(
                  "relation",
                  evalItem.criteria,
                ),
              "🎵 Évaluations": notionApiHandler.transformNotionProperty(
                "relation",
                newGrille.id,
              ),
              ...((evalItem.comment ?? "").length > 0 && {
                Commentaires: notionApiHandler.transformNotionProperty(
                  "rich_text",
                  evalItem.comment,
                ),
              }),
              Note: notionApiHandler.transformNotionProperty(
                "number",
                evalItem.note.toString(),
              ),
              Nom: notionApiHandler.transformNotionProperty(
                "title",
                `${evalItem.note} - ${evalItem.name}`,
              ),
            },
          }),
        ),
      );

      await Promise.all(scorePromises);

      // Show success message
      toast.success("Votre évaluation a été enregistrée avec succès");
      dispatch(changeStep(10));
    } catch (error) {
      console.error("Error submitting evaluation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log(sortedSections, "sortedSections");

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Revoir votre évaluation
      </h2>
      <p className="text-gray-600 mb-8 text-center">
        Veuillez relire vos réponses avant de les envoyer. Vous pouvez revenir
        en arrière pour des changements si nécessaire.
      </p>

      <div className="bg-white  rounded-lg p-6 ">
        <Card className="mb-6">
          <CardContent className="">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-base text-muted-foreground">
                  Jury
                </h4>
                <p className="text-lg">{currentJury.name}</p>
              </div>

              <div>
                <h4 className="font-medium text-base text-muted-foreground">
                  Startup
                </h4>
                <p className="text-lg">{currentStartup.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {sortedSections.map((section, i) => (
          <EvaluationsSection
            key={`section-overview-${i}`}
            title={section.phase}
            section={section.questions}
          />
        ))}

        <div className="grid grid-cols-2 w-full space-x-2">
          <Button
            type="button"
            className=""
            disabled={isSubmitting}
            onClick={() => {
              dispatch(changeStep(7));
            }}
          >
            Précédent
          </Button>
          <Button
            className=""
            disabled={false}
            onClick={() => {
              onClickSubmit();
            }}
          >
            Soumettre
            {isSubmitting && <Loader2 className="animate-spin" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
