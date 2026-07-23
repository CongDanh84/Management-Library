import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { ROUTE_NAMES } from '../constants/routes'
import { ROLES, CHUC_VU } from '../constants/index'

const routes = [
  { path: '/', redirect: '/sach' },
  {
    path: '/dang-nhap',
    name: ROUTE_NAMES.LOGIN_SELECT,
    component: () => import('../views/auth/LoginSelect.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/dang-nhap/doc-gia',
    name: ROUTE_NAMES.LOGIN_READER,
    component: () => import('../views/auth/LoginReader.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/dang-nhap/nhan-vien',
    name: ROUTE_NAMES.LOGIN_STAFF,
    component: () => import('../views/auth/LoginStaff.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/dang-ky',
    name: ROUTE_NAMES.REGISTER_READER,
    component: () => import('../views/auth/RegisterReader.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/sach',
    name: ROUTE_NAMES.BOOK_LIST,
    component: () => import('../views/BookList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sach/:maSach',
    name: ROUTE_NAMES.BOOK_DETAIL,
    component: () => import('../views/BookDetail.vue'),
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/ca-nhan',
    name: ROUTE_NAMES.MY_PROFILE,
    component: () => import('../views/reader/MyProfile.vue'),
    meta: { requiresAuth: true, roles: [ROLES.READER] }
  },
  {
    path: '/muon-cua-toi',
    name: ROUTE_NAMES.MY_BORROWS,
    component: () => import('../views/reader/MyBorrows.vue'),
    meta: { requiresAuth: true, roles: [ROLES.READER] }
  },
  {
    path: '/nhan-vien/ho-so',
    name: ROUTE_NAMES.STAFF_PROFILE,
    component: () => import('../views/staff/StaffProfile.vue'),
    meta: { requiresAuth: true, roles: [ROLES.STAFF] }
  },
  {
    path: '/nhan-vien/sach',
    name: ROUTE_NAMES.MANAGE_BOOKS,
    component: () => import('../views/staff/ManageBooks.vue'),
    meta: { requiresAuth: true, roles: [ROLES.STAFF] }
  },
  {
    path: '/nhan-vien/nha-xuat-ban',
    name: ROUTE_NAMES.MANAGE_PUBLISHERS,
    component: () => import('../views/staff/ManagePublisher.vue'),
    meta: { requiresAuth: true, roles: [ROLES.STAFF] }
  },
  {
    path: '/nhan-vien/muon-tra',
    name: ROUTE_NAMES.MANAGE_BORROWS,
    component: () => import('../views/staff/ManageBorrow.vue'),
    meta: { requiresAuth: true, roles: [ROLES.STAFF] }
  },
  {
    path: '/nhan-vien/doc-gia',
    name: ROUTE_NAMES.MANAGE_READERS,
    component: () => import('../views/staff/ManageReader.vue'),
    meta: { requiresAuth: true, roles: [ROLES.STAFF] }
  },
  {
    path: '/quan-tri/nhan-su',
    name: ROUTE_NAMES.MANAGE_STAFFS,
    component: () => import('../views/admin/ManageStaff.vue'),
    meta: { requiresAuth: true, roles: [ROLES.STAFF], chucVu: [CHUC_VU.ADMIN] }
  },
  {
    path: '/khong-co-quyen',
    name: ROUTE_NAMES.FORBIDDEN,
    component: () => import('../views/Forbidden.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: ROUTE_NAMES.NOT_FOUND,
    component: () => import('../views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: ROUTE_NAMES.BOOK_LIST }
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: ROUTE_NAMES.LOGIN_SELECT, query: { redirect: to.fullPath } }
  }

  if (to.meta.roles && !to.meta.roles.includes(auth.role)) {
    return { name: ROUTE_NAMES.FORBIDDEN }
  }

  if (to.meta.chucVu && !to.meta.chucVu.includes(auth.chucVu)) {
    return { name: ROUTE_NAMES.FORBIDDEN }
  }

  return true
})

export default router
