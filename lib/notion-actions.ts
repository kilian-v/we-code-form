"use server";

import { DATABASE_IDS, notionApiHandler } from "./notion-handler";

export const getJury = async ({ filter }: { filter?: any }) => {
  const databaseJury = await notionApiHandler.queryDatabase({
    databaseId: DATABASE_IDS.JURY,
    ...(filter && { filter }),
  });
  const formatted = databaseJury.map((el: any) => {
    return {
      id: el.id,
      email: notionApiHandler.parsePropertyValue(el.properties["Email"]) as any,
      lastName: notionApiHandler.parsePropertyValue(
        el.properties["Prénoms"],
      ) as any,
      fistName: notionApiHandler.parsePropertyValue(
        el.properties["Nom"],
      ) as any,
      role: notionApiHandler.parsePropertyValue(
        el.properties["Rôle/Missions"],
      ) as any,
      expertise: notionApiHandler.parsePropertyValue(
        el.properties["Expertise"],
      ) as any,
    };
  });
  return formatted;
};

export const getProblems = async ({ filter }: { filter?: any }) => {
  const databaseJury = await notionApiHandler.queryDatabase({
    databaseId: DATABASE_IDS.PROBLEM,
    ...(filter && { filter }),
  });

  const formatted = databaseJury.map((el: any) => {
    return {
      id: el.id,
      name: el.properties["Nom"].title[0].plain_text,
      problem: notionApiHandler.parsePropertyValue(
        el.properties["Problématique"],
      ) as any,
    };
  });

  return formatted;
};
export const getStartups = async ({ filter }: { filter?: any }) => {
  const databaseJury = await notionApiHandler.queryDatabase({
    databaseId: DATABASE_IDS.START_UP,
    ...(filter && { filter }),
  });

  const formatted = databaseJury.map((el: any) => {
    return {
      id: el.id,
      name: notionApiHandler.parsePropertyValue(el.properties["Nom"]),
      description: notionApiHandler.parsePropertyValue(
        el.properties["Description"],
      ),
    };
  });

  return formatted;
};

export const getPhases = async ({
  filter,
  sorts,
}: { filter?: any; sorts?: any } = {}) => {
  const databaseJury = await notionApiHandler.queryDatabase({
    databaseId: DATABASE_IDS.PHASE,
    ...(filter && { filter }),
    ...(sorts && { sorts }),
  });

  const formatted = databaseJury.map((el: any) => {
    return {
      id: el.id,
      name: el.properties["Nom"].title[0].plain_text,
      position: notionApiHandler.parsePropertyValue(el.properties["Position"]),
    };
  });

  return formatted;
};

export const getCriteria = async ({ filter }: { filter?: any }) => {
  const databaseJury = await notionApiHandler.queryDatabase({
    databaseId: DATABASE_IDS.CRITERIA,
    ...(filter && { filter }),
  });

  const formatted = databaseJury.map((el: any) => {
    return {
      id: el.id,
      name: notionApiHandler.parsePropertyValue(el.properties["Nom"]) as any,
      phase: notionApiHandler.parsePropertyValue(
        el.properties["Catégorie de critère"],
      ) as any,
      maxNote: notionApiHandler.parsePropertyValue(
        el.properties["Note max"],
      ) as any,
    };
  });

  return formatted;
};

export const createGrille = async ({
  properties,
}: {
  properties: Record<string, unknown>;
}) => {
  return await notionApiHandler.createDatabaseItem({
    databaseId: DATABASE_IDS.GRILLE,
    properties,
  });
};

export const createScore = async ({
  properties,
}: {
  properties: Record<string, unknown>;
}) => {
  return await notionApiHandler.createDatabaseItem({
    databaseId: DATABASE_IDS.SCORE,
    properties,
  });
};
