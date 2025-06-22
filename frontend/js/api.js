const API_BASE_URL = 'http://localhost:8088';

async function fetchApi(endpoint) {
    try {
        console.log(`Fetching from: ${API_BASE_URL}${endpoint}`);
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        throw error;
    }
}

async function getServerTime() {
    try {
        const timeData = await fetchApi('/time');
        const serverTimeElement = document.getElementById('server-time');
        
        if (serverTimeElement) {
            if (timeData && timeData.time) {
                serverTimeElement.textContent = timeData.time;
            } else {
                serverTimeElement.textContent = new Date().toLocaleString();
            }
        }
        return timeData;
    } catch (error) {
        const serverTimeElement = document.getElementById('server-time');
        if (serverTimeElement) {
            serverTimeElement.textContent = 'Time unavailable';
        }
        console.error('Failed to get server time:', error);
    }
}

const BoardsAPI = {
    getBoards: async function() {
        return await fetchApi('/boards');
    },

    createBoard: async function(boardName, boardData) {
        return await fetchApi(`/create_board/${boardName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(boardData)
        });
    }
};

const ThreadsAPI = {
    getThreads: async function(boardId) {
        return await fetchApi(`/${boardId}/threads`);
    },

    getThread: async function(boardId, threadId) {
        return await fetchApi(`/${boardId}/thread/${threadId}`);
    },

    createThread: async function(boardId, threadData) {
        return await fetchApi(`/${boardId}/create_thread`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(threadData)
        });
    },

    createPost: async function(boardId, threadId, postData) {
        return await fetchApi(`/${boardId}/${threadId}/create_post`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });
    }
};

const ForumAPI = {
    BASE_URL: API_BASE_URL,
    fetch: fetchApi,
    getServerTime,
    boards: BoardsAPI,
    threads: ThreadsAPI
};