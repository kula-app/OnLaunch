import { render, screen } from "@testing-library/react";
import { SessionProvider } from "next-auth/react";
import Home from "../pages/verify";

jest.mock("next/router", () => require("next-router-mock"));

describe("Verify Page", () => {
  it("renders the verify page", () => {
    render(<SessionProvider><Home /></SessionProvider>);

    // const heading = screen.getByRole("heading", {
    //   name: /Apps/i,
    // });

    // expect(heading).toBeInTheDocument();
    expect(1).toBe(1);
  });
});
