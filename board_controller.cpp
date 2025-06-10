#include "board_controller.hpp"
#include <drogon/drogon.h>
#include <drogon/orm/DbClient.h>
#include <drogon/orm/Field.h>
#include <json/json.h>

using namespace drogon;

void BoardController::createSection(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto db = app().getDbClient("imageboard");
    auto json = req->getJsonObject();
    if (!json || !json->isMember("name"))
    {
        callback(HttpResponse::newHttpJsonResponse(Json::Value("Missing 'name' field")));
        return;
    }
    std::string name = (*json)["name"].asString();
    db->execSqlAsync("INSERT INTO sections(name) VALUES($1) RETURNING id", [callback](const drogon::orm::Result &r)
                     {
            Json::Value resp;
            resp["id"] = r[0]["id"].as<int>();
            callback(HttpResponse::newHttpJsonResponse(resp)); }, [callback](const drogon::orm::DrogonDbException &e)
                     {
            auto resp = HttpResponse::newHttpResponse();
            resp->setStatusCode(k500InternalServerError);
            resp->setBody("DB error: " + std::string(e.base().what()));
            callback(resp); }, name);
}

void BoardController::createThread(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback, int sectionId)
{
    auto db = app().getDbClient("imageboard");
    auto json = req->getJsonObject();
    if (!json || !json->isMember("title"))
    {
        callback(HttpResponse::newHttpJsonResponse(Json::Value("Missing 'title' field")));
        return;
    }
    std::string title = (*json)["title"].asString();
    db->execSqlAsync(
        "INSERT INTO threads(section_id, title) VALUES($1, $2) RETURNING id, created_at",
        [callback](const drogon::orm::Result &r)
        {
            Json::Value resp;
            resp["id"] = r[0]["id"].as<Json::Int64>();
            resp["created_at"] = r[0]["created_at"].as<std::string>();
            callback(HttpResponse::newHttpJsonResponse(resp));
        },
        [callback](const drogon::orm::DrogonDbException &e)
        {
            auto resp = HttpResponse::newHttpResponse();
            resp->setStatusCode(k500InternalServerError);
            resp->setBody("DB error: " + std::string(e.base().what()));
            callback(resp);
        },
        sectionId, title);
}

void BoardController::getThread(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback, long long threadId)
{
    auto db = app().getDbClient("imageboard");
    db->execSqlAsync(
        "SELECT id, section_id, title, created_at FROM threads WHERE id=$1",
        [callback](const drogon::orm::Result &r)
        {
            if (r.empty())
            {
                auto resp = HttpResponse::newHttpResponse();
                resp->setStatusCode(k404NotFound);
                resp->setBody("Thread not found");
                callback(resp);
                return;
            }
            Json::Value resp;
            resp["id"] = r[0]["id"].as<Json::Int64>();
            resp["section_id"] = r[0]["section_id"].as<int>();
            resp["title"] = r[0]["title"].as<std::string>();
            resp["created_at"] = r[0]["created_at"].as<std::string>();
            callback(HttpResponse::newHttpJsonResponse(resp));
        },
        [callback](const drogon::orm::DrogonDbException &e)
        {
            auto resp = HttpResponse::newHttpResponse();
            resp->setStatusCode(k500InternalServerError);
            resp->setBody("DB error: " + std::string(e.base().what()));
            callback(resp);
        },
        threadId);
}

void BoardController::getSectionThreads(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback, int sectionId)
{
    auto db = app().getDbClient("imageboard");
    db->execSqlAsync(
        "SELECT id, title, created_at FROM threads WHERE section_id=$1 ORDER BY created_at DESC",
        [callback](const drogon::orm::Result &r)
        {
            Json::Value resp(Json::arrayValue);
            for (auto row : r)
            {
                Json::Value thread;
                thread["id"] = row["id"].as<Json::Int64>();
                thread["title"] = row["title"].as<std::string>();
                thread["created_at"] = row["created_at"].as<std::string>();
                resp.append(thread);
            }
            callback(HttpResponse::newHttpJsonResponse(resp));
        },
        [callback](const drogon::orm::DrogonDbException &e)
        {
            auto resp = HttpResponse::newHttpResponse();
            resp->setStatusCode(k500InternalServerError);
            resp->setBody("DB error: " + std::string(e.base().what()));
            callback(resp);
        },
        sectionId);
}