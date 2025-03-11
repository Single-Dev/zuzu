<template>
    <div class="comments-container">
        <h2 class="comments-title">Comments <span v-if="!loading">({{ comments.length }})</span></h2>

        <div v-if="loading" class="loading">
            <div class="loading-spinner"></div>
            <span>Loading comments...</span>
        </div>

        <div v-else-if="error" class="error-message">
            {{ error }}
        </div>

        <template v-else>
            <!-- Comment Form -->
            <div v-if="comments.length >= 100" class="comments-limit-reached">
                <p>Comments are closed. Maximum number of comments reached.</p>
            </div>

            <div v-else-if="!showCommentForm && !userName" class="name-prompt">
                <h3>Join the conversation</h3>
                <div class="input-group">
                    <input type="text" v-model="userNameInput" placeholder="What's your name?"
                        :class="{ 'error-input': nameError }" />
                    <button @click="handleNameSubmit" :disabled="isSubmitting">Continue</button>
                </div>
                <p v-if="nameError" class="error-text">{{ nameError }}</p>
            </div>

            <form v-else-if="comments.length < 100" @submit.prevent="submitComment" class="comment-form">
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
                <div v-for="comment in comments" :key="comment.id" class="comment">
                    <div class="comment-avatar" :style="{ backgroundColor: generateAvatarColor(comment.name) }">
                        {{ comment.name.charAt(0).toUpperCase() }}
                    </div>
                    <div class="comment-content">
                        <div class="comment-header">
                            <span class="comment-author">{{ comment.name }}</span>
                            <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
                        </div>
                        <p class="comment-text">{{ comment.text }}</p>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
export default {
    name: 'CommentsSection',
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
            apiUrl: 'https://67d028d8825945773eafc4d7.mockapi.io/comments'
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
    },
    methods: {
        async fetchComments() {
            this.loading = true
            this.error = null

            try {
                const response = await fetch(this.apiUrl)

                if (!response.ok) {
                    throw new Error('Failed to fetch comments')
                }

                this.comments = await response.json()
                this.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
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
                    createdAt: new Date().toISOString()
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
    margin: 40px 0 0 0;
    padding: 20px;
    color: #e2e8f0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: #1a202c;
    border-radius: 8px;
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
}

input:focus,
textarea:focus {
    outline: none;
    border-color: #10b981;
}

input {
    flex: 1;
}

textarea {
    width: 100%;
    min-height: 120px;
    resize: vertical;
    margin-bottom: 0.5rem;
}

button {
    padding: 0.75rem 1.25rem;
    background-color: #10b981;
    color: #1a202c;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.2s;
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
}

.comment-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
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
}

@media (max-width: 768px) {
    .comments-container {
        width: 300px;
    }
}
</style>