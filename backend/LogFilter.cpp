/**
 *
 *  LogFilter.cc
 *
 */

#include "LogFilter.h"

using namespace drogon;

void LogFilter::doFilter(const HttpRequestPtr &req, FilterCallback &&fcb, FilterChainCallback &&fccb)
{
	LOG_INFO << "Request: " << req->methodString() << " " << req->path() << " from " << req->peerAddr().toIpPort();
	if (1) {
		fccb();
		LOG_INFO << "Responce: " << req->methodString() << " " << req->path() << " from "
			 << req->peerAddr().toIpPort();
		return;
	}

	auto res = drogon::HttpResponse::newHttpResponse();
	res->setStatusCode(k500InternalServerError);
	fcb(res);
}
