<script>
import GamesPanelExpanded from '@/components/GamesPanelExpanded.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { useNotificationsStore } from '@/stores/notifications'
import { mapActions } from 'pinia'

export default {
    components: { GamesPanelExpanded, LoadingSpinner },
    data() {
        return {
            popularGames: [],
            limit: 80,
            offset: 0,
            loading: true,
            loadingMore: false
        }
    },
    async mounted() {
        this.getGames()
    },
    methods: {
        ...mapActions(useNotificationsStore, ['createNotification']),
        async getGames() {
            this.loadingMore = true
            try {
                const query = new URLSearchParams()
                query.set('limit', this.limit)
                query.set('offset', this.offset)
                const response = await this.$axios.get('/api/popular?' + query.toString())
                this.popularGames = this.popularGames.concat(response.data)
                this.offset += this.limit
            } catch (err) {
                console.log(err)
                this.createNotification({
                    type: 'danger',
                    message: 'An error occurred while fetching popular games'
                })
            } finally {
                this.loading = false
                this.loadingMore = false
            }
        }
    }
}
</script>

<template>
    <main class="pt-4 px-md-4">
        <LoadingSpinner v-if="loading"></LoadingSpinner>
        <GamesPanelExpanded
            v-else
            @reachedBottom="getGames"
            title="Popular"
            icon="graph-up-arrow"
            :gameList="popularGames"
            :allowClose="false"
            :loading="loadingMore"
        ></GamesPanelExpanded>
    </main>
</template>
