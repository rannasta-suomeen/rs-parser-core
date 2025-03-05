import { Pool, PoolConfig } from "pg";
export interface RsSubcategory {
    id: number;
    name: string;
    category_id: number;
}
export interface RsDrink {
    name: string;
    href: string;
    price: string | number;
    img: string;
    volume: string | number;
    category: number;
    abv?: number;
    subcategory?: number;
    retailer?: string;
    checksum?: string;
}
export interface RsResult {
    checked: number;
    inserted: number;
    skipped: number;
    updated: number;
}
export declare enum RsDatabaseAction {
    InsertDrink = 0,
    UpdateDrink = 1
}
export type RsPool = Pool;
export declare const connectToDatabase: (config: PoolConfig) => RsPool;
export declare const construct_category_map: (pool: Pool) => Promise<{
    [key: string]: [number, number];
}>;
export declare const get_drink_by_checksum: (checksum: string, pool: RsPool) => Promise<RsDrink | null>;
export declare const insert_drink: (drink: RsDrink, pool: RsPool) => Promise<RsDatabaseAction>;
export declare const insert_drinks: (drinks: RsDrink[], pool: RsPool) => Promise<RsResult>;
export declare const generate_drink_checksum: (drink: RsDrink) => string;
export declare const generate_checksum: (str: string, seed?: number) => string;
