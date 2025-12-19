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
            // ✨ 修改重點 1：加入 meta 設定，標記此區塊需要權限
            meta: { requiresAuth: true, role: 'landlord' },
            children: [
                {
                    path: '',
                    redirect: '/LandlordHome/rent'
                },
                {
                    path: 'rent',
                    name: 'LandlordRent',
                    component: () => import('../views/landlord/Rentals.vue')
                },
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
            // ✨ 修改重點 2：加入 meta 設定，標記此區塊需要權限
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
                }
            ]
        }
    ]
})

// ==========================================
// ✨ 修改重點 3：加入全域導航守衛 (警衛)
// ==========================================
router.beforeEach((to, from, next) => {
    // 1. 取得目前 localStorage 裡的使用者資料
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // 2. 檢查要去的頁面 (to) 是否需要驗證 (requiresAuth)
    // to.matched 會包含父路由資訊，確保子路由也能被保護
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    
    // 3. 如果需要驗證
    if (requiresAuth) {
        // 情況 A：根本沒登入
        if (!currentUser) {
            alert('請先登入！');
            next('/Login'); // 踢回登入頁
            return;
        }

        // 情況 B：有登入，但身分不對 (例如租客想偷看房東頁面)
        // 取得該頁面要求的角色 (從父路由 meta 拿)
        const requiredRole = to.matched.find(record => record.meta.role)?.meta.role;

        if (requiredRole && currentUser.role !== requiredRole) {
            alert('您沒有權限訪問此頁面！');
            // 根據他原本的身分，踢回屬於他的首頁
            if (currentUser.role === 'landlord') {
                next('/LandlordHome');
            } else {
                next('/TenantHome');
            }
            return;
        }

        // 情況 C：登入且身分正確 -> 放行
        next();
    } else {
        // 4. 不需要驗證的頁面 (如 Login, Register) -> 直接放行
        
        // (選擇性優化) 如果已經登入，還想去 Login 頁，直接導向首頁
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