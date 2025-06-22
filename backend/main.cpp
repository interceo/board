#include <iostream>

#include <drogon/drogon.h>
#include <drogon/orm/DbConfig.h>

#include "LogFilter.h"
#include "board_controller.hpp"

int main()
{
	drogon::app().registerPostHandlingAdvice([](const drogon::HttpRequestPtr &, const drogon::HttpResponsePtr &resp) {
		resp->addHeader("Access-Control-Allow-Origin", "*");
		resp->addHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
		resp->addHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
	});
	drogon::app().loadConfigFile("../config.json").run();
	return 0;
}