#include <iostream>

#include <drogon/drogon.h>
#include <drogon/orm/DbConfig.h>

#include "LogFilter.h"
#include "board_controller.hpp"

using namespace drogon;

int main()
{
	drogon::app().loadConfigFile("../config.json").run();
	return 0;
}