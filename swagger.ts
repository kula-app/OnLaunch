const swaggerAutogen = require("swagger-autogen")();
const dotenv = require("dotenv");
dotenv.config();

const doc = {
  info: {
    title: "API Documentation",
    description: "Description of your API",
  },
  host: process.env.HOST_URL || "localhost:3000",
  schemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./pages/api/**/*.ts"];

const generateSwaggerDocs = async () => {
  try {
    await swaggerAutogen(outputFile, endpointsFiles, doc);
    console.log("Swagger documentation has been generated successfully.");
  } catch (error) {
    console.error("Error generating Swagger documentation:", error);
  }
};

generateSwaggerDocs();
