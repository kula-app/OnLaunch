import "@fontsource-variable/plus-jakarta-sans";

export const styles = {
  styles: {
    global: {
      html: {
        fontFamily: `'Plus Jakarta Sans Variable', sans-serif`,
        bg: "rgba(4,9,40,1)",
      },
      body: {
        bg: "linear-gradient(160deg, rgba(59,65,152,1) 15%, rgba(21,29,91,1) 65%, rgba(4,9,40,1) 85%)",
        bgSize: "cover",
        bgPosition: "center center",
      },
      "*::placeholder": {
        color: "gray.400",
      },
    },
  },
};
