#pragma once

#include <drogon/HttpController.h>

using namespace drogon;

class BoardController : public HttpController<BoardController> {
    public:
	METHOD_LIST_BEGIN

	ADD_METHOD_TO(BoardController::GetTime, "/time", Get, Options, "LogFilter");
	ADD_METHOD_TO(BoardController::GetBoards, "/boards", Get, Options, "LogFilter");
	ADD_METHOD_TO(BoardController::GetThreads, "/{1}/threads", Get, Options, "LogFilter");
	ADD_METHOD_TO(BoardController::GetThread, "/{1}/thread/{2}", Get, Options, "LogFilter");
	ADD_METHOD_TO(BoardController::CreateThread, "/{1}/create_thread", Post, Options, "LogFilter");
	ADD_METHOD_TO(BoardController::CreatePost, "/{1}/{2}/create_post", Post, Options, "LogFilter");

	ADD_METHOD_TO(BoardController::CreateBoard, "/create_board/{1}", Post, Options, "LogFilter");

	METHOD_LIST_END

	void GetTime(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback);
	void GetBoards(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback);
	void GetThread(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback,
		       const std::string &board_name, const size_t thread_id);
	void GetThreads(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback,
			const std::string &board_name);
	void CreateThread(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback,
			  const std::string &board_name);
	void CreatePost(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback,
			const std::string &board_name, const size_t thread_id);

	void CreateBoard(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback,
			 const std::string &board_name);
};