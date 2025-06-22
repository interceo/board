// Controllers for different pages
const ForumControllers = {
    // Controller function to load boards
    loadBoards: function () {
        const boardsContainer = document.getElementById('boards-container');

        // Get server time
        ForumAPI.getServerTime();

        // Get boards
        ForumAPI.boards.getBoards()
            .then(boards => {
                hideElement('loading');

                if (!boards || boards.length === 0) {
                    showError('No boards found');
                    return;
                }

                // Process each board and create HTML
                boards.forEach(board => {
                    const boardElement = ForumUI.createBoardCard(board);
                    boardsContainer.appendChild(boardElement);
                });
            })
            .catch(error => {
                hideElement('loading');
                showError('Failed to load boards. Please try again later.');
            });
    },

    // Controller function to load threads
    loadThreads: function (params) {
        const boardName = params.boardName;
        const threadsContainer = document.getElementById('threads-container');
        const boardNameElement = document.getElementById('board-name');
        const boardDescElement = document.getElementById('board-description');

        if (boardNameElement) {
            boardNameElement.textContent = boardName;
        }

        const createThreadLink = document.getElementById('create-thread-link');
        if (createThreadLink) {
            createThreadLink.href = `/${boardName}/create`;
        }

        // Get server time
        ForumAPI.getServerTime();
        
        console.log(boardName)
        const threads = ForumAPI.threads.getThreads(board.name);
        threads.forEach(thread => {
            const threadElement = ForumUI.createThreadElement(thread, boardName);
            threadsContainer.appendChild(threadElement);
        });
    },

    // Controller function to load a thread
    loadThread: function (params) {
        const boardName = params.boardName;
        const threadId = params.threadId;
        const threadContainer = document.getElementById('thread-container');
        const backButton = document.getElementById('back-to-board');

        if (backButton) {
            backButton.href = `/${boardName}`;
        }

        // Get server time
        ForumAPI.getServerTime();

        // Get board info first to find board ID
        ForumAPI.boards.getBoards()
            .then(boards => {
                const board = boards.find(b => b.name === boardName);

                if (!board) {
                    throw new Error('Board not found');
                }

                // Get thread data using board ID and thread ID
                return ForumAPI.threads.getThread(board.name, threadId);
            })
            .then(thread => {
                hideElement('loading');

                if (!thread) {
                    showError('Thread not found');
                    return;
                }

                // Display the thread
                const threadElement = ForumUI.createThreadDetail(thread, boardName);
                threadContainer.appendChild(threadElement);

                // Show reply form
                showElement('reply-form');

                // Setup reply form submission
                const postForm = document.getElementById('post-form');
                if (postForm) {
                    postForm.addEventListener('submit', (e) => {
                        e.preventDefault();

                        const author = document.getElementById('author').value || 'Anonymous';
                        const content = document.getElementById('content').value;

                        if (!content.trim()) {
                            alert('Please enter a message');
                            return;
                        }

                        // Get board ID
                        ForumAPI.boards.getBoards()
                            .then(boards => {
                                const board = boards.find(b => b.name === boardName);
                                return ForumAPI.threads.createPost(board.name, threadId, {
                                    author,
                                    content
                                });
                            })
                            .then(() => {
                                // Reload the page to show the new post
                                ForumRouter.handleUrl();
                            })
                            .catch(error => {
                                showError('Failed to post reply');
                            });
                    });
                }
            })
            .catch(error => {
                hideElement('loading');
                showError('Failed to load thread. Please try again later.');
            });
    }
};