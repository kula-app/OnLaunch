import type { Session } from "next-auth";

const sessionRef: { current: Session | null } = {
  current: {
    user: { id: 1, email: "test@example.com" },
    expires: "2099-01-01T00:00:00Z",
  } as unknown as Session,
};

jest.mock("../../../src/util/create-authenticated-server-action", () => ({
  __esModule: true,
  createAuthenticatedServerAction: <
    TResult,
    TArgs extends unknown[],
  >(
    callback: (session: Session, ...args: TArgs) => Promise<TResult>,
  ) => {
    return async (...args: TArgs) => {
      try {
        if (!sessionRef.current) {
          return {
            success: false as const,
            error: { name: "SessionNotFoundError", message: "no session" },
          };
        }
        const value = await callback(sessionRef.current, ...args);
        return { success: true as const, value };
      } catch (error) {
        return {
          success: false as const,
          error: {
            name: error instanceof Error ? error.name : "Error",
            message: error instanceof Error ? error.message : String(error),
          },
        };
      }
    };
  },
}));

import { createMessage } from "@/app/actions/create-message";
import { MessageActionButtonDesign } from "@/models/message-action-button-design";
import { MessageActionLinkTarget } from "@/models/message-action-link-target";
import { MessageActionType } from "@/models/message-action-type";
import { $Enums } from "@prisma/client";
import { prismaMock } from "../../../jest-setup";

describe("createMessage", () => {
  beforeEach(() => {
    sessionRef.current = {
      user: { id: 1, email: "test@example.com" },
      expires: "2099-01-01T00:00:00Z",
    } as unknown as Session;

    prismaMock.app.findUnique.mockResolvedValue({
      id: 1,
      organisation: {
        id: 1,
        users: [{ userId: 1 }],
      },
    } as never);

    prismaMock.$transaction.mockImplementation(async (cb: unknown) => {
      if (typeof cb === "function") {
        return await (cb as (tx: unknown) => Promise<unknown>)(prismaMock);
      }
      return undefined;
    });

    prismaMock.message.create.mockResolvedValue({ id: 99 } as never);
  });

  describe("with OPEN_LINK action and IN_APP_BROWSER target", () => {
    it("persists link and linkTarget", async () => {
      // -- Act --
      const result = await createMessage({
        appId: 1,
        title: "Title",
        body: "Body",
        isBlocking: false,
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-01-02"),
        actions: [
          {
            id: 1,
            actionType: MessageActionType.OPEN_LINK,
            buttonDesign: MessageActionButtonDesign.FILLED,
            title: "Open",
            link: {
              link: "https://onlaunch.app",
              target: MessageActionLinkTarget.IN_APP_BROWSER,
            },
          },
        ],
      } as never);

      // -- Assert --
      expect(result.success).toBe(true);
      const createCall = prismaMock.message.create.mock.calls[0]?.[0] as {
        data: {
          actions: {
            createMany: {
              data: Array<{
                link?: string;
                linkTarget?: string;
                actionType?: string;
              }>;
            };
          };
        };
      };
      expect(createCall.data.actions.createMany.data[0]).toEqual(
        expect.objectContaining({
          link: "https://onlaunch.app",
          linkTarget: $Enums.MessageActionLinkTarget.IN_APP_BROWSER,
          actionType: $Enums.ActionType.OPEN_LINK,
        }),
      );
    });
  });

  describe("with OPEN_LINK action and SYSTEM_BROWSER target", () => {
    it("persists link and linkTarget", async () => {
      // -- Act --
      await createMessage({
        appId: 1,
        title: "Title",
        body: "Body",
        isBlocking: false,
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-01-02"),
        actions: [
          {
            id: 1,
            actionType: MessageActionType.OPEN_LINK,
            buttonDesign: MessageActionButtonDesign.FILLED,
            title: "Open",
            link: {
              link: "https://onlaunch.app",
              target: MessageActionLinkTarget.SYSTEM_BROWSER,
            },
          },
        ],
      } as never);

      // -- Assert --
      const createCall = prismaMock.message.create.mock.calls[0]?.[0] as {
        data: {
          actions: { createMany: { data: Array<{ linkTarget?: string }> } };
        };
      };
      expect(createCall.data.actions.createMany.data[0]?.linkTarget).toBe(
        $Enums.MessageActionLinkTarget.SYSTEM_BROWSER,
      );
    });
  });

  describe("with DISMISS action and no link", () => {
    it("persists undefined link and linkTarget", async () => {
      // -- Act --
      const result = await createMessage({
        appId: 1,
        title: "Title",
        body: "Body",
        isBlocking: false,
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-01-02"),
        actions: [
          {
            id: 1,
            actionType: MessageActionType.DISMISS,
            buttonDesign: MessageActionButtonDesign.FILLED,
            title: "Dismiss",
            link: undefined,
          },
        ],
      } as never);

      // -- Assert --
      expect(result.success).toBe(true);
      const createCall = prismaMock.message.create.mock.calls[0]?.[0] as {
        data: {
          actions: {
            createMany: {
              data: Array<{ link?: unknown; linkTarget?: unknown }>;
            };
          };
        };
      };
      const action = createCall.data.actions.createMany.data[0];
      expect(action.link).toBeUndefined();
      expect(action.linkTarget).toBeUndefined();
    });
  });

  describe("when session is missing", () => {
    it("returns SessionNotFoundError", async () => {
      // -- Arrange --
      sessionRef.current = null;
      // -- Act --
      const result = await createMessage({
        appId: 1,
        title: "Title",
        body: "Body",
        isBlocking: false,
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-01-02"),
        actions: [],
      } as never);
      // -- Assert --
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe("SessionNotFoundError");
      }
    });
  });

  describe("when user has no access to app", () => {
    it("returns ForbiddenError", async () => {
      // -- Arrange --
      prismaMock.app.findUnique.mockResolvedValue({
        id: 1,
        organisation: { id: 1, users: [] },
      } as never);
      // -- Act --
      const result = await createMessage({
        appId: 1,
        title: "Title",
        body: "Body",
        isBlocking: false,
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-01-02"),
        actions: [],
      } as never);
      // -- Assert --
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe("ForbiddenError");
      }
    });
  });
});
