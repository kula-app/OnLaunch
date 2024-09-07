import { AdminTokenType } from "@/models/adminTokenType";

const delimiter = "_";

export function encodeOrgToken(token: string): string {
  return encodeToken(token, AdminTokenType.Org);
}

export function encodeAppToken(token: string): string {
  return encodeToken(token, AdminTokenType.App);
}

function encodeToken(token: string, type: AdminTokenType): string {
  return `${type}${delimiter}${token}`;
}
