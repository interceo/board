#pragma once
#include <drogon/drogon.h>
#include <drogon/HttpAppFramework.h>
#include <drogon/orm/DbClient.h>

void handleCreateThread(
    const drogon::orm::DbClientPtr& db,
    const drogon::HttpRequestPtr& req,
    std::function<void(const drogon::HttpResponsePtr&)>&& callback
);