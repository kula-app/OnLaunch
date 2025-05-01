"use client";
import { Button, Link } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa6";

export const GitHubStargazersButton: React.FC = () => {
  const [stargazers, setStargazers] = useState(0);

  const formattedStarCount = (count: number): string => {
    if (count < 1000) {
      return count.toString();
    }

    const rounded = Math.ceil(count / 100) * 100;
    return `${(rounded / 1000).toFixed(1)}k`;
  };

  useEffect(() => {
    fetch("https://api.github.com/repos/kula-app/OnLaunch")
      .then((res) => res.json())
      .then((data) => setStargazers(data.stargazers_count));
  }, []);

  return (
    <Link href={"https://github.com/kula-app/OnLaunch"} target={"_blank"}>
      <Button
        leftIcon={<FaGithub />}
        colorScheme="gray"
        size={"sm"}
        variant="solid"
      >
        {formattedStarCount(stargazers)}
      </Button>
    </Link>
  );
};
