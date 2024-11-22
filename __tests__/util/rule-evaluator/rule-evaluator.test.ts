import type { RuleEvaluationContext } from "@/util/rule-evaluation/rule-evaluation-context";
import { RuleEvaluator } from "@/util/rule-evaluation/rule-evaluator";
import {
  MessageRuleCondition as PrismaMessageRuleCondition,
  MessageRuleConditionComparator as PrismaMessageRuleConditionComparator,
  MessageRuleGroup as PrismaMessageRuleGroup,
  MessageRuleGroupOperator as PrismaMessageRuleGroupOperator,
} from "@prisma/client";
import { prismaMock } from "../../../jest-setup";

describe("RuleEvaluator", () => {
  describe("#isMessageIncluded", () => {
    describe("when the rule group is not found", () => {
      it("should throw an error", async () => {
        // -- Arrange --
        prismaMock.messageRuleGroup.findUnique.mockResolvedValue(null);
        const context: RuleEvaluationContext = {};
        // -- Act --
        await expect(RuleEvaluator.isMessageIncluded(1, context))
          // -- Assert --
          .rejects.toThrow("Failed to find group by id: 1");
        expect(prismaMock.messageRuleGroup.findUnique).toHaveBeenCalledTimes(1);
        expect(prismaMock.messageRuleGroup.findUnique).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              id: 1,
            }),
          }),
        );
      });
    });

    describe("unknown group operator", () => {
      it("should throw an error", async () => {
        // -- Arrange --
        prismaMock.messageRuleGroup.findUnique.mockResolvedValue({
          id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          parentGroupId: null,
          operator: "unknown" as PrismaMessageRuleGroupOperator,
        });
        const context: RuleEvaluationContext = {};
        // -- Act --
        await expect(RuleEvaluator.isMessageIncluded(1, context))
          // -- Assert --
          .rejects.toThrow("Failed to map operator from prisma: unknown");
        expect(prismaMock.messageRuleGroup.findUnique).toHaveBeenCalledTimes(1);
        expect(prismaMock.messageRuleGroup.findUnique).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              id: 1,
            }),
          }),
        );
      });
    });

    describe("unknown condition system variable", () => {
      it("should throw an error", async () => {
        // -- Arrange --
        const condition1: PrismaMessageRuleCondition = {
          id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          parentGroupId: 1,
          systemVariable: "unknown",
          comparator: PrismaMessageRuleConditionComparator.CONTAINS,
          userVariable: null,
        };
        const ruleGroup: PrismaMessageRuleGroup & {
          conditions: PrismaMessageRuleCondition[];
          groups: PrismaMessageRuleGroup[];
        } = {
          id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          parentGroupId: null,
          operator: PrismaMessageRuleGroupOperator.AND,
          conditions: [condition1],
          groups: [],
        };
        prismaMock.messageRuleGroup.findUnique.mockResolvedValue(ruleGroup);
        const context: RuleEvaluationContext = {};
        // -- Act --
        await expect(RuleEvaluator.isMessageIncluded(1, context))
          // -- Assert --
          .rejects.toThrow(
            "Failed to map system variable from prisma: unknown",
          );
        expect(prismaMock.messageRuleGroup.findUnique).toHaveBeenCalledTimes(1);
        expect(prismaMock.messageRuleGroup.findUnique).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              id: 1,
            }),
          }),
        );
      });
    });

    describe("unknown condition comparator", () => {
      it("should throw an error", async () => {
        // -- Arrange --
        const condition1: PrismaMessageRuleCondition = {
          id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          parentGroupId: 1,
          systemVariable: "BUNDLE_ID",
          comparator: "unknown" as PrismaMessageRuleConditionComparator,
          userVariable: null,
        };
        const ruleGroup: PrismaMessageRuleGroup & {
          conditions: PrismaMessageRuleCondition[];
          groups: PrismaMessageRuleGroup[];
        } = {
          id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          parentGroupId: null,
          operator: PrismaMessageRuleGroupOperator.AND,
          conditions: [condition1],
          groups: [],
        };
        prismaMock.messageRuleGroup.findUnique.mockResolvedValue(ruleGroup);
        const context: RuleEvaluationContext = {};
        // -- Act --
        await expect(RuleEvaluator.isMessageIncluded(1, context))
          // -- Assert --
          .rejects.toThrow("Failed to map comparator from prisma: unknown");
        expect(prismaMock.messageRuleGroup.findUnique).toHaveBeenCalledTimes(1);
        expect(prismaMock.messageRuleGroup.findUnique).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              id: 1,
            }),
          }),
        );
      });
    });

    describe("when the rule group is found", () => {
      describe("AND operator", () => {
        describe("no groups and conditions", () => {
          it("should return true", async () => {
            const messageRuleGroup: PrismaMessageRuleGroup & {
              conditions: PrismaMessageRuleCondition[];
              groups: PrismaMessageRuleGroup[];
            } = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: null,
              operator: "AND",
              conditions: [],
              groups: [],
            };
            // -- Arrange --
            prismaMock.messageRuleGroup.findUnique.mockResolvedValue(
              messageRuleGroup,
            );
            const context: RuleEvaluationContext = {};
            // -- Act --
            const result = await RuleEvaluator.isMessageIncluded(1, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("all sub groups and conditions evaluate true", () => {
          it("should return true", async () => {
            // -- Arrange --
            const messageRuleGroup: PrismaMessageRuleGroup & {
              conditions: PrismaMessageRuleCondition[];
              groups: Pick<PrismaMessageRuleGroup, "id">[];
            } = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: null,
              operator: "AND",
              conditions: [
                {
                  id: 1,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  parentGroupId: 1,
                  systemVariable: "BUNDLE_ID",
                  comparator: PrismaMessageRuleConditionComparator.EQUALS,
                  userVariable: "com.example.app",
                },
              ],
              groups: [
                {
                  id: 2,
                },
              ],
            };
            prismaMock.messageRuleGroup.findUnique.mockResolvedValueOnce(
              messageRuleGroup,
            );
            const subGroup: PrismaMessageRuleGroup & {
              conditions: PrismaMessageRuleCondition[];
              groups: PrismaMessageRuleGroup[];
            } = {
              id: 2,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              operator: "AND",
              conditions: [],
              groups: [],
            };
            prismaMock.messageRuleGroup.findUnique.mockResolvedValueOnce(
              subGroup,
            );
            const context: RuleEvaluationContext = {
              clientBundleId: "com.example.app",
            };
            // -- Act --
            const result = await RuleEvaluator.isMessageIncluded(1, context);
            // -- Assert --
            expect(result).toBe(true);
            expect(
              prismaMock.messageRuleGroup.findUnique,
            ).toHaveBeenCalledTimes(2);
            expect(
              prismaMock.messageRuleGroup.findUnique,
            ).toHaveBeenNthCalledWith(
              1,
              expect.objectContaining({
                where: expect.objectContaining({
                  id: 1,
                }),
              }),
            );
            expect(
              prismaMock.messageRuleGroup.findUnique,
            ).toHaveBeenNthCalledWith(
              2,
              expect.objectContaining({
                where: expect.objectContaining({
                  id: 2,
                }),
              }),
            );
          });
        });

        describe("a sub group evaluates false", () => {
          it("should return false and exit early", async () => {
            // -- Arrange --
            const messageRuleGroup: PrismaMessageRuleGroup & {
              conditions: PrismaMessageRuleCondition[];
              groups: Pick<PrismaMessageRuleGroup, "id">[];
            } = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: null,
              operator: PrismaMessageRuleGroupOperator.AND,
              conditions: [],
              groups: [
                {
                  id: 2,
                },
                {
                  id: 3,
                },
              ],
            };
            prismaMock.messageRuleGroup.findUnique.mockResolvedValueOnce(
              messageRuleGroup,
            );
            const subGroup: PrismaMessageRuleGroup & {
              conditions: PrismaMessageRuleCondition[];
              groups: PrismaMessageRuleGroup[];
            } = {
              id: 2,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              operator: PrismaMessageRuleGroupOperator.AND,
              conditions: [
                {
                  id: 1,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  parentGroupId: 2,
                  systemVariable: "BUNDLE_ID",
                  comparator: PrismaMessageRuleConditionComparator.IS_NOT_EQUAL,
                  userVariable: "com.example.app",
                },
              ],
              groups: [],
            };
            prismaMock.messageRuleGroup.findUnique.mockResolvedValueOnce(
              subGroup,
            );
            const context: RuleEvaluationContext = {
              clientBundleId: "com.example.app",
            };
            // -- Act --
            const result = await RuleEvaluator.isMessageIncluded(1, context);
            // -- Assert --
            expect(result).toBe(false);
            expect(
              prismaMock.messageRuleGroup.findUnique,
            ).toHaveBeenCalledTimes(2);
            expect(
              prismaMock.messageRuleGroup.findUnique,
            ).toHaveBeenNthCalledWith(
              1,
              expect.objectContaining({
                where: expect.objectContaining({
                  id: 1,
                }),
              }),
            );
            expect(
              prismaMock.messageRuleGroup.findUnique,
            ).toHaveBeenNthCalledWith(
              2,
              expect.objectContaining({
                where: expect.objectContaining({
                  id: 2,
                }),
              }),
            );
          });
        });

        describe("a condition evaluates false", () => {
          it("should return false and exit early", async () => {
            // -- Arrange --
            const messageRuleGroup: PrismaMessageRuleGroup & {
              conditions: PrismaMessageRuleCondition[];
              groups: Pick<PrismaMessageRuleGroup, "id">[];
            } = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: null,
              operator: PrismaMessageRuleGroupOperator.AND,
              conditions: [
                {
                  id: 1,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  parentGroupId: 1,
                  systemVariable: "BUNDLE_ID",
                  comparator: PrismaMessageRuleConditionComparator.IS_NOT_EQUAL,
                  userVariable: "com.example.app",
                },
              ],
              groups: [
                {
                  id: 2,
                },
              ],
            };
            prismaMock.messageRuleGroup.findUnique.mockResolvedValue(
              messageRuleGroup,
            );
            const context: RuleEvaluationContext = {
              clientBundleId: "com.example.app",
            };
            // -- Act --
            const result = await RuleEvaluator.isMessageIncluded(1, context);
            // -- Assert --
            expect(result).toBe(false);
            expect(
              prismaMock.messageRuleGroup.findUnique,
            ).toHaveBeenCalledTimes(1);
            expect(prismaMock.messageRuleGroup.findUnique).toHaveBeenCalledWith(
              expect.objectContaining({
                where: expect.objectContaining({
                  id: 1,
                }),
              }),
            );
          });
        });
      });

      describe("OR operator", () => {
        describe("no groups and conditions", () => {
          it("should return false", async () => {
            // -- Arrange --
            const messageRuleGroup: PrismaMessageRuleGroup & {
              conditions: PrismaMessageRuleCondition[];
              groups: PrismaMessageRuleGroup[];
            } = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: null,
              operator: PrismaMessageRuleGroupOperator.OR,
              conditions: [],
              groups: [],
            };
            prismaMock.messageRuleGroup.findUnique.mockResolvedValue(
              messageRuleGroup,
            );
            const context: RuleEvaluationContext = {};
            // -- Act --
            const result = await RuleEvaluator.isMessageIncluded(1, context);
            // -- Assert --
            expect(result).toBe(false);
            expect(
              prismaMock.messageRuleGroup.findUnique,
            ).toHaveBeenCalledTimes(1);
            expect(prismaMock.messageRuleGroup.findUnique).toHaveBeenCalledWith(
              expect.objectContaining({
                where: expect.objectContaining({
                  id: 1,
                }),
              }),
            );
          });
        });

        describe("all sub groups and conditions evaluate false", () => {
          it("should return false", async () => {
            // -- Arrange --
            const messageRuleGroup: PrismaMessageRuleGroup & {
              conditions: PrismaMessageRuleCondition[];
              groups: Pick<PrismaMessageRuleGroup, "id">[];
            } = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: null,
              operator: PrismaMessageRuleGroupOperator.OR,
              conditions: [
                {
                  id: 1,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  parentGroupId: 1,
                  systemVariable: "BUNDLE_ID",
                  comparator: PrismaMessageRuleConditionComparator.IS_NOT_EQUAL,
                  userVariable: "com.example.app",
                },
              ],
              groups: [
                {
                  id: 2,
                },
                {
                  id: 3,
                },
              ],
            };
            prismaMock.messageRuleGroup.findUnique.mockResolvedValueOnce(
              messageRuleGroup,
            );
            const subGroup1: PrismaMessageRuleGroup & {
              conditions: PrismaMessageRuleCondition[];
              groups: PrismaMessageRuleGroup[];
            } = {
              id: 2,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              operator: PrismaMessageRuleGroupOperator.OR,
              conditions: [],
              groups: [],
            };
            prismaMock.messageRuleGroup.findUnique.mockResolvedValueOnce(
              subGroup1,
            );
            const subGroup2: PrismaMessageRuleGroup & {
              conditions: PrismaMessageRuleCondition[];
              groups: PrismaMessageRuleGroup[];
            } = {
              id: 3,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              operator: PrismaMessageRuleGroupOperator.OR,
              conditions: [],
              groups: [],
            };
            prismaMock.messageRuleGroup.findUnique.mockResolvedValueOnce(
              subGroup2,
            );

            const context: RuleEvaluationContext = {
              clientBundleId: "com.example.app",
            };
            // -- Act --
            const result = await RuleEvaluator.isMessageIncluded(1, context);
            // -- Assert --
            expect(result).toBe(false);
            expect(
              prismaMock.messageRuleGroup.findUnique,
            ).toHaveBeenCalledTimes(3);
            expect(
              prismaMock.messageRuleGroup.findUnique,
            ).toHaveBeenNthCalledWith(
              1,
              expect.objectContaining({
                where: expect.objectContaining({
                  id: 1,
                }),
              }),
            );
            expect(
              prismaMock.messageRuleGroup.findUnique,
            ).toHaveBeenNthCalledWith(
              2,
              expect.objectContaining({
                where: expect.objectContaining({
                  id: 2,
                }),
              }),
            );
            expect(
              prismaMock.messageRuleGroup.findUnique,
            ).toHaveBeenNthCalledWith(
              3,
              expect.objectContaining({
                where: expect.objectContaining({
                  id: 3,
                }),
              }),
            );
          });
        });

        describe("a sub group evaluates true", () => {
          it("should return true and exit early", async () => {
            // -- Arrange --
            const messageRuleGroup: PrismaMessageRuleGroup & {
              conditions: PrismaMessageRuleCondition[];
              groups: Pick<PrismaMessageRuleGroup, "id">[];
            } = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: null,
              operator: PrismaMessageRuleGroupOperator.OR,
              conditions: [],
              groups: [
                {
                  id: 2,
                },
                {
                  id: 3,
                },
              ],
            };
            prismaMock.messageRuleGroup.findUnique.mockResolvedValueOnce(
              messageRuleGroup,
            );
            const subGroup1: PrismaMessageRuleGroup & {
              conditions: PrismaMessageRuleCondition[];
              groups: PrismaMessageRuleGroup[];
            } = {
              id: 2,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              operator: PrismaMessageRuleGroupOperator.OR,
              conditions: [
                {
                  id: 1,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  parentGroupId: 3,
                  systemVariable: "BUNDLE_ID",
                  comparator: PrismaMessageRuleConditionComparator.EQUALS,
                  userVariable: "com.example.app",
                },
              ],
              groups: [],
            };
            prismaMock.messageRuleGroup.findUnique.mockResolvedValueOnce(
              subGroup1,
            );
            const subGroup2: PrismaMessageRuleGroup & {
              conditions: PrismaMessageRuleCondition[];
              groups: PrismaMessageRuleGroup[];
            } = {
              id: 3,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              operator: PrismaMessageRuleGroupOperator.OR,
              conditions: [],
              groups: [],
            };
            prismaMock.messageRuleGroup.findUnique.mockResolvedValueOnce(
              subGroup2,
            );
            const context: RuleEvaluationContext = {
              clientBundleId: "com.example.app",
            };
            // -- Act --
            const result = await RuleEvaluator.isMessageIncluded(1, context);
            // -- Assert --
            expect(result).toBe(true);
            expect(
              prismaMock.messageRuleGroup.findUnique,
            ).toHaveBeenCalledTimes(2);
            expect(
              prismaMock.messageRuleGroup.findUnique,
            ).toHaveBeenNthCalledWith(
              1,
              expect.objectContaining({
                where: expect.objectContaining({
                  id: 1,
                }),
              }),
            );
            expect(
              prismaMock.messageRuleGroup.findUnique,
            ).toHaveBeenNthCalledWith(
              2,
              expect.objectContaining({
                where: expect.objectContaining({
                  id: 2,
                }),
              }),
            );
          });
        });

        describe("a condition evaluates true", () => {
          it("should return true and exit early", async () => {
            // -- Arrange --
            const messageRuleGroup: PrismaMessageRuleGroup & {
              conditions: PrismaMessageRuleCondition[];
              groups: Pick<PrismaMessageRuleGroup, "id">[];
            } = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: null,
              operator: PrismaMessageRuleGroupOperator.OR,
              conditions: [
                {
                  id: 1,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  parentGroupId: 1,
                  systemVariable: "BUNDLE_ID",
                  comparator: PrismaMessageRuleConditionComparator.EQUALS,
                  userVariable: "com.example.app",
                },
              ],
              groups: [
                {
                  id: 2,
                },
              ],
            };
            prismaMock.messageRuleGroup.findUnique.mockResolvedValue(
              messageRuleGroup,
            );
            const context: RuleEvaluationContext = {
              clientBundleId: "com.example.app",
            };
            // -- Act --
            const result = await RuleEvaluator.isMessageIncluded(1, context);
            // -- Assert --
            expect(result).toBe(true);
            expect(
              prismaMock.messageRuleGroup.findUnique,
            ).toHaveBeenCalledTimes(1);
            expect(prismaMock.messageRuleGroup.findUnique).toHaveBeenCalledWith(
              expect.objectContaining({
                where: expect.objectContaining({
                  id: 1,
                }),
              }),
            );
          });
        });
      });
    });
  });

  describe("#evaluateCondition", () => {
    describe("system variable", () => {
      describe("bundle id", () => {
        describe("context value is not given", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_ID",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "com.example.app",
            };
            const context: RuleEvaluationContext = {};
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });

        describe("context value equals user variable", () => {
          it("should return true ", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_ID",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "com.example.app",
            };
            const context: RuleEvaluationContext = {
              clientBundleId: "com.example.app",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("context value does not equal user variable", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_ID",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "com.example.app",
            };
            const context: RuleEvaluationContext = {
              clientBundleId: "com.example.app2",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });
      });

      describe("bundle version", () => {
        describe("context value is not given", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "1.0.0",
            };
            const context: RuleEvaluationContext = {};
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });

        describe("context value equals user variable", () => {
          it("should return true ", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "1.0.0",
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "1.0.0",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("context value does not equal user variable", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "1.0.0",
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "1.0.1",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });
      });

      describe("locale", () => {
        describe("context value is not given", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "LOCALE",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "en",
            };
            const context: RuleEvaluationContext = {};
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });

        describe("context value equals user variable", () => {
          it("should return true ", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "LOCALE",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "en",
            };
            const context: RuleEvaluationContext = {
              clientLocale: "en",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("context value does not equal user variable", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "LOCALE",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "en",
            };
            const context: RuleEvaluationContext = {
              clientLocale: "fr",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });
      });

      describe("locale language code", () => {
        describe("context value is not given", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "LOCALE_LANGUAGE_CODE",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "en",
            };
            const context: RuleEvaluationContext = {};
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });

        describe("context value equals user variable", () => {
          it("should return true ", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "LOCALE_LANGUAGE_CODE",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "en",
            };
            const context: RuleEvaluationContext = {
              clientLocaleLanguageCode: "en",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("context value does not equal user variable", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "LOCALE_LANGUAGE_CODE",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "en",
            };
            const context: RuleEvaluationContext = {
              clientLocaleLanguageCode: "fr",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });
      });

      describe("locale region code", () => {
        describe("context value is not given", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "LOCALE_REGION_CODE",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "US",
            };
            const context: RuleEvaluationContext = {};
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });

        describe("context value equals user variable", () => {
          it("should return true ", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "LOCALE_REGION_CODE",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "US",
            };
            const context: RuleEvaluationContext = {
              clientLocaleRegionCode: "US",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("context value does not equal user variable", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "LOCALE_REGION_CODE",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "US",
            };
            const context: RuleEvaluationContext = {
              clientLocaleRegionCode: "CA",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });
      });

      describe("package name", () => {
        describe("context value is not given", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "PACKAGE_NAME",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "com.example.app",
            };
            const context: RuleEvaluationContext = {};
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });

        describe("context value equals user variable", () => {
          it("should return true ", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "PACKAGE_NAME",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "com.example.app",
            };
            const context: RuleEvaluationContext = {
              clientPackageName: "com.example.app",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("context value does not equal user variable", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "PACKAGE_NAME",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "com.example.app",
            };
            const context: RuleEvaluationContext = {
              clientPackageName: "com.example.app2",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });
      });

      describe("platform name", () => {
        describe("context value is not given", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "PLATFORM_NAME",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "iOS",
            };
            const context: RuleEvaluationContext = {};
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });

        describe("context value equals user variable", () => {
          it("should return true ", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "PLATFORM_NAME",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "iOS",
            };
            const context: RuleEvaluationContext = {
              clientPlatformName: "iOS",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("context value does not equal user variable", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "PLATFORM_NAME",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "iOS",
            };
            const context: RuleEvaluationContext = {
              clientPlatformName: "Android",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });
      });

      describe("platform version", () => {
        describe("context value is not given", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "PLATFORM_VERSION",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "14.0",
            };
            const context: RuleEvaluationContext = {};
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });

        describe("context value equals user variable", () => {
          it("should return true ", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "PLATFORM_VERSION",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "14.0",
            };
            const context: RuleEvaluationContext = {
              clientPlatformVersion: "14.0",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("context value does not equal user variable", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "PLATFORM_VERSION",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "14.0",
            };
            const context: RuleEvaluationContext = {
              clientPlatformVersion: "13.0",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });
      });

      describe("release version", () => {
        describe("context value is not given", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "RELEASE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "1.0.0",
            };
            const context: RuleEvaluationContext = {};
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });

        describe("context value equals user variable", () => {
          it("should return true ", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "RELEASE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "1.0.0",
            };
            const context: RuleEvaluationContext = {
              clientReleaseVersion: "1.0.0",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("context value does not equal user variable", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "RELEASE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "1.0.0",
            };
            const context: RuleEvaluationContext = {
              clientReleaseVersion: "1.0.1",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });
      });

      describe("version code", () => {
        describe("context value is not given", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "VERSION_CODE",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "100",
            };
            const context: RuleEvaluationContext = {};
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });

        describe("context value equals user variable", () => {
          it("should return true ", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "VERSION_CODE",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "100",
            };
            const context: RuleEvaluationContext = {
              clientVersionCode: "100",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("context value does not equal user variable", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "VERSION_CODE",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "100",
            };
            const context: RuleEvaluationContext = {
              clientVersionCode: "101",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });
      });

      describe("version name", () => {
        describe("context value is not given", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "VERSION_NAME",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "1.0.0",
            };
            const context: RuleEvaluationContext = {};
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });

        describe("context value equals user variable", () => {
          it("should return true ", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "VERSION_NAME",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "1.0.0",
            };
            const context: RuleEvaluationContext = {
              clientVersionName: "1.0.0",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("context value does not equal user variable", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "VERSION_NAME",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "1.0.0",
            };
            const context: RuleEvaluationContext = {
              clientVersionName: "1.0.1",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });
      });

      describe("unknown system variable", () => {
        it("should throw an error", async () => {
          // -- Arrange --
          const condition: PrismaMessageRuleCondition = {
            id: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            parentGroupId: 1,
            systemVariable: "unknown",
            comparator: PrismaMessageRuleConditionComparator.EQUALS,
            userVariable: "com.example.app",
          };
          const context: RuleEvaluationContext = {};
          // -- Act --
          expect(() =>
            RuleEvaluator.evaluateCondition(condition, context),
          ).toThrow("Failed to map system variable from prisma: unknown");
        });
      });
    });

    describe("comparator", () => {
      describe("equals", () => {
        describe("context value equals user variable", () => {
          it("should return true", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_ID",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "com.example.app",
            };
            const context: RuleEvaluationContext = {
              clientBundleId: "com.example.app",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("context value does not equal user variable", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_ID",
              comparator: PrismaMessageRuleConditionComparator.EQUALS,
              userVariable: "com.example.app",
            };
            const context: RuleEvaluationContext = {
              clientBundleId: "com.example.app2",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });
      });

      describe("is greater than", () => {
        describe("when context value is greater than user variable", () => {
          it("should return true", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.IS_GREATER_THAN,
              userVariable: "1.0.0",
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "2.0.0",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("when context value is not greater than user variable", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.IS_GREATER_THAN,
              userVariable: "2.0.0",
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "1.0.0",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });

        describe("when context value is undefined", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.IS_GREATER_THAN,
              userVariable: "1.0.0",
            };
            const context: RuleEvaluationContext = {};
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });
      });

      describe("is greater than or equal", () => {
        describe("when context value is greater than or equal to user variable", () => {
          it("should return true", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator:
                PrismaMessageRuleConditionComparator.IS_GREATER_THAN_OR_EQUAL,
              userVariable: "1.0.0",
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "1.0.0",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("when context value is not greater than or equal to user variable", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator:
                PrismaMessageRuleConditionComparator.IS_GREATER_THAN_OR_EQUAL,
              userVariable: "2.0.0",
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "1.0.0",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });

        describe("when context value is undefined", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator:
                PrismaMessageRuleConditionComparator.IS_GREATER_THAN_OR_EQUAL,
              userVariable: "1.0.0",
            };
            const context: RuleEvaluationContext = {};
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });
      });

      describe("is less than", () => {
        describe("when context value is less than user variable", () => {
          it("should return true", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.IS_LESS_THAN,
              userVariable: "2.0.0",
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "1.0.0",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("when context value is not less than user variable", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.IS_LESS_THAN,
              userVariable: "1.0.0",
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "2.0.0",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });

        describe("when context value is undefined", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.IS_LESS_THAN,
              userVariable: "2.0.0",
            };
            const context: RuleEvaluationContext = {};
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });
      });

      describe("is less than or equal", () => {
        describe("when context value is less than or equal to user variable", () => {
          it("should return true", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator:
                PrismaMessageRuleConditionComparator.IS_LESS_THAN_OR_EQUAL,
              userVariable: "1.0.0",
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "1.0.0",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("when context value is not less than or equal to user variable", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator:
                PrismaMessageRuleConditionComparator.IS_LESS_THAN_OR_EQUAL,
              userVariable: "1.0.0",
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "2.0.0",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });

        describe("when context value is undefined", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator:
                PrismaMessageRuleConditionComparator.IS_LESS_THAN_OR_EQUAL,
              userVariable: "1.0.0",
            };
            const context: RuleEvaluationContext = {};
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });
      });

      describe("CONTAINS", () => {
        describe("when context value is undefined", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.CONTAINS,
              userVariable: "1.0",
            };
            const context: RuleEvaluationContext = {};
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });

        describe("when context value contains the user variable", () => {
          it("should return true", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.CONTAINS,
              userVariable: "1.0",
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "1.0.0",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("when context value does not contain the user variable", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.CONTAINS,
              userVariable: "2.0",
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "1.0.0",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });
      });

      describe("DOES_NOT_CONTAIN", () => {
        describe("when context value is not provided", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.DOES_NOT_CONTAIN,
              userVariable: "1.0",
            };
            const context: RuleEvaluationContext = {};
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });

        describe("when context value does not contain the user variable", () => {
          it("should return true", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.DOES_NOT_CONTAIN,
              userVariable: "2.0",
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "1.0.0",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("when context value contains the user variable", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.DOES_NOT_CONTAIN,
              userVariable: "1.0",
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "1.0.0",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });
      });

      describe("IS_EMPTY", () => {
        describe("when no context value is defined", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.IS_EMPTY,
              userVariable: null,
            };
            const context: RuleEvaluationContext = {};
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });

        describe("when context value is empty", () => {
          it("should return true", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.IS_EMPTY,
              userVariable: null,
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("when context value is not empty", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.IS_EMPTY,
              userVariable: null,
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "1.0.0",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });
      });

      describe("IS_NOT_EMPTY", () => {
        describe("when no context value is set", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.IS_NOT_EMPTY,
              userVariable: null,
            };
            const context: RuleEvaluationContext = {};
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });

        describe("when context value is not empty", () => {
          it("should return true", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.IS_NOT_EMPTY,
              userVariable: null,
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "1.0.0",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("when context value is empty", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.IS_NOT_EMPTY,
              userVariable: null,
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });
      });

      describe("IS_NULL", () => {
        describe("when context value is null", () => {
          it("should return true", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.IS_NULL,
              userVariable: null,
            };
            const context: RuleEvaluationContext = {};
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("when context value is not null", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.IS_NULL,
              userVariable: null,
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "1.0.0",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });
      });

      describe("IS_NOT_NULL", () => {
        describe("when context value is not null", () => {
          it("should return true", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.IS_NOT_NULL,
              userVariable: null,
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "1.0.0",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("when context value is null", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.IS_NOT_NULL,
              userVariable: null,
            };
            const context: RuleEvaluationContext = {};
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });
      });

      describe("IS_TRUE", () => {
        describe("when context value is 'true'", () => {
          it("should return true", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.IS_TRUE,
              userVariable: null,
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "true",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("when context value is not 'true'", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.IS_TRUE,
              userVariable: null,
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "false",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });

        describe("when context value is null", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.IS_TRUE,
              userVariable: null,
            };
            const context: RuleEvaluationContext = {};
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });
      });

      describe("IS_FALSE", () => {
        describe("when context value is 'false'", () => {
          it("should return true", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.IS_FALSE,
              userVariable: null,
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "false",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("when context value is not 'false'", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.IS_FALSE,
              userVariable: null,
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "true",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });

        describe("when context value is null", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.IS_FALSE,
              userVariable: null,
            };
            const context: RuleEvaluationContext = {};
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });
      });

      describe("IS_AFTER", () => {
        describe("when context value is after user variable", () => {
          it("should return true", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.IS_AFTER,
              userVariable: "2023-01-01",
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "2024-01-01",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("when context value is not after user variable", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.IS_AFTER,
              userVariable: "2024-01-01",
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "2023-01-01",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });

        describe("when context value is null", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.IS_AFTER,
              userVariable: "2024-01-01",
            };
            const context: RuleEvaluationContext = {};
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });
      });

      describe("IS_BEFORE", () => {
        describe("when context value is before user variable", () => {
          it("should return true", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.IS_BEFORE,
              userVariable: "2024-01-01",
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "2023-01-01",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("when context value is not before user variable", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.IS_BEFORE,
              userVariable: "2023-01-01",
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "2024-01-01",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });

        describe("when context value is null", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.IS_BEFORE,
              userVariable: "2024-01-01",
            };
            const context: RuleEvaluationContext = {};
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });
      });

      describe("IS_AFTER_OR_EQUAL", () => {
        describe("when context value is after user variable", () => {
          it("should return true", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator:
                PrismaMessageRuleConditionComparator.IS_AFTER_OR_EQUAL,
              userVariable: "2023-01-01",
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "2024-01-01",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("when context value equals user variable", () => {
          it("should return true", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator:
                PrismaMessageRuleConditionComparator.IS_AFTER_OR_EQUAL,
              userVariable: "2024-01-01",
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "2024-01-01",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("when context value is before user variable", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator:
                PrismaMessageRuleConditionComparator.IS_AFTER_OR_EQUAL,
              userVariable: "2024-01-01",
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "2023-01-01",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });

        describe("when context value is null", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator:
                PrismaMessageRuleConditionComparator.IS_AFTER_OR_EQUAL,
              userVariable: "2024-01-01",
            };
            const context: RuleEvaluationContext = {};
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });
      });

      describe("IS_BEFORE_OR_EQUAL", () => {
        describe("when context value is before user variable", () => {
          it("should return true", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator:
                PrismaMessageRuleConditionComparator.IS_BEFORE_OR_EQUAL,
              userVariable: "2024-01-01",
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "2023-01-01",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("when context value equals user variable", () => {
          it("should return true", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator:
                PrismaMessageRuleConditionComparator.IS_BEFORE_OR_EQUAL,
              userVariable: "2024-01-01",
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "2024-01-01",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("when context value is after user variable", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator:
                PrismaMessageRuleConditionComparator.IS_BEFORE_OR_EQUAL,
              userVariable: "2023-01-01",
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "2024-01-01",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });

        describe("when context value is null", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator:
                PrismaMessageRuleConditionComparator.IS_BEFORE_OR_EQUAL,
              userVariable: "2024-01-01",
            };
            const context: RuleEvaluationContext = {};
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });
      });

      describe("MATCHES_REGEX", () => {
        describe("when context value matches regex", () => {
          it("should return true", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.MATCHES_REGEX,
              userVariable: "^\\d+\\.\\d+\\.\\d+$",
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "1.0.0",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(true);
          });
        });

        describe("when context value does not match regex", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.MATCHES_REGEX,
              userVariable: "^\\d+\\.\\d+\\.\\d+$",
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "invalid",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });

        describe("when context value is null", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.MATCHES_REGEX,
              userVariable: "^\\d+\\.\\d+\\.\\d+$",
            };
            const context: RuleEvaluationContext = {};
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });

        describe("when regex is invalid", () => {
          it("should return false", async () => {
            // -- Arrange --
            const condition: PrismaMessageRuleCondition = {
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              parentGroupId: 1,
              systemVariable: "BUNDLE_VERSION",
              comparator: PrismaMessageRuleConditionComparator.MATCHES_REGEX,
              userVariable: "[", // Invalid regex - unclosed character class
            };
            const context: RuleEvaluationContext = {
              clientBundleVersion: "1.0.0",
            };
            // -- Act --
            const result = RuleEvaluator.evaluateCondition(condition, context);
            // -- Assert --
            expect(result).toBe(false);
          });
        });

        describe("DOES_NOT_MATCH_REGEX", () => {
          describe("when context value does not match regex", () => {
            it("should return true", async () => {
              // -- Arrange --
              const condition: PrismaMessageRuleCondition = {
                id: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
                parentGroupId: 1,
                systemVariable: "BUNDLE_VERSION",
                comparator:
                  PrismaMessageRuleConditionComparator.DOES_NOT_MATCH_REGEX,
                userVariable: "^\\d+\\.\\d+\\.\\d+$",
              };
              const context: RuleEvaluationContext = {
                clientBundleVersion: "abc",
              };
              // -- Act --
              const result = RuleEvaluator.evaluateCondition(
                condition,
                context,
              );
              // -- Assert --
              expect(result).toBe(true);
            });
          });

          describe("when context value matches regex", () => {
            it("should return false", async () => {
              // -- Arrange --
              const condition: PrismaMessageRuleCondition = {
                id: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
                parentGroupId: 1,
                systemVariable: "BUNDLE_VERSION",
                comparator:
                  PrismaMessageRuleConditionComparator.DOES_NOT_MATCH_REGEX,
                userVariable: "^\\d+\\.\\d+\\.\\d+$",
              };
              const context: RuleEvaluationContext = {
                clientBundleVersion: "1.0.0",
              };
              // -- Act --
              const result = RuleEvaluator.evaluateCondition(
                condition,
                context,
              );
              // -- Assert --
              expect(result).toBe(false);
            });
          });

          describe("when context value is null", () => {
            it("should return false", async () => {
              // -- Arrange --
              const condition: PrismaMessageRuleCondition = {
                id: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
                parentGroupId: 1,
                systemVariable: "BUNDLE_VERSION",
                comparator:
                  PrismaMessageRuleConditionComparator.DOES_NOT_MATCH_REGEX,
                userVariable: "^\\d+\\.\\d+\\.\\d+$",
              };
              const context: RuleEvaluationContext = {};
              // -- Act --
              const result = RuleEvaluator.evaluateCondition(
                condition,
                context,
              );
              // -- Assert --
              expect(result).toBe(false);
            });
          });

          describe("when regex is invalid", () => {
            it("should return false", async () => {
              // -- Arrange --
              const condition: PrismaMessageRuleCondition = {
                id: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
                parentGroupId: 1,
                systemVariable: "BUNDLE_VERSION",
                comparator:
                  PrismaMessageRuleConditionComparator.DOES_NOT_MATCH_REGEX,
                userVariable: "[", // Invalid regex - unclosed character class
              };
              const context: RuleEvaluationContext = {
                clientBundleVersion: "1.0.0",
              };
              // -- Act --
              const result = RuleEvaluator.evaluateCondition(
                condition,
                context,
              );
              // -- Assert --
              expect(result).toBe(false);
            });
          });
        });
      });
    });
  });
});
