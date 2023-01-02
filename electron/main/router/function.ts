import { z } from "zod";

import { publicProcedure, router } from "../utils/createRouter.js";
import { IFunctionClient } from "../wingsdk.js";

type ResponseEnvelope =
  | {
      success: true;
      response: string;
    }
  | {
      success: false;
      error: unknown;
    };

export const createFunctionRouter = () => {
  return router({
    "function.invoke": publicProcedure
      .input(
        z.object({
          resourcePath: z.string(),
          message: z.string(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const simulator = await ctx.simulator();
        const client = simulator.getResource(
          input.resourcePath,
        ) as IFunctionClient;
        try {
          const response: ResponseEnvelope = {
            success: true,
            response: await client.invoke(input.message),
          };
          return response;
        } catch (error) {
          const response: ResponseEnvelope = {
            success: false,
            error: error instanceof Error ? error.message : error,
          };
          return response;
        }
      }),
  });
};
