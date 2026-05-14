import "reflect-metadata";

import { CreateMessageDto } from "@/models/dtos/request/createMessageDto";
import { ActionType, ButtonDesign, MessageActionLinkTarget } from "@prisma/client";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

const baseValid = {
  blocking: false,
  title: "Title",
  body: "Body",
  startDate: "2025-01-01T00:00:00.000Z",
  endDate: "2025-01-02T00:00:00.000Z",
};

describe("CreateMessageDto", () => {
  describe("DISMISS action without link or linkTarget", () => {
    it("should pass validation", async () => {
      // -- Arrange --
      const dto = plainToInstance(CreateMessageDto, {
        ...baseValid,
        actions: [
          {
            title: "Dismiss",
            actionType: ActionType.DISMISS,
            buttonDesign: ButtonDesign.FILLED,
          },
        ],
      });
      // -- Act --
      const errors = await validate(dto);
      // -- Assert --
      expect(errors).toHaveLength(0);
    });
  });

  describe("DISMISS action with arbitrary link string", () => {
    it("should pass validation (validators skipped for non-OPEN_LINK)", async () => {
      // -- Arrange --
      const dto = plainToInstance(CreateMessageDto, {
        ...baseValid,
        actions: [
          {
            title: "Dismiss",
            actionType: ActionType.DISMISS,
            buttonDesign: ButtonDesign.FILLED,
            link: "ignored",
          },
        ],
      });
      // -- Act --
      const errors = await validate(dto);
      // -- Assert --
      expect(errors).toHaveLength(0);
    });
  });

  describe("OPEN_LINK action with valid link and linkTarget", () => {
    it("should pass validation", async () => {
      // -- Arrange --
      const dto = plainToInstance(CreateMessageDto, {
        ...baseValid,
        actions: [
          {
            title: "Open",
            actionType: ActionType.OPEN_LINK,
            buttonDesign: ButtonDesign.FILLED,
            link: "https://onlaunch.app",
            linkTarget: MessageActionLinkTarget.IN_APP_BROWSER,
          },
        ],
      });
      // -- Act --
      const errors = await validate(dto);
      // -- Assert --
      expect(errors).toHaveLength(0);
    });
  });

  describe("OPEN_LINK action missing link", () => {
    it("should fail validation", async () => {
      // -- Arrange --
      const dto = plainToInstance(CreateMessageDto, {
        ...baseValid,
        actions: [
          {
            title: "Open",
            actionType: ActionType.OPEN_LINK,
            buttonDesign: ButtonDesign.FILLED,
            linkTarget: MessageActionLinkTarget.IN_APP_BROWSER,
          },
        ],
      });
      // -- Act --
      const errors = await validate(dto);
      // -- Assert --
      const flatten = JSON.stringify(errors);
      expect(flatten).toMatch(/link is required when actionType is OPEN_LINK/);
    });
  });

  describe("OPEN_LINK action missing linkTarget", () => {
    it("should fail validation", async () => {
      // -- Arrange --
      const dto = plainToInstance(CreateMessageDto, {
        ...baseValid,
        actions: [
          {
            title: "Open",
            actionType: ActionType.OPEN_LINK,
            buttonDesign: ButtonDesign.FILLED,
            link: "https://onlaunch.app",
          },
        ],
      });
      // -- Act --
      const errors = await validate(dto);
      // -- Assert --
      const flatten = JSON.stringify(errors);
      expect(flatten).toMatch(
        /linkTarget is required when actionType is OPEN_LINK/,
      );
    });
  });

  describe("OPEN_LINK action with invalid linkTarget enum", () => {
    it("should fail validation", async () => {
      // -- Arrange --
      const dto = plainToInstance(CreateMessageDto, {
        ...baseValid,
        actions: [
          {
            title: "Open",
            actionType: ActionType.OPEN_LINK,
            buttonDesign: ButtonDesign.FILLED,
            link: "https://onlaunch.app",
            linkTarget: "BOGUS",
          },
        ],
      });
      // -- Act --
      const errors = await validate(dto);
      // -- Assert --
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe("OPEN_LINK action with link exceeding max length", () => {
    it("should fail validation", async () => {
      // -- Arrange --
      const tooLong = "https://onlaunch.app/" + "a".repeat(200);
      const dto = plainToInstance(CreateMessageDto, {
        ...baseValid,
        actions: [
          {
            title: "Open",
            actionType: ActionType.OPEN_LINK,
            buttonDesign: ButtonDesign.FILLED,
            link: tooLong,
            linkTarget: MessageActionLinkTarget.SYSTEM_BROWSER,
          },
        ],
      });
      // -- Act --
      const errors = await validate(dto);
      // -- Assert --
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
