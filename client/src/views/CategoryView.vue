<script>
import GamesPanelExpanded from '@/components/GamesPanelExpanded.vue'

export default {
    components: { GamesPanelExpanded },
    data() {
        return {
            testArray: Array(20).fill({
                title: 'Bloodborne',
                release: '2015',
                developer: 'From Software',
                genres: ['Adventure', 'Role-playing (RPG)', 'Action', 'Souls-like'],
                platforms: ['PlayStation 4', 'PC (magari)'],
                image: 'https://assets.reedpopcdn.com/-1616688899670.jpg/BROK/thumbnail/1600x900/quality/100/-1616688899670.jpg',
                added: true
            }),
            category: this.$route.params.categoryName
        }
    }
}
</script>

<template>
    <main>
        <GamesPanelExpanded :title="category" :gameList="testArray"></GamesPanelExpanded>
    </main>
</template>