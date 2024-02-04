import { decodeToken } from "../../../util/adminApi/tokenDecoding";

const delimiter = "_";
const appPrefix = "app";
const orgPrefix = "org";
const testToken = "abcdefgh1234567890";

describe("Test token decoding util", () => {
  it("decodes app token successfully", () => {
    const encodedToken = `${appPrefix}${delimiter}${testToken}`;

    const decodedToken = decodeToken(encodedToken);

    expect(decodedToken?.token).toBe(testToken);
    expect(decodedToken?.type).toBe(appPrefix);
  });

  it("decodes org token successfully", () => {
    const encodedToken = `${orgPrefix}${delimiter}${testToken}`;

    const decodedToken = decodeToken(encodedToken);

    expect(decodedToken?.token).toBe(testToken);
    expect(decodedToken?.type).toBe(orgPrefix);
  });

  it("returns null when the token contains no delimiter", () => {
    const encodedToken = `${orgPrefix}${testToken}`;

    const decodedToken = decodeToken(encodedToken);

    expect(decodedToken).toBeNull();
  });

  it("returns null when the token contains no valid type prefix", () => {
    const fakePrefix = "fakePrefix";
    const encodedToken = `${fakePrefix}${delimiter}${testToken}`;

    const decodedToken = decodeToken(encodedToken);

    expect(decodedToken).toBeNull();
  });

  it("returns null when the token contains no type prefix", () => {
    const encodedToken = `${delimiter}${testToken}`;

    const decodedToken = decodeToken(encodedToken);

    expect(decodedToken).toBeNull();
  });

  it("returns null when the token contains no actual token", () => {
    const encodedToken = `${orgPrefix}${delimiter}`;

    const decodedToken = decodeToken(encodedToken);

    expect(decodedToken).toBeNull();
  });
});
