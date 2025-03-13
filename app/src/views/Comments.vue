<template>
    <div class="comments-container">
        <div class="comments-header">
            <h2 class="comments-title">Comments <span v-if="!loading">({{ totalCommentCount }})</span></h2>

            <!-- Notifications Icon -->
            <div v-if="userName" class="notifications-wrapper">
                <button @click="toggleNotifications" class="notifications-button">
                    <Bell :size="20" />
                    <span v-if="unreadNotifications.length > 0" class="notification-badge">
                        {{ unreadNotifications.length }}
                    </span>
                </button>

                <!-- Notifications Dropdown -->
                <transition name="fade">
                    <div v-if="showNotifications" class="notifications-dropdown">
                        <h3 class="notifications-heading">Notifications</h3>
                        <div v-if="notifications.length === 0" class="no-notifications">
                            <p>No notifications yet</p>
                        </div>
                        <div v-else class="notifications-list">
                            <div v-for="notification in notifications" :key="notification.id" class="notification-item"
                                :class="{ 'unread': !notification.read }"
                                @click="markAsRead(notification.id); scrollToComment(notification.commentId)">
                                <div class="notification-avatar"
                                    :style="{ backgroundColor: generateAvatarColor(notification.fromName) }">
                                    {{ notification.fromName.charAt(0).toUpperCase() }}
                                </div>
                                <div class="notification-content">
                                    <p class="notification-text">
                                        <strong>{{ notification.fromName }}</strong> replied to your comment
                                    </p>
                                    <span class="notification-time">{{ formatDate(notification.createdAt) }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="notifications-actions">
                            <button v-if="unreadNotifications.length > 0" @click="markAllAsRead" class="mark-all-read">
                                Mark all as read
                            </button>
                            <button @click="clearAllNotifications" class="clear-all">
                                Clear all
                            </button>
                        </div>
                    </div>
                </transition>
            </div>
        </div>

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
                <div v-for="comment in sortedTopLevelComments" :key="comment.id" class="comment-thread"
                    :id="`comment-${comment.id}`">
                    <!-- Parent comment -->
                    <div class="comment" :class="{ 'highlight': highlightedCommentId === comment.id }">
                        <div class="comment-avatar" :style="{ backgroundColor: generateAvatarColor(comment.name) }">
                            {{ comment.name.charAt(0).toUpperCase() }}
                        </div>
                        <div class="comment-content">
                            <div class="comment-header">
                                <span class="comment-author">{{ comment.name }}</span>
                                <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
                            </div>
                            <p class="comment-text">{{ comment.text }}</p>
                            <div class="comment-actions" v-if="userName && totalCommentCount < 100">
                                <button @click="toggleReplyForm(comment.id)" class="reply-button"
                                    :class="{ 'active': activeReplyId === comment.id }">
                                    <span class="reply-btn-text">{{ activeReplyId === comment.id ? 'Cancel' : 'Reply'
                                    }}</span>
                                </button>
                            </div>

                            <!-- Reply form with transition -->
                            <transition name="slide-fade">
                                <div v-if="activeReplyId === comment.id" class="reply-form">
                                    <textarea v-model="replyText" placeholder="Write a reply..."
                                        :class="{ 'error-input': replyError }" ref="replyTextarea"></textarea>
                                    <p v-if="replyError" class="error-text">{{ replyError }}</p>
                                    <div class="reply-form-actions">
                                        <button @click="submitReply(comment.id, comment.name)"
                                            :disabled="isSubmittingReply" class="reply-submit-btn">
                                            {{ isSubmittingReply ? 'Posting...' : 'Reply' }}
                                        </button>
                                    </div>
                                </div>
                            </transition>
                        </div>
                    </div>

                    <!-- Replies with transition group -->
                    <transition-group name="list" tag="div" class="replies-container">
                        <div v-if="getRepliesForComment(comment.id).length > 0" class="replies"
                            :key="`replies-${comment.id}`">
                            <div v-for="reply in getRepliesForComment(comment.id)" :key="reply.id" class="reply"
                                :id="`comment-${reply.id}`" :class="{ 'highlight': highlightedCommentId === reply.id }"
                                :style="{ backgroundColor: generateReplyColor(reply.name), borderLeftColor: generateAvatarColor(reply.name) }">
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
                    </transition-group>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import { UserCheck, Bell } from 'lucide-vue-next';

export default {
    name: 'CommentsSection',
    components: {
        UserCheck,
        Bell
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
            isSubmittingReply: false,
            notifications: [],
            showNotifications: false,
            highlightedCommentId: null
        }
    },
    computed: {
        // Get only top-level comments (no parent)
        topLevelComments() {
            return this.comments.filter(comment => !comment.parentId);
        },
        // Get sorted top-level comments (newest first)
        sortedTopLevelComments() {
            return [...this.topLevelComments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        },
        // Count all comments including replies
        totalCommentCount() {
            return this.comments.length;
        },
        // Get unread notifications
        unreadNotifications() {
            return this.notifications.filter(notification => !notification.read);
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

        // Load notifications from localStorage
        this.loadNotifications()

        // Start polling for real-time updates
        this.startRealTimeUpdates()

        // Add click outside listener for notifications dropdown
        document.addEventListener('click', this.handleClickOutside)
    },
    beforeUnmount() {
        // Clean up polling interval when component is destroyed
        this.stopRealTimeUpdates()
        // Remove click outside listener
        document.removeEventListener('click', this.handleClickOutside)
    },
    watch: {
        // Focus the reply textarea when it appears
        activeReplyId(newVal) {
            if (newVal) {
                this.$nextTick(() => {
                    if (this.$refs.replyTextarea) {
                        this.$refs.replyTextarea.focus();
                    }
                });
            }
        },
        // Watch for new comments to check for notifications
        comments: {
            deep: true,
            handler(newComments, oldComments) {
                if (oldComments.length > 0 && newComments.length > oldComments.length) {
                    this.checkForNewReplies(newComments, oldComments);
                }
            }
        }
    },
    methods: {
        // Load notifications from localStorage
        loadNotifications() {
            if (this.userName) {
                const storedNotifications = localStorage.getItem(`notifications_${this.userName}`);
                if (storedNotifications) {
                    this.notifications = JSON.parse(storedNotifications);
                }
            }
        },

        // Save notifications to localStorage
        saveNotifications() {
            if (this.userName) {
                localStorage.setItem(`notifications_${this.userName}`, JSON.stringify(this.notifications));
            }
        },

        // Toggle notifications dropdown
        toggleNotifications(event) {
            event.stopPropagation();
            this.showNotifications = !this.showNotifications;
        },

        // Handle click outside to close notifications dropdown
        handleClickOutside(event) {
            const dropdown = document.querySelector('.notifications-dropdown');
            const button = document.querySelector('.notifications-button');

            if (dropdown && button && !dropdown.contains(event.target) && !button.contains(event.target)) {
                this.showNotifications = false;
            }
        },

        // Mark notification as read
        markAsRead(notificationId) {
            const notification = this.notifications.find(n => n.id === notificationId);
            if (notification) {
                notification.read = true;
                this.saveNotifications();
            }
            this.showNotifications = false;
        },

        // Mark all notifications as read
        markAllAsRead() {
            this.notifications.forEach(notification => {
                notification.read = true;
            });
            this.saveNotifications();
        },

        // Clear all notifications
        clearAllNotifications() {
            this.notifications = [];
            this.saveNotifications();
        },

        // Scroll to a comment when clicking on a notification
        scrollToComment(commentId) {
            this.highlightedCommentId = commentId;

            this.$nextTick(() => {
                const commentElement = document.getElementById(`comment-${commentId}`);
                if (commentElement) {
                    commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

                    // Remove highlight after a delay
                    setTimeout(() => {
                        this.highlightedCommentId = null;
                    }, 3000);
                }
            });
        },

        // Check for new replies to the current user's comments
        checkForNewReplies(newComments, oldComments) {
            if (!this.userName) return;

            // Find new replies
            const oldIds = new Set(oldComments.map(c => c.id));
            const newReplies = newComments.filter(comment =>
                !oldIds.has(comment.id) && comment.parentId
            );

            // Check if any new replies are to the current user's comments
            newReplies.forEach(reply => {
                const parentComment = newComments.find(c => c.id === reply.parentId);

                // If the parent comment is by the current user and the reply is from someone else
                if (parentComment && parentComment.name === this.userName && reply.name !== this.userName) {
                    this.addNotification(reply, parentComment);
                }
            });
        },

        // Add a notification
        addNotification(reply, parentComment) {
            const notification = {
                id: `notification_${Date.now()}`,
                commentId: reply.id,
                parentCommentId: parentComment.id,
                fromName: reply.name,
                createdAt: reply.createdAt,
                read: false
            };

            this.notifications.unshift(notification);
            this.saveNotifications();

            // Show browser notification if supported
            this.showBrowserNotification(reply.name);
        },

        // Show browser notification if supported and permitted
        showBrowserNotification(fromName) {
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('New Reply', {
                    body: `${fromName} replied to your comment`,
                    icon: '/favicon.ico'
                });
            } else if ('Notification' in window && Notification.permission !== 'denied') {
                Notification.requestPermission();
            }
        },

        // Get replies for a specific comment
        getRepliesForComment(commentId) {
            return this.comments.filter(comment => comment.parentId === commentId)
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Sort oldest first for replies
        },

        // Toggle reply form visibility with smooth transition
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
        async submitReply(parentId, parentAuthor) {
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

            // Load notifications for this user
            this.loadNotifications()
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
                '#10b981', 
                '#3b82f6', 
                '#8b5cf6', 
                '#ec4899', 
                '#f59e0b', 
                '#ef4444', 
                '#00f9fe', 
                '#edfb00', 
                '#0100fb',
                '#fb0000',
                '#2afb00'
            ];

            const index = Math.abs(hash) % colors.length;
            return colors[index];
        },
        generateReplyColor(name) {
            // Generate a consistent color based on the name
            let hash = 0;
            for (let i = 0; i < name.length; i++) {
                hash = name.charCodeAt(i) + ((hash << 5) - hash);
            }

            // Use a color palette that matches the dark theme
            const colors = [
                'rgba(16, 185, 129, 0.1)', 
                'rgba(10, 29, 203, 0.1)', 
                'rgba(129, 0, 143, 0.1)', 
                'rgba(194, 3, 191, 0.1)', 
                'rgba(208, 143, 4, 0.1)', 
                'rgba(220, 5, 41, 0.1)', 
                'rgba( 0, 249, 254, 0.1)', 
                'rgba(237, 251, 0, 0.1)',
                'rgba(1, 0, 251, 0.1)',
                'rgba( 251, 0, 0, 0.1)',
                'rgba( 42, 251, 0, 0.1)',
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
    overflow-x: hidden;
    display: block !important;
    transition: 1s all;
    /* Prevent horizontal scrolling */
    color:#dfe0db;
}

.comments-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.comments-title {
    font-size: 1.5rem;
    color: #10b981;
    font-weight: 600;
    margin: 0;
}

/* Notifications Styles */
.notifications-wrapper {
    position: relative;
}

.notifications-button {
    position: relative;
    background-color: transparent;
    color: #e2e8f0;
    padding: 8px;
    border-radius: 50%;
    border: 1px solid #4a5568;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.notifications-button:hover {
    background-color: #2d3748;
}

.notification-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: #ef4444;
    color: white;
    font-size: 0.7rem;
    font-weight: bold;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.notifications-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    width: 300px;
    max-height: 400px;
    background-color: #2d3748;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    z-index: 100;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.notifications-heading {
    margin: 0;
    padding: 15px;
    font-size: 1.1rem;
    border-bottom: 1px solid #4a5568;
    color: #e2e8f0;
}

.notifications-list {
    overflow-y: auto;
    max-height: 300px;
}

.no-notifications {
    padding: 20px;
    text-align: center;
    color: #94a3b8;
}

.notification-item {
    display: flex;
    padding: 12px 15px;
    border-bottom: 1px solid #4a5568;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.notification-item:hover {
    background-color: #374151;
}

.notification-item.unread {
    background-color: rgba(16, 185, 129, 0.1);
}

.notification-item.unread:hover {
    background-color: rgba(16, 185, 129, 0.15);
}

.notification-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1a202c;
    font-weight: bold;
    margin-right: 12px;
    flex-shrink: 0;
}

.notification-content {
    flex: 1;
}

.notification-text {
    margin: 0 0 5px 0;
    font-size: 0.9rem;
    color: #e2e8f0;
}

.notification-time {
    font-size: 0.8rem;
    color: #94a3b8;
}

.notifications-actions {
    display: flex;
    justify-content: space-between;
    padding: 10px 15px;
    border-top: 1px solid #4a5568;
}

.mark-all-read,
.clear-all {
    background-color: transparent;
    color: #94a3b8;
    border: none;
    font-size: 0.85rem;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.mark-all-read:hover,
.clear-all:hover {
    background-color: #374151;
    color: #e2e8f0;
}

/* Highlight effect for comments */
.comment.highlight,
.reply.highlight {
    animation: highlight-pulse 3s ease-in-out;
}

@keyframes highlight-pulse {
    0% {
        background-color: #2d3748;
    }

    30% {
        background-color: rgba(16, 185, 129, 0.3);
    }

    100% {
        background-color: #2d3748;
    }
}

/* Fade animation for notifications dropdown */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s, transform 0.2s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
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
    width: 100%;
}

.comment-thread {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.comment {
    display: flex;
    padding: 1rem;
    background-color: #2d3748;
    border-radius: 8px;
    width: 100%;
    box-sizing: border-box;
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
    width: 100%;
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
    min-width: 60px;
    /* Fixed width to prevent layout shifts */
    text-align: center;
    transition: all 0.2s ease;
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
    width: 100%;
    box-sizing: border-box;
}

.reply-form textarea {
    min-height: 80px;
}

.reply-form-actions {
    display: flex;
    justify-content: flex-end;
}

.replies-container {
    width: 100%;
    box-sizing: border-box;
}

.replies {
    margin-left: 2rem;
    margin-top: 0.5rem;
    padding-left: 1rem;
    width: calc(100% - 3rem);
    box-sizing: border-box;
}

.reply {
    display: flex;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    border-left: 4px solid ;
    border-radius: 4px;
    /* background-color: rgba(16, 185, 129, 0.1); */
    border-radius: 6px;
    width: 100%;
    box-sizing: border-box;
}

.reply:last-child {
    margin-bottom: 0;
}

.reply-avatar {
    width: 32px;
    height: 32px;
}

/* Animations */
.slide-fade-enter-active {
    transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateY(-10px);
    opacity: 0;
}

.list-enter-active,
.list-leave-active {
    transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateY(20px);
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
    .comments-container {
        width: 100%;
        padding: 15px;
        margin: 20px auto;
        margin-top: 50px !important;
    }

    .comment,
    .reply {
        padding: 12px;
        width: 100%;
        box-sizing: border-box;
    }

    .comment-form,
    .name-prompt,
    .reply-form {
        padding: 15px;
        width: 100%;
        box-sizing: border-box;
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
        width: 100%;
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
        width: calc(100% - 1rem);
    }

    /* Fix for mobile width issues */
    .comment-thread,
    .comment-content,
    .replies-container {
        width: 100%;
        box-sizing: border-box;
    }

    /* Ensure reply button has fixed width on mobile */
    .reply-button {
        width: 250px;
        padding: 6px 10px;
    }

    /* Make reply form animation smoother on mobile */
    .slide-fade-enter-active {
        transition: all 0.25s ease-out;
    }

    .slide-fade-leave-active {
        transition: all 0.15s ease-in;
    }

    .notifications-dropdown {
        width: 280px;
        right: -10px;
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

    .notifications-dropdown {
        width: 250px;
    }
}
</style>