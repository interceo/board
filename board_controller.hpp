#pragma once

#include <drogon/HttpController.h>

class BoardController : public drogon::HttpController<BoardController> {
public:
    METHOD_LIST_BEGIN
        ADD_METHOD_TO(BoardController::createSection, "/section", drogon::Post);
        ADD_METHOD_TO(BoardController::createThread, "/section/{1}/thread", drogon::Post);
        ADD_METHOD_TO(BoardController::getThread, "/thread/{1}", drogon::Get);
        ADD_METHOD_TO(BoardController::getSectionThreads, "/section/{1}/threads", drogon::Get);
    METHOD_LIST_END

    void createSection(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback);
    void createThread(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback, int sectionId);
    void getThread(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback, long long threadId);
    void getSectionThreads(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback, int sectionId);
};