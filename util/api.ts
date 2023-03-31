export async function returnDataOrThrowError(response: Response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "an error occurred");
  }

  return data;
}
