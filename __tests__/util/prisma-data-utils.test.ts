import { MessageActionButtonDesign } from "@/models/message-action-button-design";
import { MessageActionType } from "@/models/message-action-type";
import { MessageRuleComparator } from "@/models/message-rule-comparator";
import { MessageRuleGroupOperator } from "@/models/message-rule-group-operator";
import { MessageRuleSystemVariable } from "@/models/message-rule-system-variable";
import { PrismaDataUtils } from "@/util/prisma-data-utils";
import * as PrismaClient from "@prisma/client";

describe("PrismaDataUtils", () => {
  describe("#mapConditionComparatorToPrisma", () => {
    describe("unknown comparator", () => {
      it("should return undefined", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          "unknown" as MessageRuleComparator,
        );
        // -- Assert --
        expect(result).toBeUndefined();
      });
    });

    describe(MessageRuleComparator.EQUALS, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.EQUALS,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.EQUALS,
        );
      });
    });

    describe(MessageRuleComparator.IS_NOT_EQUAL, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.IS_NOT_EQUAL,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.IS_NOT_EQUAL,
        );
      });
    });

    describe(MessageRuleComparator.IS_GREATER_THAN, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.IS_GREATER_THAN,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.IS_GREATER_THAN,
        );
      });
    });

    describe(MessageRuleComparator.IS_GREATER_THAN_OR_EQUAL, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.IS_GREATER_THAN_OR_EQUAL,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.IS_GREATER_THAN_OR_EQUAL,
        );
      });
    });

    describe(MessageRuleComparator.IS_LESS_THAN, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.IS_LESS_THAN,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.IS_LESS_THAN,
        );
      });
    });

    describe(MessageRuleComparator.IS_LESS_THAN_OR_EQUAL, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.IS_LESS_THAN_OR_EQUAL,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.IS_LESS_THAN_OR_EQUAL,
        );
      });
    });

    describe(MessageRuleComparator.CONTAINS, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.CONTAINS,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.CONTAINS,
        );
      });
    });

    describe(MessageRuleComparator.DOES_NOT_CONTAIN, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.DOES_NOT_CONTAIN,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.DOES_NOT_CONTAIN,
        );
      });
    });

    describe(MessageRuleComparator.IS_EMPTY, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.IS_EMPTY,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.IS_EMPTY,
        );
      });
    });

    describe(MessageRuleComparator.IS_NOT_EMPTY, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.IS_NOT_EMPTY,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.IS_NOT_EMPTY,
        );
      });
    });

    describe(MessageRuleComparator.IS_NULL, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.IS_NULL,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.IS_NULL,
        );
      });
    });

    describe(MessageRuleComparator.IS_NOT_NULL, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.IS_NOT_NULL,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.IS_NOT_NULL,
        );
      });
    });

    describe(MessageRuleComparator.IS_TRUE, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.IS_TRUE,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.IS_TRUE,
        );
      });
    });

    describe(MessageRuleComparator.IS_FALSE, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.IS_FALSE,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.IS_FALSE,
        );
      });
    });

    describe(MessageRuleComparator.IS_AFTER, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.IS_AFTER,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.IS_AFTER,
        );
      });
    });

    describe(MessageRuleComparator.IS_BEFORE, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.IS_BEFORE,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.IS_BEFORE,
        );
      });
    });

    describe(MessageRuleComparator.IS_AFTER_OR_EQUAL, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.IS_AFTER_OR_EQUAL,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.IS_AFTER_OR_EQUAL,
        );
      });
    });

    describe(MessageRuleComparator.IS_BEFORE_OR_EQUAL, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.IS_BEFORE_OR_EQUAL,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.IS_BEFORE_OR_EQUAL,
        );
      });
    });
  });

  describe("#mapConditionComparatorToPrisma", () => {
    describe("unknown comparator", () => {
      it("should return undefined", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          "unknown" as MessageRuleComparator,
        );
        // -- Assert --
        expect(result).toBeUndefined();
      });
    });

    describe(MessageRuleComparator.EQUALS, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.EQUALS,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.EQUALS,
        );
      });
    });

    describe(MessageRuleComparator.IS_NOT_EQUAL, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.IS_NOT_EQUAL,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.IS_NOT_EQUAL,
        );
      });
    });

    describe(MessageRuleComparator.IS_GREATER_THAN, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.IS_GREATER_THAN,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.IS_GREATER_THAN,
        );
      });
    });

    describe(MessageRuleComparator.IS_GREATER_THAN_OR_EQUAL, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.IS_GREATER_THAN_OR_EQUAL,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.IS_GREATER_THAN_OR_EQUAL,
        );
      });
    });

    describe(MessageRuleComparator.IS_LESS_THAN, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.IS_LESS_THAN,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.IS_LESS_THAN,
        );
      });
    });

    describe(MessageRuleComparator.IS_LESS_THAN_OR_EQUAL, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.IS_LESS_THAN_OR_EQUAL,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.IS_LESS_THAN_OR_EQUAL,
        );
      });
    });

    describe(MessageRuleComparator.CONTAINS, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.CONTAINS,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.CONTAINS,
        );
      });
    });

    describe(MessageRuleComparator.DOES_NOT_CONTAIN, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.DOES_NOT_CONTAIN,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.DOES_NOT_CONTAIN,
        );
      });
    });

    describe(MessageRuleComparator.IS_EMPTY, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.IS_EMPTY,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.IS_EMPTY,
        );
      });
    });

    describe(MessageRuleComparator.IS_NOT_EMPTY, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.IS_NOT_EMPTY,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.IS_NOT_EMPTY,
        );
      });
    });

    describe(MessageRuleComparator.IS_NULL, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.IS_NULL,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.IS_NULL,
        );
      });
    });

    describe(MessageRuleComparator.IS_NOT_NULL, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.IS_NOT_NULL,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.IS_NOT_NULL,
        );
      });
    });

    describe(MessageRuleComparator.IS_TRUE, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.IS_TRUE,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.IS_TRUE,
        );
      });
    });

    describe(MessageRuleComparator.IS_FALSE, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.IS_FALSE,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.IS_FALSE,
        );
      });
    });

    describe(MessageRuleComparator.IS_AFTER, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.IS_AFTER,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.IS_AFTER,
        );
      });
    });

    describe(MessageRuleComparator.IS_BEFORE, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.IS_BEFORE,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.IS_BEFORE,
        );
      });
    });

    describe(MessageRuleComparator.IS_AFTER_OR_EQUAL, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.IS_AFTER_OR_EQUAL,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.IS_AFTER_OR_EQUAL,
        );
      });
    });

    describe(MessageRuleComparator.IS_BEFORE_OR_EQUAL, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.IS_BEFORE_OR_EQUAL,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.IS_BEFORE_OR_EQUAL,
        );
      });
    });

    describe(MessageRuleComparator.MATCHES_REGEX, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.MATCHES_REGEX,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.MATCHES_REGEX,
        );
      });
    });

    describe(MessageRuleComparator.DOES_NOT_MATCH_REGEX, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorToPrisma(
          MessageRuleComparator.DOES_NOT_MATCH_REGEX,
        );
        // -- Assert --
        expect(result).toEqual(
          PrismaClient.MessageRuleConditionComparator.DOES_NOT_MATCH_REGEX,
        );
      });
    });
  });

  describe("#mapConditionComparatorFromPrisma", () => {
    describe("unknown comparator", () => {
      it("should return undefined", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorFromPrisma(
          "unknown" as PrismaClient.MessageRuleConditionComparator,
        );
        // -- Assert --
        expect(result).toBeUndefined();
      });
    });

    describe(PrismaClient.MessageRuleConditionComparator.EQUALS, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorFromPrisma(
          PrismaClient.MessageRuleConditionComparator.EQUALS,
        );
        // -- Assert --
        expect(result).toEqual(MessageRuleComparator.EQUALS);
      });
    });

    describe(PrismaClient.MessageRuleConditionComparator.IS_NOT_EQUAL, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorFromPrisma(
          PrismaClient.MessageRuleConditionComparator.IS_NOT_EQUAL,
        );
        // -- Assert --
        expect(result).toEqual(MessageRuleComparator.IS_NOT_EQUAL);
      });
    });

    describe(
      PrismaClient.MessageRuleConditionComparator.IS_GREATER_THAN,
      () => {
        it("should be mapped", () => {
          // -- Act --
          const result = PrismaDataUtils.mapConditionComparatorFromPrisma(
            PrismaClient.MessageRuleConditionComparator.IS_GREATER_THAN,
          );
          // -- Assert --
          expect(result).toEqual(MessageRuleComparator.IS_GREATER_THAN);
        });
      },
    );

    describe(
      PrismaClient.MessageRuleConditionComparator.IS_GREATER_THAN_OR_EQUAL,
      () => {
        it("should be mapped", () => {
          // -- Act --
          const result = PrismaDataUtils.mapConditionComparatorFromPrisma(
            PrismaClient.MessageRuleConditionComparator
              .IS_GREATER_THAN_OR_EQUAL,
          );
          // -- Assert --
          expect(result).toEqual(
            MessageRuleComparator.IS_GREATER_THAN_OR_EQUAL,
          );
        });
      },
    );

    describe(PrismaClient.MessageRuleConditionComparator.IS_LESS_THAN, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorFromPrisma(
          PrismaClient.MessageRuleConditionComparator.IS_LESS_THAN,
        );
        // -- Assert --
        expect(result).toEqual(MessageRuleComparator.IS_LESS_THAN);
      });
    });

    describe(
      PrismaClient.MessageRuleConditionComparator.IS_LESS_THAN_OR_EQUAL,
      () => {
        it("should be mapped", () => {
          // -- Act --
          const result = PrismaDataUtils.mapConditionComparatorFromPrisma(
            PrismaClient.MessageRuleConditionComparator.IS_LESS_THAN_OR_EQUAL,
          );
          // -- Assert --
          expect(result).toEqual(MessageRuleComparator.IS_LESS_THAN_OR_EQUAL);
        });
      },
    );

    describe(PrismaClient.MessageRuleConditionComparator.CONTAINS, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorFromPrisma(
          PrismaClient.MessageRuleConditionComparator.CONTAINS,
        );
        // -- Assert --
        expect(result).toEqual(MessageRuleComparator.CONTAINS);
      });
    });

    describe(
      PrismaClient.MessageRuleConditionComparator.DOES_NOT_CONTAIN,
      () => {
        it("should be mapped", () => {
          // -- Act --
          const result = PrismaDataUtils.mapConditionComparatorFromPrisma(
            PrismaClient.MessageRuleConditionComparator.DOES_NOT_CONTAIN,
          );
          // -- Assert --
          expect(result).toEqual(MessageRuleComparator.DOES_NOT_CONTAIN);
        });
      },
    );

    describe(PrismaClient.MessageRuleConditionComparator.IS_EMPTY, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorFromPrisma(
          PrismaClient.MessageRuleConditionComparator.IS_EMPTY,
        );
        // -- Assert --
        expect(result).toEqual(MessageRuleComparator.IS_EMPTY);
      });
    });

    describe(PrismaClient.MessageRuleConditionComparator.IS_NOT_EMPTY, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorFromPrisma(
          PrismaClient.MessageRuleConditionComparator.IS_NOT_EMPTY,
        );
        // -- Assert --
        expect(result).toEqual(MessageRuleComparator.IS_NOT_EMPTY);
      });
    });

    describe(PrismaClient.MessageRuleConditionComparator.IS_NULL, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorFromPrisma(
          PrismaClient.MessageRuleConditionComparator.IS_NULL,
        );
        // -- Assert --
        expect(result).toEqual(MessageRuleComparator.IS_NULL);
      });
    });

    describe(PrismaClient.MessageRuleConditionComparator.IS_NOT_NULL, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorFromPrisma(
          PrismaClient.MessageRuleConditionComparator.IS_NOT_NULL,
        );
        // -- Assert --
        expect(result).toEqual(MessageRuleComparator.IS_NOT_NULL);
      });
    });

    describe(PrismaClient.MessageRuleConditionComparator.IS_TRUE, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorFromPrisma(
          PrismaClient.MessageRuleConditionComparator.IS_TRUE,
        );
        // -- Assert --
        expect(result).toEqual(MessageRuleComparator.IS_TRUE);
      });
    });

    describe(PrismaClient.MessageRuleConditionComparator.IS_FALSE, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorFromPrisma(
          PrismaClient.MessageRuleConditionComparator.IS_FALSE,
        );
        // -- Assert --
        expect(result).toEqual(MessageRuleComparator.IS_FALSE);
      });
    });

    describe(PrismaClient.MessageRuleConditionComparator.IS_AFTER, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorFromPrisma(
          PrismaClient.MessageRuleConditionComparator.IS_AFTER,
        );
        // -- Assert --
        expect(result).toEqual(MessageRuleComparator.IS_AFTER);
      });
    });

    describe(PrismaClient.MessageRuleConditionComparator.IS_BEFORE, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorFromPrisma(
          PrismaClient.MessageRuleConditionComparator.IS_BEFORE,
        );
        // -- Assert --
        expect(result).toEqual(MessageRuleComparator.IS_BEFORE);
      });
    });

    describe(
      PrismaClient.MessageRuleConditionComparator.IS_AFTER_OR_EQUAL,
      () => {
        it("should be mapped", () => {
          // -- Act --
          const result = PrismaDataUtils.mapConditionComparatorFromPrisma(
            PrismaClient.MessageRuleConditionComparator.IS_AFTER_OR_EQUAL,
          );
          // -- Assert --
          expect(result).toEqual(MessageRuleComparator.IS_AFTER_OR_EQUAL);
        });
      },
    );

    describe(
      PrismaClient.MessageRuleConditionComparator.IS_BEFORE_OR_EQUAL,
      () => {
        it("should be mapped", () => {
          // -- Act --
          const result = PrismaDataUtils.mapConditionComparatorFromPrisma(
            PrismaClient.MessageRuleConditionComparator.IS_BEFORE_OR_EQUAL,
          );
          // -- Assert --
          expect(result).toEqual(MessageRuleComparator.IS_BEFORE_OR_EQUAL);
        });
      },
    );

    describe(PrismaClient.MessageRuleConditionComparator.MATCHES_REGEX, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapConditionComparatorFromPrisma(
          PrismaClient.MessageRuleConditionComparator.MATCHES_REGEX,
        );
        // -- Assert --
        expect(result).toEqual(MessageRuleComparator.MATCHES_REGEX);
      });
    });

    describe(
      PrismaClient.MessageRuleConditionComparator.DOES_NOT_MATCH_REGEX,
      () => {
        it("should be mapped", () => {
          // -- Act --
          const result = PrismaDataUtils.mapConditionComparatorFromPrisma(
            PrismaClient.MessageRuleConditionComparator.DOES_NOT_MATCH_REGEX,
          );
          // -- Assert --
          expect(result).toEqual(MessageRuleComparator.DOES_NOT_MATCH_REGEX);
        });
      },
    );
  });

  describe("#mapSystemVariableToPrisma", () => {
    describe(MessageRuleSystemVariable.BUNDLE_ID, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapSystemVariableToPrisma(
          MessageRuleSystemVariable.BUNDLE_ID,
        );
        // -- Assert --
        expect(result).toEqual("BUNDLE_ID");
      });
    });

    describe(MessageRuleSystemVariable.BUNDLE_VERSION, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapSystemVariableToPrisma(
          MessageRuleSystemVariable.BUNDLE_VERSION,
        );
        // -- Assert --
        expect(result).toEqual("BUNDLE_VERSION");
      });
    });

    describe(MessageRuleSystemVariable.LOCALE, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapSystemVariableToPrisma(
          MessageRuleSystemVariable.LOCALE,
        );
        // -- Assert --
        expect(result).toEqual("LOCALE");
      });
    });

    describe(MessageRuleSystemVariable.LOCALE_LANGUAGE_CODE, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapSystemVariableToPrisma(
          MessageRuleSystemVariable.LOCALE_LANGUAGE_CODE,
        );
        // -- Assert --
        expect(result).toEqual("LOCALE_LANGUAGE_CODE");
      });
    });

    describe(MessageRuleSystemVariable.LOCALE_REGION_CODE, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapSystemVariableToPrisma(
          MessageRuleSystemVariable.LOCALE_REGION_CODE,
        );
        // -- Assert --
        expect(result).toEqual("LOCALE_REGION_CODE");
      });
    });

    describe(MessageRuleSystemVariable.PACKAGE_NAME, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapSystemVariableToPrisma(
          MessageRuleSystemVariable.PACKAGE_NAME,
        );
        // -- Assert --
        expect(result).toEqual("PACKAGE_NAME");
      });
    });

    describe(MessageRuleSystemVariable.PLATFORM_NAME, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapSystemVariableToPrisma(
          MessageRuleSystemVariable.PLATFORM_NAME,
        );
        // -- Assert --
        expect(result).toEqual("PLATFORM_NAME");
      });
    });

    describe(MessageRuleSystemVariable.PLATFORM_VERSION, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapSystemVariableToPrisma(
          MessageRuleSystemVariable.PLATFORM_VERSION,
        );
        // -- Assert --
        expect(result).toEqual("PLATFORM_VERSION");
      });
    });

    describe(MessageRuleSystemVariable.RELEASE_VERSION, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapSystemVariableToPrisma(
          MessageRuleSystemVariable.RELEASE_VERSION,
        );
        // -- Assert --
        expect(result).toEqual("RELEASE_VERSION");
      });
    });

    describe(MessageRuleSystemVariable.VERSION_CODE, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapSystemVariableToPrisma(
          MessageRuleSystemVariable.VERSION_CODE,
        );
        // -- Assert --
        expect(result).toEqual("VERSION_CODE");
      });
    });

    describe(MessageRuleSystemVariable.VERSION_NAME, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapSystemVariableToPrisma(
          MessageRuleSystemVariable.VERSION_NAME,
        );
        // -- Assert --
        expect(result).toEqual("VERSION_NAME");
      });
    });
  });

  describe("#mapSystemVariableFromPrisma", () => {
    describe("unknown system variable", () => {
      it("should return undefined", () => {
        // -- Act --
        const result = PrismaDataUtils.mapSystemVariableFromPrisma(
          "unknown" as string,
        );
        // -- Assert --
        expect(result).toBeUndefined();
      });
    });

    describe("BUNDLE_ID", () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapSystemVariableFromPrisma("BUNDLE_ID");
        // -- Assert --
        expect(result).toEqual(MessageRuleSystemVariable.BUNDLE_ID);
      });
    });

    describe("BUNDLE_VERSION", () => {
      it("should be mapped", () => {
        // -- Act --
        const result =
          PrismaDataUtils.mapSystemVariableFromPrisma("BUNDLE_VERSION");
        // -- Assert --
        expect(result).toEqual(MessageRuleSystemVariable.BUNDLE_VERSION);
      });
    });

    describe("LOCALE", () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapSystemVariableFromPrisma("LOCALE");
        // -- Assert --
        expect(result).toEqual(MessageRuleSystemVariable.LOCALE);
      });
    });

    describe("LOCALE_LANGUAGE_CODE", () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapSystemVariableFromPrisma(
          "LOCALE_LANGUAGE_CODE",
        );
        // -- Assert --
        expect(result).toEqual(MessageRuleSystemVariable.LOCALE_LANGUAGE_CODE);
      });
    });

    describe("LOCALE_REGION_CODE", () => {
      it("should be mapped", () => {
        // -- Act --
        const result =
          PrismaDataUtils.mapSystemVariableFromPrisma("LOCALE_REGION_CODE");
        // -- Assert --
        expect(result).toEqual(MessageRuleSystemVariable.LOCALE_REGION_CODE);
      });
    });

    describe("PACKAGE_NAME", () => {
      it("should be mapped", () => {
        // -- Act --
        const result =
          PrismaDataUtils.mapSystemVariableFromPrisma("PACKAGE_NAME");
        // -- Assert --
        expect(result).toEqual(MessageRuleSystemVariable.PACKAGE_NAME);
      });
    });

    describe("PLATFORM_NAME", () => {
      it("should be mapped", () => {
        // -- Act --
        const result =
          PrismaDataUtils.mapSystemVariableFromPrisma("PLATFORM_NAME");
        // -- Assert --
        expect(result).toEqual(MessageRuleSystemVariable.PLATFORM_NAME);
      });
    });

    describe("PLATFORM_VERSION", () => {
      it("should be mapped", () => {
        // -- Act --
        const result =
          PrismaDataUtils.mapSystemVariableFromPrisma("PLATFORM_VERSION");
        // -- Assert --
        expect(result).toEqual(MessageRuleSystemVariable.PLATFORM_VERSION);
      });
    });

    describe("RELEASE_VERSION", () => {
      it("should be mapped", () => {
        // -- Act --
        const result =
          PrismaDataUtils.mapSystemVariableFromPrisma("RELEASE_VERSION");
        // -- Assert --
        expect(result).toEqual(MessageRuleSystemVariable.RELEASE_VERSION);
      });
    });

    describe("VERSION_CODE", () => {
      it("should be mapped", () => {
        // -- Act --
        const result =
          PrismaDataUtils.mapSystemVariableFromPrisma("VERSION_CODE");
        // -- Assert --
        expect(result).toEqual(MessageRuleSystemVariable.VERSION_CODE);
      });
    });

    describe("VERSION_NAME", () => {
      it("should be mapped", () => {
        // -- Act --
        const result =
          PrismaDataUtils.mapSystemVariableFromPrisma("VERSION_NAME");
        // -- Assert --
        expect(result).toEqual(MessageRuleSystemVariable.VERSION_NAME);
      });
    });
  });

  describe("#mapGroupOperatorFromPrisma", () => {
    describe("unknown group operator", () => {
      it("should return undefined", () => {
        // -- Act --
        const result = PrismaDataUtils.mapGroupOperatorFromPrisma(
          "unknown" as PrismaClient.MessageRuleGroupOperator,
        );
        // -- Assert --
        expect(result).toBeUndefined();
      });
    });

    describe(PrismaClient.MessageRuleGroupOperator.AND, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapGroupOperatorFromPrisma("AND");
        // -- Assert --
        expect(result).toEqual(MessageRuleGroupOperator.AND);
      });
    });

    describe(PrismaClient.MessageRuleGroupOperator.OR, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapGroupOperatorFromPrisma("OR");
        // -- Assert --
        expect(result).toEqual(MessageRuleGroupOperator.OR);
      });
    });
  });

  describe("#mapGroupOperatorToPrisma", () => {
    describe(MessageRuleGroupOperator.AND, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapGroupOperatorToPrisma(
          MessageRuleGroupOperator.AND,
        );
        // -- Assert --
        expect(result).toEqual(PrismaClient.MessageRuleGroupOperator.AND);
      });
    });

    describe(MessageRuleGroupOperator.OR, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapGroupOperatorToPrisma(
          MessageRuleGroupOperator.OR,
        );
        // -- Assert --
        expect(result).toEqual(PrismaClient.MessageRuleGroupOperator.OR);
      });
    });
  });

  describe("#mapButtonDesignFromPrisma", () => {
    describe("unknown button design", () => {
      it("should return undefined", () => {
        // -- Act --
        const result = PrismaDataUtils.mapButtonDesignFromPrisma(
          "unknown" as PrismaClient.ButtonDesign,
        );
        // -- Assert --
        expect(result).toBeUndefined();
      });
    });

    describe(PrismaClient.ButtonDesign.FILLED, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapButtonDesignFromPrisma("FILLED");
        // -- Assert --
        expect(result).toEqual(MessageActionButtonDesign.FILLED);
      });
    });

    describe(PrismaClient.ButtonDesign.TEXT, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapButtonDesignFromPrisma("TEXT");
        // -- Assert --
        expect(result).toEqual(MessageActionButtonDesign.OUTLINE);
      });
    });
  });

  describe("#mapButtonDesignToPrisma", () => {
    describe(MessageActionButtonDesign.FILLED, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapButtonDesignToPrisma(
          MessageActionButtonDesign.FILLED,
        );
        // -- Assert --
        expect(result).toEqual(PrismaClient.ButtonDesign.FILLED);
      });
    });

    describe(MessageActionButtonDesign.OUTLINE, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapButtonDesignToPrisma(
          MessageActionButtonDesign.OUTLINE,
        );
        // -- Assert --
        expect(result).toEqual(PrismaClient.ButtonDesign.TEXT);
      });
    });
  });

  describe("#mapActionTypeFromPrisma", () => {
    describe("unknown action type", () => {
      it("should return undefined", () => {
        // -- Act --
        const result = PrismaDataUtils.mapActionTypeFromPrisma(
          "unknown" as PrismaClient.ActionType,
        );
        // -- Assert --
        expect(result).toBeUndefined();
      });
    });

    describe(PrismaClient.ActionType.DISMISS, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapActionTypeFromPrisma(
          PrismaClient.ActionType.DISMISS,
        );
        // -- Assert --
        expect(result).toEqual(MessageActionType.DISMISS);
      });
    });
  });

  describe("#mapActionTypeToPrisma", () => {
    describe(MessageActionType.DISMISS, () => {
      it("should be mapped", () => {
        // -- Act --
        const result = PrismaDataUtils.mapActionTypeToPrisma(
          MessageActionType.DISMISS,
        );
        // -- Assert --
        expect(result).toEqual(PrismaClient.ActionType.DISMISS);
      });
    });
  });
});
