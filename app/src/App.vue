<script setup>
import SideBar from './components/SideBar.vue';
</script>

<template>
  <div>
    <SideBar />
    <div class="global-notifications">
      <transition-group name="notification">
        <div 
          v-for="notification in visibleNotifications" 
          :key="notification.id" 
          class="notification-toast"
          @click="handleNotificationClick(notification)"
          :style="{ backgroundColor: generateReplyColor(notification.fromName), borderLeftColor: generateAvatarColor(notification.fromName) }"
        >
          <div class="notification-avatar" :style="{ backgroundColor: generateAvatarColor(notification.fromName) }">
            {{ notification.fromName.charAt(0).toUpperCase() }}
          </div>
          <div class="notification-content">
            <p class="notification-text">
              <strong>{{ notification.fromName }}</strong> replied to your comment
            </p>
            <span class="notification-time">{{ formatDate(notification.createdAt) }}</span>
          </div>
          <button class="close-notification" @click.stop="removeVisibleNotification(notification.id)">×</button>
        </div>
      </transition-group>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      notifications: [],
      visibleNotifications: [], // Separate array for visible notifications
      pollingInterval: null,
      userName: '',
      lastCheckTime: null,
      notificationDuration: 6000 // 5 seconds before auto-dismiss
    }
  },
  created() {
    // Load user name from localStorage
    this.userName = localStorage.getItem('userName') || '';
    
    // Load existing notifications
    this.loadNotifications();
    
    // Start polling for new notifications
    this.startNotificationPolling();
    
    // Request permission for browser notifications
    this.requestNotificationPermission();
  },
  beforeUnmount() {
    this.stopNotificationPolling();
  },
  methods: {
    loadNotifications() {
      if (this.userName) {
        const storedNotifications = localStorage.getItem(`notifications_${this.userName}`);
        if (storedNotifications) {
          this.notifications = JSON.parse(storedNotifications);
          // Don't show old notifications on page load
        }
      }
    },
    
    saveNotifications() {
      if (this.userName) {
        localStorage.setItem(`notifications_${this.userName}`, JSON.stringify(this.notifications));
      }
    },
    
    startNotificationPolling() {
      // Poll for new comments every seconds
      this.pollingInterval = setInterval(() => {
        this.checkForNewNotifications();
      }, 10000);
    },
    
    stopNotificationPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
    },
    
    async checkForNewNotifications() {
      if (!this.userName) return;
      
      try {
        // Fetch all comments from your API
        const response = await fetch('https://67d028d8825945773eafc4d7.mockapi.io/comments');
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        
        const comments = await response.json();
        
        // Find comments by the current user
        const userComments = comments.filter(comment => comment.name === this.userName);
        
        // Find replies to the user's comments
        const now = new Date();
        const checkTime = this.lastCheckTime ? new Date(this.lastCheckTime) : new Date(now.getTime() - 60000); // Default to 1 minute ago
        
        for (const comment of userComments) {
          // Find replies to this comment
          const replies = comments.filter(c => 
            c.parentId === comment.id && 
            c.name !== this.userName &&
            new Date(c.createdAt) > checkTime
          );
          
          // Create notifications for new replies
          for (const reply of replies) {
            // Check if we already have this notification
            const existingNotification = this.notifications.find(n => 
              n.commentId === reply.id && n.parentCommentId === comment.id
            );
            
            if (!existingNotification) {
              this.addNotification(reply, comment);
            }
          }
        }
        
        // Update last check time
        this.lastCheckTime = now.toISOString();
        
      } catch (error) {
        console.error('Error checking for notifications:', error);
      }
    },
    
    addNotification(reply, parentComment) {
      const notification = {
        id: `notification_${Date.now()}`,
        commentId: reply.id,
        parentCommentId: parentComment.id,
        fromName: reply.name,
        createdAt: reply.createdAt,
        read: false
      };
      
      // Add to persistent notifications
      this.notifications.unshift(notification);
      this.saveNotifications();
      
      // Add to visible notifications
      this.visibleNotifications.unshift(notification);
      
      // Set timeout to remove from visible notifications
      setTimeout(() => {
        this.removeVisibleNotification(notification.id);
      }, this.notificationDuration);
      
      // Show browser notification
      this.showBrowserNotification(reply.name);
    },
    
    removeVisibleNotification(id) {
      const index = this.visibleNotifications.findIndex(n => n.id === id);
      if (index !== -1) {
        this.visibleNotifications.splice(index, 1);
      }
    },
    
    showBrowserNotification(fromName) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Reply', {
          body: `${fromName} replied to your comment`,
          icon: '/favicon.ico'
        });
      }
    },
    
    requestNotificationPermission() {
      if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    },
    
    handleNotificationClick(notification) {
      // Mark as read
      const storedNotification = this.notifications.find(n => n.id === notification.id);
      if (storedNotification) {
        storedNotification.read = true;
        this.saveNotifications();
      }
      
      // Remove from visible notifications
      this.removeVisibleNotification(notification.id);
      
      // Navigate to the page with the comment
      // You'll need to adjust this based on your routing structure
      this.$router.push({ 
        path: '/comments', 
        query: { highlight: notification.commentId } 
      });
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return 'Just now';
      }
      
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) {
        return 'Just now';
      }
      
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
      }
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      }
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 30) {
        return `${diffInDays}d ago`;
      }
      
      const options = { month: 'short', day: 'numeric' };
      return date.toLocaleDateString(undefined, options);
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
                'rgba(16, 185, 129, 0.5)', 
                'rgba(10, 29, 203, 0.5)', 
                'rgba(129, 0, 143, 0.5)', 
                'rgba(194, 3, 191, 0.5)', 
                'rgba(208, 143, 4, 0.5)', 
                'rgba(220, 5, 41, 0.5)', 
                'rgba( 0, 249, 254, 0.5)', 
                'rgba(237, 251, 0, 0.5)',
                'rgba(1, 0, 251, 0.5)',
                'rgba( 251, 0, 0, 0.5)',
                'rgba( 42, 251, 0, 0.5)',
            ];

            const index = Math.abs(hash) % colors.length;
            return colors[index];
        }
  }
}
</script>

<style scoped>
div {
  display: flex;
}

.global-notifications {
  position: fixed;
  top: 70px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 350px;
}

.notification-toast {
  display: flex;
  padding: 12px 15px;
  background-color: #2d3748;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  border-left: 4px solid #10b981;
  transition: transform 0.2s, opacity 0.2s;
  position: relative;
}

.notification-toast:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
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

.close-notification {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: rgba(74, 85, 104, 0.7);
  color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1;
  padding: 0;
  border: none;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.notification-toast:hover .close-notification {
  opacity: 1;
}

/* Animation for notifications */
.notification-enter-active {
  animation: slide-in 0.3s ease-out;
}

.notification-leave-active {
  animation: slide-out 0.3s ease-in;
  position: absolute;
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-out {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

@media (max-width: 480px) {
  .global-notifications {
    bottom: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
    display: none;
  }
}
</style>
