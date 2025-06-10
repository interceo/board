#include <iostream>

#include <drogon/drogon.h>
#include <drogon/orm/DbConfig.h>

#include "views/create_thread.hpp"
#include "views/get_time.hpp"
#include "board_controller.hpp"

using namespace drogon;

int main()
{
    drogon::app().setLogPath("./").setLogLevel(trantor::Logger::kWarn);

    drogon::orm::PostgresConfig cfg{
        .host = "127.0.0.1",
        .port = 5432,
        .databaseName = "imageboard",
        .username = "imageboard_user",
        .password = "password",
        .connectionNumber = 2,
        .name = "imageboard",
        .isFast = false,
        .characterSet = "utf8",
        .timeout = 60,
        .autoBatch = true};

    drogon::app().addDbClient(cfg);

    drogon::app().registerHandler("/time",
                                  [](const HttpRequestPtr &,
                                     std::function<void(const HttpResponsePtr &)> &&callback)
                                  {
                                      Json::Value resp;
                                      resp["server_time"] = now_iso8601();
                                      callback(HttpResponse::newHttpJsonResponse(resp));
                                  },
                                  {Get});

    drogon::app().addListener("127.0.0.1", 8088).setThreadNum(16).run();
    return 0;
}