<script>
import { RouterView } from 'vue-router'
import NavbarMain from '@/components/NavbarMain.vue'
import DialogSignUp from '@/components/DialogSignUp.vue'
import DialogLogin from '@/components/DialogLogin.vue'
import DialogPasswordReset from '@/components/DialogPasswordReset.vue'
import NotificationList from '@/components/NotificationList.vue'
import { mapActions, mapStores } from 'pinia'
import { useUserStore } from '@/stores/user'
import { useNotificationsStore } from '@/stores/notifications'
import { useGamesStore } from '@/stores/games'

export default {
    components: {
        RouterView,
        NavbarMain,
        DialogSignUp,
        DialogLogin,
        DialogPasswordReset,
        NotificationList
    },
    computed: {
        ...mapStores(useGamesStore)
    },
    methods: {
        ...mapActions(useUserStore, ['setUser']),
        ...mapActions(useNotificationsStore, ['createNotification']),

        async tryAutomaticLogin() {
            try {
                // try to login using stored refresh token
                const loginResponse = await this.$axios.post('/auth/tokens/refresh', {})
                console.log(loginResponse.data)
                await this.setUser(loginResponse.data)

                // start a timer to refresh the access token before it expires
                const waitTime = Math.max(loginResponse.data.expires_in - 10_000, 10_000) // times in milliseconds
                setTimeout(this.tryAutomaticLogin, waitTime)
            } catch (err) {
                if (err.response?.status === 401) {
                    console.log(err.response.data)
                } else {
                    console.log(err)
                    this.createNotification({
                        type: 'danger',
                        message: 'An error occurred while trying to login. Please do a manual login'
                    })
                }
            }
        }
    },
    async mounted() {
        await this.tryAutomaticLogin()
    }
}
</script>

<template>
    <div class="d-flex flex-column h-100">
        <NavbarMain></NavbarMain>

        <RouterView v-slot="{ Component }" class="overflow-auto">
            <KeepAlive exclude="CategoryView,GameDetailsView,SearchResultsView">
                <component :is="Component"></component>
            </KeepAlive>
        </RouterView>
    </div>

    <!-- Notification panel-->
    <NotificationList></NotificationList>

    <!-- Login and Sign up modals -->
    <DialogSignUp></DialogSignUp>
    <DialogLogin></DialogLogin>
    <DialogPasswordReset></DialogPasswordReset>
</template>

<style>
.btn-primary {
    --bs-btn-bg: var(--gt-color-secondary);
    --bs-btn-disabled-bg: var(--gt-color-secondary);
}

.btn-outline-primary {
    --bs-btn-color: var(--gt-color-text);
    --bs-btn-hover-color: var(--gt-color-text);
    --bs-btn-active-color: var(--gt-color-text);
}

.btn-primary,
.btn-outline-primary {
    --bs-btn-border-color: var(--gt-color-secondary);
    --bs-btn-hover-bg: var(--gt-color-secondary-hover);
    --bs-btn-hover-border-color: var(--gt-color-secondary);
    --bs-btn-active-bg: var(--gt-color-secondary-active);
    --bs-btn-active-border-color: var(--gt-color-secondary-active);
    --bs-btn-disabled-border-color: var(--gt-color-secondary);
}

.form-control:focus {
    box-shadow: 0 0 0 0.25rem var(--gt-color-secondary-transparent);
}

.form-control,
.form-control:active,
.form-control:focus {
    background-color: var(--gt-color-bg) !important;
    color: var(--gt-color-text);
    border: none;
}

.form-control::placeholder {
    color: var(--gt-color-text);
}

.form-control::ms-input-placeholder {
    color: var(--gt-color-text);
}
</style>
