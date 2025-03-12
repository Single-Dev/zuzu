<template>
    <div class="comments-container">
        <h2 class="comments-title">Comments <span v-if="!loading">({{ totalCommentCount }})</span></h2>

        <div v-if="loading" class="loading">
            <div class="loading-spinner"></div>
            <span>Loading comments...</span>
        </div>

        <div v-else-if="error" class="error-message">
            {{ error }}
        </div>

        <template v-else>
            <!-- Comment Form -->
            <div v-if="totalCommentCount >= 100" class="comments-limit-reached">
                <p>Whoaaa... we reached 100 comments. It is time to read them all.</p>
            </div>

            <div v-else-if="!showCommentForm && !userName" class="name-prompt">
                <h3>Join the conversation</h3>
                <div class="input-group">
                    <input type="text" v-model="userNameInput" placeholder="What's your name?"
                        :class="{ 'error-input': nameError }" />
                    <button @click="handleNameSubmit" :disabled="isSubmitting">
                        <UserCheck />
                    </button>
                </div>
                <p v-if="nameError" class="error-text">{{ nameError }}</p>
            </div>

            <form v-else-if="totalCommentCount < 100" @submit.prevent="submitComment" class="comment-form">
                <div class="form-header">
                    <div class="user-avatar">{{ userName.charAt(0).toUpperCase() }}</div>
                    <span class="commenting-as">Commenting as <strong>{{ userName }}</strong></span>
                </div>

                <textarea v-model="commentText" placeholder="Share your thoughts..."
                    :class="{ 'error-input': commentError }"></textarea>
                <p v-if="commentError" class="error-text">{{ commentError }}</p>

                <div class="form-actions">
                    <button type="submit" :disabled="isSubmitting">
                        {{ isSubmitting ? 'Posting...' : 'Post Comment' }}
                    </button>
                </div>
            </form>

            <!-- Comments List -->
            <div v-if="comments.length === 0" class="no-comments">
                <p>No comments yet. Be the first to share your thoughts!</p>
            </div>

            <div v-else class="comments-list">
                <!-- Only render top-level comments here -->
                <div v-for="comment in topLevelComments" :key="comment.id" class="comment-thread">
                    <!-- Parent comment -->
                    <div class="comment">
                        <div class="comment-avatar" :style="{ backgroundColor: generateAvatarColor(comment.name) }">
                            {{ comment.name.charAt(0).toUpperCase() }}
                        </div>
                        <div class="comment-content">
                            <div class="comment-header">
                                <span class="comment-author">{{ comment.name }}</span>
                                <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
                            </div>
                            <p class="comment-text">{{ comment.text }}</p>
                            <div  class="comment-actions" v-if="userName && totalCommentCount < 100">
                                <button @click="toggleReplyForm(comment.id)" class="reply-button"
                                    :class="{ 'active': activeReplyId === comment.id }">
                                    {{ activeReplyId === comment.id ? 'Cancel' : 'Reply' }}
                                </button>
                            </div>

                            <!-- Reply form -->
                            <div v-if="activeReplyId === comment.id" class="reply-form">
                                <textarea v-model="replyText" placeholder="Write a reply..."
                                    :class="{ 'error-input': replyError }"></textarea>
                                <p v-if="replyError" class="error-text">{{ replyError }}</p>
                                <div class="reply-form-actions">
                                    <button @click="submitReply(comment.id)" :disabled="isSubmittingReply">
                                        {{ isSubmittingReply ? 'Posting...' : 'Reply' }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Replies -->
                    <div v-if="getRepliesForComment(comment.id).length > 0" class="replies">
                        <div v-for="reply in getRepliesForComment(comment.id)" :key="reply.id" class="reply">
                            <div class="comment-avatar reply-avatar"
                                :style="{ backgroundColor: generateAvatarColor(reply.name) }">
                                {{ reply.name.charAt(0).toUpperCase() }}
                            </div>
                            <div class="comment-content">
                                <div class="comment-header">
                                    <span class="comment-author">{{ reply.name }}</span>
                                    <span class="comment-date">{{ formatDate(reply.createdAt) }}</span>
                                </div>
                                <p class="comment-text">{{ reply.text }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import { UserCheck } from 'lucide-vue-next';

export default {
    name: 'CommentsSection',
    components: {
        UserCheck
    },
    data() {
        return {
            comments: [],
            loading: true,
            error: null,
            userNameInput: '',
            userName: '',
            commentText: '',
            showCommentForm: false,
            nameError: '',
            commentError: '',
            isSubmitting: false,
            apiUrl: 'https://67d028d8825945773eafc4d7.mockapi.io/comments',
            pollingInterval: null,
            lastFetchTime: null,
            activeReplyId: null,
            replyText: '',
            replyError: '',
            isSubmittingReply: false
        }
    },
    computed: {
        // Get only top-level comments (no parent)
        topLevelComments() {
            return this.comments.filter(comment => !comment.parentId);
        },
        // Count all comments including replies
        totalCommentCount() {
            return this.comments.length;
        }
    },
    mounted() {
        this.fetchComments()
        // Check if user name is stored in localStorage
        const storedName = localStorage.getItem('userName')
        if (storedName) {
            this.userName = storedName
            this.showCommentForm = true
        }

        // Start polling for real-time updates
        this.startRealTimeUpdates()
    },
    beforeUnmount() {
        // Clean up polling interval when component is destroyed
        this.stopRealTimeUpdates()
    },
    methods: {
        // Get replies for a specific comment
        getRepliesForComment(commentId) {
            return this.comments.filter(comment => comment.parentId === commentId)
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Sort oldest first for replies
        },

        // Toggle reply form visibility
        toggleReplyForm(commentId) {
            if (this.activeReplyId === commentId) {
                // If clicking on the same comment, close the form
                this.activeReplyId = null;
                this.replyText = '';
                this.replyError = '';
            } else {
                // Open reply form for this comment
                this.activeReplyId = commentId;
                this.replyText = '';
                this.replyError = '';
            }
        },

        // Submit a reply to a comment
        async submitReply(parentId) {
            if (!this.replyText.trim()) {
                this.replyError = 'Please enter a reply';
                return;
            }

            this.replyError = '';
            this.isSubmittingReply = true;

            try {
                const newReply = {
                    name: this.userName,
                    text: this.replyText,
                    createdAt: new Date().toISOString(),
                    parentId: parentId // Set the parent ID to create the relationship
                };

                const response = await fetch(this.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newReply)
                });

                if (!response.ok) {
                    throw new Error('Failed to post reply');
                }

                const savedReply = await response.json();

                // Add the new reply to the comments list
                this.comments.push(savedReply);

                // Clear the reply form
                this.replyText = '';
                this.activeReplyId = null;

            } catch (err) {
                console.error('Error posting reply:', err);
                this.replyError = 'Failed to post your reply. Please try again.';
            } finally {
                this.isSubmittingReply = false;
            }
        },

        startRealTimeUpdates() {
            // Poll for new comments every 1 second
            this.pollingInterval = setInterval(() => {
                this.checkForNewComments()
            }, 1000)
        },

        stopRealTimeUpdates() {
            if (this.pollingInterval) {
                clearInterval(this.pollingInterval)
                this.pollingInterval = null
            }
        },

        async checkForNewComments() {
            try {
                // Only fetch comments that are newer than our last fetch
                let url = this.apiUrl
                if (this.lastFetchTime) {
                    // This is a mock implementation - in a real API you would filter by date
                    // url += `?createdAt_gt=${this.lastFetchTime}`
                }

                const response = await fetch(url)
                if (!response.ok) {
                    throw new Error('Failed to fetch new comments')
                }

                const newComments = await response.json()

                // Update last fetch time
                this.lastFetchTime = new Date().toISOString()

                // If we already have comments, check for new ones
                if (this.comments.length > 0) {
                    const existingIds = new Set(this.comments.map(c => c.id))
                    const freshComments = newComments.filter(c => !existingIds.has(c.id))

                    if (freshComments.length > 0) {
                        // Add new comments to our list
                        this.comments = [...this.comments, ...freshComments]
                    }
                } else {
                    // First load, just set all comments
                    this.comments = newComments
                }

                // Sort top-level comments by date (newest first)
                // Replies are sorted separately in the getRepliesForComment method
                this.comments = [...this.comments].sort((a, b) => {
                    // Only sort top-level comments by newest first
                    if (!a.parentId && !b.parentId) {
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    }
                    return 0; // Don't change order for replies
                });
            } catch (err) {
                console.error('Error checking for new comments:', err)
                // Don't show error to user during background polling
            }
        },

        async fetchComments() {
            this.loading = true
            this.error = null

            try {
                const response = await fetch(this.apiUrl)

                if (!response.ok) {
                    throw new Error('Failed to fetch comments')
                }

                this.comments = await response.json()

                // Sort top-level comments by date (newest first)
                this.comments = [...this.comments].sort((a, b) => {
                    // Only sort top-level comments by newest first
                    if (!a.parentId && !b.parentId) {
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    }
                    return 0; // Don't change order for replies
                });

                // Set last fetch time for real-time updates
                this.lastFetchTime = new Date().toISOString()
            } catch (err) {
                console.error('Error fetching comments:', err)
                this.error = 'Unable to load comments. Please try again later.'
            } finally {
                this.loading = false
            }
        },

        handleNameSubmit() {
            if (!this.userNameInput.trim()) {
                this.nameError = 'Please enter your name'
                return
            }

            this.nameError = ''
            this.userName = this.userNameInput.trim()
            this.showCommentForm = true

            // Store user name in localStorage for future visits
            localStorage.setItem('userName', this.userName)
        },

        async submitComment() {
            if (!this.commentText.trim()) {
                this.commentError = 'Please enter a comment'
                return
            }

            this.commentError = ''
            this.isSubmitting = true

            try {
                const newComment = {
                    name: this.userName,
                    text: this.commentText,
                    createdAt: new Date().toISOString(),
                    parentId: null // Explicitly set to null for top-level comments
                }

                const response = await fetch(this.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newComment)
                })

                if (!response.ok) {
                    throw new Error('Failed to post comment')
                }

                const savedComment = await response.json()

                // Add the new comment to the top of the list immediately
                this.comments.unshift(savedComment)
                this.commentText = ''

            } catch (err) {
                console.error('Error posting comment:', err)
                this.commentError = 'Failed to post your comment. Please try again.'
            } finally {
                this.isSubmitting = false
            }
        },

        formatDate(dateString) {
            const date = new Date(dateString)

            if (isNaN(date.getTime())) {
                return 'Just now'
            }

            const now = new Date()
            const diffInSeconds = Math.floor((now - date) / 1000)

            if (diffInSeconds < 60) {
                return 'Just now'
            }

            const diffInMinutes = Math.floor(diffInSeconds / 60)
            if (diffInMinutes < 60) {
                return `${diffInMinutes}m ago`
            }

            const diffInHours = Math.floor(diffInMinutes / 60)
            if (diffInHours < 24) {
                return `${diffInHours}h ago`
            }

            const diffInDays = Math.floor(diffInHours / 24)
            if (diffInDays < 30) {
                return `${diffInDays}d ago`
            }

            const options = { month: 'short', day: 'numeric' }
            return date.toLocaleDateString(undefined, options)
        },

        generateAvatarColor(name) {
            // Generate a consistent color based on the name
            let hash = 0;
            for (let i = 0; i < name.length; i++) {
                hash = name.charCodeAt(i) + ((hash << 5) - hash);
            }

            // Use a color palette that matches the dark theme
            const colors = [
                '#10b981', // emerald
                '#3b82f6', // blue
                '#8b5cf6', // violet
                '#ec4899', // pink
                '#f59e0b', // amber
                '#ef4444', // red
            ];

            const index = Math.abs(hash) % colors.length;
            return colors[index];
        }
    }
}
</script>

<style scoped>
.comments-container {
    width: 900px;
    margin: 40px auto;
    padding: 20px;
    color: #e2e8f0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: #1a202c;
    border-radius: 8px;
    box-sizing: border-box;
    display: block !important;
}

.comments-title {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    color: #10b981;
    font-weight: 600;
}

.loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: #94a3b8;
}

.loading-spinner {
    width: 24px;
    height: 24px;
    border: 3px solid rgba(16, 185, 129, 0.3);
    border-radius: 50%;
    border-top-color: #10b981;
    animation: spin 1s ease-in-out infinite;
    margin-right: 10px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.error-message {
    padding: 1rem;
    background-color: rgba(239, 68, 68, 0.2);
    border-left: 4px solid #ef4444;
    color: #fecaca;
    border-radius: 4px;
    margin-bottom: 1rem;
}

.comments-limit-reached {
    padding: 1rem;
    background-color: rgba(16, 185, 129, 0.1);
    border-left: 4px solid #10b981;
    color: #d1fae5;
    border-radius: 4px;
    margin-bottom: 1.5rem;
}

.name-prompt {
    background-color: #2d3748;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
}

.name-prompt h3 {
    color: #e2e8f0;
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.2rem;
}

.input-group {
    display: flex;
    gap: 0.5rem;
}

input,
textarea {
    background-color: #1a202c;
    color: #e2e8f0;
    border: 1px solid #4a5568;
    padding: 0.75rem;
    border-radius: 4px;
    font-family: inherit;
    font-size: 1rem;
    transition: border-color 0.2s;
    width: 100%;
    box-sizing: border-box;
}

input:focus,
textarea:focus {
    outline: none;
    border-color: #10b981;
}

textarea {
    min-height: 120px;
    resize: vertical;
    margin-bottom: 0.5rem;
}

button {
    padding: 10px 15px;
    background-color: #10b981;
    color: #1a202c;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.2s;
    white-space: nowrap;
}

button:hover {
    background-color: #059669;
}

button:disabled {
    background-color: #064e3b;
    color: #94a3b8;
    cursor: not-allowed;
}

.error-input {
    border-color: #ef4444;
}

.error-text {
    color: #ef4444;
    font-size: 0.85rem;
    margin: 0.5rem 0;
}

.comment-form {
    background-color: #2d3748;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
}

.form-header {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
}

.user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: #10b981;
    color: #1a202c;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-right: 0.75rem;
    flex-shrink: 0;
}

.commenting-as {
    flex: 1;
    color: #94a3b8;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
}

.no-comments {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
    background-color: #2d3748;
    border-radius: 8px;
}

.comments-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.comment-thread {
    display: flex;
    flex-direction: column;
}

.comment {
    display: flex;
    padding: 1rem;
    background-color: #2d3748;
    border-radius: 8px;
}

.comment-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    color: #1a202c;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-right: 1rem;
    flex-shrink: 0;
}

.comment-content {
    flex: 1;
    min-width: 0;
    /* Prevents content from overflowing on small screens */
}

.comment-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    flex-wrap: wrap;
    /* Allow wrapping on small screens */
    gap: 0.5rem;
}

.comment-author {
    font-weight: bold;
    color: #e2e8f0;
}

.comment-date {
    color: #94a3b8;
    font-size: 0.85rem;
}

.comment-text {
    margin: 0;
    line-height: 1.5;
    color: #cbd5e0;
    word-break: break-word;
    /* Ensures text wraps properly on mobile */
}

.comment-actions {
    margin-top: 0.75rem;
    display: flex;
    gap: 0.5rem;
}

.reply-button {
    background-color: transparent;
    color: #94a3b8;
    padding: 4px 8px;
    font-size: 0.85rem;
    font-weight: normal;
    border: 1px solid #4a5568;
}

.reply-button:hover {
    background-color: #4a5568;
    color: #e2e8f0;
}

.reply-button.active {
    background-color: #4a5568;
    color: #e2e8f0;
}

.reply-form {
    margin-top: 0.75rem;
    padding: 0.75rem;
    background-color: #1a202c;
    border-radius: 4px;
}

.reply-form textarea {
    min-height: 80px;
}

.reply-form-actions {
    display: flex;
    justify-content: flex-end;
}

.replies {
    margin-left: 2rem;
    margin-top: 0.5rem;
    border-left: 2px solid #4a5568;
    padding-left: 1rem;
}

.reply {
    display: flex;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    background-color: #2d3748;
    border-radius: 6px;
}

.reply:last-child {
    margin-bottom: 0;
}

.reply-avatar {
    width: 32px;
    height: 32px;
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
    .comments-container {
        width: 100%;
        padding: 15px;
        margin: 20px auto;
    }

    .comment,
    .reply {
        padding: 12px;
    }

    .comment-form,
    .name-prompt,
    .reply-form {
        padding: 15px;
    }

    .form-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .user-avatar {
        margin-bottom: 10px;
    }

    .comment-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .comment-date {
        margin-top: 2px;
    }

    .input-group {
        flex-direction: column;
    }

    .input-group button {
        margin-top: 10px;
        width: 100%;
    }

    textarea {
        min-height: 100px;
    }

    button {
        width: 100%;
    }

    .replies {
        margin-left: 0.5rem;
        padding-left: 0.5rem;
    }
}

/* Small mobile devices */
@media (max-width: 480px) {
    .comments-container {
        padding: 10px;
    }

    .comments-title {
        font-size: 1.3rem;
    }

    .comment-avatar {
        width: 32px;
        height: 32px;
    }

    .reply-avatar {
        width: 28px;
        height: 28px;
    }
}
</style>