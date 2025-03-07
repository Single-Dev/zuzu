<template>
    <div class="sidebar-wrapper" :class="{ 'mobile-open': isMobileOpen, 'dark-mode': isDarkMode }">
        <!-- Overlay for mobile -->
        <div class="sidebar-overlay" v-if="isMobile" @click="toggleMobile" :class="{ 'show': isMobileOpen }"></div>

        <!-- Mobile toggle button -->
        <button v-if="isMobile" class="mobile-toggle" :class="{ 'open': isMobileOpen }" @click="toggleMobile">
            <span class="hamburger"></span>
        </button>

        <!-- Sidebar -->
        <aside class="sidebar" :class="{ 'collapsed': isCollapsed && !isMobile }">
            <!-- Header -->
            <div class="sidebar-header">
                <div class="header-content">
                    <Heart class="icon heart-icon" />
                    <span class="title">Zara F. Hanin</span>
                </div>
                <button class="collapse-btn" @click="toggleCollapse" v-if="!isMobile">
                    <ChevronLeft :class="{ 'rotate-180': isCollapsed }" />
                </button>
            </div>

            <!-- Navigation -->
            <nav class="sidebar-nav">
                <router-link to="/" class="nav-item" active-class="active">
                    <Home class="icon" />
                    <span class="nav-text">Home</span>
                </router-link>

                <router-link to="/birthday" class="nav-item" active-class="active">
                    <Gift class="icon" />
                    <span class="nav-text">Until your birthday</span>
                </router-link>

                <router-link to="/timeline" class="nav-item" active-class="active">
                    <Infinity class="icon" />
                    <span class="nav-text">Til now</span>
                </router-link>

                <router-link to="/about" class="nav-item" active-class="active">
                    <Info class="icon" />
                    <span class="nav-text">About us</span>
                </router-link>

                <router-link to="/player" class="nav-item" active-class="active">
                    <Music4  class="icon" />
                    <span class="nav-text">Player</span>
                </router-link>
            </nav>

            <!-- Footer -->
            <div class="sidebar-footer">
                <div class="user-profile">
                    <User class="icon user-icon" />
                    <div class="user-info">
                        <span class="username">Anonym</span>
                        <span class="user-role">User</span>
                    </div>
                </div>
                <!-- Dark mode toggle -->
                <!-- <button class="dark-mode-toggle" @click="toggleDarkMode">
                    <Sun v-if="isDarkMode" class="icon" />
                    <Moon v-else class="icon" />
                    <span>{{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}</span>
                </button> -->
            </div>
        </aside>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import {
    Heart,
    Home,
    Gift,
    Infinity,
    Info,
    User,
    ChevronLeft,
    Sun,
    Moon,
    Music4
} from 'lucide-vue-next';

const isCollapsed = ref(false);
const isMobile = ref(false);
const isMobileOpen = ref(false);
const isDarkMode = ref(true); // Start with dark mode by default

const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
};

const toggleMobile = () => {
    isMobileOpen.value = !isMobileOpen.value;
    if (isMobileOpen.value) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
};

const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value;
    updateDarkMode();
};

const updateDarkMode = () => {
    if (isDarkMode.value) {
        document.documentElement.classList.add('dark-mode');
    } else {
        document.documentElement.classList.remove('dark-mode');
    }
};

const checkMobile = () => {
    isMobile.value = window.innerWidth < 768;
    if (!isMobile.value && isMobileOpen.value) {
        isMobileOpen.value = false;
        document.body.style.overflow = '';
    }
};

onMounted(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    updateDarkMode();
});

onUnmounted(() => {
    window.removeEventListener('resize', checkMobile);
});

watch(isDarkMode, updateDarkMode);
</script>

<style scoped>
.sidebar-wrapper {
    position: relative;
    height: 100%;
}

.sidebar {
    width: 260px;
    height: 100vh;
    background-color: #0f172a;
    color: #fff;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
}

.sidebar.collapsed {
    width: 80px;
}

/* Header styles */
.sidebar-header {
    padding: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.heart-icon {
    color: #10b981;
}

.title {
    font-weight: 600;
    white-space: nowrap;
}

.collapse-btn {
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s ease;
}

.rotate-180 {
    transform: rotate(180deg);
}

/* Navigation styles */
.sidebar-nav {
    flex: 1;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    color: #94a3b8;
    text-decoration: none;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
}

.nav-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: #fff;
}

.nav-item.active {
    background-color: #10b981;
    color: #fff;
}

.icon {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
}

/* Footer styles */
.sidebar-footer {
    padding: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-profile {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.user-icon {
    background-color: #10b981;
    padding: 0.5rem;
    border-radius: 50%;
}

.user-info {
    display: flex;
    flex-direction: column;
}

.username {
    font-weight: 600;
    font-size: 0.9rem;
}

.user-role {
    font-size: 0.8rem;
    color: #94a3b8;
}

/* Dark mode toggle */
.dark-mode-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: 1px solid var(--toggle-border);
    color: var(--toggle-text);
    cursor: pointer;
    padding: 0.5rem;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    border-radius: 0.5rem;
    width: 100%;
    justify-content: center;
}

.dark-mode-toggle:hover {
    background-color: var(--toggle-hover);
}

.dark-mode-toggle .icon {
    color: var(--toggle-icon);
}

/* Collapsed state styles */
.sidebar.collapsed .nav-text,
.sidebar.collapsed .user-info,
.sidebar.collapsed .title,
.sidebar.collapsed .dark-mode-toggle span {
    display: none;
}

/* Mobile styles */
.mobile-toggle {
    display: none;
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 1001;
    background: #0f172a;
    border: none;
    padding: 0.75rem;
    border-radius: 0.5rem;
    cursor: pointer;
}

.hamburger {
    display: block;
    width: 24px;
    height: 2px;
    background: #fff;
    position: relative;
    transition: all 0.3s ease;
}

.hamburger::before,
.hamburger::after {
    content: '';
    position: absolute;
    width: 24px;
    height: 2px;
    background: #fff;
    transition: all 0.3s ease;
}

.hamburger::before {
    top: -6px;
}

.hamburger::after {
    bottom: -6px;
}

.mobile-toggle.open .hamburger {
    background: white;
}

.mobile-toggle.open .hamburger::before {
    transform: rotate(45deg);
    top: 0;
}

.mobile-toggle.open .hamburger::after {
    transform: rotate(-45deg);
    bottom: 0;
}

.sidebar-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    opacity: 0;
    transition: opacity 0.3s ease;
}

@media (max-width: 767px) {
    .sidebar {
        transform: translateX(-100%);
    }

    .mobile-toggle {
        display: block;
    }

    .sidebar-overlay {
        display: block;
    }

    .sidebar-overlay.show {
        opacity: 1;
    }

    .mobile-open .sidebar {
        transform: translateX(0);
    }

    .sidebar.collapsed {
        width: 260px;
    }

    .sidebar.collapsed .nav-text,
    .sidebar.collapsed .user-info,
    .sidebar.collapsed .title,
    .sidebar.collapsed .dark-mode-toggle span {
        display: block;
    }
}

/* Animation for mobile menu */
@keyframes slideIn {
    from {
        transform: translateX(-100%);
    }

    to {
        transform: translateX(0);
    }
}

@keyframes slideOut {
    from {
        transform: translateX(0);
    }

    to {
        transform: translateX(-100%);
    }
}

/* Light mode styles */
:root {
    --bg-color: #ffffff;
    --text-color: #333333;
    --sidebar-bg: #f0f0f0;
    --sidebar-text: #333333;
    --sidebar-hover: #e0e0e0;
    --sidebar-active: #10b981;
    --toggle-border: #d1d5db;
    --toggle-text: #4b5563;
    --toggle-icon: #4b5563;
    --toggle-hover: #e5e7eb;
}

/* Dark mode styles */
.dark-mode {
    --bg-color: #0f172a;
    --text-color: #ffffff;
    --sidebar-bg: #1e293b;
    --sidebar-text: #ffffff;
    --sidebar-hover: #2d3748;
    --sidebar-active: #10b981;
    --toggle-border: #4b5563;
    --toggle-text: #e5e7eb;
    --toggle-icon: #e5e7eb;
    --toggle-hover: #374151;
}

/* Apply variables */
.sidebar-wrapper {
    background-color: var(--bg-color);
    color: var(--text-color);
}

.sidebar {
    background-color: var(--sidebar-bg);
    color: var(--sidebar-text);
}

.nav-item {
    color: var(--sidebar-text);
}

.nav-item:hover {
    background-color: var(--sidebar-hover);
}

.nav-item.active {
    background-color: var(--sidebar-active);
    color: #ffffff;
}
</style>