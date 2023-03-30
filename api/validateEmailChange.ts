import ApiRoutes from "../routes/apiRoutes";

const validateEmailChange = async (
  token: string, 
) => {
    const response = await fetch(ApiRoutes.EMAIL_CHANGE, {
        method: "PUT",
        body: JSON.stringify({ token: token }),
        headers: {
            "Content-Type": "application/json",
        },
    });

  const data = await response.json();

  if (!response.ok) {
      throw new Error (data.message || 'an error occurred');
  }

  return data;
}

export default validateEmailChange;