#include <iostream>

#include <drogon/drogon.h>
#include <drogon/orm/DbConfig.h>

#include "views/get_threads.hpp"
#include "views/get_time.hpp"

using namespace drogon;

int main()
{
    drogon::app().setLogPath("../log.log");
    drogon::app().setLogLevel(trantor::Logger::kDebug);
    drogon::app().loadConfigFile("/home/interceo/projects/board/config.json");

    auto db = app().getDbClient();

    app().registerHandler("/time",
                          [](const HttpRequestPtr &,
                             std::function<void(const HttpResponsePtr &)> &&callback)
                          {
                              Json::Value resp;
                              resp["server_time"] = now_iso8601();
                              callback(HttpResponse::newHttpJsonResponse(resp));
                          },
                          {Get});

    app().registerHandler("/threads",
                          [db](const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&cb)
                          {
                              handleCreateThread(db, req, std::move(cb));
                          },
                          {Post});

    app().addListener("127.0.0.1", 8080).run();
}