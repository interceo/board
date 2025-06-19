#pragma once

#include <drogon/HttpController.h>

class BoardController : public drogon::HttpController<BoardController> {
    public:
	METHOD_LIST_BEGIN

	ADD_METHOD_TO(BoardController::GetTime, "/time", drogon::Get);
	ADD_METHOD_TO(BoardController::GetThread, "/{1}/thread/{2}", drogon::Get);
	ADD_METHOD_TO(BoardController::GetThreads, "/{1}/threads", drogon::Get);
	ADD_METHOD_TO(BoardController::CreateThread, "/{1}/create_thread", drogon::Post);
	ADD_METHOD_TO(BoardController::CreatePost, "/{1}/{2}/create_post", drogon::Post);

	ADD_METHOD_TO(BoardController::CreateBoard, "/create_board/{1}", drogon::Post);

	METHOD_LIST_END

	void GetTime(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback);
	void GetThread(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback,
		       const std::string &board_name, const size_t thread_id);
	void GetThreads(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback,
			const std::string &board_name);
	void CreateThread(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback,
			  const std::string &board_name);
	void CreatePost(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback,
			const std::string &board_name, const size_t thread_id);

	void CreateBoard(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback,
			 const std::string &board_name);
};