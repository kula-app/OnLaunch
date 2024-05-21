import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import swaggerDocument from "../swagger-output.json";

const ApiDoc = () => {
  return <SwaggerUI spec={swaggerDocument} />;
};

export default ApiDoc;
