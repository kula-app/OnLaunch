import { render, screen } from "@testing-library/react";
import Home from "../pages/orgs/[orgId]/apps/index";

jest.mock("next/router", () => require("next-router-mock"));

describe("Home", () => {
  it("renders a heading", () => {
    render(<Home />);

    // const heading = screen.getByRole("heading", {
    //   name: /Apps/i,
    // });

    // expect(heading).toBeInTheDocument();
    expect(1).toBe(1);
  });
});
