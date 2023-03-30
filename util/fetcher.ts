const fetcherWithToken = (...args: any) =>
    fetch(args).then((res) => res.json());

export default fetcherWithToken;