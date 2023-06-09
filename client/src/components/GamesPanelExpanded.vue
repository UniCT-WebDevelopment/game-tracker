<script>
import GameCard from '@/components/GameCard.vue'
import ContentPanel from '@/components/ContentPanel.vue'

export default {
    components: { GameCard, ContentPanel },
    emits: ['reachedBottom', 'reached-bottom'],
    props: {
        title: {
            type: String,
            required: true
        },
        icon: {
            type: String
        },
        gameList: {
            type: Array,
            required: true
        },
        allowClose: {
            type: Boolean,
            default: true
        },
        loading: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            bottomOberver: undefined
        }
    },
    computed: {
        iconClass() {
            return `bi-${this.icon}`
        }
    },
    methods: {
        closePanel() {
            this.$router.back()
        },
        onReachedBottom(entries) {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    this.$emit('reachedBottom')
                    this.bottomObserver.unobserve(entry.target)
                }
            }
        },
        updateObservedItem() {
            const lastCard = this.$refs.cardsContainer.querySelector(':scope>*:last-child')
            if (lastCard) {
                this.bottomObserver.disconnect()
                this.bottomObserver.observe(lastCard)
            }
        }
    },
    mounted() {
        // this will make a new request when user reaches the bottom of the panel
        const observerOptions = {
            root: this.$refs.cardsContainer,
            threshold: 1
        }
        this.bottomObserver = new IntersectionObserver(this.onReachedBottom, observerOptions)
        this.updateObservedItem()
    },
    watch: {
        gameList: {
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
    <ContentPanel class="h-100 d-flex flex-column">
        <div class="d-flex flex-row justify-content-between align-items-center my-3 ps-3">
            <h2 class="mb-0 ms-2 fs-3 text-start">
                <i v-if="icon" class="bi" :class="iconClass"></i> {{ title }}
            </h2>
            <a
                v-if="allowClose"
                @click="closePanel"
                class="fs-4 me-4 text-decoration-none text-nowrap"
                role="button"
            >
                Close
                <i class="bi bi-x-lg"></i>
            </a>
        </div>
        <div ref="cardsContainer" class="cards-container w-100 h-100 overflow-auto pb-3">
            <GameCard v-for="(game, index) in gameList" :key="index" :gameInfo="game"></GameCard>
        </div>
        <div v-if="loading" class="spinner-border mx-auto mb-3" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </ContentPanel>
</template>

<style scoped>
h2 {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}
.cards-container {
    display: grid;
    column-gap: 10px;
    row-gap: 30px;
    grid-template-columns: repeat(auto-fill, 10rem);
    justify-content: space-evenly;
}

.spinner-border {
    aspect-ratio: 1/1;
}
</style>
