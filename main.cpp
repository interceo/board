#include <drogon/drogon.h>
#include <drogon/orm/DbConfig.h>
using namespace drogon;

int main()
{
    drogon::orm::Sqlite3Config cfg;
    cfg.connectionNumber = 10;
    cfg.filename = "imageboard.db";
    cfg.name = "default";

    app().addDbClient(cfg);

    drogon::StreamError;
    
    auto db = app().getDbClient("default");

    db->execSqlSync(R"sql(
        CREATE TABLE IF NOT EXISTS threads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message TEXT NOT NULL
        );
    )sql");

    app().registerHandler("/threads",
        [db](const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback)
        {
            auto result = db->execSqlSync("SELECT id, message FROM threads ORDER BY id DESC");
            Json::Value threads(Json::arrayValue);
            for (const auto &row : result)
            {
                Json::Value thread;
                thread["id"] = row["id"].as<int>();
                thread["message"] = row["message"].as<std::string>();
                threads.append(thread);
            }
            auto resp = HttpResponse::newHttpJsonResponse(threads);
            callback(resp);
        },
        {Get});

    app().registerHandler("/threads",
        [db](const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback)
        {
            auto json = req->getJsonObject();
            if (!json || !(*json)["message"].isString())
            {
                auto resp = HttpResponse::newHttpResponse();
                resp->setStatusCode(k400BadRequest);
                resp->setBody("Missing 'message' field");
                callback(resp);
                return;
            }
            std::string message = (*json)["message"].asString();
            db->execSqlAsync(
                "INSERT INTO threads (message) VALUES (?)",
                [callback](const drogon::orm::Result &)
                {
                    auto resp = HttpResponse::newHttpResponse();
                    resp->setStatusCode(k201Created);
                    resp->setBody("Thread created");
                    callback(resp);
                },
                [callback](const drogon::orm::DrogonDbException &)
                {
                    auto resp = HttpResponse::newHttpResponse();
                    resp->setStatusCode(k500InternalServerError);
                    resp->setBody("DB Error");
                    callback(resp);
                },
                message
            );
        },
        {Post});

    app().addListener("0.0.0.0", 8080).run();
}