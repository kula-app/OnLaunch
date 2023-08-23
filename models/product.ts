export interface Product {
    id: string;
    description: string;
    name: string;
    priceId: string;
    priceAmount: number;
    // some products contain the amount of requests within the metadata
    // with key "requests"
    requests?: number;
    // dividedBy is used for stripe's transform_quantity which is 
    // necessary for package pricing (e.g. "pay 10 cents per 1.000 requests"
    // in this example the 1.000 would be the dividedBy value)
    divideBy?: number;
    unlimitedOption?: Product;
}