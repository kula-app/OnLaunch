import { StatusCodes } from "http-status-codes";
import prisma from "../../../lib/services/db";
import { authenticate } from "../../../util/adminApi/auth";
import { decodeToken } from "../../../util/adminApi/tokenDecoding";

jest.mock("../../../lib/services/db", () => ({
  organisationAdminToken: {
    findFirst: jest.fn(),
  },
  appAdminToken: {
    findFirst: jest.fn(),
  },
}));

jest.mock("../../../util/logger", () => ({
  Logger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn(),
  })),
}));

jest.mock("../../../util/adminApi/tokenDecoding", () => ({
  decodeToken: jest.fn(),
}));

const delimiter = "_";
const appPrefix = "app";
const orgPrefix = "org";
const testToken = "abcdefgh1234567890";

describe("Test auth for admin api tokens", () => {
  it("authenticates app admin api token successfully", async () => {
    // -- Arrange --
    const req = { headers: { authorization: "Bearer app_abcdefgh1234567890" } };

    (decodeToken as jest.Mock).mockReturnValue({
      token: testToken,
      type: appPrefix,
    });
    (prisma.appAdminToken.findFirst as jest.Mock).mockResolvedValue({
      appId: 123,
      token: testToken,
      isDeleted: false,
    });

    // -- Act  --
    const result = await authenticate(req as any, "app");

    // -- Assert  --
    expect(result).toEqual({
      success: true,
      authToken: testToken,
      id: 123,
      statusCode: StatusCodes.OK,
    });
  });

  it("authenticates org admin api token successfully", async () => {
    // -- Arrange --
    const req = { headers: { authorization: "Bearer org_abcdefgh1234567890" } };

    (decodeToken as jest.Mock).mockReturnValue({
      token: testToken,
      type: orgPrefix,
    });
    (prisma.organisationAdminToken.findFirst as jest.Mock).mockResolvedValue({
      orgId: 123,
      token: testToken,
      isDeleted: false,
    });

    // -- Act  --
    const result = await authenticate(req as any, "org");

    // -- Assert  --
    expect(result).toEqual({
      success: true,
      authToken: testToken,
      id: 123,
      statusCode: StatusCodes.OK,
    });
  });

  it("authenticates org admin api token without Bearer prefix successfully", async () => {
    // -- Arrange --
    const req = { headers: { authorization: "org_abcdefgh1234567890" } };

    (decodeToken as jest.Mock).mockReturnValue({
      token: testToken,
      type: orgPrefix,
    });
    (prisma.organisationAdminToken.findFirst as jest.Mock).mockResolvedValue({
      orgId: 123,
      token: testToken,
      isDeleted: false,
    });

    // -- Act  --
    const result = await authenticate(req as any, "org");

    // -- Assert  --
    expect(result).toEqual({
      success: true,
      authToken: testToken,
      id: 123,
      statusCode: StatusCodes.OK,
    });
  });

  it("should return 401 if authorization token is missing", async () => {
    // -- Arrange --
    // Mocked request without authorization header
    const req = { headers: {} };

    // -- Act  --
    const result = await authenticate(req as any, "org");

    // -- Assert  --
    expect(result).toEqual({
      success: false,
      statusCode: StatusCodes.UNAUTHORIZED,
      errorMessage: "Authorization token is required",
    });
  });

  it("should return 403 for invalid token", async () => {
    // -- Arrange --
    const req = { headers: { authorization: "Bearer invalidToken" } };

    (decodeToken as jest.Mock).mockReturnValue(null);

    // -- Act  --
    const result = await authenticate(req as any, "org");

    // -- Assert  --
    expect(result).toEqual({
      success: false,
      statusCode: StatusCodes.FORBIDDEN,
      errorMessage: "Authorization token is invalid",
    });
  });

  it("should return 403 for token used for wrong route", async () => {
    // -- Arrange --
    const req = { headers: { authorization: "Bearer app_abcdefgh1234567890" } };

    (decodeToken as jest.Mock).mockReturnValue({
      token: testToken,
      type: appPrefix, // Token type is for app
    });

    // -- Act  --
    // Wrong route type (org)
    const result = await authenticate(req as any, "org");

    // -- Assert  --
    expect(result).toEqual({
      success: false,
      statusCode: StatusCodes.FORBIDDEN,
      errorMessage: "Access denied. Wrong route.",
    });
  });

  it("should return 403 if no app admin token found (expired / is deleted / never existed)", async () => {
    // -- Arrange --
    const req = { headers: { authorization: "Bearer app_abcdefgh1234567890" } };

    (decodeToken as jest.Mock).mockReturnValue({
      token: testToken,
      type: appPrefix,
    });
    (prisma.appAdminToken.findFirst as jest.Mock).mockResolvedValue(null);

    // -- Act  --
    const result = await authenticate(req as any, "app");

    // -- Assert  --
    expect(result).toEqual({
      success: false,
      statusCode: StatusCodes.FORBIDDEN,
      errorMessage: "Authorization token is invalid",
    });
  });
});
