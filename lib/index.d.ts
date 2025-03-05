import { Pool, PoolConfig } from "pg";
/**
 * Product subcategory
 * * Contains `category_id` to the category it is derived from
 */
export interface RsSubcategory {
    id: number;
    name: string;
    category_id: number;
}
/**
 * `rannasta-suomeen-sdk` compatible Product that can be inserted into the database
 */
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
/**
 * Result for {@link insert_drinks}
 * * Contains information about the bulk addition (e.g. how many were updates and skipped)
 */
export interface RsResult {
    checked: number;
    inserted: number;
    skipped: number;
    updated: number;
}
/**
 *  * Result for {@link insert_drink}
 * * Contains information about the single addition of {@link RsDrink}
 * - {@link RsDatabaseAction.InsertDrink} : Drink was inserted successfully
 * - {@link RsDatabaseAction.UpdateDrink} : Drink *(with matching checksum)* was updated successfully
 */
export declare enum RsDatabaseAction {
    InsertDrink = 0,
    UpdateDrink = 1
}
/**
 * Alias for {@link Pool} because Node is fucking broken and doesn't like multiple type definitions for the same type
 */
export type RsPool = Pool;
/**
 * Creates new conection specified config
 * @param config Usual {@link PoolConfig}
 * @returns The fucking {@link RsPool}
 */
export declare const connectToDatabase: (config: PoolConfig) => RsPool;
/**
 * Constructs `subcategory_name` -> `[category_id, subcategory_id]` map from database defined subcategories
 * * Useful when only subcategories are resolved *(by name)*, and `category_id` should be automatically matched from database
 * @param pool
 * @returns
 */
export declare const construct_category_map: (pool: Pool) => Promise<{
    [key: string]: [number, number];
}>;
/**
 * Returns {@link RsDrink} with a matching checksum
 * * Useful for checking for changes
 * * See {@link generate_drink_checksum}
 * @param checksum
 * @param pool
 * @returns
 */
export declare const get_drink_by_checksum: (checksum: string, pool: RsPool) => Promise<RsDrink | null>;
/**
 * Inserts or updates {@link RsDrink} into the database
 * - If the drink exists *(and has not changed by `checksum`)*, the drink is updated
 * => {@link null} is returned
 *
 * - If the drink exists *(and has changed by `checksum`)*, the drink is updated
 * => {@link RsDatabaseAction.UpdateDrink} is returned
 *
 * - If the drink doesn't exists , the drink is inserted
 * => {@link RsDatabaseAction.InsertDrink} is returned
 *
 * @param drink
 * @param pool
 * @returns
 */
export declare const insert_drink: (drink: RsDrink, pool: RsPool) => Promise<RsDatabaseAction | null>;
/**
 * Performs {@link insert_drink} for every drink in `drinks`
 * - Returns result of the bulk insertion, *(see {@link RsResult})*
 * @param drinks
 * @param pool
 * @returns
 */
export declare const insert_drinks: (drinks: RsDrink[], pool: RsPool) => Promise<RsResult>;
/**
 * Generates a checksum based on the most important fields of the drink
 * @param drink
 * @returns
 */
export declare const generate_drink_checksum: (drink: RsDrink) => string;
/**
 * General purpose checksum-generator in ShitScript
 * @param str
 * @param seed
 * @returns
 */
export declare const generate_checksum: (str: string, seed?: number) => string;
