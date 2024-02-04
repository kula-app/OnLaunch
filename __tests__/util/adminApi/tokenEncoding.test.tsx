import {
  encodeAppToken,
  encodeOrgToken,
} from "../../../util/adminApi/tokenEncoding";

const delimiter = "_";
const appPrefix = "app";
const orgPrefix = "org";
const testToken = "abcdefgh1234567890";

describe("Test token encoding util", () => {
  it("encodes app token successfully", () => {
    const expectedToken = `${appPrefix}${delimiter}${testToken}`;

    const encodedToken = encodeAppToken(testToken);

    expect(encodedToken).toBe(expectedToken);
  });

  it("encodes app token successfully", () => {
    const expectedToken = `${orgPrefix}${delimiter}${testToken}`;

    const encodedToken = encodeOrgToken(testToken);

    expect(encodedToken).toBe(expectedToken);
  });
});
