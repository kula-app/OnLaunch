export interface Product {
    id: string;
    description: string;
    name: string;
    priceId: string | null;
    price: number | null;
}