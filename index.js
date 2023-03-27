require("dotenv").config();
const {
    Database
} = require("sqlite3");
const sqlite = new Database("./index.db");
const express = require("express");

const DADATA_TOKEN = process.env.DADATA_TOKEN;
console.log(DADATA_TOKEN);

const app = express();

const query = async(sql, params = []) => {
    return new Promise((resolve, reject) => {
        sqlite.all(sql, params, (err, rows) => {
            if(err) {
                reject(err);
            } else {
                resolve(rows);
            }
        })
    })
}

const searchLocal = async(id) => {
    try {
        const rows = await query("SELECT data FROM local WHERE id = ?;", [id]);
        if(rows.length) {
            return rows[0].data;
        }
        return null;
    } catch(err) {
        console.error(err);
        return null;
    }
}

const searchPublic = async(id) => {
    try {
        const response = await fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": "Token " + DADATA_TOKEN
            },
            body: JSON.stringify({
                query: String(id),
            })
        });
        const data = await response.json();
        if(data.suggestions?.length) {
            await query("INSERT INTO local (id, data) VALUES (?, ?);", [id, data.suggestions[0].value]);
            return data.suggestions[0].value;
        };
        return null;
    } catch(err) {
        console.error(err);
        return null;
    }
}

app.use("/", express.static("public"));

app.get("/:id", async(req, res) => {
    const id = req.params.id;
    if(!id) {
        res.send("Неправильно указан идентификатор");
        return;
    }
    const local = await searchLocal(id);
    if(local) {
        res.send(local);
        return;
    }
    const public = await searchPublic(id);
    if(public) {
        res.send(public);
        return;
    }
    res.send("Ничего не найдено...");
    return;
});

const run = async() => {
    await query("CREATE TABLE IF NOT EXISTS local (id TEXT PRIMARY KEY, data TEXT);");
    app.listen(3000, () => {
        console.log("Listening on port 3000.");
    });
}

run().catch(console.error);