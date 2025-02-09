import "@testing-library/jest-dom";

import { beforeEach, jest } from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset } from "jest-mock-extended";

const prismaMock = mockDeep<PrismaClient>();

jest.mock("./src/services/db", () => ({
  __esModule: true,
  default: prismaMock,
}));

export { prismaMock };

beforeEach(() => {
  mockReset(prismaMock);
});
