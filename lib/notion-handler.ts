import { Client } from "@notionhq/client";
import {
  CreatePageParameters,
  DatabaseObjectResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

// Optional: Define your database IDs with a type for better type safety
export const DATABASE_IDS = {
  JURY: "1c9748b89aff800ebd52e1213fb2db29",

  START_UP: "1c9748b89aff80049c80f888bd0aa6d9",

  GRILLE: "1c9748b89aff80258ad0dbc514e449d5",

  CRITERIA: "1c9748b89aff809184f1e12d73d3e6e3",

  PHASE: "1c9748b89aff8027bb4bc90ec47efa40",

  SCORE: "1c9748b89aff807896f3e96d200a6fda",

  PROBLEM: "1c9748b89aff80b6aa2dfdf568434618",
} as const;

// Define types for transformation options
interface TransformOptions {
  end?: string;
  timeZone?: string;
  color?: string;
  customType?: Record<string, unknown>;
}

class NotionAPIHandler {
  private notion: Client;

  constructor() {
    // Ensure NOTION_API_KEY is available
    if (!process.env.NEXT_PUBLIC_NOTION_API_KEY) {
      throw new Error(
        "NEXT_PUBLIC_NOTION_API_KEY is not defined in environment variables",
      );
    }

    this.notion = new Client({
      auth: process.env.NEXT_PUBLIC_NOTION_API_KEY,
    });
  }

  // Type-safe property value parser
  parsePropertyValue(property: any): unknown {
    switch (property.type) {
      case "title":
        return property.title.map((title: any) => title.plain_text).join("");

      case "rich_text":
        return property.rich_text.map((text: any) => text.plain_text).join("");

      case "number":
        return property.number;

      case "select":
        return property.select ? property.select.name : null;

      case "multi_select":
        return property.multi_select.map((item: any) => item.name);

      case "date":
        return property.date
          ? {
              start: property.date.start,
              end: property.date.end,
            }
          : null;

      case "people":
        return property.people.map((person: any) => ({
          id: person.id,
          name: person.name,
        }));

      case "files":
        return property.files.map((file: any) => ({
          name: file.name,
          url: file.type === "file" ? file.file.url : file.external.url,
        }));

      case "checkbox":
        return property.checkbox;

      case "url":
        return property.url;

      case "email":
        return property.email;

      case "phone_number":
        return property.phone_number;

      case "relation":
        return property.relation.map((relation: any) => relation.id);

      case "created_by":
      case "last_edited_by":
        return {
          id: property.id,
          name: property.name,
        };

      case "created_time":
      case "last_edited_time":
        return property.timestamp;

      default:
        return `Unsupported property type: ${property.type}`;
    }
  }

  // Type-safe property transformation
  transformNotionProperty(
    type: any,
    value: unknown,
    options: TransformOptions = {},
  ): Record<string, unknown> {
    switch (type) {
      case "title":
        return {
          title: [
            {
              type: "text",
              text: { content: value as string },
            },
          ],
        };

      case "rich_text":
        return {
          rich_text: [
            {
              type: "text",
              text: { content: value as string },
            },
          ],
        };

      case "number":
        return { number: Number(value) };

      case "select":
        return { select: { name: value as string } };

      case "multi_select":
        const multiSelectValues = Array.isArray(value) ? value : [value];
        return {
          multi_select: multiSelectValues.map((v) => ({ name: v as string })),
        };

      case "date":
        return {
          date: {
            start: value as string,
            end: options.end || null,
            time_zone: options.timeZone || null,
          },
        };

      case "checkbox":
        return { checkbox: Boolean(value) };

      case "url":
        return { url: value as string };

      case "email":
        return { email: value as string };

      case "phone_number":
        return { phone_number: value as string };

      case "relation":
        const relationValues = Array.isArray(value) ? value : [value];
        return {
          relation: relationValues.map((v) => ({ id: v as string })),
        };

      case "status":
        return {
          status: {
            name: value as string,
            color: options.color || "default",
          },
        };

      case "people":
        const peopleValues = Array.isArray(value) ? value : [value];
        return {
          people: peopleValues.map((v) => ({ id: v as string })),
        };

      case "files":
        const fileValues = Array.isArray(value) ? value : [value];
        return {
          files: fileValues.map((v) => {
            const fileInfo =
              typeof v === "object"
                ? (v as { name: string; url: string })
                : { name: v as string, url: v as string };

            return {
              type: "external",
              name: fileInfo.name,
              external: { url: fileInfo.url },
            };
          }),
        };

      default:
        if (options.customType) {
          return {
            [type]: {
              ...options.customType,
              name: value as string,
            },
          };
        }

        throw new Error(`Unsupported property type: ${type}`);
    }
  }

  // Create a database item with type-safe parameters
  async createDatabaseItem({
    databaseId,
    properties,
  }: {
    databaseId: string;
    properties: Record<string, unknown>;
  }): Promise<PageObjectResponse> {
    try {
      const response = await this.notion.pages.create({
        parent: { database_id: databaseId },
        properties,
      } as CreatePageParameters);

      return response as PageObjectResponse;
    } catch (error) {
      console.error("Error creating database item:", error);
      throw error;
    }
  }

  // Query a database with optional filtering
  async queryDatabase({
    databaseId,
    filter = undefined,
  }: {
    databaseId: string;
    filter?: any | undefined;
  }): Promise<PageObjectResponse[]> {
    try {
      const response = await this.notion.databases.query({
        database_id: databaseId,
        ...(filter && { filter }),
      });

      return response.results as PageObjectResponse[];
    } catch (error) {
      console.error("Error querying database:", error);
      throw error;
    }
  }

  // Retrieve a specific database
  async retrieveDatabase({
    databaseId,
  }: {
    databaseId: string;
  }): Promise<DatabaseObjectResponse> {
    try {
      return (await this.notion.databases.retrieve({
        database_id: databaseId,
      })) as DatabaseObjectResponse;
    } catch (error) {
      console.error("Error retrieving database:", error);
      throw error;
    }
  }

  // Query a page property
  async queryPageProperty({
    pageId,
  }: {
    pageId: string;
  }): Promise<PageObjectResponse> {
    try {
      const response = await this.notion.pages.retrieve({
        page_id: pageId,
      });

      return response as PageObjectResponse;
    } catch (error) {
      console.error("Error querying page property:", error);
      throw error;
    }
  }
}

// Export the handler for use in Next.js API routes or server-side operations
export const notionApiHandler = new NotionAPIHandler();
