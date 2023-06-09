<script>
import GamesPanel from '@/components/GamesPanel.vue'
import { useNotificationsStore } from '@/stores/notifications'
import { mapActions } from 'pinia'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

export default {
    components: { GamesPanel, LoadingSpinner },
    data() {
        return {
            // this will contain an object for each category with a name and the game list
            categories: [],
            limit: 5,
            offset: 0,
            gamesPerCategory: 20,
            bottomObserver: undefined,
            loading: true,
            loadingMore: false
        }
    },
    computed: {
        filteredCategories() {
            return this.categories.filter((category) => category.games?.length > 0)
        }
    },
    methods: {
        ...mapActions(useNotificationsStore, ['createNotification']),
        async getCategories() {
            this.loadingMore = true
            try {
                const query = new URLSearchParams()
                query.set('limit', this.limit)
                query.set('offset', this.offset)
                query.set('games', this.gamesPerCategory)
                const response = await this.$axios.get('/api/categories?' + query.toString())
                this.categories = this.categories.concat(response.data)
                this.offset += this.limit
            } catch (err) {
                console.log(err)
                this.createNotification({
                    type: 'danger',
                    message: 'An error occurred while fetching genres.'
                })
            } finally {
                this.loading = false
                this.loadingMore = false
                this.updateObservedItem()
            }
        },
        onReachedBottom(entries) {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    this.getCategories()
                    this.bottomObserver.unobserve(entry.target)
                }
            }
        },
        updateObservedItem() {
            const lastPanel = this.$refs.panelsContainer.querySelector(':scope>*:nth-last-child(2)')
            if (lastPanel) {
                this.bottomObserver.disconnect()
                this.bottomObserver.observe(lastPanel)
                console.log(lastPanel)
            }
        }
    },
    async mounted() {
        this.getCategories()

        const observerOptions = {
            root: this.$refs.panelsContainer,
            threshold: 1
        }
        this.bottomObserver = new IntersectionObserver(this.onReachedBottom, observerOptions)
        this.updateObservedItem()
    },
    watch: {
        categories: {
            handler(newList, oldList) {
                if (newList[newList.length - 1] !== oldList[oldList.length - 1]) {
                    this.updateObservedItem()
                }
            },
            flush: 'post'
        }
    }
}
</script>

<template>
    <main ref="panelsContainer" class="pt-4">
        <LoadingSpinner v-if="loading"></LoadingSpinner>
        <template v-else>
            <GamesPanel
                v-for="(category, index) in filteredCategories"
                :key="index"
                class="games-panel"
                :title="category.name"
                :gameList="category.games"
                :extendedRoute="{
                    name: 'category',
                    params: { id: category.id },
                    query: { name: category.name }
                }"
            ></GamesPanel>
            <div class="text-center">
                <div v-if="loadingMore" class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        </template>
    </main>
</template>
