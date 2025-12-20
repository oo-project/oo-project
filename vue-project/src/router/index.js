import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
    history: createWebHashHistory(),
    
    routes: [
        {
            path: '/',
            redirect: '/Login'
        },
        {
            path: '/Login',
            name: 'Login',
            component: () => import('../components/Login.vue')
        },
        {
            path: '/ForgotPassword',
            component: () => import('../components/ForgotPassword.vue')
        },
        // ==========================================
        // 房東區塊 (需要登入 + 身分是 landlord)
        // ==========================================
        {
            path: '/LandlordHome',
            component: () => import('../views/LandlordHome.vue'),
            meta: { requiresAuth: true, role: 'landlord' },
            children: [
                {
                    path: '',
                    redirect: '/LandlordHome/rent'
                },
                // --- 租件管理相關 (整合在一起) ---
                {
                    path: 'rent',
                    name: 'LandlordRent',
                    component: () => import('../views/landlord/Rentals.vue') // 列表頁
                },
                {
                    path: 'rent/new',
                    name: 'LandlordRentNew',
                    component: () => import('../views/landlord/RentalEditor.vue') // 新增頁
                },
                {
                    path: 'rent/edit/:id',
                    name: 'LandlordRentEdit',
                    component: () => import('../views/landlord/RentalEditor.vue') // 編輯頁
                },
                // -------------------------------
                {
                    path: 'lease',
                    name: 'LandlordLease',
                    component: () => import('../views/landlord/Leases.vue')
                },
                {
                    path: 'tenant',
                    name: 'LandlordTenant',
                    component: () => import('../views/landlord/Tenants.vue')
                },
                {
                    path: 'search',
                    name: 'LandlordSearch',
                    component: () => import('../views/landlord/Search.vue')
                },
                {
                    path: 'map',
                    name: 'LandlordMap',
                    component: () => import('../views/landlord/MapVisual.vue')
                },
                {
                    path: 'profile',
                    name: 'LandlordProfile',
                    component: () => import('../views/landlord/Profile.vue')
                }
            ]
        },
        // 公開頁面 (不用登入)
        {
            path: '/RegChoose',
            component: () => import('../components/RegChoose.vue')
        },
        {
            path: '/Register', 
            name: 'Register',
            component: () => import('../components/RegisterForm.vue') 
        },
        // ==========================================
        // 租客區塊 (需要登入 + 身分是 tenant)
        // ==========================================
        {
            path: '/TenantHome',
            component: () => import('../views/TenantHome.vue'),
            meta: { requiresAuth: true, role: 'tenant' },
            children: [
                {
                    path: '',
                    redirect: '/TenantHome/browse'
                },
                {
                    path: 'browse',
                    name: 'TenantBrowse',
                    component: () => import('../views/tenant/Browse.vue')
                },
                {
                    path: 'favorites',
                    name: 'TenantFavorites',
                    component: () => import('../views/tenant/Favorites.vue')
                },
                {
                    path: 'profile',
                    name: 'TenantProfile',
                    component: () => import('../views/tenant/Profile.vue')
                },
                {
                    path: 'change-password',
                    component: () => import('../views/tenant/ChangePassword.vue')
                },
                { 
                    path: 'reservations', 
                    component: () => import('../views/tenant/Reservations.vue') 
                },
                { 
                    path: 'contracts', 
                    component: () => import('../views/tenant/Contracts.vue') 
                },
                {
                    path: 'rental/:id',
                    name: 'RentalDetail',
                    component: () => import('../views/tenant/RentalDetail.vue')
                },
                {
                    path: 'map',
                    name: 'TenantMap',
                    component: () => import('../views/tenant/MapSearch.vue')
                }
            ]
        }
    ]
})

// ==========================================
// 全域導航守衛 (完全正確，不用改)
// ==========================================
router.beforeEach((to, from, next) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    
    if (requiresAuth) {
        if (!currentUser) {
            alert('請先登入！');
            next('/Login');
            return;
        }

        const requiredRole = to.matched.find(record => record.meta.role)?.meta.role;

        if (requiredRole && currentUser.role !== requiredRole) {
            alert('您沒有權限訪問此頁面！');
            if (currentUser.role === 'landlord') {
                next('/LandlordHome');
            } else {
                next('/TenantHome');
            }
            return;
        }
        next();
    } else {
        if (to.path === '/Login' && currentUser) {
             if (currentUser.role === 'landlord') {
                next('/LandlordHome');
            } else {
                next('/TenantHome');
            }
            return;
        }
        next();
    }
});

export default router;