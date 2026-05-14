import "reflect-metadata";

jest.mock("../../../../../src/util/adminApi/auth", () => ({
  __esModule: true,
  authenticate: jest.fn(),
}));

import handler from "@/pages/api/admin/v0.1/app/messages";
import messageHandler from "@/pages/api/admin/v0.1/app/messages/[messageId]";
import { authenticate } from "@/util/adminApi/auth";
import { $Enums } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { NextApiRequest, type NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { prismaMock } from "../../../../../jest-setup";

const authMock = authenticate as jest.MockedFunction<typeof authenticate>;

const ok = (id = 1) =>
  ({ success: true, id, statusCode: 200 }) as Awaited<
    ReturnType<typeof authenticate>
  >;

describe("/api/admin/v0.1/app/messages", () => {
  beforeEach(() => {
    authMock.mockReset();
    authMock.mockResolvedValue(ok(1));
  });

  describe("GET — listing messages", () => {
    it("includes link and linkTarget on OPEN_LINK actions", async () => {
      // -- Arrange --
      prismaMock.message.findMany.mockResolvedValue([
        {
          id: 1,
          appId: 1,
          createdAt: new Date(0),
          updatedAt: new Date(0),
          title: "M1",
          body: "Body",
          blocking: false,
          startDate: new Date(0),
          endDate: new Date(1000),
          actions: [
            {
              id: 1,
              messageId: 1,
              createdAt: new Date(0),
              updatedAt: new Date(0),
              title: "Open",
              actionType: $Enums.ActionType.OPEN_LINK,
              buttonDesign: $Enums.ButtonDesign.FILLED,
              link: "https://onlaunch.app",
              linkTarget: $Enums.MessageActionLinkTarget.SYSTEM_BROWSER,
            },
          ],
        },
      ] as never);
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      // -- Act --
      await handler(req, res);

      // -- Assert --
      expect(res.statusCode).toBe(StatusCodes.CREATED);
      const body = res._getJSONData() as Array<{
        actions: Array<{
          link?: string;
          linkTarget?: string;
        }>;
      }>;
      expect(body[0].actions[0]).toEqual(
        expect.objectContaining({
          link: "https://onlaunch.app",
          linkTarget: "SYSTEM_BROWSER",
        }),
      );
    });

    it("omits link and linkTarget when database has nulls", async () => {
      // -- Arrange --
      prismaMock.message.findMany.mockResolvedValue([
        {
          id: 1,
          appId: 1,
          createdAt: new Date(0),
          updatedAt: new Date(0),
          title: "M1",
          body: "Body",
          blocking: false,
          startDate: new Date(0),
          endDate: new Date(1000),
          actions: [
            {
              id: 1,
              messageId: 1,
              createdAt: new Date(0),
              updatedAt: new Date(0),
              title: "Dismiss",
              actionType: $Enums.ActionType.DISMISS,
              buttonDesign: $Enums.ButtonDesign.FILLED,
              link: null,
              linkTarget: null,
            },
          ],
        },
      ] as never);
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      // -- Act --
      await handler(req, res);

      // -- Assert --
      const body = res._getJSONData() as Array<{
        actions: Array<{ link?: unknown; linkTarget?: unknown }>;
      }>;
      const action = body[0].actions[0];
      expect(action).not.toHaveProperty("link");
      expect(action).not.toHaveProperty("linkTarget");
    });
  });

  describe("POST — creating a message", () => {
    it("rejects OPEN_LINK without link", async () => {
      // -- Arrange --
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          blocking: false,
          title: "T",
          body: "B",
          startDate: "2025-01-01T00:00:00.000Z",
          endDate: "2025-01-02T00:00:00.000Z",
          actions: [
            {
              title: "Open",
              actionType: $Enums.ActionType.OPEN_LINK,
              buttonDesign: $Enums.ButtonDesign.FILLED,
            },
          ],
        },
      });
      // -- Act --
      await handler(req, res);
      // -- Assert --
      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      const body = res._getJSONData() as { message: string };
      expect(body.message).toMatch(/link is required/);
    });

    it("rejects OPEN_LINK without linkTarget", async () => {
      // -- Arrange --
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          blocking: false,
          title: "T",
          body: "B",
          startDate: "2025-01-01T00:00:00.000Z",
          endDate: "2025-01-02T00:00:00.000Z",
          actions: [
            {
              title: "Open",
              actionType: $Enums.ActionType.OPEN_LINK,
              buttonDesign: $Enums.ButtonDesign.FILLED,
              link: "https://onlaunch.app",
            },
          ],
        },
      });
      // -- Act --
      await handler(req, res);
      // -- Assert --
      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      const body = res._getJSONData() as { message: string };
      expect(body.message).toMatch(/linkTarget is required/);
    });

    it("accepts OPEN_LINK with link and linkTarget", async () => {
      // -- Arrange --
      prismaMock.message.create.mockResolvedValue({
        id: 5,
        appId: 1,
        createdAt: new Date(0),
        updatedAt: new Date(0),
        title: "T",
        body: "B",
        blocking: false,
        startDate: new Date(0),
        endDate: new Date(1000),
      } as never);
      prismaMock.messageAction.createMany.mockResolvedValue({
        count: 1,
      } as never);
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          blocking: false,
          title: "T",
          body: "B",
          startDate: "2025-01-01T00:00:00.000Z",
          endDate: "2025-01-02T00:00:00.000Z",
          actions: [
            {
              title: "Open",
              actionType: $Enums.ActionType.OPEN_LINK,
              buttonDesign: $Enums.ButtonDesign.FILLED,
              link: "https://onlaunch.app",
              linkTarget: $Enums.MessageActionLinkTarget.IN_APP_BROWSER,
            },
          ],
        },
      });

      // -- Act --
      await handler(req, res);

      // -- Assert --
      expect(res.statusCode).toBe(StatusCodes.CREATED);
      const body = res._getJSONData() as {
        actions: Array<{ link?: string; linkTarget?: string }>;
      };
      expect(body.actions[0]).toEqual(
        expect.objectContaining({
          link: "https://onlaunch.app",
          linkTarget: "IN_APP_BROWSER",
        }),
      );
    });

    it("accepts DISMISS without link or linkTarget", async () => {
      // -- Arrange --
      prismaMock.message.create.mockResolvedValue({
        id: 5,
        appId: 1,
        createdAt: new Date(0),
        updatedAt: new Date(0),
        title: "T",
        body: "B",
        blocking: false,
        startDate: new Date(0),
        endDate: new Date(1000),
      } as never);
      prismaMock.messageAction.createMany.mockResolvedValue({
        count: 1,
      } as never);
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          blocking: false,
          title: "T",
          body: "B",
          startDate: "2025-01-01T00:00:00.000Z",
          endDate: "2025-01-02T00:00:00.000Z",
          actions: [
            {
              title: "Dismiss",
              actionType: $Enums.ActionType.DISMISS,
              buttonDesign: $Enums.ButtonDesign.FILLED,
            },
          ],
        },
      });

      // -- Act --
      await handler(req, res);

      // -- Assert --
      expect(res.statusCode).toBe(StatusCodes.CREATED);
    });
  });
});

describe("/api/admin/v0.1/app/messages/[messageId]", () => {
  beforeEach(() => {
    authMock.mockReset();
    authMock.mockResolvedValue(ok(1));
  });

  describe("GET — single message", () => {
    it("includes link and linkTarget", async () => {
      // -- Arrange --
      prismaMock.message.findUnique.mockResolvedValue({
        id: 7,
        appId: 1,
        createdAt: new Date(0),
        updatedAt: new Date(0),
        title: "M",
        body: "B",
        blocking: false,
        startDate: new Date(0),
        endDate: new Date(1000),
        actions: [
          {
            id: 1,
            messageId: 7,
            createdAt: new Date(0),
            updatedAt: new Date(0),
            title: "Open",
            actionType: $Enums.ActionType.OPEN_LINK,
            buttonDesign: $Enums.ButtonDesign.FILLED,
            link: "https://onlaunch.app",
            linkTarget: $Enums.MessageActionLinkTarget.SHARE_SHEET,
          },
        ],
      } as never);
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { messageId: "7" },
      });

      // -- Act --
      await messageHandler(req, res);

      // -- Assert --
      expect(res.statusCode).toBe(StatusCodes.OK);
      const body = res._getJSONData() as {
        actions: Array<{ link?: string; linkTarget?: string }>;
      };
      expect(body.actions[0]).toEqual(
        expect.objectContaining({
          link: "https://onlaunch.app",
          linkTarget: "SHARE_SHEET",
        }),
      );
    });
  });
});
