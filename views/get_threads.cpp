
#include "get_threads.hpp"

using namespace drogon;

void handleCreateThread(
    const drogon::orm::DbClientPtr& db,
    const drogon::HttpRequestPtr& req,
    std::function<void(const drogon::HttpResponsePtr&)>&& callback
) {
    auto json = req->getJsonObject();
    if (!json || !(*json)["message"].isString()) {
        auto resp = drogon::HttpResponse::newHttpResponse();
        resp->setStatusCode(drogon::k400BadRequest);
        resp->setBody("Missing 'message' field");
        callback(resp);
        return;
    }
    std::string message = (*json)["message"].asString();
    db->execSqlAsync(
        "INSERT INTO threads (message) VALUES (?) RETURNING id",
        [callback, message](const drogon::orm::Result &r) {
            Json::Value resp_json;
            resp_json["message"] = message;
            if (!r.empty()) {
                resp_json["id"] = (*r.begin())["id"].as<int>();
            }
            auto resp = drogon::HttpResponse::newHttpJsonResponse(resp_json);
            resp->setStatusCode(drogon::k201Created);
            callback(resp);
        },
        [callback](const drogon::orm::DrogonDbException &) {
            auto resp = drogon::HttpResponse::newHttpResponse();
            resp->setStatusCode(drogon::k500InternalServerError);
            resp->setBody("DB Error");
            callback(resp);
        },
        message
    );
}