import { draftFormSchema } from "@/components/message-editor/_models/draft/draft-form-schema";
import { MessageActionButtonDesign } from "@/models/message-action-button-design";
import { MessageActionLinkTarget } from "@/models/message-action-link-target";
import { MessageActionType } from "@/models/message-action-type";

describe("draftFormSchema", () => {
  const baseValues = {
    title: "Title",
    body: "Body",
    isBlocking: false,
  };

  describe("DISMISS action with empty link object", () => {
    it("should validate", async () => {
      // -- Arrange --
      const values = {
        ...baseValues,
        actions: [
          {
            id: 1,
            actionType: MessageActionType.DISMISS,
            buttonDesign: MessageActionButtonDesign.FILLED,
            title: "Dismiss",
            link: {},
          },
        ],
      };
      // -- Act / Assert --
      await expect(draftFormSchema.validate(values)).resolves.toBeDefined();
    });
  });

  describe("DISMISS action with link object containing partial data", () => {
    it("should validate even when only link.link is present", async () => {
      // -- Arrange --
      const values = {
        ...baseValues,
        actions: [
          {
            id: 1,
            actionType: MessageActionType.DISMISS,
            buttonDesign: MessageActionButtonDesign.FILLED,
            title: "Dismiss",
            link: { link: "https://onlaunch.app" },
          },
        ],
      };
      // -- Act / Assert --
      await expect(draftFormSchema.validate(values)).resolves.toBeDefined();
    });
  });

  describe("OPEN_LINK action with valid link and target", () => {
    it("should validate", async () => {
      // -- Arrange --
      const values = {
        ...baseValues,
        actions: [
          {
            id: 1,
            actionType: MessageActionType.OPEN_LINK,
            buttonDesign: MessageActionButtonDesign.FILLED,
            title: "Open Link",
            link: {
              link: "https://onlaunch.app",
              target: MessageActionLinkTarget.IN_APP_BROWSER,
            },
          },
        ],
      };
      // -- Act / Assert --
      await expect(draftFormSchema.validate(values)).resolves.toBeDefined();
    });
  });

  describe("OPEN_LINK action with empty link object", () => {
    it("should fail validation", async () => {
      // -- Arrange --
      const values = {
        ...baseValues,
        actions: [
          {
            id: 1,
            actionType: MessageActionType.OPEN_LINK,
            buttonDesign: MessageActionButtonDesign.FILLED,
            title: "Open Link",
            link: {},
          },
        ],
      };
      // -- Act / Assert --
      await expect(draftFormSchema.validate(values)).rejects.toThrow();
    });
  });

  describe("OPEN_LINK action missing target", () => {
    it("should fail validation", async () => {
      // -- Arrange --
      const values = {
        ...baseValues,
        actions: [
          {
            id: 1,
            actionType: MessageActionType.OPEN_LINK,
            buttonDesign: MessageActionButtonDesign.FILLED,
            title: "Open Link",
            link: { link: "https://onlaunch.app" },
          },
        ],
      };
      // -- Act / Assert --
      await expect(draftFormSchema.validate(values)).rejects.toThrow(
        /Target is required/,
      );
    });
  });

  describe("OPEN_LINK action missing link", () => {
    it("should fail validation", async () => {
      // -- Arrange --
      const values = {
        ...baseValues,
        actions: [
          {
            id: 1,
            actionType: MessageActionType.OPEN_LINK,
            buttonDesign: MessageActionButtonDesign.FILLED,
            title: "Open Link",
            link: { target: MessageActionLinkTarget.SYSTEM_BROWSER },
          },
        ],
      };
      // -- Act / Assert --
      await expect(draftFormSchema.validate(values)).rejects.toThrow(
        /Link is required/,
      );
    });
  });

  describe("OPEN_LINK action with invalid URL", () => {
    it("should fail validation", async () => {
      // -- Arrange --
      const values = {
        ...baseValues,
        actions: [
          {
            id: 1,
            actionType: MessageActionType.OPEN_LINK,
            buttonDesign: MessageActionButtonDesign.FILLED,
            title: "Open Link",
            link: {
              link: "not-a-url",
              target: MessageActionLinkTarget.IN_APP_BROWSER,
            },
          },
        ],
      };
      // -- Act / Assert --
      await expect(draftFormSchema.validate(values)).rejects.toThrow(
        /must be a valid URL/,
      );
    });
  });

  describe("OPEN_LINK action with invalid target enum", () => {
    it("should fail validation", async () => {
      // -- Arrange --
      const values = {
        ...baseValues,
        actions: [
          {
            id: 1,
            actionType: MessageActionType.OPEN_LINK,
            buttonDesign: MessageActionButtonDesign.FILLED,
            title: "Open Link",
            link: {
              link: "https://onlaunch.app",
              target: "INVALID_TARGET",
            },
          },
        ],
      };
      // -- Act / Assert --
      await expect(draftFormSchema.validate(values)).rejects.toThrow();
    });
  });
});
