export interface Product {
    id: string;
    description: string;
    name: string;
    nameTag: string;
    priceId: string;
    priceAmount: number;
    // some products contain the amount of requests within the metadata
    // with key "requests"
    requests?: number;
    // the unlimited option price / product has a reference to the main
    // product in the metadata via the key "mainProductId"
    unlimitedOption?: Product;
}
