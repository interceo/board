#include "board_controller.hpp"
#include <drogon/drogon.h>
#include <drogon/orm/DbClient.h>
#include <drogon/orm/Field.h>

#include <json/json.h>
#include <fmt/format.h>
#include <fmt/compile.h>

#include "views/get_time.hpp"

using namespace drogon;

void BoardController::GetTime(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback)
{
	Json::Value resp;
	resp["time"] = now_iso8601();
	resp["sosal?"] = bool(rand() & 1) ? "да" : "нет";
	callback(HttpResponse::newHttpJsonResponse(std::move(resp)));
}

void BoardController::GetBoards(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback)
{
	auto db = app().getDbClient("imageboard");

	LOG_DEBUG << "Recieve board!";

	auto future = db->execSqlAsyncFuture(
		R"(
            SELECT
                name
            FROM board
        )");

	try {
		const auto rows = future.get();
		Json::Value resp(Json::arrayValue);

		for (const auto &row : rows) {
			Json::Value thread;

			thread["name"] = row["name"].as<std::string>();
			resp.append(std::move(thread));
		}

		callback(HttpResponse::newHttpJsonResponse(std::move(resp)));
	} catch (const std::exception &e) {
		auto resp = HttpResponse::newHttpResponse();
		resp->setStatusCode(k500InternalServerError);
		resp->setBody("DB error: " + std::string(e.what()));
		callback(resp);
	}
}

void BoardController::GetThread(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback,
				const std::string &board_name, const size_t thread_id)
{
	auto db = app().getDbClient("imageboard");

	auto future = db->execSqlAsyncFuture(
		R"(
            SELECT
                post_number,
                title,
                created_at
            FROM post
            WHERE
				(fk_board_name = $1 AND parent_id = $2) OR
				(fk_board_name = $1 AND post_number = $2)
            ORDER BY post_number ASC
        )",
		board_name, thread_id);

	try {
		const auto rows = future.get();
		Json::Value resp(Json::arrayValue);

		for (const auto &row : rows) {
			Json::Value thread;

			thread["id"] = row["post_number"].as<Json::Int64>();
			thread["title"] = row["title"].as<std::string>();
			thread["created_at"] = row["created_at"].as<std::string>();
			resp.append(std::move(thread));
		}
		callback(HttpResponse::newHttpJsonResponse(std::move(resp)));
	} catch (const std::exception &e) {
		auto resp = HttpResponse::newHttpResponse();
		resp->setStatusCode(k500InternalServerError);
		resp->setBody("DB error: " + std::string(e.what()));
		callback(resp);
	}
}

void BoardController::GetThreads(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback,
				 const std::string &board_name)
{
	auto db = app().getDbClient("imageboard");

	auto future = db->execSqlAsyncFuture(
		R"(
            SELECT
                post_number,
                title,
                created_at
            FROM post
            WHERE fk_board_name = $1 AND parent_id IS NULL
            ORDER BY created_at DESC
        )",
		board_name);

	try {
		const auto rows = future.get();
		Json::Value resp(Json::arrayValue);

		for (const auto &row : rows) {
			Json::Value thread;

			thread["id"] = row["post_number"].as<Json::Int64>();
			thread["title"] = row["title"].as<std::string>();
			thread["created_at"] = row["created_at"].as<std::string>();
			resp.append(std::move(thread));
		}
		callback(HttpResponse::newHttpJsonResponse(std::move(resp)));
	} catch (const std::exception &e) {
		auto resp = HttpResponse::newHttpResponse();
		resp->setStatusCode(k500InternalServerError);
		resp->setBody("DB error: " + std::string(e.what()));
		callback(resp);
	}
}

void BoardController::CreateThread(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback,
				   const std::string &board_name)
{
	auto json_request_opt = req->getJsonObject();
	if (!json_request_opt || !json_request_opt->isMember("title")) {
		callback(HttpResponse::newHttpJsonResponse(Json::Value("Missing 'name' field")));
		return;
	}

	const auto &json_request = *json_request_opt;
	if (!json_request_opt->isMember("title")) {
		callback(HttpResponse::newHttpJsonResponse(Json::Value("Missing 'title' field")));
		return;
	}

	auto db = app().getDbClient("imageboard");

	try {
		const auto result = db->execSqlSync(
			R"(
            INSERT INTO post (fk_board_name, title)
            VALUES($1, $2)
            RETURNING post_number
        )",
			board_name, json_request["title"]);

		Json::Value thread;

		if (!result.empty()) {
			thread["id"] = result.front()["post_number"].as<Json::Int64>();
		}

		callback(HttpResponse::newHttpJsonResponse(std::move(thread)));
	} catch (const std::exception &e) {
		auto resp = HttpResponse::newHttpResponse();
		resp->setStatusCode(k500InternalServerError);
		resp->setBody("DB error: " + std::string(e.what()));
		callback(resp);
	}
}

void BoardController::CreatePost(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback,
				 const std::string &board_name, const size_t thread_id)
{
	auto json_request_opt = req->getJsonObject();
	if (!json_request_opt || !json_request_opt->isMember("title")) {
		callback(HttpResponse::newHttpJsonResponse(Json::Value("Missing 'name' field")));
		return;
	}

	const auto &json_request = *json_request_opt;
	if (!json_request_opt->isMember("title")) {
		callback(HttpResponse::newHttpJsonResponse(Json::Value("Missing 'title' field")));
		return;
	}

	auto db = app().getDbClient("imageboard");

	try {
		const auto result = db->execSqlSync(
			R"(
            INSERT INTO post (fk_board_name, title, parent_id)
            VALUES($1, $2, $3)
            RETURNING post_number
        )",
			board_name, json_request["title"], thread_id);

		Json::Value thread;
		if (!result.empty()) {
			thread["id"] = result.front()["post_number"].as<Json::Int64>();
		}

		callback(HttpResponse::newHttpJsonResponse(std::move(thread)));
	} catch (const std::exception &e) {
		auto resp = HttpResponse::newHttpResponse();
		resp->setStatusCode(k500InternalServerError);
		resp->setBody("DB error: " + std::string(e.what()));
		callback(resp);
	}
}

void BoardController::CreateBoard(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback,
				  const std::string &board_name)
{
	auto db = app().getDbClient("imageboard");

	try {
		const auto result = db->execSqlSync(
			R"(
                INSERT INTO board (name)
                VALUES($1)
				ON CONFLICT DO NOTHING
				RETURNING name
            )",
			board_name);

		Json::Value thread;
		if (result.empty()) {
			auto resp = HttpResponse::newHttpResponse();
			resp->setStatusCode(k202Accepted);
			resp->setBody(fmt::format(FMT_COMPILE("Board {} already exist"), board_name));
			callback(resp);
		}

		callback(HttpResponse::newHttpJsonResponse({}));
	} catch (const std::exception &e) {
		auto resp = HttpResponse::newHttpResponse();
		resp->setStatusCode(k500InternalServerError);
		resp->setBody("DB error: " + std::string(e.what()));
		callback(resp);
	}
}