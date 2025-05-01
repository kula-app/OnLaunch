import { MessageRuleSystemVariable } from "@/models/message-rule-system-variable";
import handler from "@/pages/api/v0.2/messages";
import {
  $Enums,
  type Message as PrismaMessage,
  type MessageAction as PrismaMessageAction,
  type MessageFilter as PrismaMessageFilter,
  type MessageRuleCondition as PrismaMessageRuleCondition,
  type MessageRuleGroup as PrismaMessageRuleGroup,
} from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { NextApiRequest, type NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { prismaMock } from "../../../jest-setup";

describe("/api/v0.2/messages", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  describe("HTTP GET", () => {
    describe("when the client key is not defined in headers", () => {
      it("should return an validation error", async () => {
        // -- Arrange --
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: "GET",
        });
        // -- Act --
        await handler(req, res);
        // -- Assert --
        expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        expect(res._getJSONData()).toStrictEqual({
          message: "Validation Error",
          constraints: {
            isDefined: "x-api-key should not be null or undefined",
          },
        });
      });
    });

    describe("context header validation", () => {
      beforeEach(() => {
        prismaMock.app.findFirst.mockResolvedValue({
          id: 1,
          createdAt: new Date(1000),
          updatedAt: new Date(2000),
          publicKey: "public-key",
          name: "Example App",
          orgId: null,
          idOfLastReportedApiRequest: null,
          isDeleted: false,
          deletedAt: null,
        });
        prismaMock.message.findMany.mockResolvedValue([]);
      });

      describe("x-onlaunch-bundle-id", () => {
        describe("valid string", () => {
          it("should return a success response", async () => {
            // -- Arrange --
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
              method: "GET",
              headers: {
                "x-api-key": "client-key",
                "x-onlaunch-bundle-id": "com.example.app",
              },
            });
            // -- Act --
            await handler(req, res);
            // -- Assert --
            expect(res.statusCode).toEqual(StatusCodes.OK);
            expect(res._getJSONData()).toStrictEqual([]);
          });
        });

        describe("too long string", () => {
          it("should return an validation error", async () => {
            // -- Arrange --
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
              method: "GET",
              headers: {
                "x-api-key": "client-key",
                "x-onlaunch-bundle-id": 123 as any,
              },
            });
            // -- Act --
            await handler(req, res);
            // -- Assert --
            expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(res._getJSONData()).toStrictEqual({
              message: "Validation Error",
              constraints: {
                maxLength:
                  "x-onlaunch-bundle-id must be shorter than or equal to 200 characters",
              },
            });
          });
        });
      });

      describe("x-onlaunch-bundle-version", () => {
        describe("valid string", () => {
          it("should return a success response", async () => {
            // -- Arrange --
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
              method: "GET",
              headers: {
                "x-api-key": "client-key",
                "x-onlaunch-bundle-version": "1.0.0",
              },
            });
            // -- Act --
            await handler(req, res);
            // -- Assert --
            expect(res.statusCode).toEqual(StatusCodes.OK);
            expect(res._getJSONData()).toStrictEqual([]);
          });
        });

        describe("too long string", () => {
          it("should return a validation error", async () => {
            // -- Arrange --
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
              method: "GET",
              headers: {
                "x-api-key": "client-key",
                "x-onlaunch-bundle-version": "a".repeat(201),
              },
            });
            // -- Act --
            await handler(req, res);
            // -- Assert --
            expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(res._getJSONData()).toStrictEqual({
              message: "Validation Error",
              constraints: {
                maxLength:
                  "x-onlaunch-bundle-version must be shorter than or equal to 200 characters",
              },
            });
          });
        });
      });

      describe("x-onlaunch-locale", () => {
        describe("valid string", () => {
          it("should return a success response", async () => {
            // -- Arrange --
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
              method: "GET",
              headers: {
                "x-api-key": "client-key",
                "x-onlaunch-locale": "en_US",
              },
            });
            // -- Act --
            await handler(req, res);
            // -- Assert --
            expect(res.statusCode).toEqual(StatusCodes.OK);
            expect(res._getJSONData()).toStrictEqual([]);
          });
        });

        describe("too long string", () => {
          it("should return a validation error", async () => {
            // -- Arrange --
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
              method: "GET",
              headers: {
                "x-api-key": "client-key",
                "x-onlaunch-locale": "a".repeat(201),
              },
            });
            // -- Act --
            await handler(req, res);
            // -- Assert --
            expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(res._getJSONData()).toStrictEqual({
              message: "Validation Error",
              constraints: {
                maxLength:
                  "x-onlaunch-locale must be shorter than or equal to 200 characters",
              },
            });
          });
        });
      });

      describe("x-onlaunch-locale-language-code", () => {
        describe("valid string", () => {
          it("should return a success response", async () => {
            // -- Arrange --
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
              method: "GET",
              headers: {
                "x-api-key": "client-key",
                "x-onlaunch-locale-language-code": "en",
              },
            });
            // -- Act --
            await handler(req, res);
            // -- Assert --
            expect(res.statusCode).toEqual(StatusCodes.OK);
            expect(res._getJSONData()).toStrictEqual([]);
          });
        });

        describe("too long string", () => {
          it("should return a validation error", async () => {
            // -- Arrange --
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
              method: "GET",
              headers: {
                "x-api-key": "client-key",
                "x-onlaunch-locale-language-code": "a".repeat(201),
              },
            });
            // -- Act --
            await handler(req, res);
            // -- Assert --
            expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(res._getJSONData()).toStrictEqual({
              message: "Validation Error",
              constraints: {
                maxLength:
                  "x-onlaunch-locale-language-code must be shorter than or equal to 200 characters",
              },
            });
          });
        });
      });

      describe("x-onlaunch-locale-region-code", () => {
        describe("valid string", () => {
          it("should return a success response", async () => {
            // -- Arrange --
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
              method: "GET",
              headers: {
                "x-api-key": "client-key",
                "x-onlaunch-locale-region-code": "US",
              },
            });
            // -- Act --
            await handler(req, res);
            // -- Assert --
            expect(res.statusCode).toEqual(StatusCodes.OK);
            expect(res._getJSONData()).toStrictEqual([]);
          });
        });

        describe("too long string", () => {
          it("should return a validation error", async () => {
            // -- Arrange --
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
              method: "GET",
              headers: {
                "x-api-key": "client-key",
                "x-onlaunch-locale-region-code": "a".repeat(201),
              },
            });
            // -- Act --
            await handler(req, res);
            // -- Assert --
            expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(res._getJSONData()).toStrictEqual({
              message: "Validation Error",
              constraints: {
                maxLength:
                  "x-onlaunch-locale-region-code must be shorter than or equal to 200 characters",
              },
            });
          });
        });
      });

      describe("x-onlaunch-package-name", () => {
        describe("valid string", () => {
          it("should return a success response", async () => {
            // -- Arrange --
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
              method: "GET",
              headers: {
                "x-api-key": "client-key",
                "x-onlaunch-package-name": "com.example.app",
              },
            });
            // -- Act --
            await handler(req, res);
            // -- Assert --
            expect(res.statusCode).toEqual(StatusCodes.OK);
            expect(res._getJSONData()).toStrictEqual([]);
          });
        });

        describe("too long string", () => {
          it("should return a validation error", async () => {
            // -- Arrange --
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
              method: "GET",
              headers: {
                "x-api-key": "client-key",
                "x-onlaunch-package-name": "a".repeat(151),
              },
            });
            // -- Act --
            await handler(req, res);
            // -- Assert --
            expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(res._getJSONData()).toStrictEqual({
              message: "Validation Error",
              constraints: {
                maxLength:
                  "x-onlaunch-package-name must be shorter than or equal to 150 characters",
              },
            });
          });
        });
      });

      describe("x-onlaunch-platform-name", () => {
        describe("valid string", () => {
          it("should return a success response", async () => {
            // -- Arrange --
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
              method: "GET",
              headers: {
                "x-api-key": "client-key",
                "x-onlaunch-platform-name": "android",
              },
            });
            // -- Act --
            await handler(req, res);
            // -- Assert --
            expect(res.statusCode).toEqual(StatusCodes.OK);
            expect(res._getJSONData()).toStrictEqual([]);
          });
        });

        describe("too long string", () => {
          it("should return a validation error", async () => {
            // -- Arrange --
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
              method: "GET",
              headers: {
                "x-api-key": "client-key",
                "x-onlaunch-platform-name": "a".repeat(201),
              },
            });
            // -- Act --
            await handler(req, res);
            // -- Assert --
            expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(res._getJSONData()).toStrictEqual({
              message: "Validation Error",
              constraints: {
                maxLength:
                  "x-onlaunch-platform-name must be shorter than or equal to 200 characters",
              },
            });
          });
        });
      });

      describe("x-onlaunch-platform-version", () => {
        describe("valid string", () => {
          it("should return a success response", async () => {
            // -- Arrange --
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
              method: "GET",
              headers: {
                "x-api-key": "client-key",
                "x-onlaunch-platform-version": "21",
              },
            });
            // -- Act --
            await handler(req, res);
            // -- Assert --
            expect(res.statusCode).toEqual(StatusCodes.OK);
            expect(res._getJSONData()).toStrictEqual([]);
          });
        });

        describe("too long string", () => {
          it("should return a validation error", async () => {
            // -- Arrange --
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
              method: "GET",
              headers: {
                "x-api-key": "client-key",
                "x-onlaunch-platform-version": "a".repeat(201),
              },
            });
            // -- Act --
            await handler(req, res);
            // -- Assert --
            expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(res._getJSONData()).toStrictEqual({
              message: "Validation Error",
              constraints: {
                maxLength:
                  "x-onlaunch-platform-version must be shorter than or equal to 200 characters",
              },
            });
          });
        });
      });

      describe("x-onlaunch-release-version", () => {
        describe("valid string", () => {
          it("should return a success response", async () => {
            // -- Arrange --
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
              method: "GET",
              headers: {
                "x-api-key": "client-key",
                "x-onlaunch-release-version": "123",
              },
            });
            // -- Act --
            await handler(req, res);
            // -- Assert --
            expect(res.statusCode).toEqual(StatusCodes.OK);
            expect(res._getJSONData()).toStrictEqual([]);
          });
        });

        describe("too long string", () => {
          it("should return a validation error", async () => {
            // -- Arrange --
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
              method: "GET",
              headers: {
                "x-api-key": "client-key",
                "x-onlaunch-release-version": "a".repeat(201),
              },
            });
            // -- Act --
            await handler(req, res);
            // -- Assert --
            expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(res._getJSONData()).toStrictEqual({
              message: "Validation Error",
              constraints: {
                maxLength:
                  "x-onlaunch-release-version must be shorter than or equal to 200 characters",
              },
            });
          });
        });
      });

      describe("x-onlaunch-version-code", () => {
        describe("valid string", () => {
          it("should return a success response", async () => {
            // -- Arrange --
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
              method: "GET",
              headers: {
                "x-api-key": "client-key",
                "x-onlaunch-version-code": "123",
              },
            });
            // -- Act --
            await handler(req, res);
            // -- Assert --
            expect(res.statusCode).toEqual(StatusCodes.OK);
            expect(res._getJSONData()).toStrictEqual([]);
          });
        });

        describe("too long string", () => {
          it("should return a validation error", async () => {
            // -- Arrange --
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
              method: "GET",
              headers: {
                "x-api-key": "client-key",
                "x-onlaunch-version-code": "a".repeat(201),
              },
            });
            // -- Act --
            await handler(req, res);
            // -- Assert --
            expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(res._getJSONData()).toStrictEqual({
              message: "Validation Error",
              constraints: {
                maxLength:
                  "x-onlaunch-version-code must be shorter than or equal to 200 characters",
              },
            });
          });
        });
      });

      describe("x-onlaunch-version-name", () => {
        describe("valid string", () => {
          it("should return a success response", async () => {
            // -- Arrange --
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
              method: "GET",
              headers: {
                "x-api-key": "client-key",
                "x-onlaunch-version-name": "1.0.0",
              },
            });
            // -- Act --
            await handler(req, res);
            // -- Assert --
            expect(res.statusCode).toEqual(StatusCodes.OK);
            expect(res._getJSONData()).toStrictEqual([]);
          });
        });

        describe("too long string", () => {
          it("should return a validation error", async () => {
            // -- Arrange --
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
              method: "GET",
              headers: {
                "x-api-key": "client-key",
                "x-onlaunch-version-name": "a".repeat(201),
              },
            });
            // -- Act --
            await handler(req, res);
            // -- Assert --
            expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(res._getJSONData()).toStrictEqual({
              message: "Validation Error",
              constraints: {
                maxLength:
                  "x-onlaunch-version-name must be shorter than or equal to 200 characters",
              },
            });
          });
        });
      });

      describe("x-onlaunch-update-available", () => {
        describe("valid boolean", () => {
          it("should return a success response", async () => {
            // -- Arrange --
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
              method: "GET",
              headers: {
                "x-api-key": "client-key",
                "x-onlaunch-update-available": "false",
              },
            });
            // -- Act --
            await handler(req, res);
            // -- Assert --
            expect(res.statusCode).toEqual(StatusCodes.OK);
            expect(res._getJSONData()).toStrictEqual([]);
          });
        });

        describe("invalid boolean", () => {
          it("should return a validation error", async () => {
            // -- Arrange --
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
              method: "GET",
              headers: {
                "x-api-key": "client-key",
                "x-onlaunch-update-available": "not-a-boolean",
              },
            });
            // -- Act --
            await handler(req, res);
            // -- Assert --
            expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(res._getJSONData()).toStrictEqual({
              message: "Validation Error",
              constraints: {
                isBoolean:
                  "x-onlaunch-update-available must be a boolean value",
              },
            });
          });
        });
      });
    });

    describe("app not found by client key", () => {
      beforeEach(() => {
        prismaMock.app.findFirst.mockResolvedValue(null);
      });

      it("should return a not found error", async () => {
        // -- Arrange --
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: "GET",
          headers: {
            "x-api-key": "client-key",
          },
        });
        prismaMock.app.findFirst.mockResolvedValue(null);
        // -- Act --
        await handler(req, res);
        // -- Assert --
        expect(res.statusCode).toEqual(StatusCodes.NOT_FOUND);
        expect(res._getJSONData()).toStrictEqual({
          message: "no app found for api key",
        });
        expect(prismaMock.app.findFirst).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              publicKey: "client-key",
              isDeleted: {
                not: true,
              },
              organisation: {
                isDeleted: {
                  not: true,
                },
              },
            },
          }),
        );
        expect(prismaMock.message.findMany).not.toHaveBeenCalled();
        expect(prismaMock.loggedApiRequests.create).not.toHaveBeenCalled();
      });
    });

    describe("app of deleted organisation", () => {
      it("should return a not found error", async () => {
        // -- Arrange --
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: "GET",
          headers: {
            "x-api-key": "client-key",
          },
        });
        // -- Act --
        await handler(req, res);
        // -- Assert --
        expect(res.statusCode).toEqual(StatusCodes.NOT_FOUND);
        expect(res._getJSONData()).toStrictEqual({
          message: "no app found for api key",
        });
        expect(prismaMock.app.findFirst).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              publicKey: "client-key",
              isDeleted: {
                not: true,
              },
              organisation: {
                isDeleted: {
                  not: true,
                },
              },
            },
          }),
        );
        expect(prismaMock.message.findMany).not.toHaveBeenCalled();
        expect(prismaMock.loggedApiRequests.create).not.toHaveBeenCalled();
      });
    });

    describe("app found by client key", () => {
      beforeEach(() => {
        prismaMock.app.findFirst.mockResolvedValue({
          id: 1,
          createdAt: new Date(1000),
          updatedAt: new Date(2000),
          publicKey: "public-key",
          name: "Example App",
          orgId: null,
          idOfLastReportedApiRequest: null,
          isDeleted: false,
          deletedAt: null,
        });
      });

      describe("message ending in past", () => {
        it("should not return message", async () => {
          // -- Arrange --
          jest.useFakeTimers().setSystemTime(new Date(999));
          const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: "GET",
            headers: {
              "x-api-key": "client-key",
            },
          });
          prismaMock.message.findMany.mockResolvedValue([]);
          // -- Act --
          await handler(req, res);
          // -- Assert --
          expect(res.statusCode).toEqual(StatusCodes.OK);
          expect(res._getJSONData()).toStrictEqual([]);
          expect(prismaMock.app.findFirst).toHaveBeenCalledWith(
            expect.objectContaining({
              where: {
                publicKey: "client-key",
                isDeleted: {
                  not: true,
                },
                organisation: {
                  isDeleted: {
                    not: true,
                  },
                },
              },
            }),
          );
          expect(prismaMock.message.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
              where: {
                AND: expect.arrayContaining([
                  {
                    appId: 1,
                  },
                  {
                    startDate: {
                      lte: new Date(999),
                    },
                  },
                ]),
              },
            }),
          );
          expect(prismaMock.loggedApiRequests.create).toHaveBeenCalled();
        });
      });

      describe("messages starting in future", () => {
        it("should not return message", async () => {
          // -- Arrange --
          jest.useFakeTimers().setSystemTime(new Date(999));
          const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: "GET",
            headers: {
              "x-api-key": "client-key",
            },
          });
          prismaMock.message.findMany.mockResolvedValue([]);
          // -- Act --
          await handler(req, res);
          // -- Assert --
          expect(res.statusCode).toEqual(StatusCodes.OK);
          expect(res._getJSONData()).toStrictEqual([]);
          expect(prismaMock.app.findFirst).toHaveBeenCalledWith(
            expect.objectContaining({
              where: {
                publicKey: "client-key",
                isDeleted: {
                  not: true,
                },
                organisation: {
                  isDeleted: {
                    not: true,
                  },
                },
              },
            }),
          );
          expect(prismaMock.message.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
              where: {
                AND: expect.arrayContaining([
                  {
                    appId: 1,
                  },
                  {
                    endDate: {
                      gte: new Date(999),
                    },
                  },
                ]),
              },
            }),
          );
          expect(prismaMock.loggedApiRequests.create).toHaveBeenCalled();
        });
      });

      describe("message with filter", () => {
        describe("filter matching context", () => {
          it("should return message ", async () => {
            // -- Arrange --
            jest.useFakeTimers().setSystemTime(new Date(1000));
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
              method: "GET",
              headers: {
                "x-api-key": "client-key",
                "x-onlaunch-bundle-id": "com.example.app",
              },
            });
            const action1: PrismaMessageAction = {
              id: 1,
              messageId: null,

              createdAt: new Date(1000),
              updatedAt: new Date(2000),

              title: "Action 1",
              actionType: $Enums.ActionType.DISMISS,
              buttonDesign: $Enums.ButtonDesign.FILLED,
            };
            const message1: PrismaMessage & {
              actions: PrismaMessageAction[];
              filter: PrismaMessageFilter & {
                ruleGroup: PrismaMessageRuleGroup;
              };
            } = {
              id: 1,
              appId: 1,
              createdAt: new Date(1000),
              updatedAt: new Date(2000),

              title: "Message 1",
              body: "This is a message",
              actions: [action1],

              blocking: false,

              startDate: new Date(500),
              endDate: new Date(1500),

              filter: {
                id: 2,
                createdAt: new Date(1000),
                updatedAt: new Date(2000),
                ruleGroupId: 3,
                ruleGroup: {
                  id: 4,
                  createdAt: new Date(1000),
                  updatedAt: new Date(2000),
                  operator: $Enums.MessageRuleGroupOperator.AND,
                  parentGroupId: null,
                },
                messageId: 1,
              },
            };
            const action2: PrismaMessageAction = {
              id: 2,
              messageId: null,

              createdAt: new Date(1000),
              updatedAt: new Date(2000),

              title: "Action 2",
              actionType: $Enums.ActionType.DISMISS,
              buttonDesign: $Enums.ButtonDesign.FILLED,
            };
            const message2: PrismaMessage & {
              actions: PrismaMessageAction[];
              filter: PrismaMessageFilter & {
                ruleGroup: PrismaMessageRuleGroup;
              };
            } = {
              id: 2,
              appId: 1,
              createdAt: new Date(1000),
              updatedAt: new Date(2000),

              title: "Message 2",
              body: "This is a message",
              actions: [action2],

              blocking: false,

              startDate: new Date(500),
              endDate: new Date(1500),

              filter: {
                id: 3,
                createdAt: new Date(1000),
                updatedAt: new Date(2000),
                ruleGroupId: 5,
                ruleGroup: {
                  id: 6,
                  createdAt: new Date(1000),
                  updatedAt: new Date(2000),
                  operator: $Enums.MessageRuleGroupOperator.AND,
                  parentGroupId: null,
                },
                messageId: 2,
              },
            };
            prismaMock.message.findMany.mockResolvedValue([message1, message2]);
            // Message 1 should be included
            const filterGroup1: PrismaMessageRuleGroup & {
              conditions: PrismaMessageRuleCondition[];
              groups: PrismaMessageRuleGroup[];
            } = {
              id: 7,
              createdAt: new Date(1000),
              updatedAt: new Date(2000),
              operator: $Enums.MessageRuleGroupOperator.AND,
              parentGroupId: null,
              conditions: [
                {
                  id: 8,
                  createdAt: new Date(1000),
                  updatedAt: new Date(2000),
                  systemVariable: MessageRuleSystemVariable.BUNDLE_ID,
                  comparator: $Enums.MessageRuleConditionComparator.EQUALS,
                  userVariable: "com.example.app",
                  parentGroupId: 0,
                },
              ],
              groups: [],
            };
            prismaMock.messageRuleGroup.findUnique.mockResolvedValueOnce(
              filterGroup1,
            );
            // Message 2 should not be included
            const filterGroup2: PrismaMessageRuleGroup & {
              conditions: PrismaMessageRuleCondition[];
              groups: PrismaMessageRuleGroup[];
            } = {
              id: 7,
              createdAt: new Date(1000),
              updatedAt: new Date(2000),
              operator: $Enums.MessageRuleGroupOperator.AND,
              parentGroupId: null,
              conditions: [
                {
                  id: 8,
                  createdAt: new Date(1000),
                  updatedAt: new Date(2000),
                  systemVariable: MessageRuleSystemVariable.BUNDLE_ID,
                  comparator:
                    $Enums.MessageRuleConditionComparator.IS_NOT_EQUAL,
                  userVariable: "com.example.app",
                  parentGroupId: 0,
                },
              ],
              groups: [],
            };
            prismaMock.messageRuleGroup.findUnique.mockResolvedValueOnce(
              filterGroup2,
            );
            // -- Act --
            await handler(req, res);
            // -- Assert --
            expect(res.statusCode).toEqual(StatusCodes.OK);
            expect(res._getJSONData()).toStrictEqual([
              {
                id: 1,
                title: "Message 1",
                body: "This is a message",
                blocking: false,
                actions: [
                  {
                    title: "Action 1",
                    actionType: "DISMISS",
                    buttonDesign: "FILLED",
                  },
                ],
              },
            ]);
            expect(prismaMock.app.findFirst).toHaveBeenCalledWith(
              expect.objectContaining({
                where: expect.objectContaining({
                  publicKey: "client-key",
                }),
              }),
            );
            expect(prismaMock.message.findMany).toHaveBeenCalledWith(
              expect.objectContaining({
                where: {
                  AND: expect.arrayContaining([
                    {
                      appId: 1,
                    },
                  ]),
                },
              }),
            );
            expect(prismaMock.loggedApiRequests.create).toHaveBeenCalled();
            expect(
              prismaMock.messageRuleGroup.findUnique,
            ).toHaveBeenNthCalledWith(
              1,
              expect.objectContaining({
                where: expect.objectContaining({
                  id: 4,
                }),
              }),
            );
            expect(
              prismaMock.messageRuleGroup.findUnique,
            ).toHaveBeenNthCalledWith(
              2,
              expect.objectContaining({
                where: expect.objectContaining({
                  id: 6,
                }),
              }),
            );
          });
        });

        describe("filter not matching context", () => {
          it("should not return", async () => {
            // -- Arrange --
            jest.useFakeTimers().setSystemTime(new Date(1000));
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
              method: "GET",
              headers: {
                "x-api-key": "client-key",
                "x-onlaunch-bundle-id": "com.example.app",
              },
            });
            const action1: PrismaMessageAction = {
              id: 1,
              messageId: null,

              createdAt: new Date(1000),
              updatedAt: new Date(2000),

              title: "Action 1",
              actionType: $Enums.ActionType.DISMISS,
              buttonDesign: $Enums.ButtonDesign.FILLED,
            };
            const message1: PrismaMessage & {
              actions: PrismaMessageAction[];
              filter: PrismaMessageFilter & {
                ruleGroup: PrismaMessageRuleGroup;
              };
            } = {
              id: 1,
              appId: 1,
              createdAt: new Date(1000),
              updatedAt: new Date(2000),

              title: "Message 1",
              body: "This is a message",
              actions: [action1],

              blocking: false,

              startDate: new Date(500),
              endDate: new Date(1500),

              filter: {
                id: 2,
                createdAt: new Date(1000),
                updatedAt: new Date(2000),
                ruleGroupId: 3,
                ruleGroup: {
                  id: 4,
                  createdAt: new Date(1000),
                  updatedAt: new Date(2000),
                  operator: $Enums.MessageRuleGroupOperator.AND,
                  parentGroupId: null,
                },
                messageId: 1,
              },
            };
            prismaMock.message.findMany.mockResolvedValue([message1]);
            // Message 1 should not be included
            const filterGroup1: PrismaMessageRuleGroup & {
              conditions: PrismaMessageRuleCondition[];
              groups: PrismaMessageRuleGroup[];
            } = {
              id: 7,
              createdAt: new Date(1000),
              updatedAt: new Date(2000),
              operator: $Enums.MessageRuleGroupOperator.AND,
              parentGroupId: null,
              conditions: [
                {
                  id: 8,
                  createdAt: new Date(1000),
                  updatedAt: new Date(2000),
                  systemVariable: MessageRuleSystemVariable.BUNDLE_ID,
                  comparator:
                    $Enums.MessageRuleConditionComparator.IS_NOT_EQUAL,
                  userVariable: "com.example.app",
                  parentGroupId: 0,
                },
              ],
              groups: [],
            };
            prismaMock.messageRuleGroup.findUnique.mockResolvedValueOnce(
              filterGroup1,
            );
            // -- Act --
            await handler(req, res);
            // -- Assert --
            expect(res.statusCode).toEqual(StatusCodes.OK);
            expect(res._getJSONData()).toStrictEqual([]);
            expect(prismaMock.app.findFirst).toHaveBeenCalledWith(
              expect.objectContaining({
                where: expect.objectContaining({
                  publicKey: "client-key",
                }),
              }),
            );
            expect(prismaMock.message.findMany).toHaveBeenCalledWith(
              expect.objectContaining({
                where: {
                  AND: expect.arrayContaining([
                    {
                      appId: 1,
                    },
                  ]),
                },
              }),
            );
          });
        });
      });

      it("should sort messages by startDate", async () => {
        // -- Arrange --
        jest.useFakeTimers().setSystemTime(new Date(1000));
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: "GET",
          headers: {
            "x-api-key": "client-key",
          },
        });
        const message1: PrismaMessage & {
          actions: PrismaMessageAction[];
        } = {
          id: 1,
          appId: 1,
          createdAt: new Date(1000),
          updatedAt: new Date(2000),

          title: "Message 1",
          body: "This is a message",
          actions: [],

          blocking: false,

          startDate: new Date(500),
          endDate: new Date(1500),
        };
        const message2: PrismaMessage & {
          actions: PrismaMessageAction[];
        } = {
          id: 2,
          appId: 1,
          createdAt: new Date(1000),
          updatedAt: new Date(2000),

          title: "Message 2",
          body: "This is a message",
          actions: [],

          blocking: false,
          startDate: new Date(500),
          endDate: new Date(1500),
        };
        const message3: PrismaMessage & {
          actions: PrismaMessageAction[];
        } = {
          id: 3,
          appId: 1,
          createdAt: new Date(1000),
          updatedAt: new Date(2000),

          title: "Message 3",
          body: "This is another message",
          actions: [],

          blocking: false,

          startDate: new Date(250),
          endDate: new Date(1500),
        };
        prismaMock.message.findMany.mockResolvedValue([
          message3,
          message2,
          message1,
        ]);

        // -- Act --
        await handler(req, res);

        // -- Assert --
        expect(res.statusCode).toEqual(StatusCodes.OK);
        expect(res._getJSONData()).toStrictEqual([
          {
            id: 3,
            title: "Message 3",
            body: "This is another message",
            blocking: false,
            actions: [],
          },
          {
            id: 2,
            title: "Message 2",
            body: "This is a message",
            blocking: false,
            actions: [],
          },
          {
            id: 1,
            title: "Message 1",
            body: "This is a message",
            blocking: false,
            actions: [],
          },
        ]);
        expect(prismaMock.app.findFirst).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              publicKey: "client-key",
            }),
          }),
        );
        expect(prismaMock.message.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: {
              startDate: "asc",
            },
          }),
        );
        expect(prismaMock.loggedApiRequests.create).toHaveBeenCalled();
      });

      describe("message with open in app store action", () => {
        it("should return message with open in app store action", async () => {
          // -- Arrange --
          jest.useFakeTimers().setSystemTime(new Date(1000));
          const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: "GET",
            headers: {
              "x-api-key": "client-key",
            },
          });

          const action1: PrismaMessageAction = {
            id: 1,
            messageId: null,

            createdAt: new Date(1000),
            updatedAt: new Date(2000),

            title: "Action 1",
            actionType: $Enums.ActionType.OPEN_APP_IN_APP_STORE,
            buttonDesign: $Enums.ButtonDesign.FILLED,
          };
          const message1: PrismaMessage & {
            actions: PrismaMessageAction[];
          } = {
            id: 1,
            appId: 1,
            createdAt: new Date(1000),
            updatedAt: new Date(2000),

            title: "Message 1",
            body: "This is a message",
            actions: [action1],

            blocking: false,

            startDate: new Date(500),
            endDate: new Date(1500),
          };
          prismaMock.message.findMany.mockResolvedValue([message1]);

          // -- Act --
          await handler(req, res);

          // -- Assert --
          expect(res.statusCode).toEqual(StatusCodes.OK);
          expect(res._getJSONData()).toStrictEqual([
            {
              id: 1,
              title: "Message 1",
              body: "This is a message",
              blocking: false,
              actions: [
                {
                  actionType: "OPEN_APP_IN_APP_STORE",
                  title: "Action 1",
                },
              ],
            },
          ]);
        });
      });
    });
  });

  describe("other HTTP methods", () => {
    it("should return method not allowed", async () => {
      // -- Arrange --
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
      });
      // -- Act --
      await handler(req, res);
      // -- Assert --
      expect(res.statusCode).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
      expect(res._getJSONData()).toStrictEqual({
        message: "Method not allowed",
      });
    });
  });
});
