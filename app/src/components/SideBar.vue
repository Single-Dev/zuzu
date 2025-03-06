<template>
    <aside :class="['sidebar', { 'sidebar--collapsed': isCollapsed }]">
        <!-- Sidebar Header -->
        <div class="sidebar__header">
            <div class="sidebar__logo">
                <heart />
                <span v-show="!isCollapsed">Zara F. Hanin</span>
            </div>
            <button class="sidebar__toggle" @click="toggleSidebar">
                <chevron-left v-if="!isCollapsed" />
                <chevron-right v-else />
            </button>
        </div>

        <!-- Sidebar Content -->
        <div class="sidebar__content">
            <!-- Main Navigation -->
            <nav class="sidebar__nav">
                <ul class="sidebar__menu">
                    <li v-for="(item, index) in menuItems" :key="index" class="sidebar__menu-item">
                        <router-link :to="item.path">
                            <div :class="['sidebar__menu-button', { 'active': item.active }]">
                                <component :is="item.icon" class="sidebar__icon" />
                                <span v-show="!isCollapsed">{{ item.title }}</span>
                            </div>
                        </router-link>
                    </li>
                </ul>
            </nav>
        </div>

        <!-- Sidebar Footer -->
        <div class="sidebar__footer">
            <div class="sidebar__user" v-show="!isCollapsed">
                <user class="sidebar__user-icon" />
                <div class="sidebar__user-info">
                    <span class="sidebar__user-name">Anonym</span>
                    <span class="sidebar__user-role">User</span>
                </div>
            </div>
            <settings v-show="isCollapsed" class="sidebar__icon" />
        </div>
    </aside>
</template>

<script setup>
import { ref } from 'vue';
import {
    Home,
    Infinity ,
    User,
    Heart,
    PartyPopper ,
    ChevronLeft,
    ChevronRight
} from 'lucide-vue-next';

const isCollapsed = ref(false);

const menuItems = ref([
    {
        title: 'Home',
        icon: Home,
        path: '/',
        active: false
    },
    {
        title: 'Until your birthday',
        icon: PartyPopper ,
        path: '/countdown',
        active: false
    },
    {
        title: 'Til now',
        icon: Infinity ,
        path: '/countup',
        active: false
    }
]);

const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value;
};

const toggleSubmenu = (index) => {
    menuItems.value[index].expanded = !menuItems.value[index].expanded;
};

const navigateTo = (path) => {
    // Implementation would depend on your routing solution
    console.log(`Navigating to ${path}`);

    // Update active state (simplified implementation)
    menuItems.value.forEach(item => {
        item.active = item.path === path;
        if (item.children) {
            item.children.forEach(child => {
                child.active = child.path === path;
                if (child.active) {
                    item.expanded = true;
                }
            });
        }
    });
};
</script>

<style>
:root {
    --sidebar-width: 260px;
    --sidebar-collapsed-width: 64px;
    --sidebar-bg: #ffffff;
    --sidebar-border: #e2e8f0;
    --sidebar-color: #334155;
    --sidebar-hover-bg: #f8fafc;
    --sidebar-active-bg: #f1f5f9;
    --sidebar-active-color: #0f172a;
    --sidebar-icon-color: #64748b;
    --primary-color: #3b82f6;
    --transition-speed: 0.3s;
}

.sidebar {
    display: flex;
    flex-direction: column;
    width: var(--sidebar-width);
    height: auto;
    background-color: var(--sidebar-bg);
    border-right: 1px solid var(--sidebar-border);
    transition: width var(--transition-speed) ease;
    overflow: hidden;
    position: relative;
}

.sidebar--collapsed {
    width: var(--sidebar-collapsed-width);
}

.sidebar__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    height: 64px;
    border-bottom: 1px solid var(--sidebar-border);
}

.sidebar__logo {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 600;
    font-size: 18px;
    color: var(--sidebar-active-color);
}

.sidebar__toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 4px;
    border: none;
    background-color: transparent;
    cursor: pointer;
    color: var(--sidebar-icon-color);
}

.sidebar__toggle:hover {
    background-color: var(--sidebar-hover-bg);
}

.sidebar__content {
    flex: 1;
    overflow-y: auto;
    padding: 12px 0;
}

.sidebar__menu {
    list-style: none;
    padding: 0;
    margin: 0;
}

.sidebar__menu-item {
    margin: 4px 0;
}

.sidebar__menu-button {
    display: flex;
    align-items: center;
    padding: 10px 16px;
    border-radius: 6px;
    margin: 0 8px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    color: var(--sidebar-color);
    gap: 12px;
}

.sidebar__menu-button:hover {
    background-color: var(--sidebar-hover-bg);
}

.sidebar__menu-button.active {
    background-color: var(--sidebar-active-bg);
    color: var(--sidebar-active-color);
    font-weight: 500;
}

.sidebar__icon {
    width: 20px;
    height: 20px;
    color: var(--sidebar-icon-color);
    flex-shrink: 0;
}

.sidebar__menu-button.active .sidebar__icon {
    color: var(--primary-color);
}

.sidebar__dropdown-icon {
    margin-left: auto;
    width: 16px;
    height: 16px;
    transition: transform 0.2s ease;
}

.sidebar__dropdown-icon.rotate {
    transform: rotate(180deg);
}

.sidebar__submenu {
    list-style: none;
    padding: 0;
    margin: 0 0 0 32px;
}

.sidebar__submenu-item {
    margin: 2px 0;
}

.sidebar__submenu-link {
    display: block;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    color: var(--sidebar-color);
    font-size: 14px;
}

.sidebar__submenu-link:hover {
    background-color: var(--sidebar-hover-bg);
}

.sidebar__submenu-link.active {
    color: var(--primary-color);
    font-weight: 500;
}

.sidebar__footer {
    padding: 16px;
    border-top: 1px solid var(--sidebar-border);
    display: flex;
    align-items: center;
}

.sidebar__user {
    display: flex;
    align-items: center;
    gap: 12px;
}

.sidebar__user-icon {
    width: 32px;
    height: 32px;
    padding: 6px;
    border-radius: 50%;
    background-color: var(--sidebar-active-bg);
    color: var(--primary-color);
}

.sidebar__user-info {
    display: flex;
    flex-direction: column;
}

.sidebar__user-name {
    font-weight: 500;
    font-size: 14px;
    color: var(--sidebar-active-color);
}

.sidebar__user-role {
    font-size: 12px;
    color: var(--sidebar-icon-color);
}

/* Submenu transition */
.submenu-enter-active,
.submenu-leave-active {
    transition: max-height var(--transition-speed) ease, opacity var(--transition-speed) ease;
    max-height: 500px;
    overflow: hidden;
}

.submenu-enter-from,
.submenu-leave-to {
    max-height: 0;
    opacity: 0;
}

/* Add dark mode support */
@media (prefers-color-scheme: dark) {
    :root {
        --sidebar-bg: #0f172a;
        --sidebar-border: #1e293b;
        --sidebar-color: #cbd5e1;
        --sidebar-hover-bg: #1e293b;
        --sidebar-active-bg: #1e293b;
        --sidebar-active-color: #ffffff;
        --sidebar-icon-color: #94a3b8;
    }
}

/* Responsive styles */
@media (max-width: 768px) {
    .sidebar {
        position: fixed;
        z-index: 100;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        transform: translateX(0);
    }

    .sidebar--collapsed {
        transform: translateX(calc(-1 * var(--sidebar-width)));
    }
}
</style>