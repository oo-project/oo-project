import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
    history: createWebHashHistory(), 
    
    routes: [
        {
            path: '/',
            redirect: '/TenantHome' // 開發時想直接看哪個頁面就這裡修改，環境要整個重開
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
        {
            path: '/LandlordHome',
            component: () => import('../views/LandlordHome.vue'),
            children: [
                {
                path: '', // 預設進入 /LandlordHome 就跳轉到 rent
                redirect: '/LandlordHome/rent'
                },
                {
                path: 'rent', // 網址：/LandlordHome/rent
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
        {
            path: '/RegChoose',
            component: () => import('../components/RegChoose.vue')
        },
        {
        path: '/Register', 
        name: 'Register',
        component: () => import('../components/RegisterForm.vue') 
        },
        {
        path: '/TenantHome',
        component: () => import('../views/TenantHome.vue'),
            children: [
                {
                path: '',
                redirect: '/TenantHome/browse' // 預設跳轉到找房
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
                    // ✨ 動態路由：:id 代表房子的編號
                    path: 'rental/:id',
                    name: 'RentalDetail',
                    component: () => import('../views/tenant/RentalDetail.vue')
                }
            ]
        }
    ]}
)

export default router;