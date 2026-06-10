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

import { updateMessage } from "@/app/actions/update-message";
import { MessageActionButtonDesign } from "@/models/message-action-button-design";
import { MessageActionLinkTarget } from "@/models/message-action-link-target";
import { MessageActionType } from "@/models/message-action-type";
import { $Enums } from "@prisma/client";
import { prismaMock } from "../../../jest-setup";

describe("updateMessage", () => {
  beforeEach(() => {
    sessionRef.current = {
      user: { id: 1, email: "test@example.com" },
      expires: "2099-01-01T00:00:00Z",
    } as unknown as Session;

    prismaMock.message.findUnique.mockResolvedValue({
      id: 10,
      actions: [{ id: 1 }],
      app: {
        id: 1,
        organisation: {
          id: 1,
          users: [{ userId: 1 }],
        },
      },
    } as never);

    prismaMock.$transaction.mockImplementation(async (cb: unknown) => {
      if (typeof cb === "function") {
        return await (cb as (tx: unknown) => Promise<unknown>)(prismaMock);
      }
      return undefined;
    });

    prismaMock.message.update.mockResolvedValue({ id: 10 } as never);
    prismaMock.messageAction.deleteMany.mockResolvedValue({
      count: 0,
    } as never);
    prismaMock.messageAction.upsert.mockResolvedValue({ id: 1 } as never);
  });

  describe("when transitioning DISMISS to OPEN_LINK", () => {
    it("upserts link and linkTarget", async () => {
      // -- Act --
      const result = await updateMessage({
        id: 10,
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
              target: MessageActionLinkTarget.SHARE_SHEET,
            },
          },
        ],
      } as never);

      // -- Assert --
      expect(result.success).toBe(true);
      const upsertArgs = prismaMock.messageAction.upsert.mock
        .calls[0]?.[0] as {
        update: { link?: unknown; linkTarget?: unknown };
        create: { link?: unknown; linkTarget?: unknown };
      };
      expect(upsertArgs.update.link).toBe("https://onlaunch.app");
      expect(upsertArgs.update.linkTarget).toBe(
        $Enums.MessageActionLinkTarget.SHARE_SHEET,
      );
      expect(upsertArgs.create.link).toBe("https://onlaunch.app");
      expect(upsertArgs.create.linkTarget).toBe(
        $Enums.MessageActionLinkTarget.SHARE_SHEET,
      );
    });
  });

  describe("when transitioning OPEN_LINK to DISMISS", () => {
    it("clears link and linkTarget to null", async () => {
      // -- Act --
      const result = await updateMessage({
        id: 10,
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
      const upsertArgs = prismaMock.messageAction.upsert.mock
        .calls[0]?.[0] as {
        update: { link?: unknown; linkTarget?: unknown };
      };
      expect(upsertArgs.update.link).toBeNull();
      expect(upsertArgs.update.linkTarget).toBeNull();
    });
  });

  describe("when message does not exist", () => {
    it("returns NotFoundError", async () => {
      // -- Arrange --
      prismaMock.message.findUnique.mockResolvedValue(null);
      // -- Act --
      const result = await updateMessage({
        id: 99,
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
        expect(result.error.name).toBe("NotFoundError");
      }
    });
  });

  describe("when user has no access", () => {
    it("returns UnauthorizedError", async () => {
      // -- Arrange --
      prismaMock.message.findUnique.mockResolvedValue({
        id: 10,
        actions: [],
        app: {
          id: 1,
          organisation: { id: 1, users: [] },
        },
      } as never);
      // -- Act --
      const result = await updateMessage({
        id: 10,
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
        expect(result.error.name).toBe("UnauthorizedError");
      }
    });
  });

  describe("transaction error propagation", () => {
    it("propagates errors thrown inside the transaction (await fix)", async () => {
      // -- Arrange --
      prismaMock.message.update.mockImplementation(async () => {
        throw new Error("db down");
      });
      // -- Act --
      const result = await updateMessage({
        id: 10,
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
        expect(result.error.message).toContain("db down");
      }
    });
  });
});
