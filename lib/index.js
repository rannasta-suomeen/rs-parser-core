"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate_checksum = exports.generate_drink_checksum = exports.insert_drinks = exports.insert_drink = exports.get_drink_by_checksum = exports.construct_category_map = exports.connectToDatabase = exports.RsDatabaseAction = void 0;
const pg_1 = require("pg");
var RsDatabaseAction;
(function (RsDatabaseAction) {
    RsDatabaseAction[RsDatabaseAction["InsertDrink"] = 0] = "InsertDrink";
    RsDatabaseAction[RsDatabaseAction["UpdateDrink"] = 1] = "UpdateDrink";
})(RsDatabaseAction = exports.RsDatabaseAction || (exports.RsDatabaseAction = {}));
const connectToDatabase = (config) => {
    return new pg_1.Pool(config);
};
exports.connectToDatabase = connectToDatabase;
const construct_category_map = async (pool) => {
    return new Promise((resolve, reject) => {
        const data = {};
        pool.query("SELECT * FROM subcategories")
            .then(async (result) => {
            const list = result.rows;
            list.forEach(category => {
                data[category.name] = [category.id, category.category_id];
            });
            return resolve(data);
        })
            .catch(err => {
            return reject(err);
        });
    });
};
exports.construct_category_map = construct_category_map;
const get_drink_by_checksum = async (checksum, pool) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM products WHERE checksum = $1", [checksum])
            .then(async (result) => {
            return resolve(result.rows[0] ?? null);
        })
            .catch(err => {
            return reject(err);
        });
    });
};
exports.get_drink_by_checksum = get_drink_by_checksum;
const insert_drink = (drink, pool) => {
    return new Promise(async (resolve, reject) => {
        if (Object.values(drink).includes(null) || Object.values(drink).includes(undefined) || Object.values(drink).includes(NaN)) {
            console.log(">> Found invalid drink");
            console.log(drink);
            return reject(null);
        }
        const stored = await (0, exports.get_drink_by_checksum)(drink.checksum, pool);
        if (stored) {
            await pool.query("UPDATE products SET last_available = NOW() AT TIME ZONE 'UTC' WHERE checksum = $1", [drink.checksum])
                .then(() => {
                console.log(">> Drink already exists (updated)");
                return reject(null);
            })
                .catch(err => {
                console.log(err);
                return reject(err);
            });
        }
        pool.query(`INSERT INTO products
            (name, href, price, img, volume, category_id, subcategory_id, abv, retailer, checksum, currently_available, last_available)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, NOW() AT TIME ZONE 'UTC')
            ON CONFLICT (href) DO UPDATE SET last_available = NOW() AT TIME ZONE 'UTC'`, [
            drink.name,
            drink.href,
            drink.price,
            drink.img,
            drink.volume,
            drink.category,
            drink.subcategory,
            drink.abv,
            drink.retailer,
            drink.checksum
        ])
            .then(async (result) => {
            if (result.rowCount ?? 0 >= 1) {
                await pool.query("UPDATE subcategories SET product_count = product_count + 1 WHERE id = $1", [drink.subcategory])
                    .catch(err => {
                    console.log(err);
                    return reject(err);
                });
                console.log(">> Inserted a drink");
                return resolve(RsDatabaseAction.InsertDrink);
            }
            else {
                pool.query(`UPDATE products
                    SET price = $1,
                    img = $2,
                    checksum = $3
                    last_available = NOW() AT TIME ZONE 'UTC',
                    currently_available = true
                    WHERE href = $4
                    `, [
                    drink.price,
                    drink.img,
                    drink.checksum,
                    drink.href
                ]);
                console.log(">> Drink info was updated");
                return resolve(RsDatabaseAction.UpdateDrink);
            }
        })
            .catch(err => {
            console.log(err);
            return reject(err);
        });
    });
};
exports.insert_drink = insert_drink;
const insert_drinks = (drinks, pool) => {
    return new Promise(async (resolve, reject) => {
        const result = {
            checked: 0,
            inserted: 0,
            skipped: 0,
            updated: 0,
        };
        for await (const drink of drinks) {
            result.checked += 1;
            await (0, exports.insert_drink)(drink, pool)
                .then(action => {
                switch (action) {
                    case RsDatabaseAction.InsertDrink:
                        result.inserted += 1;
                        break;
                    case RsDatabaseAction.UpdateDrink:
                        result.updated += 1;
                        break;
                }
            })
                .catch(e => {
                result.skipped += 1;
                return;
            });
        }
    });
};
exports.insert_drinks = insert_drinks;
const generate_drink_checksum = (drink) => {
    const str = `${drink.href};${drink.price};${drink.img}`;
    return (0, exports.generate_checksum)(str);
};
exports.generate_drink_checksum = generate_drink_checksum;
const generate_checksum = (str, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return `C${4294967296 * (2097151 & h2) + (h1 >>> 0)}`;
};
exports.generate_checksum = generate_checksum;
