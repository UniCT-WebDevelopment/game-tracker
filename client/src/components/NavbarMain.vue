<script>
import { RouterLink } from 'vue-router'
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'
import SearchBar from '@/components/SearchBar.vue'
import NavbarUserPanel from '@/components/NavbarUserPanel.vue'

export default {
    components: {
        RouterLink,
        SearchBar,
        NavbarUserPanel
    },
    data() {
        return {
            appPages: this.$router.getRoutes().filter((value) => {
                return value.meta.mainNavigation
            })
        }
    },
    computed: {
        ...mapState(useUserStore, ['loggedIn']),
        authenticatedPages() {
            return this.appPages.filter((value) => {
                return !(value.meta.requiresAuth && !this.loggedIn)
            })
        }
    }
}
</script>

<template>
    <header>
        <nav class="navbar navbar-expand-lg sticky-top navbar-dark shadow">
            <div class="container-fluid d-flex align-items-center">
                <!-- Mobile only elements -->
                <div class="d-flex d-lg-none col flex-nowrap align-items-center">
                    <RouterLink to="/" class="navbar-brand d-none d-sm-inline ms-2">GT</RouterLink>
                    <div
                        class="flex-grow-1 flex-shrink-1 mx-2 justify-content-center d-flex d-lg-none"
                    >
                        <SearchBar></SearchBar>
                    </div>

                    <!-- Toggler -->
                    <button
                        class="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbar-collapse-content"
                        aria-controls="navbar-collapse-content"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span class="navbar-toggler-icon"></span>
                    </button>
                </div>

                <!-- Collapsible area -->
                <div class="collapse navbar-collapse text-center" id="navbar-collapse-content">
                    <!-- Navigation -->
                    <div
                        class="col my-2 my-lg-0 d-flex justify-content-center justify-content-lg-start"
                    >
                        <!-- Desktop Brand -->
                        <RouterLink to="/" class="navbar-brand d-none d-lg-inline" href="/"
                            >Game Tracker</RouterLink
                        >

                        <ul class="navbar-nav nav-pills">
                            <li
                                v-for="(page, index) in authenticatedPages"
                                :key="index"
                                class="nav-item mx-xl-2 mb-2 mb-lg-0"
                            >
                                <RouterLink
                                    class="nav-link px-3 rounded-5"
                                    active-class="active aria-current shadow"
                                    :to="page.path"
                                >
                                    {{ page.name }}
                                </RouterLink>
                            </li>
                        </ul>
                    </div>

                    <!-- Desktop Search -->
                    <div
                        class="col mx-5 mx-lg-0 mb-3 mb-lg-0 justify-content-center d-none d-lg-flex"
                    >
                        <SearchBar></SearchBar>
                    </div>

                    <!-- Login buttons -->
                    <div
                        v-if="!loggedIn"
                        class="col-xl ms-2 ms-xl-0 mb-2 mb-lg-0 d-flex justify-content-end"
                    >
                        <button
                            type="button"
                            class="btn btn-primary shadow me-2"
                            data-bs-toggle="modal"
                            data-bs-target="#login-dialog"
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            class="btn btn-primary shadow"
                            data-bs-toggle="modal"
                            data-bs-target="#signup-dialog"
                        >
                            Sign Up
                        </button>
                    </div>
                    <!-- Show these instead if logged in -->
                    <NavbarUserPanel
                        v-else
                        class="col-xl ms-2 ms-xl-0 mb-2 mb-lg-0 d-flex justify-content-center justify-content-lg-end"
                    ></NavbarUserPanel>
                </div>
            </div>
        </nav>
    </header>
</template>

<style scoped>
.navbar {
    background-color: var(--gt-color-main);
    --bs-navbar-nav-link-padding-x: 1rem;
    text-transform: capitalize;
}

.nav-pills {
    --bs-nav-pills-link-active-bg: var(--gt-color-secondary);
}
</style>
