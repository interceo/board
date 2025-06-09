cmake_minimum_required(VERSION 3.5)
project(imageboard)

set(CMAKE_CXX_STANDARD 20)

find_package(Drogon CONFIG REQUIRED)
add_executable(imageboard main.cpp)
target_link_libraries(imageboard PRIVATE Drogon::Drogon)